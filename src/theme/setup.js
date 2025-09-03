import { MorpheusCore } from '..';
import 'splitting/dist/splitting.css';
import 'splitting/dist/splitting-cells.css';
import Splitting from 'splitting';

export default class setupTheme {
  plugin;
  observer;

  constructor(plugin) {
    this.plugin = plugin;

    const applySplitting = () => {
      window.setTimeout(() => {
        this.applySplittingToTitle();
      }, 1000 / 30);
    };

    this.plugin.registerEvent(
      this.plugin.app.workspace.on('active-leaf-change', applySplitting.bind(this))
    );
    this.plugin.registerEvent(
      this.plugin.app.workspace.on('layout-change', applySplitting.bind(this))
    );
  }

  applySplittingToTitle() {
    const $container = this.plugin.app.workspace?.activeLeaf?.containerEl;
    if (!$container) return;
    const $title = $container.querySelector(
      '.inline-title:not(.placeholder):not(.morpheus-title-placeholder)'
    );
    if (!$title) return;

    // Remove existing observer
    if (this.observer) {
      this.observer.disconnect();
    }

    // Observer
    this.observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === 'characterData' ||
          (mutation.type === 'childList' && mutation.addedNodes.length)
        ) {
          const $placeholder = this.createPlaceholder($title);
          this.split($title, $placeholder);
        }
      });
    });

    // Delete existing placeholders
    const $placeholders = $container.querySelectorAll(
      '.morpheus-title-placeholder'
    );
    $placeholders.forEach(($placeholder) => $placeholder.remove());

    // Create new placeholder
    const $placeholder = this.createPlaceholder($title);
    this.observer.observe($title, {
      childList: true,
      characterData: true,
      subtree: true,
    });
    $container.querySelector('.morpheus-title-placeholder');
    this.split($title, $placeholder);
  }

  applySplittingToAllTitles() {
    const $allTitles = document.querySelectorAll(
      '.inline-title:not(.placeholder)'
    );
    $allTitles.forEach(($title) => {
      const $placeholder = this.createPlaceholder($title);
      this.split($title, $placeholder);
    });
  }

  split($title, $placeholder) {
    $placeholder.innerHTML = $title.innerHTML;
    Splitting({ target: $placeholder, by: 'chars' });
    this.scanCapitalization($placeholder);
  }

  createPlaceholder($title) {
    let $placeholder =
      this.plugin.app.workspace.activeLeaf.containerEl.querySelector(
        '.morpheus-title-placeholder'
      );
    if ($placeholder) {
      $placeholder.remove();
    }
    $placeholder = document.createElement('div');
    $placeholder.classList.add('inline-title', 'morpheus-title-placeholder');
    $title?.parentNode?.insertAfter($placeholder, $title);

    return $placeholder;
  }

  unload() {
    if (this.observer) {
      this.observer.disconnect();
    }
    const $placeholders = document.querySelectorAll(
      '.morpheus-title-placeholder'
    );
    $placeholders.forEach(($placeholder) => $placeholder.remove());
  }

  // Loop through each `.word .char`
  // If text is capital letter, add class `.capital`
  scanCapitalization($placeholder) {
    const $chars = $placeholder.querySelectorAll('.word .char');
    $chars.forEach(($char) => {
      if (
        $char.textContent === $char.textContent?.toUpperCase() &&
        $char.textContent?.toLowerCase() !== $char.textContent?.toUpperCase()
      ) {
        $char.classList.add('capital');
      }
    });
  }
}
