/**
 * Supported output formats for pango-view's Cairo backend.
 * @type {ReadonlyArray<string>}
 */
export const SUPPORTED_FORMATS = Object.freeze(['png', 'svg', 'pdf', 'ps']);

/**
 * Supported text alignment values.
 * @type {ReadonlyArray<string>}
 */
export const SUPPORTED_ALIGNMENTS = Object.freeze(['left', 'center', 'right']);

/**
 * Supported text wrap modes.
 * @type {ReadonlyArray<string>}
 */
export const SUPPORTED_WRAP_MODES = Object.freeze(['word', 'char', 'word-char']);

/**
 * Supported ellipsization modes.
 * @type {ReadonlyArray<string>}
 */
export const SUPPORTED_ELLIPSIZE_MODES = Object.freeze(['start', 'middle', 'end']);

/**
 * Default pango-view executable name.
 * @type {string}
 */
export const DEFAULT_PANGO_VIEW_PATH = 'pango-view';

/**
 * Default rendering backend.
 * @type {string}
 */
export const DEFAULT_BACKEND = 'cairo';
