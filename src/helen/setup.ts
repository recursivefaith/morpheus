import {HeleniteCore} from '../../main'
import {GoogleGenerativeAI} from '@google/generative-ai'
import HeleniteSettingsTab from './settings'

// Settings
interface HeleniteSettings {geminiAPI: string}
const DEFAULT_SETTINGS: HeleniteSettings = {geminiAPI: ''}

export default function mixinSetup(baseClass: typeof HeleniteCore) {
  return class extends baseClass {
    async onload() {
      await this.loadSettings()
      await this.init()
      this.genAI = new GoogleGenerativeAI(this.settings.geminiAPI)
      this.model = this.genAI.getGenerativeModel({model: 'gemini-pro'})
    }

    // @todo
    onunload() {}

    async init() {
      // Ribbon
      const ribbonIconEl = this.addRibbonIcon('mountain', 'Helenite', (evt: MouseEvent) => this.onRibbonClick(evt))
      ribbonIconEl.addClass('helenite')

      // Commands
      this.addSettingTab(new HeleniteSettingsTab(this.app, this))
      this.addCommand({
        id: 'helenite-start-submit',
        name: 'Start/Submit Chat',
        hotkeys: [
          {
            modifiers: ['Ctrl'],
            key: 'Enter',
          },
        ],
        callback: () => this.onRibbonClick(null),
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