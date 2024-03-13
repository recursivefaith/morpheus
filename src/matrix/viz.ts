import { Plugin, ItemView, WorkspaceLeaf } from 'obsidian'

export class MatrixTab extends ItemView {
  plugin: Plugin
  
  constructor (plugin: Plugin, leaf: WorkspaceLeaf) {
    super(leaf)
    this.plugin = plugin
  }

  getViewType(): string {return 'helenite-matrix'}
  getDisplayText(): string {return 'Matrix Rain'}  

  async onOpen(): Promise<void> {
    console.log('test')
  }
}