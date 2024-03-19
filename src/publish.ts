import '../styles.css'
import 'splitting/dist/splitting.css'
import 'splitting/dist/splitting-cells.css'
import Splitting from 'splitting'

export default (() => {
  let oldHref = null
  let hasFoundTitle = false
  let initInterval:any = null

  /**
   * Poll for the title
   */
  const pollForTitle = () => {
    hasFoundTitle = false
    initInterval = setInterval(() => {
      if (!hasFoundTitle) {
        const $title:HTMLElement|null = document.querySelector('.page-header:not(.split)')
        if ($title) {
          $title.classList.add('split')
          const $placeholder = createPlaceholder($title)
          split($title, $placeholder)
        }
      }
    }, 1000/30)
  }
  pollForTitle()
  
  /**
   * Create placeholder
   */
  const createPlaceholder = ($title:HTMLElement) => {
    let $placeholder:HTMLElement|null = document.querySelector('.morpheus-title-placeholder')
    if ($placeholder) {$placeholder.remove()}
    
    $placeholder = document.createElement('div')
    $placeholder.classList.add('inline-title', 'morpheus-title-placeholder')
    $title?.parentNode?.insertAfter($placeholder, $title)

    return $placeholder
  }

  const split = ($title: HTMLElement, $placeholder: HTMLElement) => {
    $placeholder.innerHTML = $title.innerHTML
    Splitting({target: $placeholder, by: 'chars'})
    
    const $chars = $placeholder.querySelectorAll('.word .char')
    $chars.forEach(($char: HTMLElement) => {
      if ($char.textContent === $char.textContent?.toUpperCase() && $char.textContent?.toLowerCase() !== $char.textContent?.toUpperCase()) {
        $char.classList.add('capital')
      }
    })
  }
})();