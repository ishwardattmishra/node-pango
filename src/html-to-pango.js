import * as htmlparser2 from 'htmlparser2';
import { DomHandler } from 'domhandler';

/*
 * Pango natively supports these convenience tags, so they can be
 * passed through as-is when they appear in HTML input:
 *   <b>  <big>  <i>  <s>  <sub>  <sup>  <small>  <tt>  <u>
 *
 * HTML tags that have NO Pango equivalent must be converted to
 * <span> with the appropriate attributes.
 */
const PANGO_NATIVE_TAGS = new Set([
  'b', 'big', 'i', 's', 'sub', 'sup', 'small', 'tt', 'u'
]);

/*
 * Complete list of attributes accepted by Pango's <span> tag
 * (as of Pango 1.50+).  Aliases are included so that users can
 * write either the long or the short form on an HTML <span>.
 */
const PANGO_SPAN_ATTRS = new Set([
  'font', 'font_desc',
  'font_family', 'face',
  'font_size', 'size',
  'font_style', 'style',
  'font_weight', 'weight',
  'font_variant', 'variant',
  'font_stretch', 'stretch',
  'font_features',
  'foreground', 'fgcolor', 'color',
  'background', 'bgcolor',
  'alpha', 'fgalpha',
  'background_alpha', 'bgalpha',
  'underline', 'underline_color',
  'overline', 'overline_color',
  'rise',
  'baseline_shift',
  'font_scale',
  'strikethrough', 'strikethrough_color',
  'fallback',
  'lang',
  'letter_spacing',
  'gravity', 'gravity_hint',
  'show',
  'insert_hyphens',
  'allow_breaks',
  'line_height',
  'text_transform',
  'segment'
]);

class HtmlToPangoConverter {
  constructor() {
    this.tagMapping = {
      'strong': { tag: 'b' },
      'em':     { tag: 'i' },
      'strike': { tag: 's' },
      'code':   { tag: 'tt' }
    };
  }

  convert(html) {
    let dom;
    const handler = new DomHandler((error, _dom) => {
      if (error) throw error;
      dom = _dom;
    });

    const parser = new htmlparser2.Parser(handler, {
      decodeEntities: true,
      lowerCaseTags: true,
      lowerCaseAttributeNames: true
    });

    parser.write(html);
    parser.end();

    return this._processNodes(dom);
  }

  _processNodes(nodes) {
    if (!nodes || nodes.length === 0) return '';

    let result = '';
    for (const node of nodes) {
      if (node.type === 'text') {
        result += this._escapeText(node.data);
      } else if (node.type === 'tag') {
        result += this._processTag(node);
      }
    }
    return result;
  }

  _processTag(node) {
    const tag = node.name.toLowerCase();

    if (tag === 'br') return '\n';

    if (tag === 'p' || tag === 'div') {
      return this._processNodes(node.children) + '\n';
    }

    if (/^h[1-6]$/.test(tag)) {
      const level = parseInt(tag[1]);
      const size = this._getHeadingSize(level);
      const content = this._processNodes(node.children);
      return `<span size="${size}" weight="bold">${content}</span>\n`;
    }

    if (tag === 'font') return this._processFontTag(node);

    if (tag === 'span') return this._processSpanTag(node);

    if (PANGO_NATIVE_TAGS.has(tag)) {
      const content = this._processNodes(node.children);
      return `<${tag}>${content}</${tag}>`;
    }

    if (this.tagMapping[tag]) {
      const mapped = this.tagMapping[tag].tag;
      const content = this._processNodes(node.children);
      return `<${mapped}>${content}</${mapped}>`;
    }

    return this._processNodes(node.children);
  }

  _processFontTag(node) {
    const attrs = {};

    if (node.attribs.color) {
      attrs.foreground = node.attribs.color;
    }

    if (node.attribs.size) {
      const raw = node.attribs.size;
      attrs.size = /^\d+$/.test(raw)
        ? this._convertHtmlFontSize(parseInt(raw))
        : raw;
    }

    if (node.attribs.face) {
      attrs.face = node.attribs.face;
    }

    const content = this._processNodes(node.children);

    if (Object.keys(attrs).length > 0) {
      return `<span${this._buildAttributes(attrs)}>${content}</span>`;
    }

    return content;
  }

