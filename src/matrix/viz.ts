import { Plugin, ItemView, WorkspaceLeaf } from 'obsidian'

export class MatrixTab extends ItemView {
  plugin: Plugin
  interval: any
  $root: HTMLElement
  $container: HTMLElement
  width: number
  height: number
  
  constructor (plugin: Plugin, leaf: WorkspaceLeaf) {
    super(leaf)
    this.plugin = plugin
    this.interval = setInterval(this.setup.bind(this), 1000/30)
  }

  getViewType(): string {return 'helenite-matrix'}
  getDisplayText(): string {return 'Matrix Rain'}  

  async onOpen(): Promise<void> {
    this.$container = this.containerEl.querySelector('.view-content') as HTMLElement

    this.$root = document.createElement('div')
    this.$root.classList.add('helenite-matrix-rain-root')
    this.$container.appendChild(this.$root)

    this.onResize()
  }

  async onClose(): Promise<void> {
    clearInterval(this.interval)
  }

  // - Calculate number of characters per line
  // - Calculate total number of lines before overflowing
  // - Create components
  onResize(): void {
    this.$container.innerHTML = ''
    this.$root.innerHTML = ''
    
    const $div = document.createElement('div')
    $div.classList.add('helenite-matrix-rain-dummy')
    $div.innerHTML = '<span>a</span>'
    this.$container.appendChild($div)

    // Calculate width
    let width = 0
    while (width < 10000) {
      const $span = document.createElement('span')
      $span.innerText = 'a'
      $span.style.wordBreak = 'break-all'
      $div.appendChild($span)
      width++

      if ($span.offsetHeight < $div.clientHeight) {
        this.width = width
        break
      }
    }

    // Calculate height
    $div.innerHTML = ''
    let height = 0
    while (height < 10000) {
      const $span = document.createElement('span')
      $span.innerText = '\n'
      $span.style.wordBreak = 'break-all'
      $div.appendChild($span)
      height++

      if ($div.offsetHeight > this.$container.clientHeight) {
        this.height = height
        break
      }
    }

    this.$container.replaceWith(this.$root)
    this.createComponents()
  }

  /**
   * Creates a component for each cell
   */
  createComponents () {
    for (let i = 0; i < this.width * this.height; i++) {
      // const $span = document.createElement('span')
      // $span.classList.add('helenite-matrix-rain-cell')
      // this.$root.appendChild($span)
    }
  }

  setup () {
    const latin = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
    const nums = '0123456789'
    const alphabet = latin + nums

    // Add a random character for each cell
    let grid = ''
    for (let i = 0; i < this.width; i++) {
      for (let j = 0; j < this.height; j++) {
        grid += alphabet.charAt(Math.floor(Math.random() * alphabet.length))
      }
    }
    this.$root.innerHTML = grid
  }
}