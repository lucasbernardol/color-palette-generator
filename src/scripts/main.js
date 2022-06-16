const DOMColorContainer = document.querySelector('[data-id="color-wrapper"]');
const DOMCardElements = document.querySelectorAll('.colorize_container');
const DOMGenerate = document.querySelector('[data-id="button-generate"]');

const DOMClipboardModal = document.querySelector('[data-id="clipboard-modal"]');

const DOMShortcutsModal = document.querySelector('[data-id="shortcuts-modal"]');
const DOMShortcutOpen = document.querySelector('[data-id="shortcut-open"]');

const DOMShortcutClose = document.querySelector('[data-id="shortcut-close"]');
const DOMShortcutCircle = document.querySelector('[data-id="shortcut-circle"]');

const DOMDownloadAnchor = document.querySelector('[data-id="download-anchor"]');

const GLOBAL_CLASS_NAMES = {
  clipboardColorText: '.clipboard__color',
};

const MESSAGES = {
  ptBR: {
    exportAlert:
      'Continuar:\nInforme o nome do arquivo no campo abaixo. A extensão não é obrigratória.\n',
  },
};

function isFunction(functionRef) {
  return typeof functionRef === 'function';
}

function isString(stringRef) {
  return typeof stringRef === 'string';
}

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

async function sendTextToClipboard(text) {
  let clipboardCopiedState = true;

  try {
    const isValidString = text && isString(text);

    if (!isValidString) return;

    await navigator.clipboard.writeText(text);

    return clipboardCopiedState;
  } catch (error) {
    // Error on copy
    console.error(error);
  } finally {
    console.debug({
      copy: `Copied to clipboard: "${text}"`,
      clipboardCopiedState,
    });
  }
}

class Fullscreen {
  _isFullscreenOpenState = false;
  documentRootHtmlElement = null;

  get state() {
    return this._isFullscreenOpenState;
  }

  /**
   * @param {Boolean} boo - State value
   */
  set state(boo) {
    this._isFullscreenOpenState = boo;
  }

  constructor({ rootElement = document.documentElement } = {}) {
    this.documentRootHtmlElement = rootElement;
  }

  toggle(onToggleCallback = null) {
    let isFullscreenOpenState = this.state;

    if (!isFullscreenOpenState) {
      this.documentRootHtmlElement.requestFullscreen();

      isFullscreenOpenState = !isFullscreenOpenState;
    } else {
      document.exitFullscreen();

      isFullscreenOpenState = false;
    }

    this.state = isFullscreenOpenState;

    // Callback option
    const isCallbackFunction = isFunction(onToggleCallback);

    if (isCallbackFunction) {
      onToggleCallback({
        isFullscreenOpenState,
      });

      return;
    }

    return { isFullscreenOpenState };
  }
}

// class "Color"
class Color {
  _rgb_string_divider = ',';

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

// class: "ModalNotifier"
class ModalNotifier {
  _class_name = null;

  _clearTimeoutHandle(timeoutHandleValue) {
    if (timeoutHandleValue) {
      clearTimeout(timeoutHandleValue);
    }
  }

  /**
   * @param {HTMLElement} element
   * @param {String} className
   */
  _containsClassName(element, className = this._class_name) {
    return element.classList.contains(className);
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
   *    setTimeoutHandleValue: number,
   *    isOpen: boolean,
   *  }],
   *  commonClassName: string,
   * }}
   */
  constructor({ overlays, commonClassName = 'hidden' }) {
    this.overlays = overlays;
    this._class_name = commonClassName;
  }

  setPartialOverlayObject(prefix, objectPartial) {
    const { overlay, overlayIndex } = this.getOverlaObjectByPrefix(prefix);

    const mergedOverlay = { ...overlay, ...objectPartial };

    this.overlays[overlayIndex] = mergedOverlay;

    console.log({
      mergedOverlay,
      overlays: this.overlays,
    });
  }

  getOverlaObjectByPrefix(prefix = null) {
    const isNotPrefix = typeof prefix !== 'string';

    if (isNotPrefix) throw new Error(`Modal key ERROR: "${prefix}"`);

    // Callback
    const findRef = ({ key }) => {
      return key === prefix;
    };

    const overlay = this.overlays.find(findRef);

    const overlayIndex = this.overlays.findIndex(findRef);

    return { overlay, overlayIndex };
  }

  open(prefix) {
    const { overlay } = this.getOverlaObjectByPrefix(prefix);

    const { container } = overlay;

    const isClosedOverlay = this._containsClassName(container);

    if (isClosedOverlay) {
      this._removeClassName(container);

      // Update object
      this.setPartialOverlayObject(prefix, { isOpen: true });
    }

    return this;
  }

  close(prefix) {
    const { overlay } = this.getOverlaObjectByPrefix(prefix);

    const { container, setTimeoutHandleValue } = overlay;

    const isOpenedOverlay = !this._containsClassName(container);

    if (isOpenedOverlay) {
      // Force "clearInterval"
      this._clearTimeoutHandle(setTimeoutHandleValue);

      this._setClassName(container);

      this.setPartialOverlayObject(prefix, {
        setTimeoutHandleValue: null,
        isOpen: false,
      });
    }
  }

  automaticClosing(prefix, secondsToClosing = 5) {
    const secondsToMillisecondsClosing =
      secondsToMilliseconds(secondsToClosing);

    const { overlay } = this.getOverlaObjectByPrefix(prefix);

    const { container } = overlay;

    const isClosedVerification = !this._containsClassName(container);

    // CallbackFn
    const closeModalRef = () => {
      this.close(prefix);
    };

    if (isClosedVerification) {
      const setTimeoutHandleValue = setTimeout(
        closeModalRef,
        secondsToMillisecondsClosing
      );

      // Save "timeout" handle.
      this.setPartialOverlayObject(prefix, { setTimeoutHandleValue });
    }
  }

  searchHtmlInOverlayAndSetTextContent({ prefix, className, textValue } = {}) {
    const { overlay } = this.getOverlaObjectByPrefix(prefix);

    const { container } = overlay;

    // html Element
    const htmlElement = container.querySelector(className);

    // Add textContent
    htmlElement.textContent = textValue;
  }
}

