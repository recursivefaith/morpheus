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

  getViewType(): string {return 'morpheus-matrix'}
  getDisplayText(): string {return 'Matrix Rain'}  

  async onOpen(): Promise<void> {
    this.$container = this.containerEl.querySelector('.view-content') as HTMLElement

    this.$root = document.createElement('div')
    this.$root.classList.add('morpheus-matrix-rain-root')
    this.$container.appendChild(this.$root)

    setTimeout(() => this.onResize(), 100)

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
    $div.classList.add('morpheus-matrix-rain-dummy')
    $div.innerHTML = '#'
    $div.style.overflowWrap = 'break-word'
    $div.style.whiteSpace = 'pre-wrap'
    this.$root.appendChild($div)

    // Sometimes the height is 0
    if ($div.clientHeight === 0) {
      setTimeout(() => this.onResize(), 100)
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
      <div class="morpheus-matrix-layer" data-layer="0"></div>
      <div class="morpheus-matrix-layer" data-layer="1"></div>
      <div class="morpheus-matrix-layer" data-layer="2"></div>
      <div class="morpheus-matrix-layer" data-layer="3"></div>
      <div class="morpheus-matrix-layer" data-layer="4"></div>
      <div class="morpheus-matrix-layer" data-layer="5"></div>
     
      <div class="morpheus-matrix-layer" data-layer="6"></div>
      <div class="morpheus-matrix-layer" data-layer="7"></div>
      <div class="morpheus-matrix-layer" data-layer="8"></div>

      <div class="morpheus-matrix-layer" data-layer="9"></div>
      <div class="morpheus-matrix-layer" data-layer="10"></div>
      <div class="morpheus-matrix-layer" data-layer="11"></div>

      <div class="morpheus-matrix-layer" data-layer="12"></div>
      <div class="morpheus-matrix-layer" data-layer="13"></div>
      <div class="morpheus-matrix-layer" data-layer="14"></div>
      `
    const $layers = this.$root.querySelectorAll('.morpheus-matrix-layer')
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

    // Empty fill string
    // @todo cache
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        this.layers[0].text += this.getRandomChar()
        this.layers[1].text += '\u00A0'
      }
    }
    for (let n = 2; n < this.layers.length; n++) {
      this.layers[n].text = this.layers[1].text
    }

    // Create matrix while thinking
    let count = Math.max(3, Math.random()*this.width/2)
    // @ts-ignore
    if (this.plugin.isThinking && !this.plugin.waitingForFirstChunk && Math.random() > .9) {
      this.createRain({style: 'primary', count: count*1})
      this.createRain({style: 'info', count: count*.25})
    }

    // Used to ignore painting on top of each other
    let changedCells: any = []
    for (let i = 0; i < this.layers[1].text.length; i++) {
      changedCells.push(false)
    }
    
    this.drops.forEach((drop, n) => {
      drop.y += drop.speed
      const y = Math.floor(drop.y)
      
      // remove once it extends beyond height
      if (y > this.height+drop.len) {
        this.drops.splice(n, 1)
        return
      }

      for (let i = drop.len; i >= 0; i--) {
        // Get cell to change
        const rowLen = (y-i)*(this.width-1)
        let cellToChange = drop.x + rowLen
        if (cellToChange < 0 || cellToChange >= this.layers[1].text.length) continue
        
        // Skip or clear if already filled from top
        if (i && changedCells?.[cellToChange]) continue
        changedCells[cellToChange] = true

        // Change style
        let layerIdx
        switch (drop.style) {
          case 'secondary':
            layerIdx = Math.floor(map(i, 0, drop.len, 9, 11))
          break

          case 'negative':
            layerIdx = Math.floor(map(i, 0, drop.len, 6, 8))
          break

          case 'info':
            layerIdx = Math.floor(map(i, 0, drop.len, 12, 14))
          break

          default:
            layerIdx = Math.floor(map(i, 0, drop.len, 3, 0))
        }

        if (!i || (layerIdx === 3 && Math.random() > .5)) layerIdx=Math.floor(map(Math.random(), 0, 1, 3, 5))
        this.layers[layerIdx].text = this.layers[layerIdx].text.slice(0, Math.max(0, cellToChange-1)) + this.getRandomChar() + this.layers[layerIdx].text.slice(cellToChange)
      }
    })

    // Draw
    this.layers.forEach((layer: Layer) => {
      layer.$.innerHTML = layer.text
    })
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
   * - If backspacing or deleting, show a red line
   */
  onEditorChange (editor: any, info: any) {
    let count = Math.max(3, Math.random()*this.width/30)
    
    // @ts-ignore
    if (this.plugin.isThinking) {
      this.createRain({style: 'primary', count: count*1})
      this.createRain({style: 'secondary', count: count*.25})
    } else if (editor?.getValue()?.length < info.data?.length) {
      this.createRain({style: 'negative', count})
    } else {
      this.createRain({style: 'primary', count})
    }
  }

  /**
   * Creates a new matrix rain drop
   */
  createRain (opts: {style: string, count: number}) {
    for (let i = 0; i < opts.count; i++) {
      // y*speed = maximum time for rain to clear
      this.drops.push({
        x: Math.floor(Math.random()*this.width),
        y: Math.floor(Math.random()*-this.height*3),
        len: Math.floor(Math.random() * this.height) + 2,
        speed: Math.random() * .25 + .05,
        style: opts.style
      })
    }
  }
}