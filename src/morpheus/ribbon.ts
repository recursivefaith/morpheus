import {Notice} from 'obsidian'
import {MorpheusCore} from '../../main'
import {MatrixTab} from '../matrix/viz'
import llm from './model/gemini'

export default function mixinRibbon(baseClass: typeof MorpheusCore) {
  return class extends baseClass {
    
    async onRibbonMainClick(evt: MouseEvent | null) {
      // If in chat, send to LLM
      if (this.isCursorInChat()) {
        const history = await this.getHistory()
        const rawChat = this.getActiveChat()
        const chatMeta = this.getChatMetaFromString(rawChat)
        const responseId = this.createSpaceFor('agent', '')
        
        const message = llm.prepareMessage(rawChat)
        
        // Build contents array with history + current message
        const contents = [
          ...history,
          {
            role: "user",
            parts: [{ text: message }]
          }
        ]
        
        // Stream results using the new API
        this.isThinking = true
        this.waitingForFirstChunk = false
        try {
          const response = await this.genAI.models.generateContentStream({
            model: "gemini-2.0-flash",
            contents: contents,
            generationConfig: {
              temperature: 0.7,
              topP: 0.8,
              topK: 40,
              maxOutputTokens: 8192,
            }
          })
          
          let text = ''
          for await (const chunk of response) {
            this.waitingForFirstChunk = true
            const chunkText = chunk.text
            text += chunkText
            if (!this.writeAgentChunk(responseId, chunkText)) {
              break
            }
          }
        } catch (e: any) {
          console.error(e)
          new Notice(e.toString())
          this.createSpaceFor('error', e.toString())
        }
        // Cleanup
        this.removeChatArtifacts(responseId)
        this.isThinking = false
        this.waitingForFirstChunk = true
        // if not in chat, create one
      } else {
        this.createSpaceFor('', '')
      }
    }
    // Matrix rain tab
    async onRibbonMatrixClick(evt: MouseEvent | null) {
      const leaf = this.app.workspace.getLeaf('split', 'vertical')
      const tab = new MatrixTab(this, leaf)
      leaf.open(tab)
    }
  }
}
