import {MorpheusCore} from "../../main"
import {MarkdownView, Notice} from 'obsidian'
import MarkdownIt from 'markdown-it'
import MarkdownItAttrs from 'markdown-it-attrs'
import shellParser from 'shell-quote/parse'

const md = new MarkdownIt({html: true})
md.use(MarkdownItAttrs)

export default function mixinEditor(baseClass: typeof MorpheusCore) {
  return class extends baseClass {
    getEditor(): CodeMirror.Editor | null {
      const activeLeaf = this.app.workspace.activeLeaf
      if (activeLeaf?.view instanceof MarkdownView) {
        // @ts-ignore: sourceMode is private i think but also this is the recommend way to access this
        return activeLeaf.view.sourceMode.cmEditor
      }
      return null
    }

    // - Checks if inside chat callout like "> [!chat user]" or ">[!chat user]"
    // - If so, checks each line moving upward to see if it starts with
    isCursorInChat(): boolean {
      const editor = this.getEditor()
      if (!editor) return false
      const cursor = editor.getCursor()

      if (!this.isCursorInBlockquote()) return false
      for (let i = cursor.line; i >= 0; i--) {
        const line = editor.getLine(i)
        if (this.chatRegex.test(line)) return true
      }
      return false
    }

    isCursorInBlockquote(): boolean {
      const editor = this.getEditor()
      if (!editor) return false
      const cursor = editor.getCursor()
      const line = editor.getLine(cursor.line)
      return line.startsWith('>')
    }

    // Get the active chat block, going up and down until there are no >
    getActiveChat(): string {
      const editor = this.getEditor()
      if (!editor) return ''
      const cursor = editor.getCursor()
      let chat = ''
      for (let i = cursor.line; i >= 0; i--) {
        const line = editor.getLine(i)
        if (line.startsWith('>')) {
          chat = line + '\n' + chat
        } else {
          break
        }
      }
      for (let i = cursor.line + 1; i < editor.lineCount(); i++) {
        const line = editor.getLine(i)
        if (line.startsWith('>')) {
          chat += line + '\n'
        } else {
          break
        }
      }
      return chat
    }

    getChatMetaFromString(rawChat: string):[] {
      const matches = rawChat.match(this.chatRegex)
      return shellParser(matches?.[1] || '')
    }

    // Scan downards from cursor until no > and insert a new line
    createSpaceFor(createFor:string):string | '' {
      const editor = this.getEditor()
      if (!editor) return ''
      const cursor = editor.getCursor()

      let lastLineWithGreaterSign = cursor.line
      for (let i = cursor.line + 1; i < editor.lineCount(); i++) {
        const line = editor.getLine(i)
        if (line.startsWith('>')) {
          lastLineWithGreaterSign = i
        } else {
          break
        }
      }

      const id = crypto.randomUUID()
      if (createFor) {
        // @todo use a template for this, so we don't forget about <span id="${id}">
        editor.replaceRange(`\n> [!chat ${createFor} id=${id}] Responding...\n\n<span id="${id}">✍️🤖</span>`, {line: lastLineWithGreaterSign + 1, ch: 0})
      } else {
        editor.replaceRange(`> [!chat] \n`, {line: lastLineWithGreaterSign + 1, ch: 0})
        editor.setCursor({line: lastLineWithGreaterSign, ch: 10})
      }
      
      return id
    }

    // Search for <span id="${id}">
    // Insert the chunkText before the < (don't replace)
    writeAgentChunk(responseId: string, chunkText: string):boolean {
      const editor = this.getEditor()
      if (!editor) return false

      let content = editor.getValue();
      let index = content.lastIndexOf(`<span id="${responseId}">`);
      if (index === -1) {
          new Notice('Lost track of the ✍️🤖');
          return false;
      }
  
      // Get the line and character position of the <span> tag
      let line = content.substr(0, index).split('\n').length - 1
      let ch = index - content.lastIndexOf('\n', index) - 1

      // Insert the chunkText before the <span> tag
      editor.replaceRange(chunkText, {line: line, ch: ch})

      return true
    }

    // Remove > [!chat agent id=${id}] Responding...
    // Remove <span id="${id}">✍️🤖</span>
    // Add 2 new lines
    // Add > [!chat]
    // Update the cursor position
    removeChatArtifacts(responseId: string):void {
      const editor = this.getEditor()
      if (!editor) return
  
      let content = editor.getValue()
      let index = content.lastIndexOf(`> [!chat agent id=${responseId}] Responding...`)
      if (index === -1) {
        new Notice('Lost track of the ✍️🤖')
        return
      }
  
      // Get the line and character position of the > [!chat agent id=${id}] Responding... tag
      let line = content.substr(0, index).split('\n').length - 1
      let ch = index - content.lastIndexOf('\n', index) - 1
  
      // Remove the > [!chat agent id=${id}] Responding... tag
      editor.replaceRange('', {line: line, ch: ch}, {line: line, ch: ch + `> [!chat agent id=${responseId}] Responding...`.length+2})
  
      // Remove the <span id="${id}">✍️🤖</span>
      content = editor.getValue()
      index = content.lastIndexOf(`<span id="${responseId}">✍️🤖</span>`)
      if (index === -1) {
        new Notice('Lost track of the ✍️🤖')
        return;
      }
  
      // Get the line and character position of the <span> tag
      line = content.substr(0, index).split('\n').length - 1
      ch = index - content.lastIndexOf('\n', index) - 1
  
      // Remove the <span id="${id}">✍️🤖</span>
      editor.replaceRange('', {line: line, ch: ch}, {line: line, ch: ch + `<span id="${responseId}">✍️🤖</span>`.length})
  
      // Add 2 new lines
      editor.replaceRange('\n\n', {line: line + 1, ch: 0})
  
      // Add > [!chat]
      editor.replaceRange('> [!chat] \n', {line: line + 2, ch: 0})
  
      // Update the cursor position end of line
      editor.setCursor({line: line + 2, ch: 10})
    }
  }
}
