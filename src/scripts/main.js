const DOMColorContainer = document.querySelector('[data-id="color-wrapper"]');
const DOMCardElements = document.querySelectorAll('.colorize_container');

const DOMGenerateButtom = document.querySelector('[data-id="button-generate"]');

const DOMClipboardContainer = document.querySelector(
  '[data-id="clipboard-modal"]'
);

const RANDOM_NUMBER = (from, to) => {
  return Math.floor(Math.random() * (to - from) + 1);
};

function secondsToMilliseconds(seconds = 0) {
  return Math.floor(seconds * 1000);
}

async function clipBoardText(text) {
  let copied = true;

  try {
    const isString = text && typeof text === 'string';

    const isInvalidString = !isString;

    if (isInvalidString) return;

    await navigator.clipboard.writeText(text);

    return copied;
  } catch (error) {
    copied = false;

    // Error on copy
    console.error(error);

    return copied;
  } finally {
    console.debug({
      copy: `Copied to clipboard: ${text}`,
    });
  }
}

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

    const inclideSpace = `${dividerCharacter} `;

    const colorsString = rgb.join(inclideSpace);

    return colorsString;
  }

  rgbToCssString(rgb = []) {
    const string = this.rgbToString(rgb);

    return `rgb(${string})`;
  }
}

// HTML ClipBoard Modal
class ClipBoardModal {
  _class_name = 'hidden';
  _handle_timeout_value = null;

  _clearTimeoutHandle() {
    clearTimeout(this._handle_timeout_value);

    this._handle_timeout_value = null;
  }

  _setTimeoutHandle(handle) {
    this._handle_timeout_value = handle;
  }

  /**
   * @param {HTMLElement} element
   * @param {String} className
   *
   */
  _containsClassName(element, className) {
    const classCSS = className || this._class_name;

    return element.classList.contains(classCSS);
  }

  _removeClassName(element, className = this._class_name) {
    return element.classList.remove(className);
  }

  _setClassName(element, className = this._class_name) {
    return element.classList.add(className);
  }

  /**
   * @param options {{
   *  clipboardContainer: HTMLElement
   * }}
   */
  constructor({ clipboardContainer }) {
    this.container = clipboardContainer;
  }

  clearTimeout() {
    if (this._handle_timeout_value) {
      this._clearTimeoutHandle();
    }
  }

  setTimeout(handle) {
    this._setTimeoutHandle(handle);
  }

  open() {
    this.clearTimeout();

    const container = this.container;

    const isClosed = this._containsClassName(container);

    if (isClosed) {
      this._removeClassName(container);
    }

    return this;
  }

  close() {
    this.clearTimeout();

    const container = this.container;

    const isOpened = !this._containsClassName(container);

    console.log({ isOpened });

    if (isOpened) {
      this._setClassName(container);
    }
  }

  automaticClosing(timeInSeconds = 2) {
    const milliseconds = secondsToMilliseconds(timeInSeconds);

    const container = this.container;

    const isOpened = !this._containsClassName(container);

    console.debug({
      isOpened,
    });

    // CallbackFunction
    const timeoutHandleCallBackFn = () => this.close();

    if (isOpened) {
      const handle = setTimeout(timeoutHandleCallBackFn, milliseconds);

      this.setTimeout(handle);
    }
  }

  searchHTMLOnContainerAndSetTextContent() {}
}

class DOMOperations {
  _elements_class_names = {
    header: '.colorize__header',
    spanHexColor: '.colorize__hex',
    spanRGBColor: '.colorize__rgb',
  };

  /**
   * @param options {{
   *  container: HTMLElement,
   *  childsElements: HTMLElement[],
   *  colorInstance: Color,
   * }}
   */
  constructor({ container, childsElements, colorInstance = new Color() }) {
    this.container = container;

    // "Array Like" to Array
    const childs = Array.from(childsElements);

    this.childsArray = childs;
    this.colorInstance = colorInstance;
  }

  init() {
    this.reloadDisplayedColors();

    // events
    this.setClipboardEvent();
  }

  /** Private method */
  _colors() {
    const { rgb, rgbCssString } = this.colorInstance.rgb();

    const hexString = this.colorInstance.rgbToHexCssString(rgb);

    return {
      hexString,
      rgbString: rgbCssString,
    };
  }

  _setStyle(element, styleObject) {
    return Object.assign(element.style, styleObject);
  }

  getColorHexCodeFromDisplay(screenElement) {
    return screenElement.textContent;
  }

  setColorOnDisplayedElements({ spanHex, spanRgb, hexString, rgbString }) {
    spanHex.textContent = hexString;
    spanRgb.textContent = rgbString;
  }

  reloadDisplayedColors() {
    let lastColorList = [];

    for (let cardElement of this.childsArray) {
      const colors = this._colors();

      const avaliableClass = this._elements_class_names;

      const headerElement = cardElement.querySelector(avaliableClass.header);

      // Color "span" elements
      const spanHex = cardElement.querySelector(avaliableClass.spanHexColor);
      const spanRgb = cardElement.querySelector(avaliableClass.spanRGBColor);

      this.setColorOnDisplayedElements({
        spanHex,
        spanRgb,
        ...colors,
      });

      this._setStyle(headerElement, {
        backgroundColor: colors.hexString,
      });

      // History
      lastColorList.push(colors);
    }

    //console.log(lastColorList);
  }

  setClipboardEvent() {
    const childs = this.childsArray;

    for (let childElement of childs) {
      const eventRef = (event) => this.copyColorToClipboard(event);

      childElement.addEventListener('click', eventRef);
    }
  }

  /**
   * Method: "copyColorToClipboard"
   * @param event {Event}
   */
  async copyColorToClipboard(event) {
    const { target } = event;

    const spanHex = target.querySelector(
      this._elements_class_names.spanHexColor
    );

    //focus
    spanHex.focus();

    const hexColorToCopy = this.getColorHexCodeFromDisplay(spanHex);

    const result = await clipBoardText(hexColorToCopy);

    if (result)
      new ClipBoardModal({ clipboardContainer: DOMClipboardContainer })
        .open()
        .automaticClosing();
  }
}

const dom = new DOMOperations({
  container: DOMColorContainer,
  childsElements: DOMCardElements,
});

dom.init();

DOMGenerateButtom.addEventListener('click', () => dom.reloadDisplayedColors());
