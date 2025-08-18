import {Plugin} from 'obsidian'
import {GoogleGenerativeAI, GenerativeModel} from '@google/generative-ai'
import mixinSetup from 'src/morpheus/setup'
import mixinRibbon from 'src/morpheus/ribbon'
import mixinEditor from 'src/morpheus/editor'
import mixinSkills from 'src/morpheus/skills'
import MatrixTheme from 'src/theme/setup'

// @see src/morpheus/setup.ts for Theme setup as well
export class MorpheusCore extends Plugin {
  settings: any
  isThinking: boolean
  waitingForFirstChunk: boolean
  genAI: GoogleGenerativeAI
  model: GenerativeModel
  theme: MatrixTheme
  chatRegex = /(?:^|\n)>\s?\[!chat\s?([^\]]*)\]/i

  // Setup
  saveSettings(){}

  // Ribbon
  onRibbonMainClick(evt: MouseEvent | null): Promise<void> {return new Promise((resolve) => {resolve()})}
  onRibbonMatrixClick(evt: MouseEvent | null): Promise<void> {return new Promise((resolve) => {resolve()})}
  
  // Editor
  onSubmitChat(){}
  getEditor(): CodeMirror.Editor | null {return null}
  isCursorInChat(): boolean {return false}
  getActiveChat(): string {return ''}
  getChatMetaFromString(rawChat: string):[] {return []}
  createSpaceFor(createFor:string, message:string|''):string {return ''}
  writeAgentChunk(responseId: string, chunkText: string):boolean {return false}
  removeChatArtifacts(responseId: string):void {}
  getHistory():Promise<[]> {return Promise.resolve([])}
}

export default mixinEditor(mixinRibbon(mixinSetup(MorpheusCore)))