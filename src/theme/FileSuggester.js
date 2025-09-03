// Credits go to Liam's Periodic Notes Plugin: [https://github.com/liamcain/obsidian-periodic-notes](https://github.com/liamcain/obsidian-periodic-notes)

import { createPopper } from '@popperjs/core';
import { App, TAbstractFile, TFile } from 'obsidian';

export const wrapAround = (value, size) => {
  return ((value % size) + size) % size;
};

class Suggest {
  owner;
  values;
  suggestions;
  selectedItem;
  containerEl;

  constructor(owner, containerEl, scope) {
    this.owner = owner;
    this.containerEl = containerEl;

    containerEl.on(
      'click',
      '.suggestion-item',
      this.onSuggestionClick.bind(this)
    );
    containerEl.on(
      'mousemove',
      '.suggestion-item',
      this.onSuggestionMouseover.bind(this)
    );

    scope.register([], 'ArrowUp', (event) => {
      if (!event.isComposing) {
        this.setSelectedItem(this.selectedItem - 1, true);
        return false;
      }
    });

    scope.register([], 'ArrowDown', (event) => {
      if (!event.isComposing) {
        this.setSelectedItem(this.selectedItem + 1, true);
        return false;
      }
    });

    scope.register([], 'Enter', (event) => {
      if (!event.isComposing) {
        this.useSelectedItem(event);
        return false;
      }
    });
  }

  onSuggestionClick(event, el) {
    event.preventDefault();

    const item = this.suggestions.indexOf(el);
    this.setSelectedItem(item, false);
    this.useSelectedItem(event);
  }

  onSuggestionMouseover(_event, el) {
    const item = this.suggestions.indexOf(el);
    this.setSelectedItem(item, false);
  }

  setSuggestions(values) {
    this.containerEl.empty();
    const suggestionEls = [];

    values.forEach((value) => {
      const suggestionEl = this.containerEl.createDiv('suggestion-item');
      this.owner.renderSuggestion(value, suggestionEl);
      suggestionEls.push(suggestionEl);
    });

    this.values = values;
    this.suggestions = suggestionEls;
    this.setSelectedItem(0, false);
  }

  useSelectedItem(event) {
    const currentValue = this.values[this.selectedItem];
    if (currentValue) {
      this.owner.selectSuggestion(currentValue, event);
    }
  }

  setSelectedItem(selectedIndex, scrollIntoView) {
    const normalizedIndex = wrapAround(selectedIndex, this.suggestions.length);
    const prevSelectedSuggestion = this.suggestions[this.selectedItem];
    const selectedSuggestion = this.suggestions[normalizedIndex];

    prevSelectedSuggestion?.removeClass('is-selected');
    selectedSuggestion?.addClass('is-selected');

    this.selectedItem = normalizedIndex;

    if (scrollIntoView) {
      selectedSuggestion.scrollIntoView(false);
    }
  }
}

export class TextInputSuggest {
  constructor(app, inputEl) {
    this.app = app;
    this.inputEl = inputEl;
    this.scope = new Scope();

    this.suggestEl = createDiv('suggestion-container');
    const suggestion = this.suggestEl.createDiv('suggestion');
    this.suggest = new Suggest(this, suggestion, this.scope);

    this.scope.register([], 'Escape', this.close.bind(this));

    this.inputEl.addEventListener('input', this.onInputChanged.bind(this));
    this.inputEl.addEventListener('focus', this.onInputChanged.bind(this));
    this.inputEl.addEventListener('blur', this.close.bind(this));
    this.suggestEl.on('mousedown', '.suggestion-container', (event) => {
      event.preventDefault();
    });
  }

  onInputChanged() {
    const inputStr = this.inputEl.value;
    const suggestions = this.getSuggestions(inputStr);

    if (suggestions.length > 0) {
      this.suggest.setSuggestions(suggestions);
      this.open(this.app.dom.appContainerEl, this.inputEl);
    }
  }

  open(container, inputEl) {
    this.app.keymap.pushScope(this.scope);

    container.appendChild(this.suggestEl);
    this.popper = createPopper(inputEl, this.suggestEl, {
      placement: 'bottom-start',
      modifiers: [
        {
          name: 'sameWidth',
          enabled: true,
          fn: ({ state, instance }) => {
            const targetWidth = `${state.rects.reference.width}px`;
            if (state.styles.popper.width === targetWidth) {
              return;
            }
            state.styles.popper.width = targetWidth;
            instance.update();
          },
          phase: 'beforeWrite',
          requires: ['computeStyles'],
        },
      ],
    });
  }

  close() {
    this.app.keymap.popScope(this.scope);

    this.suggest.setSuggestions([]);
    this.popper.destroy();
    this.suggestEl.detach();
  }
}

export class FileSuggest extends TextInputSuggest {
  getSuggestions(inputStr) {
    const abstractFiles = this.app.vault.getAllLoadedFiles();
    const files = [];
    const lowerCaseInputStr = inputStr.toLowerCase();

    abstractFiles.forEach((file) => {
      if (
        file instanceof TFile &&
        file.path.toLowerCase().contains(lowerCaseInputStr)
      ) {
        files.push(file);
      }
    });

    return files;
  }

  renderSuggestion(file, el) {
    el.setText(file.path);
  }

  selectSuggestion(file) {
    this.inputEl.value = file.path;
    this.inputEl.trigger('input');
    this.close();
  }
}
