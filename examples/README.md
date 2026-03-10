# node-pango Examples & API Documentation

Complete examples and API reference for the node-pango package.

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
  - [PangoView Class](#pangoview-class)
  - [Constructor Options](#constructor-options)
  - [Methods](#methods)
  - [Static Methods](#static-methods)
- [Examples](#examples)
- [Advanced Usage](#advanced-usage)
- [Troubleshooting](#troubleshooting)

---

## Installation

```bash
npm install node-pango
```

**System Requirements:**
- Node.js >= 14.0.0
- pango-view CLI utility installed on your system

**Installing pango-view:**

```bash
# macOS
brew install pango

# Ubuntu/Debian
sudo apt-get install pango1.0-tools

# Fedora
sudo dnf install pango-tools
```

---

## Quick Start

```javascript
const PangoView = require('node-pango');

// Basic text rendering
const pango = new PangoView({
  text: 'Hello, World!',
  output: 'output.png',
  width: 400,
  font: 'Sans 16'
});

await pango.render();
```

---

## API Reference

### PangoView Class

Main class for rendering text with Pango.

#### Constructor

```javascript
new PangoView(options)
```

Creates a new PangoView instance.

**Parameters:**
- `options` (Object) - Configuration options (see [Constructor Options](#constructor-options))

**Returns:** PangoView instance

**Example:**
```javascript
const pango = new PangoView({
  text: 'Hello',
  output: 'hello.png',
  width: 300
});
```

---

### Constructor Options

All available options for the PangoView constructor:

#### Required Options

| Option | Type | Description |
|--------|------|-------------|
| `text` | string | Text content to render (required) |
| `output` | string | Output file path (required) |

#### Font Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `font` | string | `null` | Font description (e.g., 'Sans 12', 'Serif Bold 14') |
| `fontFile` | string | `null` | Path to custom font file (.ttf or .otf) for font-by-path rendering |

**Example:**
```javascript
// System font
{ font: 'Arial 16' }

// Custom font from file
{ fontFile: './fonts/MyFont.ttf', font: 'MyFont 24' }
```

#### Layout Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `width` | number | `null` | Maximum width in pixels |
| `height` | number | `null` | Maximum height in pixels |
| `align` | string | `null` | Text alignment: `'left'`, `'center'`, `'right'` |
| `justify` | boolean | `false` | Enable text justification |
| `indent` | number | `null` | First line indentation in pixels |
| `spacing` | number | `null` | Space between lines in pixels |
| `lineSpacing` | number | `null` | Line spacing multiplier (e.g., 1.5 for 1.5x spacing) |

**Example:**
```javascript
{
  width: 500,
  height: 300,
  align: 'center',
  justify: true,
  lineSpacing: 1.5
}
```

#### Text Processing Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `markup` | boolean | `false` | If true, text already contains Pango markup |
| `htmlMode` | boolean | `true` | Parse HTML tags and convert to Pango markup |
| `wrap` | string | `null` | Text wrapping: `'word'`, `'char'`, `'word-char'` |
| `ellipsize` | string | `null` | Ellipsize mode: `'start'`, `'middle'`, `'end'` |

**Example:**
```javascript
// HTML mode (default)
{ text: '<strong>Bold</strong> text', htmlMode: true }

// Pango markup mode
{ text: '<span weight="bold">Bold</span>', markup: true, htmlMode: false }

// Text wrapping
{ wrap: 'word', ellipsize: 'end' }
```

#### Visual Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `foreground` | string | `null` | Text color (hex or named color) |
| `background` | string | `null` | Background color (hex or named color) |
| `margin` | number | `null` | Margin around text in pixels |

**Example:**
```javascript
{
  foreground: '#000000',
  background: '#ffffff',
  margin: 30
}
```

#### Output Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `backend` | string | auto | Output backend: `'cairo'` (auto-detected from file extension) |
| `dpi` | number | `null` | Output resolution in DPI |

**Example:**
```javascript
{ output: 'output.png', dpi: 300 }  // High-res PNG
{ output: 'output.svg' }            // SVG (vector)
{ output: 'output.pdf' }            // PDF
```

#### Advanced Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `annotate` | number\|boolean | `null` | Rectangle annotation level (0-2) |
| `rotateAngle` | number | `null` | Text rotation angle in degrees |
| `gravity` | string | `null` | Text gravity setting |
| `gravityHint` | string | `null` | Gravity hint setting |
| `hinting` | string | `null` | Font hinting mode |
| `language` | string | `null` | Language code for text processing |
| `pangoViewPath` | string | `'pango-view'` | Custom path to pango-view binary |

---

### Methods

#### `getMarkup()`

Returns the Pango markup that will be rendered (after HTML conversion if enabled).

**Returns:** `string` - The Pango markup

**Example:**
```javascript
const pango = new PangoView({
  text: '<strong>Bold</strong>',
  output: 'test.png'
});

console.log(pango.getMarkup());
// Output: <span weight="bold">Bold</span>
```

---

#### `render()`

Renders the text and writes output to the specified file.

**Returns:** `Promise<RenderResult>`

**RenderResult Object:**
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
try {
  const result = await pango.render();
  console.log(`Success! File: ${result.output}`);
} catch (error) {
  console.error('Rendering failed:', error.message);
}
```

---

#### `renderToBuffer()`

Renders the text and returns the output as a Node.js Buffer.

**Returns:** `Promise<Buffer>`

**Example:**
```javascript
const buffer = await pango.renderToBuffer();

// Use buffer for streaming
response.setHeader('Content-Type', 'image/png');
response.send(buffer);

// Or save to file
require('fs').writeFileSync('output.png', buffer);
```

---

#### `renderToStream()`

Renders the text and returns a readable stream.

**Returns:** `Promise<ReadStream>`

**Example:**
```javascript
const stream = await pango.renderToStream();

// Pipe to HTTP response
stream.pipe(response);

// Or pipe to file
stream.pipe(fs.createWriteStream('copy.png'));
```

---

### Static Methods

#### `PangoView.checkInstallation([pangoViewPath])`

Checks if pango-view is installed and accessible.

**Parameters:**
- `pangoViewPath` (string, optional) - Custom path to pango-view binary

**Returns:** `Promise<InstallationCheck>`

**InstallationCheck Object:**
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

if (check.installed) {
  console.log(`pango-view ${check.version} is installed`);
} else {
  console.error('pango-view not found');
}
```

---

#### `PangoView.getSupportedFormats()`

Returns array of supported output formats.

**Returns:** `string[]` - `['png', 'svg', 'pdf', 'ps']`

---

#### `PangoView.getSupportedAlignments()`

Returns array of supported text alignments.

**Returns:** `string[]` - `['left', 'center', 'right']`

---

#### `PangoView.getSupportedWrapModes()`

Returns array of supported wrap modes.

**Returns:** `string[]` - `['word', 'char', 'word-char']`

---

#### `PangoView.getSupportedEllipsizeModes()`

Returns array of supported ellipsize modes.

**Returns:** `string[]` - `['start', 'middle', 'end']`

---

## Examples

### Running Examples

Install dependencies first:
```bash
npm install
```

Run examples:
```bash
node examples/basic-usage.js
node examples/html-conversion.js
node examples/advanced-layout.js
node examples/custom-font.js /path/to/font.ttf
```

### Example 1: Basic Text Rendering

```javascript
const PangoView = require('node-pango');

const pango = new PangoView({
  text: 'Hello, World!',
  output: 'hello.png',
  width: 300,
  font: 'Sans 16',
  background: '#ffffff',
  margin: 20
});

await pango.render();
```

### Example 2: HTML Formatting

```javascript
const pango = new PangoView({
  text: `
    <h1>Document Title</h1>
    <p>This is <strong>bold</strong> and <em>italic</em>.</p>
    <p><font color="red">Red text</font></p>
  `,
  output: 'formatted.png',
  width: 500,
  font: 'Sans 14',
  htmlMode: true
});

await pango.render();
```

### Example 3: Custom Font from File

```javascript
const pango = new PangoView({
  text: 'Custom Font Text',
  fontFile: './fonts/MyFont.ttf',
  font: 'MyFont 24',
  output: 'custom-font.png',
  width: 600
});

await pango.render();
```

### Example 4: SVG Output

```javascript
const pango = new PangoView({
  text: 'Vector Graphics',
  output: 'output.svg',
  width: 400,
  font: 'Sans 20',
  align: 'center'
});

await pango.render();
```

### Example 5: Justified Text

```javascript
const pango = new PangoView({
  text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...',
  output: 'justified.png',
  width: 400,
  justify: true,
  wrap: 'word',
  lineSpacing: 1.5,
  font: 'Serif 12'
});

await pango.render();
```

### Example 6: Dark Theme

```javascript
const pango = new PangoView({
  text: 'Dark Mode Text',
  output: 'dark.png',
  width: 500,
  font: 'Sans 18',
  background: '#1a1a2e',
  foreground: '#eaeaea',
  margin: 30,
  align: 'center'
});

await pango.render();
```

### Example 7: Multiple Outputs

```javascript
async function generateMultiple() {
  const text = 'Same text, multiple formats';
  const options = {
    text,
    font: 'Sans 16',
    width: 400
  };

  // PNG
  await new PangoView({ ...options, output: 'output.png' }).render();
  
  // SVG
  await new PangoView({ ...options, output: 'output.svg' }).render();
  
  // PDF
  await new PangoView({ ...options, output: 'output.pdf' }).render();
}
```

### Example 8: Render to Buffer for Upload

```javascript
async function uploadRenderedImage() {
  const pango = new PangoView({
    text: 'Upload this image',
    output: 'temp.png',
    width: 300,
    font: 'Sans 14'
  });

  const buffer = await pango.renderToBuffer();

  // Upload to S3, Cloudinary, etc.
  await uploadToCloud(buffer);
}
```

### Example 9: Express.js Integration

```javascript
const express = require('express');
const PangoView = require('node-pango');

app.get('/render', async (req, res) => {
  try {
    const pango = new PangoView({
      text: req.query.text || 'Default Text',
      output: 'temp.png',
      width: 400,
      font: 'Sans 16'
    });

    const buffer = await pango.renderToBuffer();
    
    res.setHeader('Content-Type', 'image/png');
    res.send(buffer);
  } catch (error) {
    res.status(500).send('Rendering failed');
  }
});
```

### Example 10: Batch Processing

```javascript
async function batchRender(texts) {
  const results = await Promise.all(
    texts.map((text, index) => 
      new PangoView({
        text,
        output: `output-${index}.png`,
        width: 300,
        font: 'Sans 14'
      }).render()
    )
  );
  
  console.log(`Rendered ${results.length} images`);
}

await batchRender(['Text 1', 'Text 2', 'Text 3']);
```

---

## Advanced Usage

### HTML Tag Support

The package automatically converts HTML to Pango markup:

| HTML Tag | Effect | Example |
|----------|--------|---------|
| `<strong>`, `<b>` | Bold | `<strong>Bold</strong>` |
| `<em>`, `<i>` | Italic | `<em>Italic</em>` |
| `<u>` | Underline | `<u>Underlined</u>` |
| `<s>`, `<strike>` | Strikethrough | `<s>Strike</s>` |
| `<font color="...">` | Color | `<font color="red">Red</font>` |
| `<font size="...">` | Size | `<font size="5">Large</font>` |
| `<sup>` | Superscript | `E=mc<sup>2</sup>` |
| `<sub>` | Subscript | `H<sub>2</sub>O` |
| `<h1>` to `<h6>` | Headings | `<h1>Title</h1>` |

### CSS Inline Styles

Supports CSS inline styles on `<span>` elements:

```javascript
{
  text: `
    <span style="color: red;">Red text</span>
    <span style="font-weight: bold;">Bold</span>
    <span style="font-size: 24px;">Large</span>
  `
}
```

### Font Description Format

Font descriptions follow the pattern: `FAMILY [STYLE] SIZE`

Examples:
- `'Sans 12'` - Sans font, size 12
- `'Serif Bold 14'` - Serif font, bold, size 14
- `'Monospace Italic 10'` - Monospace font, italic, size 10
- `'Arial Bold Italic 16'` - Arial font, bold italic, size 16

### Color Formats

Colors can be specified as:
- Named colors: `'red'`, `'blue'`, `'green'`
- Hex colors: `'#FF0000'`, `'#00FF00'`, `'#0000FF'`
- RGB: `'rgb(255, 0, 0)'`
- RGBA: `'rgba(255, 0, 0, 0.5)'`

### Text Wrapping

- `'word'` - Wrap at word boundaries
- `'char'` - Wrap at character boundaries
- `'word-char'` - Wrap at word boundaries, fall back to character

### Ellipsization

- `'start'` - `…text`
- `'middle'` - `te…xt`
- `'end'` - `text…`

---

## Troubleshooting

### pango-view not found

**Error:** `pango-view not found`

**Solution:** Install Pango:
```bash
# macOS
brew install pango

# Ubuntu/Debian
sudo apt-get install pango1.0-tools

# Fedora
sudo dnf install pango-tools
```

### Font not being used

**Issue:** Custom font via `fontFile` doesn't render

**Solutions:**
1. Verify font file exists and is readable
2. Check font family name matches
3. For demo fonts, ensure they contain actual glyphs

**Debug:**
```javascript
const { FontManager } = require('node-pango');
const manager = new FontManager();
const config = await manager.createFontConfig('./fonts/MyFont.ttf');
console.log('Font family:', config.fontFamily);
```

### Empty/Blank Output

**Issue:** Output file is very small (< 1KB) or blank

**Causes:**
- Demo font with no glyphs
- Font doesn't support the characters being rendered
- Text is empty or whitespace only

**Solution:** Try with a different font or system font first

### Permission Errors

**Issue:** Cannot write to output directory

**Solution:** Ensure write permissions:
```bash
chmod 755 /path/to/output/directory
```

### Rendering Fails

**Issue:** Rendering fails with error

**Debug:**
```javascript
try {
  await pango.render();
} catch (error) {
  console.error('Error:', error.message);
  console.error('Command:', error.command);
  console.error('Exit code:', error.exitCode);
  console.error('Stderr:', error.stderr);
}
```

---

## Additional Resources

- [Main README](../README.md)
- [API Documentation](../docs/API.md)
- [HTML Conversion Guide](../docs/HTML_CONVERSION.md)
- [Font-by-Path Guide](../docs/FONT_BY_PATH.md)
- [Project Plan](../PROJECT_PLAN.md)

---

## License

MIT

---

## Support

For issues, questions, or contributions, please visit the GitHub repository.
