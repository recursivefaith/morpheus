import Splitting from 'splitting'
import {HeleniteCore} from 'main'
import 'splitting/dist/splitting.css'
import 'splitting/dist/splitting-cells.css'
import Splitting from 'splitting'

export default class setupTheme {
  plugin: HeleniteCore
  
  constructor (plugin: HeleniteCore) {
    this.plugin = plugin
    this.plugin.app.workspace.on('active-leaf-change', () => this.applySplittingToTitle())
    this.applySplittingToTitle()
  }

  applySplittingToTitle () {
    // @ts-ignore
    if (!this.plugin.app.workspace?.activeLeaf?.containerEl) return
    // @ts-ignore
    const $title = this.plugin.app.workspace.activeLeaf.containerEl.querySelector('.inline-title:not(.placeholder)')
    // $title.style.opacity = '0'

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'characterData' || (mutation.type === 'childList' && mutation.addedNodes.length)) {
          const $placeholder = this.createPlaceholder($title)
          this.split($title, $placeholder)
        }
      })
    })

    const $placeholder = this.createPlaceholder($title)
    observer.observe($title, { childList: true, characterData: true, subtree: true })
    this.plugin.app.workspace.activeLeaf.containerEl.querySelector('.helenite-title-placeholder')
    this.split($title, $placeholder)
  }

  
  
  split ($title: HTMLElement, $placeholder: HTMLElement) {
    $placeholder.innerHTML = $title.innerHTML
    Splitting({target: $placeholder, by: 'chars'})
  }


  createPlaceholder ($title: HTMLElement) {
    // @ts-ignore
    let $placeholder = this.plugin.app.workspace.activeLeaf.containerEl.querySelector('.helenite-title-placeholder')
    if ($placeholder) {$placeholder.remove()}
    $placeholder = document.createElement('div')
    $placeholder.classList.add('inline-title', 'helenite-title-placeholder')
    $title?.parentNode?.insertAfter($placeholder, $title)

    return $placeholder
  }
}