// class "View"
class View {
  _elements_class_names = {
    header: '.colorize__header',
    spanHexColor: '.colorize__hex',
    spanRGBColor: '.colorize__rgb',
  };

  _notifier_enabled = null;
  _current_colors = [];

  /**
   * @param {Boolean} boolean - Notifier value
   */
  set notifierEnabled(boolean) {
    this._notifier_enabled = boolean;
  }

  get notifierEnabled() {
    return this._notifier_enabled;
  }

  get currentColors() {
    return this._current_colors;
  }

  set currentColors(current = []) {
    this._current_colors = current;
  }

  /**
   * @param options {{
   *  container: HTMLElement,
   *  childsElements: HTMLElement[],
   *  colorInstance: Color,
   *  notifierInstance: ModalNotifier,
   *  notifierEnabled?: boolean
   * }}
   */
  constructor({
    container,
    childsElements,
    colorInstance = new Color(),
    notifierInstance,
    notifierEnabled = true,
  }) {
    // "Array Like" to Array
    const childs = Array.from(childsElements);

    this.container = container;
    this.childsArray = childs;
    this.colorInstance = colorInstance;
    this.notifierInstance = notifierInstance;

    this.notifierEnabled = notifierEnabled;

    this.init();
  }

  init() {
    this.reloadDisplayedColors();

    this.setClipboardEvent();
  }

  /** Private method */
  _colors() {
    const { rgb: rgbArray, rgbCssString } = this.colorInstance.rgb();

    const hex = this.colorInstance.rgbToHexCssString(rgbArray);

    return {
      hex,
      rgb: rgbCssString,
    };
  }

  /**
   * @param {HTMLElement} element
   * @param {CSSStyleDeclaration} styles - CSS styles
   */
  _setStyle(element, styles) {
    //return Object.assign(element.style, styleObject);
    const stylesKeys = Object.keys(styles);

    stylesKeys.forEach((cssKey) => {
      element.style[cssKey] = styles[cssKey];
    });

    return element.style;
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

      spanHex.textContent = colors.hex;
      spanRgb.textContent = colors.rgb;

      this._setStyle(headerElement, {
        backgroundColor: colors.rgb,
      });

      // History
      lastColorList.push(colors);
    }

    // Current colors
    this.currentColors = lastColorList;
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
    const { target: htmlTargetElement } = event;

    const { spanHexColor } = this._elements_class_names;

    // "span"
    const spanElementHex = htmlTargetElement.querySelector(spanHexColor);
    spanElementHex.focus();

    const hexColor = spanElementHex.textContent;

    this.notifierInstance.searchHtmlInOverlayAndSetTextContent({
      prefix: 'clipboard',
      className: GLOBAL_CLASS_NAMES.clipboardColorText,
      textValue: hexColor,
    });

    // Clipboard notifier
    const isCopied = await sendTextToClipboard(hexColor);

    const allowShowNotifierComponent = isCopied && this.notifierEnabled;

    if (allowShowNotifierComponent) {
      this.notifierInstance.open('clipboard').automaticClosing('clipboard', 5);
    }
  }
}

// class "Export"
class DownloadBlob {
  _json_type = 'application/json,charset=utf-8';

