import { Plugin, ItemView, WorkspaceLeaf } from 'obsidian'
import {map} from '../helpers'

interface Layer {
  text: string,
  $: HTMLElement
}

export class MatrixTab extends ItemView {
  plugin: Plugin
  $root: HTMLElement
  $container: HTMLElement
  layers: any
  width: number
  height: number
  grid: Array<any>
  drops: Array<any>
  
  constructor (plugin: Plugin, leaf: WorkspaceLeaf) {
    super(leaf)
    this.plugin = plugin
    this.drops = []
    
    this.plugin.registerEvent(
      this.plugin.app.workspace.on('editor-change', this.onEditorChange.bind(this))
    )
  }

  getViewType(): string {return 'helenite-matrix'}
  getDisplayText(): string {return 'Matrix Rain'}  

  async onOpen(): Promise<void> {
    this.$container = this.containerEl.querySelector('.view-content') as HTMLElement

    this.$root = document.createElement('div')
    this.$root.classList.add('helenite-matrix-rain-root')
    this.$container.appendChild(this.$root)

    this.onResize()

    this.registerInterval(
      // @fixme possible bug due to environment: https://stackoverflow.com/questions/53189729/typescript-error-setinterval-type-timer-is-not-assignable-to-type-number
      // Without adding `window.` it will return a Timer object, instead of a number
      window.setInterval(this.draw.bind(this), 1000/30)
    )
  }

  // - Calculate number of characters per line
  // - Calculate total number of lines before overflowing
  // - Create components
  onResize(): void {
    const $div = document.createElement('div')
    $div.classList.add('helenite-matrix-rain-dummy')
    $div.innerHTML = '#'
    $div.style.overflowWrap = 'break-word'
    $div.style.whiteSpace = 'pre-wrap'
    this.$root.appendChild($div)

    // Sometimes the height is 0
    if ($div.clientHeight === 0) {
      setTimeout(() => this.onResize(), 50)
      console.log('waiting')
      return
    }
    const initialHeight = $div.clientHeight

    // Calculate width
    this.width = 0
    const $checker = document.createElement('div')
    $checker.style.overflowWrap = 'break-word'
    $checker.style.whiteSpace = 'pre-wrap'
    $div.appendChild($checker)
    while ($checker.offsetHeight <= initialHeight && this.width < 1000) {
      $checker.innerHTML += '#'
      this.width++
    }

    // Calculate height
    $checker.innerHTML = ''
    this.height = 0
    while ($checker.clientHeight <= this.$container.clientHeight && this.height < 1000) {
      $checker.innerHTML += '#<br>'
      this.height++
    }

    $div.remove()
    $checker.remove()
    this.setup()
  }

  /**
   * Creates a component for each cell
   */
  setup () {
    // 0 = background
    // 1-3 = primary, dim to brightest
    // 4 = secondary
    // 5 = tertiary
    this.$root.innerHTML = `
      <div class="helenite-matrix-layer" data-layer="0"></div>
      <div class="helenite-matrix-layer" data-layer="1"></div>
      <div class="helenite-matrix-layer" data-layer="2"></div>
      <div class="helenite-matrix-layer" data-layer="3"></div>
      <div class="helenite-matrix-layer" data-layer="4"></div>
      <div class="helenite-matrix-layer" data-layer="5"></div>
    `
    const $layers = this.$root.querySelectorAll('.helenite-matrix-layer')
    this.layers = []
    $layers.forEach($layer => {
      this.layers.push({
        $: $layer,
        text: ''
      })
    })
  }

  draw () {
    if (!this.layers) return
    this.layers.forEach((layer: Layer) => {
      layer.text = ''
    })
    
    // Add a random character for each cell
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        this.layers[0].text += this.getRandomChar()
        for (let n = 1; n < this.layers.length; n++) {
          this.layers[n].text += '\u00A0'
        }
      }
    }

    // Drop matrix rain
    this.drops.forEach((drop, n) => {
      drop.y += drop.speed
      const y = Math.floor(drop.y)
      
      // remove once it extends beyond height
      if (y > this.height+drop.len) {
        this.drops.splice(n, 1)
        return
      }

      for (let i = 0; i < drop.len; i++) {
        // Get cell to change
        const rowLen = (y-i)*(this.width-2)
        let cellToChange = drop.x + rowLen
        if (cellToChange < 0 || cellToChange >= this.layers[0].text.length) continue
        
        // Sparkle
        let layerIdx = Math.floor(map(i, 0, drop.len, this.layers.length-3, 0))
        if (!i || (layerIdx === 3 && Math.random() > .5)) layerIdx=Math.floor(map(Math.random(), 0, 1, 3, 5))
        
        // Change
        this.layers[0].text = this.layers[0].text.slice(0, Math.max(0, cellToChange-1)) + '\u00A0' + this.layers[0].text.slice(cellToChange)
        this.layers[layerIdx].text = this.layers[layerIdx].text.slice(0, Math.max(0, cellToChange-1)) + this.getRandomChar() + this.layers[layerIdx].text.slice(cellToChange)
      }
    })

    // Draw
    this.layers.forEach((layer: Layer) => {
      layer.$.innerHTML = layer.text
    })
  }

  getRandomChar () {
    const caps = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ\u00A0'
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
  }

  /**
   * Creates a new matrix rain drop
   */
  createRain () {
    for (let i = 0; i < Math.max(3, Math.random()*this.width*1.5); i++) {
      // y*speed = maximum time for rain to clear
      this.drops.push({
        x: Math.floor(Math.random()*this.width),
        y: Math.floor(Math.random()*-this.height*3.5),
        len: Math.floor(Math.random() * this.height) + 2,
        speed: Math.random() * 1.25 + .5
      })
    }
  }
}