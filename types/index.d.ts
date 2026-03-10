export interface PangoViewOptions {
  text: string;
  output: string;

  font?: string;
  fontFile?: string;

  width?: number;
  height?: number;
  align?: 'left' | 'center' | 'right';
  justify?: boolean;
  justifyLastLine?: boolean;
  indent?: number;
  spacing?: number;
  lineSpacing?: number;
  singlePar?: boolean;

  markup?: boolean;
  htmlMode?: boolean;
  wrap?: 'word' | 'char' | 'word-char';
  ellipsize?: 'start' | 'middle' | 'end';

  backend?: string;
  dpi?: number;
  pixels?: boolean;

  foreground?: string;
  background?: string;
  margin?: number;

  rotateAngle?: number;
  gravity?: 'south' | 'east' | 'north' | 'west' | 'auto';
  gravityHint?: 'natural' | 'strong' | 'line';
  hinting?: 'none' | 'auto' | 'slight' | 'medium' | 'full';
  antialias?: 'none' | 'gray' | 'subpixel';
  hintMetrics?: 'on' | 'off';
  subpixelOrder?: 'rgb' | 'bgr' | 'vrgb' | 'vbgr';
  subpixelPositions?: boolean;
  language?: string;

  noAutoDir?: boolean;
  rtl?: boolean;
  header?: boolean;
  waterfall?: boolean;

  pangoViewPath?: string;
}

export interface RenderResult {
  success: boolean;
  stdout: string;
  stderr: string;
  output: string;
}

export interface InstallationCheck {
  installed: boolean;
  version?: string;
  error?: string;
  path: string;
}

export interface FontConfig {
  configPath: string;
  configDir: string;
  fontFamily: string;
  fontDir: string;
  fontFile: string;
}

export class PangoView {
  constructor(options: PangoViewOptions);

  getMarkup(): string;

  render(): Promise<RenderResult>;

  renderToBuffer(): Promise<Buffer>;

  renderToStream(): Promise<import('fs').ReadStream>;

  static checkInstallation(pangoViewPath?: string): Promise<InstallationCheck>;

  static getSupportedFormats(): string[];

  static getSupportedAlignments(): string[];

  static getSupportedWrapModes(): string[];

  static getSupportedEllipsizeModes(): string[];
}

export class HtmlToPangoConverter {
  constructor();

  convert(html: string): string;
}

export class FontManager {
  constructor();

  createFontConfig(fontPath: string, fontFamily?: string | null): Promise<FontConfig>;

  cleanup(): Promise<void>;

  withFontConfig<T>(
    fontPath: string,
    fontFamily: string | null,
    callback: (config: FontConfig) => Promise<T>
  ): Promise<T>;
}

export class ArgBuilder {
  constructor(options: PangoViewOptions, markup: string);

  build(): string[];
}

export declare const CONSTANTS: {
  readonly SUPPORTED_FORMATS: ReadonlyArray<string>;
  readonly SUPPORTED_ALIGNMENTS: ReadonlyArray<string>;
  readonly SUPPORTED_WRAP_MODES: ReadonlyArray<string>;
  readonly SUPPORTED_ELLIPSIZE_MODES: ReadonlyArray<string>;
  readonly DEFAULT_PANGO_VIEW_PATH: string;
  readonly DEFAULT_BACKEND: string;
};

export default PangoView;
