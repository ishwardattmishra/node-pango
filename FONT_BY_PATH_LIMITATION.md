# IMPORTANT: Font-by-Path Limitation on macOS

## Issue Discovered

The `FONTCONFIG_FILE` environment variable approach **does not work reliably** with `pango-view` on macOS (Homebrew version 1.57.0). While fontconfig correctly loads the font directory, `pango-view` does not respect the custom fontconfig at runtime.

## Root Cause

- Pango caches font information at library initialization
- The macOS/Homebrew version of pango-view may use CoreText instead of fontconfig for font discovery
- Environment variables set at process spawn time don't affect Pango's font cache

## Workarounds

### Option 1: Install Font System-Wide (Recommended)

```bash
# Copy your font to user fonts directory
cp /path/to/your/font.otf ~/Library/Fonts/

# Refresh font cache
fc-cache -f

# Verify it's installed
fc-list | grep "YourFontName"
```

Then use normally:
```javascript
const pango = new PangoView({
  text: 'Your text',
  font: 'YourFontName 24',  // No fontFile needed
  output: 'output.png'
});
```

###  Option 2: Use Font File Path (Linux Only)

The `fontFile` parameter works correctly on Linux systems where pango-view properly respects `FONTCONFIG_FILE`:

```javascript
const pango = new PangoView({
  text: 'Your text',
  fontFile: '/path/to/font.otf',  // Works on Linux
  font: 'FontName 24',
  output: 'output.png'
});
```

### Option 3: Programmatic Font Installation

Create a helper to temporarily install fonts:

```javascript
const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const { execa } = require('execa');

async function withTemporaryFont(fontPath, callback) {
  const fontName = path.basename(fontPath);
  const userFontsDir = path.join(os.homedir(), 'Library', 'Fonts');
  const targetPath = path.join(userFontsDir, fontName);
  
  try {
    // Install
    await fs.copyFile(fontPath, targetPath);
    await execa('fc-cache', ['-f']);
    
    // Use
    await callback();
  } finally {
    // Cleanup
    try {
      await fs.unlink(targetPath);
      await execa('fc-cache', ['-f']);
    } catch (error) {
      console.warn('Cleanup failed:', error.message);
    }
  }
}
```

## Platform Support

| Platform | fontFile Support | Notes |
|----------|------------------|-------|
| Linux | ✅ Yes | FONTCONFIG_FILE works correctly |
| macOS (Homebrew) | ❌ No | Install fonts to ~/Library/Fonts instead |
| macOS (System) | ❌ No | Install fonts to ~/Library/Fonts instead |
| Windows | ⚠️ Untested | May work with proper fontconfig setup |

## Recommendation

For **production use** and **cross-platform compatibility**, we recommend:

1. **Bundle fonts with your application**
2. **Install them to the user's font directory on first run**
3. **Don't rely on runtime fontconfig manipulation**

## Updated Example

```javascript
const PangoView = require('node-pango');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

async function ensureFontInstalled(fontPath) {
  const fontName = path.basename(fontPath);
  const userFontsDir = path.join(os.homedir(), 'Library', 'Fonts');
  const targetPath = path.join(userFontsDir, fontName);
  
  try {
    await fs.access(targetPath);
    console.log(`Font already installed: ${fontName}`);
  } catch (error) {
    console.log(`Installing font: ${fontName}`);
    await fs.copyFile(fontPath, targetPath);
    const { execa } = require('execa');
    await execa('fc-cache', ['-f']);
    console.log(`Font installed: ${fontName}`);
  }
}

async function render() {
  // Ensure font is installed first
  await ensureFontInstalled('./fonts/MyFont.otf');
  
  // Now render (font will be available system-wide)
  const pango = new PangoView({
    text: 'Hello, World!',
    font: 'MyFont 24',
    output: 'output.png'
  });
  
  await pango.render();
}

render();
```

## Future Work

We're investigating alternative approaches:

1. Using Pango's `PangoFontMap` API directly via Node.js native bindings
2. Pre-rendering with a custom Pango script
3. Docker/container-based rendering where fontconfig works reliably
4. Using alternative text rendering libraries (cairo, skia, etc.)

## Status

The `fontFile` parameter is **documented but non-functional on macOS**. It remains in the codebase for:
- Linux compatibility (where it works)
- Future fixes if pango-view behavior changes
- Documentation of the attempted approach

For now, **install fonts system-wide** for reliable cross-platform operation.
