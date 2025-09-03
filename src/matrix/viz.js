import { Plugin, ItemView, WorkspaceLeaf } from 'obsidian';
import { map } from '../helpers';

export class MatrixTab extends ItemView {
  plugin;
  $root;
  $container;
  layers;
  width;
  height;
  grid;
  drops;

  constructor(plugin, leaf) {
    super(leaf);
    this.plugin = plugin;
    this.drops = [];

    this.plugin.registerEvent(
      this.plugin.app.workspace.on(
        'editor-change',
        this.onEditorChange.bind(this)
      )
    );
  }

  getViewType() {
    return 'morpheus-matrix';
  }
  getDisplayText() {
    return 'Matrix Rain';
  }

  async onOpen() {
    this.$container = this.containerEl.querySelector('.view-content');

    this.$root = document.createElement('div');
    this.$root.classList.add('morpheus-matrix-rain-root');
    this.$container.appendChild(this.$root);

    setTimeout(() => this.onResize(), 100);

    this.registerInterval(
      window.setInterval(this.draw.bind(this), 1000 / 30)
    );
  }

  onResize() {
    const $div = document.createElement('div');
    $div.classList.add('morpheus-matrix-rain-dummy');
    $div.innerHTML = '#';
    $div.style.overflowWrap = 'break-word';
    $div.style.whiteSpace = 'pre-wrap';
    this.$root.appendChild($div);

    if ($div.clientHeight === 0) {
      setTimeout(() => this.onResize(), 100);
      return;
    }
    const initialHeight = $div.clientHeight;

    this.width = 0;
    const $checker = document.createElement('div');
    $checker.style.overflowWrap = 'break-word';
    $checker.style.whiteSpace = 'pre-wrap';
    $div.appendChild($checker);
    while ($checker.offsetHeight <= initialHeight && this.width < 1000) {
      $checker.innerHTML += '#';
      this.width++;
    }

    $checker.innerHTML = '';
    this.height = 0;
    while (
      $checker.clientHeight <= this.$container.clientHeight &&
      this.height < 1000
    ) {
      $checker.innerHTML += '#<br>';
      this.height++;
    }

    $div.remove();
    $checker.remove();
    this.setup();
  }

  setup() {
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
      `;
    const $layers = this.$root.querySelectorAll('.morpheus-matrix-layer');
    this.layers = [];
    $layers.forEach(($layer) => {
      this.layers.push({
        $: $layer,
        text: '',
      });
    });
  }

  draw() {
    if (!this.layers) return;
    this.layers.forEach((layer) => {
      layer.text = '';
    });

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        this.layers[0].text += this.getRandomChar();
        this.layers[1].text += '\u00A0';
      }
    }
    for (let n = 2; n < this.layers.length; n++) {
      this.layers[n].text = this.layers[1].text;
    }

    let count = Math.max(3, (Math.random() * this.width) / 2);
    if (
      this.plugin.isThinking &&
      !this.plugin.waitingForFirstChunk &&
      Math.random() > 0.9
    ) {
      this.createRain({ style: 'primary', count: count * 1 });
      this.createRain({ style: 'info', count: count * 0.25 });
    }

    let changedCells = [];
    for (let i = 0; i < this.layers[1].text.length; i++) {
      changedCells.push(false);
    }

    this.drops.forEach((drop, n) => {
      drop.y += drop.speed;
      const y = Math.floor(drop.y);

      if (y > this.height + drop.len) {
        this.drops.splice(n, 1);
        return;
      }

      for (let i = drop.len; i >= 0; i--) {
        const rowLen = (y - i) * (this.width - 1);
        let cellToChange = drop.x + rowLen;
        if (cellToChange < 0 || cellToChange >= this.layers[1].text.length)
          continue;

        if (i && changedCells?.[cellToChange]) continue;
        changedCells[cellToChange] = true;

        let layerIdx;
        switch (drop.style) {
          case 'secondary':
            layerIdx = Math.floor(map(i, 0, drop.len, 9, 11));
            break;
          case 'negative':
            layerIdx = Math.floor(map(i, 0, drop.len, 6, 8));
            break;
          case 'info':
            layerIdx = Math.floor(map(i, 0, drop.len, 12, 14));
            break;
          default:
            layerIdx = Math.floor(map(i, 0, drop.len, 3, 0));
        }

        if (!i || (layerIdx === 3 && Math.random() > 0.5))
          layerIdx = Math.floor(map(Math.random(), 0, 1, 3, 5));
        this.layers[layerIdx].text =
          this.layers[layerIdx].text.slice(0, Math.max(0, cellToChange - 1)) +
          this.getRandomChar() +
          this.layers[layerIdx].text.slice(cellToChange);
      }
    });

    this.layers.forEach((layer) => {
      layer.$.innerHTML = layer.text;
    });
  }

  getRandomChar() {
    const caps = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lower = caps.toLowerCase();
    const nums = '0123456789';
    const alphabet = caps + lower + nums;

    return alphabet.charAt(Math.floor(Math.random() * alphabet.length));
  }

  onEditorChange(editor, info) {
    let count = Math.max(3, (Math.random() * this.width) / 30);

    if (this.plugin.isThinking) {
      this.createRain({ style: 'primary', count: count * 1 });
      this.createRain({ style: 'secondary', count: count * 0.25 });
    } else if (editor?.getValue()?.length < info.data?.length) {
      this.createRain({ style: 'negative', count });
    } else {
      this.createRain({ style: 'primary', count });
    }
  }

  createRain(opts) {
    for (let i = 0; i < opts.count; i++) {
      this.drops.push({
        x: Math.floor(Math.random() * this.width),
        y: Math.floor(Math.random() * -this.height * 3),
        len: Math.floor(Math.random() * this.height) + 2,
        speed: Math.random() * 0.25 + 0.05,
        style: opts.style,
      });
    }
  }
}
