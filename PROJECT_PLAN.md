# Node Pango - Project Plan

## Project Overview

**Package Name**: node-pango  
**Description**: High-fidelity Node.js wrapper for the `pango-view` CLI utility with HTML support and font-by-path rendering  
**Version**: 1.0.0

## Core Requirements

### 1. Process Management ✓
- **Implementation**: `src/PangoView.js`
- Uses `execa` v8.0.1 for async subprocess management
- Configurable timeout (default: 30 seconds)
- Environment variable support for fontconfig
- Robust error handling with detailed error messages

### 2. Font-by-Path Support ✓
- **Implementation**: `src/font-manager.js`
- Dynamic generation of temporary `fonts.conf` XML files
- Automatic font family name detection from filenames
- Sets `FONTCONFIG_FILE` environment variable during execution
- Automatic cleanup of temporary files
- Support for both `.ttf` and `.otf` formats

### 3. HTML Support ✓
- **Implementation**: `src/html-to-pango.js`
- Uses `htmlparser2` v9.1.0 for HTML parsing
- Comprehensive tag mapping (see HTML Tag Mapping section)
- CSS inline style parsing
- Proper entity escaping
- Support for nested tags

### 4. API Coverage ✓
- **Implementation**: `src/PangoView.js`
- Class-based API with comprehensive options
- All `pango-view` flags supported:
  - Layout: `--width`, `--height`, `--align`, `--justify`
  - Text: `--indent`, `--spacing`, `--line-spacing`
  - Wrapping: `--wrap`, `--ellipsize`
  - Annotation: `--annotate` (levels 0-2)
  - Rotation: `--rotate`
  - Typography: `--gravity`, `--gravity-hint`, `--hinting`
  - Language: `--language`
  - Colors: `--foreground`, `--background`
  - Spacing: `--margin`
  - Output: `--dpi`, `--backend`

### 5. Output Formats ✓
- PNG (default)
- SVG
- PDF
- PS (PostScript)
- All use Cairo backend
- Automatic format detection from file extension
- Manual override via `backend` option

## File Structure

```
NodePango/
├── package.json              # Package configuration and dependencies
├── README.md                 # Main documentation
├── .gitignore               # Git ignore rules
├── src/
│   ├── index.js             # Main entry point (exports)
│   ├── PangoView.js         # Core wrapper class
│   ├── html-to-pango.js     # HTML to Pango converter
│   └── font-manager.js      # Font-by-path manager
├── types/
│   └── index.d.ts           # TypeScript definitions
├── examples/
│   ├── README.md            # Examples documentation
│   ├── basic-usage.js       # Basic functionality examples
│   ├── custom-font.js       # Font-by-path examples
│   ├── advanced-layout.js   # Layout options examples
│   └── html-conversion.js   # HTML conversion examples
├── test/
│   └── test.js              # Test suite
└── docs/
    ├── API.md               # Complete API reference
    ├── HTML_CONVERSION.md   # HTML conversion guide
    └── FONT_BY_PATH.md      # Font-by-path feature guide
```

## HTML-to-Pango Conversion Mapping

### Text Formatting
| HTML Tag | Pango Markup | Description |
|----------|--------------|-------------|
| `<strong>`, `<b>` | `<span weight="bold">` | Bold text |
| `<em>`, `<i>` | `<span style="italic">` | Italic text |
| `<u>` | `<span underline="single">` | Underlined text |
| `<s>`, `<strike>` | `<span strikethrough="true">` | Strikethrough |
| `<tt>`, `<code>` | `<span font_family="monospace">` | Monospace font |

### Text Size
| HTML Tag | Pango Markup | Description |
|----------|--------------|-------------|
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
| `size="1-7"` | `size="xx-small" to "xx-large"` | `<font size="5">` |
| `face="..."` | `font_family="..."` | `<font face="Arial">` |