  _processSpanTag(node) {
    const attrs = {};

    if (node.attribs.style) {
      Object.assign(attrs, this._parseStyleAttribute(node.attribs.style));
    }

    for (const attr of PANGO_SPAN_ATTRS) {
      if (node.attribs[attr] !== undefined) {
        attrs[attr] = node.attribs[attr];
      }
    }

    const content = this._processNodes(node.children);

    if (Object.keys(attrs).length > 0) {
      return `<span${this._buildAttributes(attrs)}>${content}</span>`;
    }

    return content;
  }

  _parseStyleAttribute(style) {
    const attrs = {};
    const declarations = style.split(';').map(s => s.trim()).filter(Boolean);

    for (const decl of declarations) {
      const colonIdx = decl.indexOf(':');
      if (colonIdx === -1) continue;
      const property = decl.slice(0, colonIdx).trim();
      const value = decl.slice(colonIdx + 1).trim();
      if (!property || !value) continue;

      switch (property) {
        case 'color':
          attrs.foreground = value;
          break;
        case 'background-color':
          attrs.background = value;
          break;
        case 'font-weight':
          attrs.weight = (value === 'bold' || parseInt(value) >= 700) ? 'bold' : 'normal';
          break;
        case 'font-style':
          attrs.style = (value === 'italic' || value === 'oblique') ? 'italic' : 'normal';
          break;
        case 'font-variant':
          attrs.variant = value.replace(/-/g, '_');
          break;
        case 'font-stretch':
          attrs.stretch = value;
          break;
        case 'text-decoration':
          if (value.includes('underline'))    attrs.underline = 'single';
          if (value.includes('overline'))     attrs.overline = 'single';
          if (value.includes('line-through')) attrs.strikethrough = 'true';
          break;
        case 'text-transform':
          attrs.text_transform = value;
          break;
        case 'font-family':
          attrs.face = value.replace(/['"]/g, '');
          break;
        case 'font-size':
          attrs.size = this._convertCssFontSize(value);
          break;
        case 'letter-spacing':
          attrs.letter_spacing = this._convertLetterSpacing(value);
          break;
        case 'line-height':
          attrs.line_height = value;
          break;
        case 'font-feature-settings':
          attrs.font_features = value.replace(/['"]/g, '');
          break;
      }
    }

    return attrs;
  }

  _convertCssFontSize(cssSize) {
    const match = cssSize.match(/^(\d+(?:\.\d+)?)(px|pt|em|rem|%)?$/);
    if (!match) return cssSize;

    const [, value, unit] = match;
    const num = parseFloat(value);

    switch (unit) {
      case 'pt':  return `${Math.round(num * 1024)}`;
      case 'px':  return `${Math.round(num * 1024 * 72 / 96)}`;
      case 'em':
      case 'rem': return `${Math.round(num * 100)}%`;
      case '%':   return cssSize;
      default:    return `${Math.round(num * 1024)}`;
    }
  }

  _convertLetterSpacing(value) {
    const match = value.match(/^(-?\d+(?:\.\d+)?)(px|pt|em)?$/);
    if (!match) return '0';
    const [, num, unit] = match;
    const v = parseFloat(num);
    if (unit === 'pt') return `${Math.round(v * 1024)}`;
    if (unit === 'em') return `${Math.round(v * 12 * 1024)}`;
    return `${Math.round(v * 1024 * 72 / 96)}`;
  }

  _convertHtmlFontSize(htmlSize) {
    const map = {
      1: 'xx-small', 2: 'x-small', 3: 'small', 4: 'medium',
      5: 'large',    6: 'x-large', 7: 'xx-large'
    };
    return map[htmlSize] || 'medium';
  }

  _getHeadingSize(level) {
    const sizes = {
      1: 'xx-large', 2: 'x-large', 3: 'large',
      4: 'medium',   5: 'small',   6: 'x-small'
    };
    return sizes[level] || 'medium';
  }

  _buildAttributes(attrs) {
    const pairs = Object.entries(attrs)
      .map(([k, v]) => `${k}="${this._escapeAttribute(v)}"`);
    return pairs.length ? ' ' + pairs.join(' ') : '';
  }

  _escapeText(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  _escapeAttribute(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}

export default HtmlToPangoConverter;
