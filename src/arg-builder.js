import path from 'node:path';

/**
 * ArgBuilder — Single Responsibility: translate a PangoView options object into
 * the CLI argument array that is passed to the pango-view subprocess.
 *
 * Keeping this logic separate from PangoView means:
 *  - PangoView only orchestrates the render pipeline.
 *  - ArgBuilder can be unit-tested without spawning any process.
 *  - New CLI flags are added here without touching PangoView.
 */
export class ArgBuilder {
  /**
   * @param {import('./pango-view.js').PangoViewOptions} options
   * @param {string} markup - Already-resolved Pango markup string
   */
  constructor(options, markup) {
    this._options = options;
    this._markup = markup;
  }

  /**
   * Build and return the full CLI argument array.
   * @returns {string[]}
   */
  build() {
    const args = [];
    const o = this._options;

    // ── Required flags ─────────────────────────────────────────────────────
    args.push('--no-display', '--markup');
    args.push('--text', this._markup);

    const outputPath = path.isAbsolute(o.output)
      ? o.output
      : path.resolve(process.cwd(), o.output);
    args.push('--output', outputPath);

    // ── Font ───────────────────────────────────────────────────────────────
    if (o.font) args.push('--font', o.font);

    // ── Layout ────────────────────────────────────────────────────────────
    if (o.width !== null)  args.push('--width',  String(o.width));
    if (o.height !== null) args.push('--height', String(o.height));
    if (o.align)           args.push(`--align=${o.align}`);
    if (o.justify)         args.push('--justify');
    if (o.justifyLastLine) args.push('--justify-last-line');
    if (o.indent !== null) args.push('--indent', String(o.indent));
    if (o.spacing !== null) args.push('--spacing', String(o.spacing));
    if (o.lineSpacing !== null) args.push('--line-spacing', String(o.lineSpacing));
    if (o.singlePar)       args.push('--single-par');

    // ── Text flow ─────────────────────────────────────────────────────────
    if (o.wrap)      args.push(`--wrap=${o.wrap}`);
    if (o.ellipsize) args.push(`--ellipsize=${o.ellipsize}`);

    // ── Transform ─────────────────────────────────────────────────────────
    if (o.rotateAngle !== null) args.push('--rotate', String(o.rotateAngle));
    if (o.gravity)              args.push(`--gravity=${o.gravity}`);
    if (o.gravityHint)          args.push(`--gravity-hint=${o.gravityHint}`);

    // ── Rendering quality ─────────────────────────────────────────────────
    if (o.hinting)             args.push(`--hinting=${o.hinting}`);
    if (o.antialias)           args.push(`--antialias=${o.antialias}`);
    if (o.hintMetrics)         args.push(`--hint-metrics=${o.hintMetrics}`);
    if (o.subpixelOrder)       args.push(`--subpixel-order=${o.subpixelOrder}`);
    if (o.subpixelPositions)   args.push('--subpixel-positions');

    // ── Locale / direction ────────────────────────────────────────────────
    if (o.language)   args.push(`--language=${o.language}`);
    if (o.noAutoDir)  args.push('--no-auto-dir');
    if (o.rtl)        args.push('--rtl');

    // ── Visual ────────────────────────────────────────────────────────────
    if (o.foreground)      args.push('--foreground', o.foreground);
    if (o.background)      args.push('--background', o.background);
    if (o.margin !== null) args.push('--margin', String(o.margin));

    // ── Output ────────────────────────────────────────────────────────────
    if (o.dpi !== null) args.push('--dpi', String(o.dpi));
    if (o.pixels)       args.push('--pixels');

    // ── Display extras ────────────────────────────────────────────────────
    if (o.header)    args.push('--header');
    if (o.waterfall) args.push('--waterfall');

    // ── Backend (always last) ─────────────────────────────────────────────
    args.push(`--backend=${o.backend}`);

    return args;
  }
}

export default ArgBuilder;