### Superscript/Subscript
| HTML Tag | Pango Markup | Description |
|----------|--------------|-------------|
| `<sup>` | `<span rise="5000">` | Superscript |
| `<sub>` | `<span rise="-5000">` | Subscript |

### CSS Inline Styles (on `<span>`)
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
| `<p>`, `<div>` | Content + newline |
| `<br>` | Line break |

## Architecture

### Component Overview

```
┌─────────────────────────────────────────────────────────┐
│                      PangoView                          │
│  (Main API - Orchestrates all components)              │
└───────────────┬─────────────────────────────────────────┘
                │
        ┌───────┴───────┐
        │               │
        ▼               ▼
┌──────────────┐  ┌──────────────────┐
│ FontManager  │  │ HtmlToPangoConverter│
│              │  │                  │
│ - fontconfig │  │ - HTML parsing  │
│ - temp files │  │ - Tag mapping   │
│ - cleanup    │  │ - CSS parsing   │
└──────────────┘  └──────────────────┘
        │
        ▼
┌──────────────────────┐
│       execa          │
│  (pango-view exec)   │
└──────────────────────┘
        │
        ▼
┌──────────────────────┐
│     pango-view       │
│   (Cairo backend)    │
└──────────────────────┘
```

### Data Flow

1. **User Input** → Options passed to `PangoView` constructor
2. **HTML Conversion** → `HtmlToPangoConverter.convert()` if `htmlMode: true`
3. **Font Setup** → `FontManager.createFontConfig()` if `fontFile` specified
4. **Argument Building** → `_buildArgs()` constructs pango-view arguments
5. **Process Execution** → `execa` runs pango-view with environment variables
6. **Output** → File written to disk or returned as Buffer
7. **Cleanup** → Temporary fontconfig files removed

## API Design

### Main Class: PangoView

```javascript
class PangoView {
  constructor(options)
  getMarkup()                    // Returns Pango markup
  render()                       // Renders to file
  renderToBuffer()               // Renders to Buffer
  renderToStream()               // Renders to ReadStream
  
  static checkInstallation()     // Verify pango-view
  static getSupportedFormats()   // ['png', 'svg', 'pdf', 'ps']
  static getSupportedAlignments() // ['left', 'center', 'right']
  static getSupportedWrapModes() // ['word', 'char', 'word-char']
  static getSupportedEllipsizeModes() // ['start', 'middle', 'end']
}
```

### Helper Class: HtmlToPangoConverter

```javascript
class HtmlToPangoConverter {
  constructor()
  convert(html)                  // HTML string → Pango markup
}
```

### Helper Class: FontManager

```javascript
class FontManager {
  constructor()
  createFontConfig(fontPath, fontFamily)  // Creates temp fontconfig
  cleanup()                               // Removes temp files
  withFontConfig(fontPath, fontFamily, callback) // Auto-cleanup
}
```

## Dependencies

### Production
- `execa@^8.0.1` - Process execution
- `htmlparser2@^9.1.0` - HTML parsing
- `domhandler@^5.0.3` - DOM tree handling

### System Requirements
- `pango-view` CLI utility (from Pango library)
- Node.js >= 14.0.0

## Installation Instructions

### Package Installation
```bash
npm install node-pango
```

### System Prerequisites

**macOS:**
```bash
brew install pango
```

**Ubuntu/Debian:**
```bash
sudo apt-get install pango1.0-tools libpango1.0-dev
```

**Fedora:**
```bash
sudo dnf install pango-tools pango-devel
```

## Testing Strategy

### Test Suite: `test/test.js`

**Unit Tests:**
- HTML converter tag mapping
- Font family detection
- XML escaping
- Markup generation
- Backend detection

**Integration Tests:**
- Simple text rendering
- HTML conversion
- Font-by-path rendering
- Buffer output
- SVG/PDF output
- Text alignment
- Justified text

**Test Execution:**
```bash
npm test
```

## Examples

### 1. Basic Usage (`examples/basic-usage.js`)
- Simple text rendering
- HTML formatting
- SVG output
- PDF with annotations
- Buffer output

