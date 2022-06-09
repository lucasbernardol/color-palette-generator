const colorWrapperElement = document.querySelector('[data-id="color-wrapper"]');

const RANDOM_NUMBER = (from, to) => {
  return Math.floor(Math.random() * (to - from) + 1);
};

class Color {
  _rgb_string_divider = ',';

  constructor() {}

  randomRGB({ convertToCssString = true } = {}) {
    // parts: ['r', 'g', 'b']
    const colorParts = Array.from([1, 2, 3]);

    let interactionsIndex = 0;

    while (interactionsIndex < colorParts.length) {
      colorParts[interactionsIndex] = RANDOM_NUMBER(1, 255);

      interactionsIndex++;
    }

    return {
      rgb: colorParts,
      rgbCssString: convertToCssString ? this.rgbToCssString(colorParts) : null,
    };
  }

  /**
   * @method rgb - "randomRGB" Alias.
   */
  rgb(options) {
    return this.randomRGB(options);
  }

  rgbToHexString(rgbArray = []) {
    const colors = rgbArray.map((decimal) => {
      // "f" => "0f"
      let decimalToHex = decimal.toString(16);

      if (decimalToHex.length < 2) {
        decimalToHex = `0${decimalToHex}`;
      }

      return decimalToHex;
    });

    const hexString = colors.join('');

    return hexString;
  }

  rgbToHexCssString(rgbArray = []) {
    const hex = this.rgbToHexString(rgbArray);

    const cssString = `#${hex}`.toUpperCase();

    return cssString;
  }

  rgbToString(rgb = []) {
    const dividerCharacter = this._rgb_string_divider;

    const colorsString = rgb.join(dividerCharacter);

    return colorsString;
  }

  rgbToCssString(rgb = []) {
    const string = this.rgbToString(rgb).toUpperCase();

    return `rgb(${string})`;
  }
}

class DOMOperations {
  _total_cards_to_generate = 5;

  constructor({ colorizeHTMLContainer }) {
    this.container = colorizeHTMLContainer;
  }

  _htmlCardTemplate({ cardId, colorText }) {
    return `
      <div class="colorize_container" data-card-id="${cardId}">
        <header class="colorize__header" style="background-color: ${colorText}">
        </header>
        <span class="colorize__color">${colorText}</span>
      </div>
   `;
  }

  _intertHTMLString(string) {
    this.container.innerHTML = string;
  }

  init() {
    let html = '';

    for (let i = 0; i < 5; i++) {
      const id = i + 1;

      const color = new Color();

      const { rgb } = color.rgb();

      html += this._htmlCardTemplate({
        colorText: color.rgbToHexCssString(rgb),
        cardId: id,
      });
    }

    this._intertHTMLString(html);
  }
}

const dom = new DOMOperations({ colorizeHTMLContainer: colorWrapperElement });

//dom.init();
