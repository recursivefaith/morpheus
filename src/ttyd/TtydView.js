import { ItemView, WorkspaceLeaf } from 'obsidian';

export const TTYD_VIEW_TYPE = 'morpheus-ttyd';

export class TtydView extends ItemView {
  plugin;

  constructor(plugin, leaf) {
    super(leaf);
    this.plugin = plugin;
  }

  getViewType() {
    return TTYD_VIEW_TYPE;
  }

  getDisplayText() {
    return 'TTYD Terminal';
  }

  async onOpen() {
    const container = this.containerEl.children[1];
    container.empty();

    const iframe = container.createEl('iframe');
    
    const port = this.plugin.settings.ttydPort || '7681';
    iframe.src = `http://localhost:${port}`;
    
    // Updated sandbox settings to allow for full interaction
    iframe.setAttribute('sandbox', 'allow-scripts allow-forms allow-same-origin allow-popups allow-modals allow-pointer-lock');
    
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
  }

  async onClose() {
    // Cleanup if needed
  }
}
