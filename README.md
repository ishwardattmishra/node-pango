# node-pango

A high-fidelity Node.js wrapper for the `pango-view` CLI utility with advanced features including HTML support and font-by-path rendering.

## Features

- 🚀 **Async Process Management**: Uses `execa` for robust subprocess handling
- 🎨 **Font-by-Path Support**: Render fonts directly from `.ttf` or `.otf` files
- 🌐 **HTML-to-Pango Conversion**: Automatic translation of HTML tags to Pango markup
- 📐 **Full API Coverage**: Supports all `pango-view` flags and options
- 🖼️ **Multiple Output Formats**: PNG, SVG, and PDF rendering via Cairo backend
- 💪 **TypeScript Support**: Full type definitions included

## Installation

```bash
npm install node-pango
```

**Prerequisites**: You must have `pango-view` installed on your system.

### Installing pango-view

**macOS:**
```bash
brew install pango
```

**Ubuntu/Debian:**
```bash
sudo apt-get install libpango1.0-dev pango1.0-tools
```

**Fedora:**
```bash
sudo dnf install pango-devel pango-tools
```

## Quick Start

```javascript
const PangoView = require('node-pango');

const pango = new PangoView({
  text: 'Hello, <b>World</b>!',
  width: 300,
  output: 'output.png'
});

await pango.render();
```

## API Reference

### Constructor Options

```javascript
const pango = new PangoView({
  // Text content (required)
  text: 'Your text here',
  
  // Output file (required)
  output: 'output.png',
  
  // Font options
  font: 'Sans 12',
  fontFile: './path/to/font.ttf', // Font-by-path support
  
  // Dimensions
  width: 400,
  height: 300,
  
  // Layout options
  align: 'left',        // left, right, center
  justify: false,
  indent: 0,
  spacing: 0,
  lineSpacing: 1.0,
  
  // Format options
  markup: false,        // Set to true if text already contains Pango markup
  htmlMode: true,       // Parse HTML tags (default: true)
  
  // Advanced options
  wrap: 'word',         // word, char, word-char
  ellipsize: 'end',     // start, middle, end
  annotate: 0,          // Rectangle annotation level (0-2)
  
  // Cairo backend options
  backend: 'png',       // png, svg, pdf
  dpi: 96,
  
  // Environment
  pangoViewPath: 'pango-view' // Custom path to pango-view binary
});
```

### Methods

#### `render()`

Renders the text and writes output to the specified file.

```javascript
await pango.render();
```

Returns: `Promise<void>`

#### `renderToBuffer()`

Renders the text and returns the output as a Buffer.

```javascript
const buffer = await pango.renderToBuffer();
```

Returns: `Promise<Buffer>`

#### `getMarkup()`

Returns the Pango markup that will be rendered (useful for debugging).

```javascript
const markup = pango.getMarkup();
console.log(markup);
```

Returns: `string`

## HTML Support

The package automatically converts HTML tags to Pango markup:

```javascript
const pango = new PangoView({
  text: `
    <h1>Title</h1>
    <p>This is <strong>bold</strong> and <em>italic</em> text.</p>
    <p>You can also use <u>underline</u> and <font color="red">colors</font>.</p>
  `,
  output: 'output.png',
  htmlMode: true
});

await pango.render();
```

### Supported HTML Tags

| HTML Tag | Pango Markup | Description |
|----------|--------------|-------------|
| `<strong>`, `<b>` | `<span weight="bold">` | Bold text |
| `<em>`, `<i>` | `<span style="italic">` | Italic text |
| `<u>` | `<span underline="single">` | Underlined text |
| `<s>`, `<strike>` | `<span strikethrough="true">` | Strikethrough |
| `<font color="...">` | `<span foreground="...">` | Text color |
| `<font size="...">` | `<span size="...">` | Font size |
| `<font face="...">` | `<span font_family="...">` | Font family |
| `<sup>` | `<span rise="positive">` | Superscript |
| `<sub>` | `<span rise="negative">` | Subscript |
| `<small>` | `<span size="small">` | Small text |
| `<big>` | `<span size="large">` | Large text |

## Font-by-Path Support

Render text using a specific font file without installing it system-wide:

```javascript
const pango = new PangoView({
  text: 'Custom Font Rendering',
  fontFile: './fonts/MyCustomFont.ttf',
  font: 'MyCustomFont 24',
  output: 'output.png'
});

await pango.render();
```

This feature:
- Dynamically generates a temporary `fonts.conf` XML file
- Sets the `FONTCONFIG_FILE` environment variable
- Cleans up temporary files after rendering

## Advanced Examples

### SVG Output with Custom Layout

```javascript
const pango = new PangoView({
  text: 'Lorem ipsum dolor sit amet...',
  output: 'output.svg',
  backend: 'svg',
  width: 500,
  align: 'justify',
  wrap: 'word',
  font: 'Serif 14',
  lineSpacing: 1.5
});

await pango.render();
```

### PDF Output with Annotations

```javascript
const pango = new PangoView({
  text: 'Annotated Text',
  output: 'output.pdf',
  backend: 'pdf',
  annotate: 2, // Full annotation
  font: 'Mono 10'
});

await pango.render();
```

### Buffer Output for Streaming

```javascript
const pango = new PangoView({
  text: 'Buffer output',
  output: 'temp.png'
});

const buffer = await pango.renderToBuffer();
// Use buffer for streaming, uploading, etc.
```

## Error Handling

```javascript
try {
  await pango.render();
} catch (error) {
  if (error.code === 'ENOENT') {
    console.error('pango-view not found. Please install Pango.');
  } else {
    console.error('Rendering failed:', error.message);
  }
}
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