### 2. Custom Fonts (`examples/custom-font.js`)
- Font-by-path rendering
- Custom font with HTML
- Custom font with SVG

### 3. Advanced Layout (`examples/advanced-layout.js`)
- Text alignment variations
- Wrap modes
- Ellipsize modes
- Line spacing
- Justified text with indentation
- Colored backgrounds

### 4. HTML Conversion (`examples/html-conversion.js`)
- Basic HTML tags
- Font elements
- Size variations
- Superscript/subscript
- Nested tags
- Headings
- CSS inline styles
- Complex documents

## Documentation

### 1. README.md
- Overview and quick start
- Installation instructions
- API reference summary
- Examples
- License

### 2. docs/API.md
- Complete API documentation
- All classes and methods
- Type definitions
- Error handling
- Configuration reference

### 3. docs/HTML_CONVERSION.md
- HTML tag mapping details
- CSS property support
- Conversion examples
- Best practices
- Limitations

### 4. docs/FONT_BY_PATH.md
- Font-by-path feature guide
- FontManager usage
- Font family detection
- Troubleshooting
- Platform notes

## Error Handling

### Error Types

1. **pango-view not found**
   - Detection via `ENOENT` error code
   - Clear message directing to installation

2. **Font file not found**
   - File path validation
   - Helpful error message

3. **Rendering failed**
   - Includes stderr output
   - Command and exit code details

4. **Invalid options**
   - Validation of enum values (align, wrap, etc.)
   - Ignored silently if invalid

## Performance Considerations

1. **Process Spawning**: Minimal overhead using execa
2. **HTML Parsing**: Fast DOM-based parsing with htmlparser2
3. **Font Caching**: Fontconfig caches font information
4. **Temp File Cleanup**: Automatic cleanup prevents accumulation
5. **Timeout**: 30-second default prevents hanging processes

## Security Considerations

1. **Path Traversal**: Font paths resolved to absolute paths
2. **XML Injection**: Font paths and names XML-escaped
3. **Command Injection**: Arguments passed as array (not string)
4. **Environment Isolation**: FONTCONFIG_FILE only affects subprocess
5. **Temp Files**: Unique temporary directory names

## Future Enhancements

Potential features for future versions:

1. **Multiple Custom Fonts**: Support for multiple fontFile entries
2. **Streaming Input**: Accept text from streams
3. **Image Embedding**: Support for inline images
4. **Link Support**: Clickable links in PDF/SVG output
5. **Batch Rendering**: Render multiple texts efficiently
6. **Font Subsetting**: Include only used glyphs
7. **CSS File Support**: Load styles from CSS files
8. **Template System**: Reusable text templates
9. **Font Validation**: Verify font files before use
10. **Progress Callbacks**: Monitor long-running renders

## Platform Compatibility

### Tested Platforms
- macOS (Homebrew Pango)
- Ubuntu/Debian (apt Pango)
- Fedora (dnf Pango)

### Windows Support
- Requires MSYS2 or GTK runtime
- Not extensively tested

## License

MIT License

## Version History

### v1.0.0 (Initial Release)
- ✓ Process management with execa
- ✓ Font-by-path support
- ✓ HTML to Pango conversion
- ✓ Complete pango-view API coverage
- ✓ PNG, SVG, PDF output formats
- ✓ TypeScript definitions
- ✓ Comprehensive documentation
- ✓ Example scripts
- ✓ Test suite

## Success Criteria

All core requirements met:

✅ **Process Management**: execa integration complete  
✅ **Font-by-Path**: Dynamic fontconfig generation working  
✅ **HTML Support**: Comprehensive tag and CSS conversion  
✅ **API Coverage**: All pango-view flags supported  
✅ **Output Formats**: PNG, SVG, PDF fully functional  

## Conclusion

This project provides a robust, well-documented Node.js wrapper for `pango-view` with advanced features including HTML parsing and custom font support. The architecture is modular, testable, and extensible for future enhancements.
