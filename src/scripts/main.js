const DOMColorContainer = document.querySelector('[data-id="color-wrapper"]');
const DOMCardElements = document.querySelectorAll(".colorize_container");

const DOMGenerate = document.querySelector('[data-id="button-generate"]');

/**
 * Clipboard
 */
const DOMClipboardModal = document.querySelector('[data-id="clipboard-modal"]');

/**
 * Shortcuts
 */
const DOMShortcutsModal = document.querySelector('[data-id="shortcuts-modal"]');

const DOMShortcutOpen = document.querySelector('[data-id="shortcut-open"]');
const DOMShortcutClose = document.querySelector('[data-id="shortcut-close"]');

const DOMShortcutCircle = document.querySelector('[data-id="shortcut-circle"]');

/**
 * Utils
 */
function randomNumber(from, to) {
  return Math.floor(Math.random() * (to - from) + 1);
}

function secondsToMilliseconds(seconds = 0) {
  const calcutate = Number(seconds) * 1000;

  return Math.floor(calcutate);
}

async function clipBoardText(text) {
  let copied = true;

  try {
    const isString = text && typeof text === "string";

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

// class "Color"
class Color {
  _rgb_string_divider = ",";

  constructor() {}

  randomRGB({ convertToCssString = true } = {}) {
    // parts: ['r', 'g', 'b']
    const colorParts = Array.from([1, 2, 3]);

    let interactionsIndex = 0;

    while (interactionsIndex < colorParts.length) {
      colorParts[interactionsIndex] = randomNumber(1, 255);

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

    const hexString = colors.join("");

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

// class: "ModalNotifier"
class ModalNotifier {
  _class_name = null;

  _handle_timeout_value = null;
  _last_prefix = null;

  _clearTimeoutHandle() {
    if (this._handle_timeout_value) {
      clearTimeout(this._handle_timeout_value);

      this._handle_timeout_value = null;
    }
  }

  _setTimeoutHandle(handle) {
    this._handle_timeout_value = handle;
  }

  _setLastPrefix(prefix) {
    this._last_prefix = prefix;
  }

  /**
   * @param {HTMLElement} element
   * @param {String} className
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
   *  overlays: [{
   *    container: HTMLElement,
   *    key: string,
   *  }],
   *  commonClassName: string,
   * }}
   */
  constructor({ overlays, commonClassName = "hidden" }) {
    this.overlays = overlays;
    this._class_name = commonClassName;
  }

  _findModalContainerByKey(keyOrPrefix = "") {
    const isKey = keyOrPrefix && typeof keyOrPrefix === "string";

    if (!isKey) {
      throw new Error(`Invalid Modal key: "${keyOrPrefix}"`);
    }

    const { container } = this.overlays.find(
      ({ key }) => key === keyOrPrefix.trim()
    );

    return container;
  }

  open(keyElement) {
    // Set Prefixs
    this._setLastPrefix(keyElement);
    this._clearTimeoutHandle();

    const containerHtmlElement = this._findModalContainerByKey(keyElement);

    const isClosedOverlay = this._containsClassName(containerHtmlElement);

    if (isClosedOverlay) {
      // Remove "hidden" className.
      this._removeClassName(containerHtmlElement);

      this._setLastPrefix(keyElement);
    }

    return this;
  }

  close(keyElement = this._last_prefix) {
    this._clearTimeoutHandle();

    const containerHtmlElement = this._findModalContainerByKey(keyElement);

    const isOpened = !this._containsClassName(containerHtmlElement);

    // Add "hidden" className.
    if (isOpened) {
      this._setClassName(containerHtmlElement);
    }
  }

  automaticClosing(key, timeInSeconds = 2) {
    let milliseconds = secondsToMilliseconds(timeInSeconds);

    const containerHtmlModalElement = this._findModalContainerByKey(key);

    const isOpenedModalOverlay = !this._containsClassName(
      containerHtmlModalElement
    );

    // CallbackFunction
    const timeoutHandleCallBackFn = () => {
      this.close(key);
    };

    if (isOpenedModalOverlay) {
      const handle = setTimeout(timeoutHandleCallBackFn, milliseconds);

      this._setTimeoutHandle(handle);
    }
  }

  searchHTMLOnContainerAndSetTextContent() {}
}

// class "View"
class View {
  _elements_class_names = {
    header: ".colorize__header",
    spanHexColor: ".colorize__hex",
    spanRGBColor: ".colorize__rgb",
  };

  _show_copied_notifier = null;

  /**
   * @param {Boolean} boo - "boolean"
   */
  set showCopyNotifier(boo) {
    this._show_copied_notifier = boo;
  }

  get showCopyNotifier() {
    return this._show_copied_notifier;
  }

  /**
   * @param options {{
   *  container: HTMLElement,
   *  childsElements: HTMLElement[],
   *  colorInstance: Color,
   *  notifierInstance: ModalNotifier,
   *  showCopyNotifier?: boolean
   * }}
   */
  constructor({
    container,
    childsElements,
    colorInstance = new Color(),
    notifierInstance,
    showCopyNotifier = true,
  }) {
    this.container = container;

    // "Array Like" to Array
    const childs = Array.from(childsElements);

    this.childsArray = childs;

    this.colorInstance = colorInstance;
    this.notifierInstance = notifierInstance;
    this.showCopyNotifier = showCopyNotifier;

    this.init();
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

      childElement.addEventListener("click", eventRef);
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

    // focus
    spanHex.focus();

    const hexColorToCopy = this.getColorHexCodeFromDisplay(spanHex);

    const isCopied = await clipBoardText(hexColorToCopy);

    // Boolean
    const isOkToDisplayClipboard = isCopied && this.showCopyNotifier;

    if (isOkToDisplayClipboard) {
      this.notifierInstance.open("clipboard").automaticClosing("clipboard");
    }
  }
}

function shortcutActionByKey(keyCode) {
  let keyBoardShortcutAction = null;

  switch (keyCode) {
    case 110:
      // Key "n"
      keyBoardShortcutAction = "TOGGLE_COPY_NOTIFIER";
      break;

    case 32:
    case 114:
      // Key "R" or SPACEBAR
      keyBoardShortcutAction = "RELOAD_PALETTE";
      break;
  }

  return keyBoardShortcutAction;
}

function application() {
  const notifier = new ModalNotifier({
    overlays: [
      { container: DOMClipboardModal, key: "clipboard" },
      { container: DOMShortcutsModal, key: "shortcut" },
    ],
  });

  const view = new View({
    container: DOMColorContainer,
    childsElements: DOMCardElements,
    notifierInstance: notifier,
    showCopyNotifier: true,
  });

  /**
   * DOM Events
   */
  DOMGenerate.addEventListener("click", () => view.reloadDisplayedColors());

  /**
   * Shortcuts HTML Events
   */
  DOMShortcutOpen.addEventListener("click", () => notifier.open("shortcut"));
  DOMShortcutClose.addEventListener("click", () => notifier.close("shortcut"));

  window.addEventListener("keypress", ({ which: keyCode }) => {
    const action = shortcutActionByKey(keyCode);

    if (action === "RELOAD_PALETTE") {
      view.reloadDisplayedColors();
    }

    if (action === "TOGGLE_COPY_NOTIFIER") {
      DOMShortcutCircle.classList.toggle("disabled");

      view.showCopyNotifier = !view.showCopyNotifier;
    }
  });
}

window.addEventListener("load", () => application());
