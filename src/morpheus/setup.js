// src/morpheus/setup.js

import { MorpheusCore } from '../index.js';
import { GoogleGenAI } from '@google/genai';
import MorpheusSettingsTab from './settings.js';
import MatrixTheme from '../theme/setup.js';
import { MatrixTab } from '../matrix/viz.js';
import { TtydView, TTYD_VIEW_TYPE } from '../ttyd/TtydView.js';
import { addIcon } from 'obsidian';

// 1. Add the new setting with its default value
const DEFAULT_SETTINGS = {
  geminiAPI: '',
  modelName: 'models/gemini-2.5-flash',
  systemPrompt: '',
  skillPrompt: '',
  planningPrompt: '',
  skillFolder: '',
  ttydPort: 7681, // Default TTYD port
};

export default function mixinSetup(baseClass) {
  return class extends baseClass {
    async onload() {
      globalThis.morpheus = this;

      this.registerView('morpheus-matrix', (leaf) => new MatrixTab(this, leaf));
      this.registerView(TTYD_VIEW_TYPE, (leaf) => new TtydView(this, leaf));

      await this.loadSettings();
      await this.init();

      if (this.settings.geminiAPI) {
        this.genAI = new GoogleGenAI({
            apiKey: this.settings.geminiAPI,
        });
      }
      
      this.theme = new MatrixTheme(this);
      let hasScanned = false;
      this.app.workspace.onLayoutReady(() => {
        !hasScanned && this.theme.applySplittingToAllTitles();
        hasScanned = true;
      });
    }

    onunload() {
      this.theme.unload();
    }

    async init() {
      this.addSettingTab(new MorpheusSettingsTab(this.app, this));
      addIcon(
        'morpheusLogo',
        `<g transform="scale(4.5,4.5)" fill="none" stroke="currentColor">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bot-message-square"><path d="M12 6V2H8"/><path d="m8 18-4 4V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2Z"/><path d="M2 12h2"/><path d="M9 11v2"/><path d="M15 11v2"/><path d="M20 12h2"/></svg>
      </g>`
      );
      const ribbonIconEl = this.addRibbonIcon(
        'morpheusLogo',
        'MorpheusAI',
        (evt) => this.onRibbonMainClick(evt)
      );
      ribbonIconEl.addClass('morpheus');
      this.addCommand({
        id: 'morpheus-start-submit',
        name: 'Start/Submit Chat',
        hotkeys: [{ modifiers: ['Mod'], key: 'Enter' }],
        callback: () => this.onRibbonMainClick(null),
      });

      addIcon(
        'morpheusTerminal',
        `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-terminal-square"><path d="M4 20h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z"/><path d="m7 11 2 2-2 2"/><path d="M11 15h4"/></svg>`
      );
      const ttydIconEl = this.addRibbonIcon(
        'morpheusTerminal',
        'Open TTYD Terminal',
        (evt) => this.onRibbonTtydClick(evt)
      );
      ttydIconEl.addClass('morpheus');
      this.addCommand({
        id: 'morpheus-open-ttyd',
        name: 'Open TTYD Terminal',
        callback: () => this.onRibbonTtydClick(null),
      });

      const matrixIconEl = this.addRibbonIcon(
        'rabbit',
        'Show Matrix Rain',
        (evt) => this.onRibbonMatrixClick(evt)
      );
      matrixIconEl.addClass('morpheus');
      this.addCommand({
        id: 'morpheus-start-matrix-rain',
        name: 'Show Matrix Rain',
        hotkeys: [{ modifiers: ['Ctrl', 'Shift'], key: 'M' }],
        callback: () => this.onRibbonMatrixClick(null),
      });
    }

    async loadSettings() {
      this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }
    
    async saveSettings() {
      await this.saveData(this.settings);
    }
  };
}

