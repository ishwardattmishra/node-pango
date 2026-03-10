# API Documentation

## Table of Contents

- [PangoView Class](#pangoview-class)
- [HtmlToPangoConverter Class](#htmltopangoconverter-class)
- [FontManager Class](#fontmanager-class)
- [HTML Tag Mapping](#html-tag-mapping)
- [Configuration Reference](#configuration-reference)

## PangoView Class

The main class for rendering text with Pango.

### Constructor

```javascript
new PangoView(options)
```

Creates a new PangoView instance with the specified options.

**Parameters:**

- `options` (Object): Configuration options

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `text` | string | `''` | The text to render (required) |
| `output` | string | `'output.png'` | Output file path (required) |
| `font` | string | `null` | Font description (e.g., 'Sans 12') |
| `fontFile` | string | `null` | Path to custom font file (.ttf or .otf) |
| `width` | number | `null` | Maximum width in pixels |
| `height` | number | `null` | Maximum height in pixels |
| `align` | string | `null` | Text alignment: 'left', 'center', 'right' |
| `justify` | boolean | `false` | Enable text justification |
| `indent` | number | `null` | First line indentation in pixels |
| `spacing` | number | `null` | Space between lines in pixels |
| `lineSpacing` | number | `null` | Line spacing multiplier |
| `markup` | boolean | `false` | Text already contains Pango markup |
| `htmlMode` | boolean | `true` | Parse HTML tags and convert to Pango markup |
| `wrap` | string | `null` | Text wrapping: 'word', 'char', 'word-char' |
| `ellipsize` | string | `null` | Ellipsize mode: 'start', 'middle', 'end' |
| `annotate` | number/boolean | `null` | Rectangle annotation level (0-2) |
| `backend` | string | auto-detected | Output format: 'png', 'svg', 'pdf', 'ps' |
| `dpi` | number | `null` | Output resolution in DPI |
| `pangoViewPath` | string | `'pango-view'` | Path to pango-view binary |
| `rotateAngle` | number | `null` | Text rotation angle in degrees |
| `gravity` | string | `null` | Text gravity setting |
| `gravityHint` | string | `null` | Gravity hint setting |
| `hinting` | string | `null` | Font hinting mode |
| `language` | string | `null` | Language code for text processing |
| `foreground` | string | `null` | Text color (hex or named color) |
| `background` | string | `null` | Background color (hex or named color) |
| `margin` | number | `null` | Margin around text in pixels |

### Methods

#### `getMarkup()`

Returns the Pango markup that will be rendered.

**Returns:** `string` - The Pango markup

**Example:**

```javascript
const pango = new PangoView({
  text: 'Hello <strong>World</strong>',
  output: 'test.png'
});

console.log(pango.getMarkup());
// Output: Hello <span weight="bold">World</span>
```

#### `render()`

Renders the text and writes output to the specified file.

**Returns:** `Promise<RenderResult>`

**RenderResult:**

```javascript
{
  success: boolean,    // Whether rendering succeeded
  stdout: string,      // Standard output from pango-view
  stderr: string,      // Standard error from pango-view
  output: string       // Output file path
}
```

**Example:**

```javascript
const result = await pango.render();
console.log(`Rendered to ${result.output}`);
```

#### `renderToBuffer()`

Renders the text and returns the output as a Buffer.

**Returns:** `Promise<Buffer>`

**Example:**

```javascript
const buffer = await pango.renderToBuffer();
// Use buffer for streaming, uploading, etc.
```

#### `renderToStream()`

Renders the text and returns a readable stream.

**Returns:** `Promise<ReadStream>`

**Example:**

```javascript
const stream = await pango.renderToStream();
stream.pipe(response);
```

### Static Methods

#### `PangoView.checkInstallation([pangoViewPath])`

Checks if pango-view is installed and accessible.

**Parameters:**

- `pangoViewPath` (string, optional): Path to pango-view binary

**Returns:** `Promise<InstallationCheck>`

**InstallationCheck:**

```javascript
{
  installed: boolean,  // Whether pango-view is found
  version: string,     // Version string (if installed)
  error: string,       // Error message (if not installed)
  path: string         // Path to binary
}
```

**Example:**

```javascript
const check = await PangoView.checkInstallation();
if (!check.installed) {
  console.error('pango-view not found');
}
```

#### `PangoView.getSupportedFormats()`

Returns an array of supported output formats.

**Returns:** `string[]` - `['png', 'svg', 'pdf', 'ps']`

#### `PangoView.getSupportedAlignments()`

Returns an array of supported text alignments.

**Returns:** `string[]` - `['left', 'center', 'right']`

#### `PangoView.getSupportedWrapModes()`

Returns an array of supported wrap modes.

**Returns:** `string[]` - `['word', 'char', 'word-char']`

#### `PangoView.getSupportedEllipsizeModes()`

Returns an array of supported ellipsize modes.

**Returns:** `string[]` - `['start', 'middle', 'end']`

---

## HtmlToPangoConverter Class

Converts HTML markup to Pango markup.

### Constructor

```javascript
new HtmlToPangoConverter()
```

Creates a new converter instance.

### Methods

#### `convert(html)`

Converts HTML to Pango markup.

**Parameters:**

- `html` (string): HTML string to convert

**Returns:** `string` - Pango markup

**Example:**

```javascript
const converter = new HtmlToPangoConverter();
const markup = converter.convert('<strong>Bold</strong> text');
// Returns: <span weight="bold">Bold</span> text
```

---

## FontManager Class

Manages custom font loading via fontconfig.

### Constructor

```javascript
new FontManager()
```

Creates a new font manager instance.

### Methods

#### `createFontConfig(fontPath, [fontFamily])`

Creates a temporary fontconfig file for a custom font.

**Parameters:**

- `fontPath` (string): Path to font file (.ttf or .otf)
- `fontFamily` (string, optional): Font family name (auto-detected if not provided)

**Returns:** `Promise<FontConfig>`

**FontConfig:**

```javascript
{
  configPath: string,   // Path to generated fonts.conf
  fontFamily: string,   // Detected/provided font family name
  fontDir: string,      // Directory containing font file
  fontFile: string      // Font file basename
}
```

**Example:**

```javascript
const manager = new FontManager();
const config = await manager.createFontConfig('./fonts/MyFont.ttf');
console.log(config.fontFamily); // 'MyFont'
```

#### `cleanup()`

Cleans up temporary fontconfig files.

**Returns:** `Promise<void>`

**Example:**

```javascript
await manager.cleanup();
```

#### `withFontConfig(fontPath, fontFamily, callback)`

Executes a callback with a temporary fontconfig, then cleans up.

**Parameters:**

- `fontPath` (string): Path to font file
- `fontFamily` (string|null): Font family name
- `callback` (function): Async function to execute

**Returns:** `Promise<T>` - Result of callback

**Example:**

```javascript
await manager.withFontConfig(
  './fonts/MyFont.ttf',
  'MyFont',
  async (config) => {
    // Use config.configPath
    return await someOperation();
  }
);
// Cleanup happens automatically
```

---

## HTML Tag Mapping

### Text Formatting

| HTML Tag | Pango Markup | Effect |
|----------|--------------|--------|
| `<strong>`, `<b>` | `<span weight="bold">` | Bold text |
| `<em>`, `<i>` | `<span style="italic">` | Italic text |
| `<u>` | `<span underline="single">` | Underlined text |
| `<s>`, `<strike>` | `<span strikethrough="true">` | Strikethrough |
| `<tt>`, `<code>` | `<span font_family="monospace">` | Monospace font |

### Text Size

| HTML Tag | Pango Markup | Effect |
|----------|--------------|--------|
| `<small>` | `<span size="small">` | Small text |
| `<big>` | `<span size="large">` | Large text |
| `<h1>` | `<span size="xx-large" weight="bold">` | Heading 1 |
| `<h2>` | `<span size="x-large" weight="bold">` | Heading 2 |
| `<h3>` | `<span size="large" weight="bold">` | Heading 3 |
| `<h4>` | `<span size="medium" weight="bold">` | Heading 4 |
| `<h5>` | `<span size="small" weight="bold">` | Heading 5 |
| `<h6>` | `<span size="x-small" weight="bold">` | Heading 6 |

### Font Element

| HTML Attribute | Pango Attribute | Example |
|----------------|-----------------|---------|
| `color="..."` | `foreground="..."` | `<font color="red">` |
| `size="..."` | `size="..."` | `<font size="5">` |
| `face="..."` | `font_family="..."` | `<font face="Arial">` |

HTML font sizes (1-7) are converted to Pango size names:

| HTML Size | Pango Size |
|-----------|------------|
| 1 | xx-small |
| 2 | x-small |
| 3 | small |
| 4 | medium |
| 5 | large |
| 6 | x-large |
| 7 | xx-large |

### Superscript/Subscript

| HTML Tag | Pango Markup | Effect |
|----------|--------------|--------|
| `<sup>` | `<span rise="5000">` | Superscript |
| `<sub>` | `<span rise="-5000">` | Subscript |

### Span with CSS Styles

The converter supports inline CSS styles on `<span>` elements:

| CSS Property | Pango Attribute | Example |
|--------------|-----------------|---------|
| `color` | `foreground` | `style="color: red"` |
| `background-color` | `background` | `style="background-color: yellow"` |
| `font-weight` | `weight` | `style="font-weight: bold"` |
| `font-style` | `style` | `style="font-style: italic"` |
| `text-decoration` | `underline`, `strikethrough` | `style="text-decoration: underline"` |
| `font-family` | `font_family` | `style="font-family: Arial"` |
| `font-size` | `size` | `style="font-size: 16px"` |

### Block Elements

| HTML Tag | Behavior |
|----------|----------|
| `<p>`, `<div>` | Content with newline |
| `<br>` | Line break |

---

## Configuration Reference

### Alignment Values

- `left`: Left-aligned text
- `center`: Center-aligned text
- `right`: Right-aligned text

### Wrap Modes

- `word`: Wrap at word boundaries
- `char`: Wrap at character boundaries
- `word-char`: Wrap at word boundaries, but fall back to character if needed

### Ellipsize Modes

- `start`: Ellipsis at the start (…text)
- `middle`: Ellipsis in the middle (te…xt)
- `end`: Ellipsis at the end (text…)

### Annotation Levels

- `0` or `false`: No annotation
- `1` or `true`: Basic annotation (extents)
- `2`: Full annotation (extents + baselines)

### Backend Formats

- `png`: PNG image (default)
- `svg`: Scalable Vector Graphics
- `pdf`: Portable Document Format
- `ps`: PostScript

### Font Description Format

Font descriptions follow the pattern: `FAMILY-LIST [STYLE-OPTIONS] [SIZE]`

Examples:
- `Sans 12`
- `Serif Bold 14`
- `Monospace Italic 10`
- `Arial Bold Italic 16`

### Color Formats

Colors can be specified as:
- Named colors: `red`, `blue`, `green`, etc.
- Hex colors: `#FF0000`, `#00FF00`, `#0000FF`
- RGB: `rgb(255, 0, 0)`
- RGBA: `rgba(255, 0, 0, 0.5)`

---

## Error Handling

### Common Errors

**pango-view not found:**

```javascript
try {
  await pango.render();
} catch (error) {
  if (error.message.includes('pango-view not found')) {
    console.error('Please install Pango');
  }
}
```

**Font file not found:**

```javascript
try {
  const pango = new PangoView({
    text: 'Test',
    fontFile: '/invalid/path.ttf',
    output: 'test.png'
  });
  await pango.render();
} catch (error) {
  console.error('Font file error:', error.message);
}
```

**Rendering failed:**

```javascript
try {
  await pango.render();
} catch (error) {
  console.error('Rendering failed:', error.message);
  // error.message includes stderr output from pango-view
}
```

---

## TypeScript Support

The package includes TypeScript definitions:

```typescript
import PangoView, { PangoViewOptions, RenderResult } from 'node-pango';

const options: PangoViewOptions = {
  text: 'Hello',
  output: 'output.png',
  width: 300
};

const pango = new PangoView(options);
const result: RenderResult = await pango.render();
```
