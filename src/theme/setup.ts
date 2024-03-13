import {HeleniteCore} from 'main'
// import './style.css'
import 'splitting/dist/splitting.css'
import 'splitting/dist/splitting-cells.css'
import Splitting from 'splitting'

export default class setupTheme {
  plugin: HeleniteCore
  observer: MutationObserver
  
  constructor (plugin: HeleniteCore) {
    this.plugin = plugin
    this.plugin.app.workspace.on('active-leaf-change', () => {
      this.applySplittingToTitle()
    })
  }

  applySplittingToTitle () {
    // @ts-ignore
    const $container = this.plugin.app.workspace?.activeLeaf?.containerEl
    if (!$container) return
    const $title = $container.querySelector('.inline-title:not(.placeholder)')
    if (!$title) return

    // Remove existing observer
    if (this.observer) {this.observer.disconnect()}

    // Observer
    this.observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'characterData' || (mutation.type === 'childList' && mutation.addedNodes.length)) {
          const $placeholder = this.createPlaceholder($title)
          this.split($title, $placeholder)
        }
      })
    })

    // Delete existing placeholders
    const $placeholders = $container.querySelectorAll('.helenite-title-placeholder')
    $placeholders.forEach(($placeholder: HTMLElement) => $placeholder.remove())

    // Create new placeholder
    const $placeholder = this.createPlaceholder($title)
    this.observer.observe($title, { childList: true, characterData: true, subtree: true })
    $container.querySelector('.helenite-title-placeholder')
    this.split($title, $placeholder)
  }

  /**
   * Setup
   */
  setup () {
    console.log('test')
  }


  applySplittingToAllTitles () {
    const $allTitles = document.querySelectorAll('.inline-title:not(.placeholder)')
    console.log($allTitles)
    $allTitles.forEach(($title: HTMLElement) => {
      const $placeholder = this.createPlaceholder($title)
      this.split($title, $placeholder)
    })
  }
  
  
  split ($title: HTMLElement, $placeholder: HTMLElement) {
    $placeholder.innerHTML = $title.innerHTML
    Splitting({target: $placeholder, by: 'chars'})
    this.scanCapitalization($placeholder)
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

  
  unload () {
    if (this.observer) {this.observer.disconnect()}
    const $placeholders = document.querySelectorAll('.helenite-title-placeholder')
    $placeholders.forEach(($placeholder: HTMLElement) => $placeholder.remove())
  }

  // Loop through each `.word .char`
  // If text is capital letter, add class `.capital`
  scanCapitalization ($placeholder: HTMLElement) {
    const $chars = $placeholder.querySelectorAll('.word .char')
    $chars.forEach(($char: HTMLElement) => {
      if ($char.textContent === $char.textContent?.toUpperCase() && $char.textContent?.toLowerCase() !== $char.textContent?.toUpperCase()) {
        $char.classList.add('capital')
      }
    })
  }
}