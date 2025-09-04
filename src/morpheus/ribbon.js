import { Notice } from 'obsidian';
import { MorpheusCore } from '..';
import { MatrixTab } from '../matrix/viz';
import { TtydView } from '../ttyd/TtydView'; 
import llm from './model/gemini';

export default function mixinRibbon(baseClass) {
  return class extends baseClass {
    async onRibbonMainClick(evt) {
      if (this.isCursorInChat()) {
        const history = await this.getHistory();
        const rawChat = this.getActiveChat();
        const responseId = this.createSpaceFor('agent', '');
        const message = llm.prepareMessage(rawChat);
        const contents = [
          ...history,
          { role: 'user', parts: [{ text: message }] },
        ];
        this.isThinking = true;
        this.waitingForFirstChunk = false;
        try {
          const response = await this.genAI.models.generateContentStream({
            model: this.settings.modelName || 'models/gemini-2.5-flash',
            contents,
            generationConfig: {
              temperature: 0.7,
              topP: 0.8,
              topK: 40,
              maxOutputTokens: 8192,
            },
          });
          let text = '';
          for await (const chunk of response) {
            this.waitingForFirstChunk = true;
            const chunkText = chunk.text;
            text += chunkText;
            if (!this.writeAgentChunk(responseId, chunkText)) break;
          }
        } catch (e) {
          console.error(e);
          new Notice(e.toString());
          this.createSpaceFor('error', e.toString());
        }
        this.removeChatArtifacts(responseId);
        this.isThinking = false;
        this.waitingForFirstChunk = true;
      } else {
        this.createSpaceFor('', '');
      }
    }

    async onRibbonMatrixClick(evt) {
      const leaf = this.app.workspace.getLeaf('split', 'vertical');
      const tab = new MatrixTab(this, leaf);
      leaf.open(tab);
    }

    async onRibbonTtydClick(evt) {
      const leaf = this.app.workspace.getLeaf('split', 'vertical');
      const tab = new TtydView(this, leaf);
      leaf.open(tab);
    }    
  };
}