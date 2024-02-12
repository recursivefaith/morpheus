import {Notice} from 'obsidian'
import {HeleniteCore} from '../../main'
import llm from './model/gemini'

export default function mixinRibbon(baseClass: typeof HeleniteCore) {
  return class extends baseClass {
    
    async onRibbonClick(evt: MouseEvent | null) {
      // If in chat, send to LLM
      if (this.isCursorInChat()) {
        const rawChat = this.getActiveChat()
        const chatMeta = this.getChatMetaFromString(rawChat)
        const responseId = this.createSpaceFor('agent', '')
        
        const message = llm.prepareMessage(rawChat)
        const chat = await this.model.startChat({
          // @todo: 
          history: [],
          generationConfig: {}
        })

        // Stream results
        try {
          const result = await chat.sendMessageStream(message.parts)
          let text = ''
          for await (const chunk of result.stream) {
            const chunkText = await chunk.text()
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
        // if not in chat, create one
      } else {
        this.createSpaceFor('', '')
      }
    }    
  }
}