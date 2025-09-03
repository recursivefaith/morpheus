import { MorpheusCore } from '..';
import { MarkdownView, Notice, TFile } from 'obsidian';
import MarkdownIt from 'markdown-it';
import MarkdownItAttrs from 'markdown-it-attrs';
import shellParser from 'shell-quote/parse';

const md = new MarkdownIt({ html: true });
md.use(MarkdownItAttrs);

export default function mixinEditor(baseClass) {
  return class extends baseClass {
    getEditor() {
      const activeLeaf = this.app.workspace.activeLeaf;
      if (activeLeaf?.view instanceof MarkdownView) {
        return activeLeaf.view.sourceMode.cmEditor;
      }
      return null;
    }

    // Add this method inside the class in morpheus/editor.js
    async gatherContextRecursively(
      filePath,
      maxDepth,
      currentDepth,
      visitedPaths
    ) {
      // Base case: Stop if max depth is reached or file has been visited
      if (currentDepth >= maxDepth || visitedPaths.has(filePath)) {
        return;
      }

      const file = this.app.vault.getAbstractFileByPath(filePath);

      if (file instanceof TFile && file.extension === 'md') {
        const content = await this.app.vault.read(file);

        // Store content to prevent re-processing
        visitedPaths.set(filePath, content);

        // Regex to find both wikilinks and transclusions
        const linkRegex = /!?\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g;
        let match;
        const promises = [];

        // Use Promise.all to fetch linked content in parallel
        while ((match = linkRegex.exec(content)) !== null) {
          const linkedFileName = match[1];
          const linkedFile = this.app.metadataCache.getFirstLinkpathDest(
            linkedFileName,
            file.path
          );

          if (linkedFile) {
            promises.push(
              this.gatherContextRecursively(
                linkedFile.path,
                maxDepth,
                currentDepth + 1,
                visitedPaths
              )
            );
          }
        }
        await Promise.all(promises);
      }
    }

    // - Checks if inside chat callout like "> [!chat user]" or ">[!chat user]"
    // - If so, checks each line moving upward to see if it starts with
    isCursorInChat() {
      const editor = this.getEditor();
      if (!editor) return false;
      const cursor = editor.getCursor();

      if (!this.isCursorInBlockquote()) return false;
      for (let i = cursor.line; i >= 0; i--) {
        const line = editor.getLine(i);
        if (this.chatRegex.test(line)) return true;
      }
      return false;
    }

    isCursorInBlockquote() {
      const editor = this.getEditor();
      if (!editor) return false;
      const cursor = editor.getCursor();
      const line = editor.getLine(cursor.line);
      return line.startsWith('>');
    }

    // Get the active chat block, going up and down until there are no >
    getActiveChat() {
      const editor = this.getEditor();
      if (!editor) return '';
      const cursor = editor.getCursor();
      let chat = '';
      for (let i = cursor.line; i >= 0; i--) {
        const line = editor.getLine(i);
        if (line.startsWith('>')) {
          chat = line + '\n' + chat;
        } else {
          break;
        }
      }
      for (let i = cursor.line + 1; i < editor.lineCount(); i++) {
        const line = editor.getLine(i);
        if (line.startsWith('>')) {
          chat += line + '\n';
        } else {
          break;
        }
      }
      return chat;
    }

    getChatMetaFromString(rawChat) {
      const matches = rawChat.match(this.chatRegex);
      return shellParser(matches?.[1] || '');
    }

    // Scan downards from cursor until no > and insert a new line
    createSpaceFor(createFor) {
      const editor = this.getEditor();
      if (!editor) return '';
      const cursor = editor.getCursor();

      let lastLineWithGreaterSign = cursor.line;
      for (let i = cursor.line + 1; i < editor.lineCount(); i++) {
        const line = editor.getLine(i);
        if (line.startsWith('>')) {
          lastLineWithGreaterSign = i;
        } else {
          break;
        }
      }

      const id = crypto.randomUUID();
      if (createFor) {
        editor.replaceRange(
          `\n> [!chat ${createFor} id=${id}] Responding...\n\n<span id="${id}">✍️🤖</span>`,
          { line: lastLineWithGreaterSign + 1, ch: 0 }
        );
      } else {
        editor.replaceRange(`> [!chat] \n`, {
          line: lastLineWithGreaterSign + 1,
          ch: 0,
        });
        editor.setCursor({ line: lastLineWithGreaterSign, ch: 10 });
      }

      return id;
    }

    // Search for <span id="${id}">
    // Insert the chunkText before the < (don't replace)
    writeAgentChunk(responseId, chunkText) {
      const editor = this.getEditor();
      if (!editor) return false;

      let content = editor.getValue();
      let index = content.lastIndexOf(`<span id="${responseId}">`);
      if (index === -1) {
        new Notice('Lost track of the ✍️🤖');
        return false;
      }

      // Get the line and character position of the <span> tag
      let line = content.substr(0, index).split('\n').length - 1;
      let ch = index - content.lastIndexOf('\n', index) - 1;

      // Insert the chunkText before the <span> tag
      editor.replaceRange(chunkText, { line: line, ch: ch });

      return true;
    }

    // Remove > [!chat agent id=${id}] Responding...
    // Remove <span id="${id}">✍️🤖</span>
    // Add 2 new lines
    // Add > [!chat]
    // Update the cursor position
    removeChatArtifacts(responseId) {
      const editor = this.getEditor();
      if (!editor) return;

      let content = editor.getValue();
      let index = content.lastIndexOf(
        `> [!chat agent id=${responseId}] Responding...`
      );
      if (index === -1) {
        new Notice('Lost track of the ✍️🤖');
        return;
      }

      // Get the line and character position of the > [!chat agent id=${id}] Responding... tag
      let line = content.substr(0, index).split('\n').length - 1;
      let ch = index - content.lastIndexOf('\n', index) - 1;

      // Remove the > [!chat agent id=${id}] Responding... tag
      editor.replaceRange(
        '',
        { line: line, ch: ch },
        {
          line: line,
          ch: ch + `> [!chat agent id=${responseId}] Responding...`.length + 2,
        }
      );

      // Remove the <span id="${id}">✍️🤖</span>
      content = editor.getValue();
      index = content.lastIndexOf(`<span id="${responseId}">✍️🤖</span>`);
      if (index === -1) {
        new Notice('Lost track of the ✍️🤖');
        return;
      }

      // Get the line and character position of the <span> tag
      line = content.substr(0, index).split('\n').length - 1;
      ch = index - content.lastIndexOf('\n', index) - 1;

      // Remove the <span id="${id}">✍️🤖</span>
      editor.replaceRange(
        '',
        { line: line, ch: ch },
        { line: line, ch: ch + `<span id="${responseId}">✍️🤖</span>`.length }
      );

      // Add 2 new lines
      editor.replaceRange('\n\n', { line: line + 1, ch: 0 });

      // Add > [!chat]
      editor.replaceRange('> [!chat] \n', { line: line + 2, ch: 0 });

      // Update the cursor position end of line
      editor.setCursor({ line: line + 2, ch: 10 });
    }

    async getHistory() {
      const editor = this.getEditor();
      if (!editor) return [];

      const history = [];
      const MAX_LINK_DEPTH = 2;

      // 1. System prompt (remains first as a general tone-setter)
      const systemPromptFile = this.app.vault.getAbstractFileByPath(
        this.settings.systemPrompt
      );
      if (systemPromptFile instanceof TFile) {
        const fileContents = await this.app.vault.read(systemPromptFile);
        history.push({ role: 'user', parts: [{ text: fileContents }] });
        history.push({ role: 'model', parts: [{ text: 'confirmed' }] });
      }

      // 2. Prepare all the user's content
      const activeFile = this.app.workspace.getActiveFile();
      let userContent = '';

      if (activeFile && editor) {
        const visitedPaths = new Map();
        await this.gatherContextRecursively(
          activeFile.path,
          MAX_LINK_DEPTH,
          0,
          visitedPaths
        );

        // A. Format linked context
        let formattedContext = '';
        const currentPageContent = visitedPaths.get(activeFile.path) || '';
        visitedPaths.delete(activeFile.path);

        for (const [path, content] of visitedPaths.entries()) {
          const file = this.app.vault.getAbstractFileByPath(path);
          if (file instanceof TFile) {
            formattedContext += `<context title="${file.basename}" path="${path}">\n${content}\n</context>\n\n`;
          }
        }

        // B. Inject cursor marker
        const cursor = editor.getCursor();
        const lines = currentPageContent.split('\n');
        lines[cursor.line] =
          lines[cursor.line].slice(0, cursor.ch) +
          '<!--CURSOR-->' +
          lines[cursor.line].slice(cursor.ch);
        const contentWithCursor = lines.join('\n');

        // C. Combine all user content together
        userContent = formattedContext + contentWithCursor;
      }

      // 3. Push the user's content first
      if (userContent.trim()) {
        history.push({
          role: 'user',
          parts: [{ text: userContent }],
        });
        history.push({
          role: 'model',
          parts: [{ text: 'Acknowledged. I have received the context.' }],
        });
      }

      // 4. Push the final instruction LAST
      const finalInstruction = `
    IMPORTANT: You are an AI assistant inside the user's personal knowledge graph. Your final instruction is to analyze all the context provided above.

    The user's current note contains a special marker, <!--CURSOR-->. This indicates their current focus. Your primary task is to generate a response that is relevant to the text immediately surrounding that cursor. Use all the preceding text, including other <context> blocks, as the knowledge base to formulate the most helpful and context-aware response possible.
    `;
      history.push({
        role: 'user',
        parts: [{ text: finalInstruction }],
      });

      return history;
    }
  };
}
