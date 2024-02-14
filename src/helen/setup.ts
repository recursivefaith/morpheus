import {HeleniteCore} from '../../main'
import {GoogleGenerativeAI} from '@google/generative-ai'
import HeleniteSettingsTab from './settings'
import HeleniteTheme from '../theme/setup'
import {addIcon} from 'obsidian'

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
      this.theme = new HeleniteTheme(this)

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
      // Ribbon
      addIcon('heliniteLogo', `<g transform="translate(100, 100) scale(0.02015625,0.02015625) rotate(-180)" fill="currentColor">
        <path d="M2496 4893 c-38 -20 -680 -501 -684 -512 -1 -4 166 -135 373 -290 l375 -281 375 281 c207 155 374 286 373 290 -4 11 -649 494 -686 513 -39 20 -88 20 -126 -1z"/>
        <path d="M1674 4069 c3 -19 51 -493 106 -1054 56 -561 103 -1030 105 -1042 5 -21 8 -22 88 -16 110 8 183 -12 319 -87 60 -33 111 -60 113 -60 3 0 5 391 5 869 l0 869 -337 252 c-186 140 -353 265 -371 278 l-34 26 6 -35z"/>
        <path d="M3077 3823 l-367 -275 0 -869 c0 -478 3 -869 6 -869 3 0 54 27 113 60 134 75 207 95 319 87 45 -3 82 -5 83 -4 2 5 217 2142 215 2144 -1 1 -167 -122 -369 -274z"/>
        <path d="M735 3780 c-38 -8 -66 -23 -86 -47 -15 -16 -408 -764 -424 -805 -7 -17 15 -18 379 -18 l386 0 236 138 235 137 -6 60 c-3 33 -8 83 -11 112 l-6 52 -287 169 c-372 220 -360 214 -416 202z"/>
        <path d="M4317 3775 c-19 -7 -170 -92 -335 -189 l-300 -178 -6 -51 c-3 -29 -8 -79 -11 -112 l-6 -60 236 -137 236 -138 385 0 c211 0 384 3 384 6 0 13 -413 799 -428 817 -37 42 -103 60 -155 42z"/>
        <path d="M1337 2767 c-75 -45 -136 -86 -134 -92 2 -5 55 -227 117 -492 63 -266 118 -483 123 -483 11 0 146 80 152 90 9 15 -99 1060 -110 1060 -5 -1 -72 -38 -148 -83z"/>
        <path d="M3572 2324 c-29 -289 -50 -529 -47 -534 6 -10 141 -90 152 -90 5 0 60 217 123 483 62 265 115 487 117 493 3 10 -264 174 -284 174 -5 0 -32 -237 -61 -526z"/>
        <path d="M236 2528 c20 -46 117 -276 216 -513 100 -236 182 -431 184 -433 1 -2 53 13 116 34 103 34 125 38 246 42 82 2 132 8 132 14 0 10 -190 823 -211 901 l-10 37 -354 0 -354 0 35 -82z"/>
        <path d="M4201 2573 c-22 -83 -211 -891 -211 -901 0 -8 32 -12 105 -12 155 0 249 -26 341 -96 l32 -23 135 322 c75 177 176 418 225 535 l90 212 -354 0 -353 0 -10 -37z"/>
        <path d="M1960 1653 c-8 -3 -122 -71 -253 -149 l-237 -144 -268 0 -267 0 -310 -103 c-171 -57 -324 -111 -341 -120 -39 -20 -39 -20 -172 -278 l-112 -216 0 -157 c0 -184 12 -221 80 -256 39 -20 53 -20 2480 -20 2427 0 2441 0 2480 20 68 35 80 72 80 255 0 138 -2 160 -21 196 -24 48 -53 63 -355 180 l-190 74 -147 196 c-106 142 -157 202 -181 213 -29 13 -78 16 -304 16 l-270 0 -244 148 c-319 193 -270 192 -600 10 l-247 -137 -248 136 c-197 108 -257 137 -293 139 -25 2 -52 1 -60 -3z"/>
      </g>`)
      const ribbonIconEl = this.addRibbonIcon('heliniteLogo', 'Helenite', (evt: MouseEvent) => this.onRibbonClick(evt))
      ribbonIconEl.addClass('helenite')

      // Commands
      this.addSettingTab(new HeleniteSettingsTab(this.app, this))
      this.addCommand({
        id: 'helenite-start-submit',
        name: 'Start/Submit Chat',
        hotkeys: [{modifiers: ['Mod'], key: 'Enter'}],
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