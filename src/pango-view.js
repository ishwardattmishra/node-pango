import { execa } from 'execa';
import { promises as fs, createReadStream } from 'node:fs';
import HtmlToPangoConverter from './html-to-pango.js';
import FontManager from './font-manager.js';
import ArgBuilder from './arg-builder.js';
import {
  SUPPORTED_FORMATS,
  SUPPORTED_ALIGNMENTS,
  SUPPORTED_WRAP_MODES,
  SUPPORTED_ELLIPSIZE_MODES,
  DEFAULT_PANGO_VIEW_PATH,
  DEFAULT_BACKEND,
} from './constants.js';

const hasOwn = (obj, key) => Object.hasOwn(obj, key);
const pick   = (obj, key, fallback) => hasOwn(obj, key) ? obj[key] : fallback;

/**
 * PangoView — orchestrates the pango-view render pipeline.
 *
 * SOLID notes:
 *  - SRP : argument-building is delegated to ArgBuilder;
 *          HTML conversion to HtmlToPangoConverter;
 *          font temp-dir management to FontManager.
 *  - O/CP: supported format/mode metadata lives in constants.js.
 *  - DIP : collaborators are injected via constructor, enabling easy
 *          substitution or mocking in tests.
 */
class PangoView {
  /**
   * @param {import('./pango-view.js').PangoViewOptions} options
   * @param {{ htmlConverter?: HtmlToPangoConverter, fontManager?: FontManager }} [deps]
   */
  constructor(options = {}, { htmlConverter, fontManager } = {}) {
    this.options = {
      // ── Content ──────────────────────────────────────────────────────────
      text:   options.text   || '',
      output: options.output || 'output.png',

      // ── Font ─────────────────────────────────────────────────────────────
      font:     options.font     || null,
      fontFile: options.fontFile || null,

      // ── Layout ───────────────────────────────────────────────────────────
      width:          pick(options, 'width',  null),
      height:         pick(options, 'height', null),
      align:          options.align          || null,
      justify:        !!options.justify,
      justifyLastLine: !!options.justifyLastLine,
      indent:         pick(options, 'indent',   null),
      spacing:        pick(options, 'spacing',  null),
      lineSpacing:    pick(options, 'lineSpacing', null),
      singlePar:      !!options.singlePar,

      // ── Text processing ───────────────────────────────────────────────────
      markup:    !!options.markup,
      htmlMode:  pick(options, 'htmlMode', true),
      wrap:      options.wrap      || null,
      ellipsize: options.ellipsize || null,

      // ── Rendering backend ─────────────────────────────────────────────────
      backend: options.backend || DEFAULT_BACKEND,
      dpi:     pick(options, 'dpi', null),
      pixels:  !!options.pixels,

      // ── Visual ────────────────────────────────────────────────────────────
      foreground: options.foreground || null,
      background: options.background || null,
      margin:     pick(options, 'margin', null),

      // ── Transform & quality ───────────────────────────────────────────────
      rotateAngle:       pick(options, 'rotateAngle', null),
      gravity:           options.gravity           || null,
      gravityHint:       options.gravityHint       || null,
      hinting:           options.hinting           || null,
      antialias:         options.antialias         || null,
      hintMetrics:       options.hintMetrics       || null,
      subpixelOrder:     options.subpixelOrder     || null,
      subpixelPositions: !!options.subpixelPositions,
      language:          options.language          || null,

      // ── Direction & display ───────────────────────────────────────────────
      noAutoDir: !!options.noAutoDir,
      rtl:       !!options.rtl,
      header:    !!options.header,
      waterfall: !!options.waterfall,

      pangoViewPath: options.pangoViewPath || DEFAULT_PANGO_VIEW_PATH,
    };

    // Injected collaborators (Dependency Inversion)
    this._htmlConverter = htmlConverter ?? new HtmlToPangoConverter();
    this._fontManager   = fontManager   ?? new FontManager();
  }

  // ── Public API ────────────────────────────────────────────────────────────

  /** Resolve the final Pango markup string from the current text/mode. */
  getMarkup() {
    const { text, markup, htmlMode } = this.options;
    if (markup)   return text;
    if (htmlMode) return this._htmlConverter.convert(text);
    return text;
  }

  /** Render text to the configured output file. */
  async render() {
    return this.options.fontFile
      ? this._renderWithCustomFont()
      : this._executeRender();
  }

  /** Render and return the output file as a Buffer. */
  async renderToBuffer() {
    await this.render();
    try {
      return await fs.readFile(this.options.output);
    } catch (error) {
      throw new Error(`Failed to read output file: ${error.message}`);
    }
  }

  /** Render and return the output file as a ReadStream. */
  async renderToStream() {
    await this.render();
    return createReadStream(this.options.output);
  }

  // ── Static helpers ─────────────────────────────────────────────────────────

  static async checkInstallation(pangoViewPath = DEFAULT_PANGO_VIEW_PATH) {
    try {
      const result = await execa(pangoViewPath, ['--version'], { timeout: 5000 });
      return { installed: true, version: result.stdout.trim(), path: pangoViewPath };
    } catch (error) {
      return { installed: false, error: error.message, path: pangoViewPath };
    }
  }

  static getSupportedFormats()        { return SUPPORTED_FORMATS; }
  static getSupportedAlignments()     { return SUPPORTED_ALIGNMENTS; }
  static getSupportedWrapModes()      { return SUPPORTED_WRAP_MODES; }
  static getSupportedEllipsizeModes() { return SUPPORTED_ELLIPSIZE_MODES; }

  // ── Private helpers ────────────────────────────────────────────────────────

  async _renderWithCustomFont() {
    return this._fontManager.withFontConfig(
      this.options.fontFile,
      this._extractFontFamily(),
      (config) => this._executeRender(
        { PANGOCAIRO_BACKEND: 'fontconfig', FONTCONFIG_PATH: config.configDir },
        config.configDir,
      ),
    );
  }

  _extractFontFamily() {
    if (!this.options.font) return null;
    const match = this.options.font.match(/^\D+/);
    return match ? match[0].trim() : null;
  }

  async _executeRender(envVars = {}, cwd = null) {
    const args = new ArgBuilder(this.options, this.getMarkup()).build();

    try {
      const result = await execa(this.options.pangoViewPath, args, {
        env: { ...process.env, ...envVars },
        cwd: cwd ?? process.cwd(),
        timeout: 30_000,
      });

      return {
        success: true,
        stdout:  result.stdout,
        stderr:  result.stderr,
        output:  this.options.output,
      };
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(
          `pango-view not found at "${this.options.pangoViewPath}". ` +
          `Please ensure Pango is installed and pango-view is in your PATH.`,
        );
      }
      throw new Error(
        `pango-view failed: ${error.message}\n` +
        `Command: ${error.command}\n` +
        `Exit code: ${error.exitCode}\n` +
        `Stderr: ${error.stderr ?? 'N/A'}`,
      );
    }
  }
}

export default PangoView;
