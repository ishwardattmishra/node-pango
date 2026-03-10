# Getting Started with node-pango

This guide will help you get started with node-pango quickly.

## Prerequisites

Before using node-pango, you need to have `pango-view` installed on your system.

### Installing pango-view

**macOS (using Homebrew):**
```bash
brew install pango
```

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install pango1.0-tools libpango1.0-dev
```

**Fedora:**
```bash
sudo dnf install pango-tools pango-devel
```

### Verify Installation

After installing, verify that pango-view is available:

```bash
pango-view --version
```

You should see output like: `pango-view (pango) 1.xx.x`

## Installation

Install the package via npm:

```bash
npm install node-pango
```

## Quick Start

### 1. Simple Text Rendering

```javascript
const PangoView = require('node-pango');

async function renderText() {
  const pango = new PangoView({
    text: 'Hello, World!',
    output: 'hello.png',
    width: 300,
    font: 'Sans 16'
  });

  await pango.render();
  console.log('Rendered to hello.png');
}

renderText();
```

### 2. HTML Formatting

```javascript
const PangoView = require('node-pango');

async function renderHTML() {
  const pango = new PangoView({
    text: `
      <h1>Welcome</h1>
      <p>This is <strong>bold</strong> and <em>italic</em> text.</p>
      <p><font color="red">Red text</font></p>
    `,
    output: 'formatted.png',
    width: 400,
    font: 'Sans 14'
  });

  await pango.render();
  console.log('Rendered HTML to formatted.png');
}

renderHTML();
```

### 3. Custom Font from File

```javascript
const PangoView = require('node-pango');

async function renderWithCustomFont() {
  const pango = new PangoView({
    text: 'Custom Font Example',
    fontFile: './fonts/MyFont.ttf',
    font: 'MyFont 24',
    output: 'custom-font.png',
    width: 500
  });

  await pango.render();
  console.log('Rendered with custom font');
}

renderWithCustomFont();
```

### 4. SVG Output

```javascript
const PangoView = require('node-pango');

async function renderSVG() {
  const pango = new PangoView({
    text: 'SVG Output',
    output: 'output.svg',
    backend: 'svg',
    width: 300,
    font: 'Sans 20',
    align: 'center'
  });

  await pango.render();
  console.log('Rendered to SVG');
}

renderSVG();
```

### 5. Render to Buffer

```javascript
const PangoView = require('node-pango');

async function renderToBuffer() {
  const pango = new PangoView({
    text: 'Buffer Output',
    output: 'temp.png',
    width: 300,
    font: 'Sans 14'
  });

  const buffer = await pango.renderToBuffer();
  console.log(`Rendered to buffer (${buffer.length} bytes)`);
  
  // Use buffer for streaming, uploading, etc.
}

renderToBuffer();
```

## Common Use Cases

### Text Layout

```javascript
const pango = new PangoView({
  text: 'Lorem ipsum dolor sit amet...',
  output: 'layout.png',
  width: 400,
  align: 'justify',
  wrap: 'word',
  lineSpacing: 1.5,
  font: 'Serif 12'
});

await pango.render();
```

### Mathematical Expressions

```javascript
const pango = new PangoView({
  text: 'E = mc<sup>2</sup>, H<sub>2</sub>O',
  output: 'math.png',
  width: 300,
  font: 'Sans 16'
});

await pango.render();
```

### Colored Text

```javascript
const pango = new PangoView({
  text: `
    <p><font color="red">Error message</font></p>
    <p><font color="green">Success message</font></p>
    <p><font color="blue">Info message</font></p>
  `,
  output: 'colors.png',
  width: 400,
  font: 'Sans 14'
});

await pango.render();
```

### Custom Background

```javascript
const pango = new PangoView({
  text: 'Dark Theme',
  output: 'dark.png',
  width: 300,
  background: '#1a1a1a',
  foreground: '#ffffff',
  margin: 20,
  font: 'Sans 16'
});

await pango.render();
```

## Error Handling

Always wrap render operations in try-catch blocks:

```javascript
const PangoView = require('node-pango');

async function safeRender() {
  try {
    const pango = new PangoView({
      text: 'Hello, World!',
      output: 'output.png',
      width: 300,
      font: 'Sans 14'
    });

    await pango.render();
    console.log('Success!');
  } catch (error) {
    if (error.message.includes('pango-view not found')) {
      console.error('Please install Pango:');
      console.error('  macOS: brew install pango');
      console.error('  Ubuntu: sudo apt-get install pango1.0-tools');
    } else {
      console.error('Rendering error:', error.message);
    }
  }
}

safeRender();
```

## Checking Installation

Before rendering, you can check if pango-view is available:

```javascript
const PangoView = require('node-pango');

async function checkPango() {
  const check = await PangoView.checkInstallation();
  
  if (check.installed) {
    console.log('✓ pango-view is installed');
    console.log('  Version:', check.version);
  } else {
    console.error('✗ pango-view not found');
    console.error('  Error:', check.error);
  }
}

checkPango();
```

## TypeScript Usage

The package includes TypeScript definitions:

```typescript
import PangoView, { PangoViewOptions, RenderResult } from 'node-pango';

const options: PangoViewOptions = {
  text: 'Hello, TypeScript!',
  output: 'output.png',
  width: 300,
  font: 'Sans 16'
};

const pango = new PangoView(options);
const result: RenderResult = await pango.render();
```

## Next Steps

- Read the [API Documentation](docs/API.md) for complete API reference
- Explore [HTML Conversion Guide](docs/HTML_CONVERSION.md) for HTML tag support
- Check [Font-by-Path Guide](docs/FONT_BY_PATH.md) for custom font usage
- Run example scripts in `examples/` directory

## Running Examples

```bash
# Basic usage
node examples/basic-usage.js

# Custom fonts (provide font path)
node examples/custom-font.js /path/to/font.ttf

# Advanced layout
node examples/advanced-layout.js

# HTML conversion
node examples/html-conversion.js
```

## Testing

Run the test suite:

```bash
npm test
```

## Troubleshooting

### "pango-view not found"

Install Pango for your platform (see Prerequisites above).

### "Font file not found"

Check that the font file path is correct and the file is readable.

### Rendering produces unexpected output

Use `getMarkup()` to debug the generated Pango markup:

```javascript
const pango = new PangoView({
  text: '<strong>Test</strong>',
  output: 'test.png'
});

console.log('Generated markup:', pango.getMarkup());
```

### Font not being used

Verify the font family name matches:

```javascript
const { FontManager } = require('node-pango');
const manager = new FontManager();
const config = await manager.createFontConfig('./fonts/MyFont.ttf');
console.log('Detected family:', config.fontFamily);
```

## Getting Help

- Check the [documentation](docs/)
- Review [examples](examples/)
- Report issues on GitHub
- Read the [Project Plan](PROJECT_PLAN.md)

## License

MIT