  /**
   * @param {{ anchorElement: HTMLAnchorElement }} options
   */
  constructor({ anchorElement } = {}) {
    this.anchorElement = anchorElement;
  }
  /**
   *
   * @param {{
   *  data: string,
   *  type?: string,
   *  filename: string,
   *  extension: string,
   *  clearDownloadURLDalaySeconds: number,
   *  onDownload: (data: any) => void,
   * }} options
   */
  export(options = {}) {
    const {
      data,
      type = this._json_type,
      filename,
      extension,
      clearDownloadURLDalaySeconds,
      onDownload,
    } = options;

    const binaryBlob = new Blob([data], {
      type,
    });

    const filenameNormalized = this.fileNameNormalize(filename, extension);

    const url = this.createURL(binaryBlob);

    // Attributes
    this.anchorElement.setAttribute('href', url);
    this.anchorElement.setAttribute('download', filenameNormalized);

    // Click
    this.anchorElement.click();

    this.remokeURL(url, clearDownloadURLDalaySeconds);

    // Callback
    const isFunctionCallBack = isFunction(onDownload);

    if (isFunctionCallBack) {
      const { size, type } = binaryBlob;

      return onDownload({ url, blob: { size, type } });
    }
  }

  createURL(binaryBlob) {
    return URL.createObjectURL(binaryBlob);
  }

  remokeURL(url, seconds) {
    const remokeCallBackFn = () => URL.revokeObjectURL(url);

    const delayMilliseconds = secondsToMilliseconds(seconds);

    setTimeout(remokeCallBackFn, delayMilliseconds);
  }

  fileNameNormalize(filename = '', extension) {
    let filenameNormalized = filename.trim();

    if (!filenameNormalized.includes(extension)) {
      filenameNormalized += extension;
    }

    return filenameNormalized;
  }
}

function shortcutActionByKey(keyCode) {
  let keyBoardShortcutAction = null;

  switch (keyCode) {
    case 110:
      // Key "n"
      keyBoardShortcutAction = 'TOGGLE_COPY_NOTIFIER';
      break;

    case 32:
    case 114:
      // Key "R" or SPACEBAR
      keyBoardShortcutAction = 'RELOAD_PALETTE';
      break;

    case 101:
      // Key "E"
      keyBoardShortcutAction = 'EXPORT_COLORS_JSON';
      break;

    case 102:
      // Key "F"
      keyBoardShortcutAction = 'TOGGLE_FULLSCREEN';
      break;
  }

  return keyBoardShortcutAction;
}

function application() {
  const fullscreen = new Fullscreen();

  const download = new DownloadBlob({
    anchorElement: DOMDownloadAnchor,
  });

  const notifier = new ModalNotifier({
    overlays: [
      {
        container: DOMClipboardModal,
        key: 'clipboard',
        setTimeoutHandleValue: null,
        isOpen: null,
      },
      {
        container: DOMShortcutsModal,
        key: 'shortcut',
        setTimeoutHandleValue: null,
        isOpen: null,
      },
    ],
    commonClassName: 'hidden',
  });

  const view = new View({
    container: DOMColorContainer,
    childsElements: DOMCardElements,
    notifierInstance: notifier,
    notifierEnabled: true,
  });

  /**
   * DOM Events
   */
  DOMGenerate.addEventListener('click', () => view.reloadDisplayedColors());

  /**
   * Shortcuts HTML Events
   */
  DOMShortcutOpen.addEventListener('click', () => notifier.open('shortcut'));
  DOMShortcutClose.addEventListener('click', () => notifier.close('shortcut'));

  window.addEventListener('keypress', (event) => {
    //console.log(event);

    const { which: keyCode } = event;

    const action = shortcutActionByKey(keyCode);

    if (action === 'RELOAD_PALETTE') {
      view.reloadDisplayedColors();
    }

    if (action === 'TOGGLE_COPY_NOTIFIER') {
      DOMShortcutCircle.classList.toggle('disabled');

      view.notifierEnabled = !view.notifierEnabled;
    }

    if (action === 'EXPORT_COLORS_JSON') {
      if (fullscreen.state) {
        fullscreen.state = false;
      }

      const COLORS_FILE_NAME = 'colors.json';

      const colors = view.currentColors;

      let filename = prompt(MESSAGES.ptBR.exportAlert, COLORS_FILE_NAME);

      const isNotString = !isString(filename);

      if (isNotString) return;

      // Empty string
      if (!filename.length) {
        filename = COLORS_FILE_NAME;
      }

      download.export({
        data: JSON.stringify(colors),
        filename,
        extension: '.json',
        clearDownloadURLDalaySeconds: 60,
        onDownload: (data) => {
          console.log(data);
        },
      });
    }

    if (action === 'TOGGLE_FULLSCREEN') {
      fullscreen.toggle((state) => {
        console.log(state);
      });
    }
  });

  return {
    fullscreen,
    notifier,
    download,
    view,
  };
}

window.addEventListener('load', () => {
  const objects = application();

  console.log(objects);
});
