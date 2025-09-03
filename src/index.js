import { Plugin } from 'obsidian';
import mixinSetup from './morpheus/setup';
import mixinRibbon from './morpheus/ribbon';
import mixinEditor from './morpheus/editor';
import mixinSkills from './morpheus/skills';
import MatrixTheme from './theme/setup';

// @see ./morpheus/setup.js for Theme setup as well
export class MorpheusCore extends Plugin {
  settings;
  isThinking;
  waitingForFirstChunk;
  genAI;
  model;
  theme;
  chatRegex = /(?:^|\n)>\s?\[!chat\s?([^\]]*)\]/i;

  // Setup
  saveSettings() {}

  // Ribbon
  onRibbonMainClick(evt) {
    return new Promise((resolve) => {
      resolve();
    });
  }
  onRibbonMatrixClick(evt) {
    return new Promise((resolve) => {
      resolve();
    });
  }

  // Editor
  onSubmitChat() {}
  getEditor() {return null;}
  isCursorInChat() {return false;}
  getActiveChat() {return '';}
  getChatMetaFromString(rawChat) {return [];}
  createSpaceFor(createFor, message) {return '';}
  writeAgentChunk(responseId, chunkText) {return false;}
  removeChatArtifacts(responseId) {}
  getHistory() {return Promise.resolve([]);}
}

export default mixinEditor(mixinRibbon(mixinSetup(MorpheusCore)));
