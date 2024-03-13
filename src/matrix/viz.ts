import { Plugin, ItemView, WorkspaceLeaf } from 'obsidian'

export class MatrixTab extends ItemView {
  plugin: Plugin
  $root: HTMLElement
  $container: HTMLElement
  width: number
  height: number
  grid: Array<any>
  drops: Array<any>
  
  constructor (plugin: Plugin, leaf: WorkspaceLeaf) {
    super(leaf)
    this.plugin = plugin
    
    this.plugin.registerEvent(
      this.plugin.app.workspace.on('editor-change', this.onEditorChange)
    )
  }

  getViewType(): string {return 'helenite-matrix'}
  getDisplayText(): string {return 'Matrix Rain'}  

  async onOpen(): Promise<void> {
    this.registerInterval(
      // @fixme possible bug due to environment: https://stackoverflow.com/questions/53189729/typescript-error-setinterval-type-timer-is-not-assignable-to-type-number
      // Without adding `window.` it will return a Timer object, instead of a number
      window.setInterval(this.setup.bind(this), 1000/30)
    )
    this.$container = this.containerEl.querySelector('.view-content') as HTMLElement

    this.$root = document.createElement('div')
    this.$root.classList.add('helenite-matrix-rain-root')
    this.$container.appendChild(this.$root)

    this.onResize()
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
    this.setup()
  }

  /**
   * Creates a component for each cell
   */
  setup () {
    this.grid = []
    for (let x = 0; x < this.width; x++) {
      this.grid[x] = []
      for (let y = 0; y < this.height; y++) {
        this.grid[x][y] = this.getRandomChar()
      }
    }

    this.draw()
  }

  draw () {
    // Add a random character for each cell
    let grid = ''
    for (let i = 0; i < this.width; i++) {
      for (let j = 0; j < this.height; j++) {
        grid += this.getRandomChar()
      }
    }
    this.$root.innerHTML = grid
  }

  getRandomChar () {
    const caps = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const lower = caps.toLowerCase()
    const nums = '0123456789'
    const alphabet = caps + lower + nums

    return alphabet.charAt(Math.floor(Math.random() * alphabet.length))
  }

  /**
   * React to editor updates
   * - Drop one matrix line
   */
  onEditorChange () {
    this.createRain()
    console.log('changed')
  }

  /**
   * Creates a new matrix rain drop
   */
  createRain () {
    this.drops.push({
      x: ~~Math.random()*this.width
    })
  }
}