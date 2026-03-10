# Font-by-Path Feature

This document explains how to use custom fonts directly from file paths without system installation.

## Overview

The font-by-path feature allows you to render text using a specific `.ttf` or `.otf` font file without installing it system-wide. This is achieved by:

1. Dynamically generating a temporary `fonts.conf` XML file
2. Setting the `FONTCONFIG_FILE` environment variable during execution
3. Automatically cleaning up temporary files after rendering

## Basic Usage

```javascript
const PangoView = require('node-pango');

const pango = new PangoView({
  text: 'Custom Font Rendering',
  fontFile: './fonts/MyCustomFont.ttf',
  font: 'MyCustomFont 24',
  output: 'output.png'
});

await pango.render();
```

## Parameters

### `fontFile`

Path to the custom font file (.ttf or .otf).

- Can be absolute or relative
- Must be readable by the process
- Supports both TrueType (.ttf) and OpenType (.otf) formats

### `font`

Font description string that matches the font family name.

Format: `FAMILY SIZE [STYLE]`

Examples:
- `'MyCustomFont 24'`
- `'CustomFont Bold 16'`
- `'CustomFont Italic 14'`

**Important**: The family name in the `font` parameter should match the font family name extracted from the font file.

## Font Family Detection

The package automatically detects the font family name from the filename:

| Filename | Detected Family |
|----------|-----------------|
| `Roboto-Regular.ttf` | `Roboto` |
| `OpenSans-Bold.otf` | `OpenSans` |
| `MyFont.ttf` | `MyFont` |
| `CustomFont-Italic.ttf` | `CustomFont` |

The detection removes common style suffixes like:
- Regular
- Bold
- Italic
- Light
- Medium
- Heavy
- Black
- Thin
- Book
- Demi/Semi
- Extra/Ultra
- Oblique

## Advanced Usage

### Manual Font Family Specification

If automatic detection doesn't work correctly, you can manually specify the font family:

```javascript
const { FontManager } = require('node-pango');

const manager = new FontManager();
const config = await manager.createFontConfig(
  './fonts/MyFont.ttf',
  'MyCustomFontFamily'  // Manual family name
);

// Use config.configPath with FONTCONFIG_FILE
```

### Using FontManager Directly

For more control, use the `FontManager` class:

```javascript
const { FontManager } = require('node-pango');

const manager = new FontManager();

try {
  const config = await manager.createFontConfig('./fonts/MyFont.ttf');
  
  console.log('Font family:', config.fontFamily);
  console.log('Config path:', config.configPath);
  
  // Use the font with pango-view by setting FONTCONFIG_FILE
  // environment variable to config.configPath
  
} finally {
  await manager.cleanup();
}
```

### Using withFontConfig Helper

The `withFontConfig` method handles cleanup automatically:

```javascript
const { FontManager } = require('node-pango');

const manager = new FontManager();

await manager.withFontConfig(
  './fonts/MyFont.ttf',
  'MyFont',
  async (config) => {
    // Your code here - config is available
    // Cleanup happens automatically when this returns
    return await someOperation(config);
  }
);
```

## How It Works

### 1. Fontconfig XML Generation

When you specify a `fontFile`, the package generates a temporary `fonts.conf` file:

```xml
<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "fonts.dtd">
<fontconfig>
  <!-- Font directory -->
  <dir>/path/to/font/directory</dir>
  
  <!-- Accept the font -->
  <selectfont>
    <acceptfont>
      <pattern>
        <patelt name="family">
          <string>MyFont</string>
        </patelt>
      </pattern>
    </acceptfont>
  </selectfont>
  
  <!-- Match the font file to the family name -->
  <match target="pattern">
    <test qual="any" name="family">
      <string>MyFont</string>
    </test>
    <edit name="file" mode="assign" binding="strong">
      <string>/path/to/font/MyFont.ttf</string>
    </edit>
  </match>
  
  <!-- Cache configuration -->
  <cachedir>/tmp/fontconfig-cache</cachedir>
  
  <!-- Hinting and antialiasing -->
  <match target="font">
    <edit name="antialias" mode="assign">
      <bool>true</bool>
    </edit>
    <edit name="hinting" mode="assign">
      <bool>true</bool>
    </edit>
    <edit name="hintstyle" mode="assign">
      <const>hintslight</const>
    </edit>
    <edit name="rgba" mode="assign">
      <const>rgb</const>
    </edit>
  </match>
</fontconfig>
```

### 2. Environment Variable

The `FONTCONFIG_FILE` environment variable is set when executing `pango-view`:

```javascript
// Internally
await execa('pango-view', args, {
  env: {
    ...process.env,
    FONTCONFIG_FILE: '/tmp/node-pango-xyz/fonts.conf'
  }
});
```

### 3. Automatic Cleanup

After rendering, temporary files are automatically cleaned up:

```javascript
// Cleanup removes:
// - The generated fonts.conf file
// - The temporary directory
```

## Multiple Font Files

To use multiple custom fonts in the same rendering, you can:

1. Use a single directory with multiple font files
2. Manually create a fonts.conf that references all fonts
3. Use system fonts in combination with one custom font

**Example with directory:**

```javascript
// Put all your fonts in one directory
// fonts/
//   ├── Font1.ttf
//   ├── Font2.ttf
//   └── Font3.ttf

// Then reference the directory in a custom fonts.conf
// (advanced usage, requires manual FontManager configuration)
```

