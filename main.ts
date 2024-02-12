import {Plugin} from 'obsidian'
import {GoogleGenerativeAI, GenerativeModel} from '@google/generative-ai'
import mixinSetup from 'src/helen/setup'
import mixinRibbon from 'src/helen/ribbon'
import mixinEditor from 'src/helen/editor'

export class HeleniteCore extends Plugin {
  settings: any
  state: {isActive: false}
  genAI: GoogleGenerativeAI
  model: GenerativeModel
  chatRegex = /(?:^|\n)>\s?\[!chat\s?([^\]]*)\]/i

  // Setup
  saveSettings(){}

  // Ribbon
  onRibbonClick(evt: MouseEvent | null): Promise<void> {return new Promise((resolve) => {resolve()})}
  
  // Editor
  onSubmitChat(){}
  getEditor(): CodeMirror.Editor | null {return null}
  isCursorInChat(): boolean {return false}
  getActiveChat(): string {return ''}
  getChatMetaFromString(rawChat: string):[] {return []}
  createSpaceFor(createFor:string, message:string|''):string {return ''}
  writeAgentChunk(responseId: string, chunkText: string):boolean {return false}
  removeChatArtifacts(responseId: string):void {}
}

export default mixinEditor(mixinRibbon(mixinSetup(HeleniteCore)))