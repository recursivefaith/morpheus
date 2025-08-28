import {MorpheusCore} from '../../main'
import {GoogleGenAI} from '@google/genai'
import MorpheusSettingsTab from './settings'
import MatrixTheme from '../theme/setup'
import {MatrixTab} from '../matrix/viz'
import {addIcon, WorkspaceLeaf} from 'obsidian'

// Settings
interface MorpheusSettings {
  geminiAPI: string,
  modelName: string,
  systemPrompt: string,
  skillPrompt: string,
  planningPrompt: string,
  skillFolder: string
}

const DEFAULT_SETTINGS: MorpheusSettings = {
  geminiAPI: '',
  modelName: 'models/gemini-2.5-flash',
  systemPrompt: '',
  skillPrompt: '',
  planningPrompt: '',
  skillFolder: ''
}

export default function mixinSetup(baseClass: typeof MorpheusCore) {
  return class extends baseClass {
    async onload() {
      (globalThis as any).morpheus = this
      
      // Register views
      this.registerView('morpheus-matrix', (leaf: WorkspaceLeaf) => new MatrixTab(this, leaf))
      
      // Setup
      await this.loadSettings()
      await this.init()
      this.genAI = new GoogleGenAI({ 
        apiKey: this.settings.geminiAPI 
      })
      this.theme = new MatrixTheme(this)
      let hasScanned = false
      this.app.workspace.onLayoutReady(() => {
        !hasScanned && this.theme.applySplittingToAllTitles()
        hasScanned = true
      })
    }
    // @todo
    onunload() {
      this.theme.unload()
    }
    
    async init() {
      this.addSettingTab(new MorpheusSettingsTab(this.app, this))
      addIcon('morpheusLogo', `<g transform="scale(4.5,4.5)" fill="none" stroke="currentColor">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bot-message-square"><path d="M12 6V2H8"/><path d="m8 18-4 4V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2Z"/><path d="M2 12h2"/><path d="M9 11v2"/><path d="M15 11v2"/><path d="M20 12h2"/></svg>
      </g>`)
      const ribbonIconEl = this.addRibbonIcon('morpheusLogo', 'MorpheusAI', (evt: MouseEvent) => this.onRibbonMainClick(evt))
      ribbonIconEl.addClass('morpheus')
      this.addCommand({
        id: 'morpheus-start-submit',
        name: 'Start/Submit Chat',
        hotkeys: [{modifiers: ['Mod'], key: 'Enter'}],
        callback: () => this.onRibbonMainClick(null),
      })
      const matrixIconEl = this.addRibbonIcon('rabbit', 'Show Matrix Rain', (evt: MouseEvent) => this.onRibbonMatrixClick(evt))
      matrixIconEl.addClass('morpheus')
      this.addCommand({
        id: 'morpheus-start-matrix-rain',
        name: 'Show Matrix Rain',
        hotkeys: [{modifiers: ['Ctrl', 'Shift'], key: 'M'}],
        callback: () => this.onRibbonMatrixClick(null),
      })
    }
    async loadSettings() {
      this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
    }
    async saveSettings() {
      await this.saveData(this.settings)
    }    
  }
}