## Output Formats

Font-by-path works with all output formats:

```javascript
// PNG
const pango1 = new PangoView({
  text: 'Custom Font',
  fontFile: './fonts/MyFont.ttf',
  font: 'MyFont 24',
  output: 'output.png'
});

// SVG
const pango2 = new PangoView({
  text: 'Custom Font',
  fontFile: './fonts/MyFont.ttf',
  font: 'MyFont 24',
  output: 'output.svg',
  backend: 'svg'
});

// PDF
const pango3 = new PangoView({
  text: 'Custom Font',
  fontFile: './fonts/MyFont.ttf',
  font: 'MyFont 24',
  output: 'output.pdf',
  backend: 'pdf'
});
```

## Combining with HTML

Font-by-path works seamlessly with HTML mode:

```javascript
const pango = new PangoView({
  text: `
    <h1>Custom Font Title</h1>
    <p>This is <strong>bold</strong> and <em>italic</em> text.</p>
    <p><font color="red">Colored text</font></p>
  `,
  fontFile: './fonts/MyFont.ttf',
  font: 'MyFont 16',
  output: 'output.png',
  htmlMode: true
});

await pango.render();
```

## Troubleshooting

### Font Not Found

If the font is not being used:

1. Check the font file path is correct
2. Verify the file is readable
3. Check the font family name matches

```javascript
// Debug: Print detected family name
const { FontManager } = require('node-pango');
const manager = new FontManager();
const config = await manager.createFontConfig('./fonts/MyFont.ttf');
console.log('Detected family:', config.fontFamily);
```

### Wrong Font Used

If a different font is being used:

1. Ensure the `font` parameter matches the detected family name
2. Try specifying the family name manually
3. Check for conflicting system fonts with the same name

### Font Style Issues

If bold/italic isn't working:

1. Check if you have separate font files for styles (e.g., `Font-Bold.ttf`)
2. Use the appropriate style file and family name
3. Consider using Pango's synthetic bold/italic if no separate style files exist

```javascript
// For separate style files, you may need multiple renders
// or manually configure fontconfig for font families with styles
```

### Permission Errors

If you get permission errors:

1. Check read permissions on the font file
2. Verify write permissions on the temp directory
3. Ensure /tmp is writable (or configure a different temp location)

## Performance Considerations

1. **Caching**: Fontconfig caches font information. Subsequent renders with the same font are faster.

2. **Cleanup**: Temporary files are small and cleaned up automatically, so there's minimal overhead.

3. **Multiple Renders**: If rendering multiple times with the same font, the fontconfig file can be reused.

## Best Practices

1. **Font Files Organization**: Keep custom fonts in a dedicated directory.

2. **Family Name Consistency**: Use consistent family names across your application.

3. **Error Handling**: Always wrap font operations in try-catch blocks.

```javascript
try {
  await pango.render();
} catch (error) {
  if (error.message.includes('Font file not found')) {
    console.error('Check font path:', error.message);
  } else {
    throw error;
  }
}
```

4. **Resource Cleanup**: If using FontManager directly, always call `cleanup()` or use `withFontConfig()`.

5. **Testing**: Test font rendering with your specific fonts to ensure they work correctly.

## Example: Web Font Rendering

```javascript
const PangoView = require('node-pango');
const path = require('path');

async function renderWithWebFont(text, fontPath, outputPath) {
  const fontName = path.basename(fontPath, path.extname(fontPath));
  
  const pango = new PangoView({
    text: text,
    fontFile: fontPath,
    font: `${fontName} 24`,
    output: outputPath,
    width: 800,
    background: '#ffffff',
    foreground: '#000000'
  });
  
  try {
    await pango.render();
    console.log(`✓ Rendered to ${outputPath}`);
  } catch (error) {
    console.error(`✗ Failed to render: ${error.message}`);
  }
}

// Usage
renderWithWebFont(
  'Hello, World!',
  './fonts/Roboto-Regular.ttf',
  'output.png'
);
```

## Platform Notes

### macOS

Works out of the box with Homebrew-installed Pango:

```bash
brew install pango
```

### Linux

Works with system Pango installation:

```bash
# Ubuntu/Debian
sudo apt-get install pango1.0-tools libpango1.0-dev

# Fedora
sudo dnf install pango-tools pango-devel
```

### Windows

Requires Pango to be installed (e.g., via MSYS2 or GTK runtime).

## Security Considerations

1. **Path Traversal**: Font file paths are resolved to absolute paths to prevent directory traversal attacks.

2. **XML Injection**: Font paths and family names are XML-escaped to prevent injection.

3. **Temporary Files**: Temporary files are created with unique names to prevent conflicts.

4. **Environment Isolation**: The `FONTCONFIG_FILE` environment variable only affects the pango-view subprocess.

## Limitations

1. **Single Font File**: Only one custom font file can be specified per render. For multiple custom fonts, manual fontconfig setup is required.

2. **Font Styles**: Separate font files are needed for different styles (bold, italic, etc.).

3. **Fallback**: If the custom font doesn't support certain characters, fontconfig's fallback mechanism applies.

4. **Platform Dependent**: Relies on fontconfig, which may behave differently across platforms.
