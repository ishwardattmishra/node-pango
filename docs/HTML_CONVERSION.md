# HTML to Pango Conversion Guide

This document explains how HTML tags are converted to Pango markup in node-pango.

## Overview

The `HtmlToPangoConverter` class parses HTML and translates it to Pango's markup format. This allows you to use familiar HTML tags for text formatting, which are then converted to the appropriate Pango attributes.

## Basic Tag Conversion

### Text Style Tags

**Bold Text:**

```html
<strong>Bold text</strong>
<b>Also bold</b>
```

Converts to:

```xml
<span weight="bold">Bold text</span>
<span weight="bold">Also bold</span>
```

**Italic Text:**

```html
<em>Italic text</em>
<i>Also italic</i>
```

Converts to:

```xml
<span style="italic">Italic text</span>
<span style="italic">Also italic</span>
```

**Underlined Text:**

```html
<u>Underlined text</u>
```

Converts to:

```xml
<span underline="single">Underlined text</span>
```

**Strikethrough Text:**

```html
<s>Strikethrough text</s>
<strike>Also strikethrough</strike>
```

Converts to:

```xml
<span strikethrough="true">Strikethrough text</span>
```

**Monospace Text:**

```html
<tt>Monospace text</tt>
<code>Also monospace</code>
```

Converts to:

```xml
<span font_family="monospace">Monospace text</span>
```

## Font Element

The `<font>` tag supports multiple attributes:

### Color

```html
<font color="red">Red text</font>
<font color="#FF0000">Also red</font>
```

Converts to:

```xml
<span foreground="red">Red text</span>
<span foreground="#FF0000">Also red</span>
```

### Size

HTML font sizes (1-7):

```html
<font size="1">Smallest</font>
<font size="4">Medium</font>
<font size="7">Largest</font>
```

Converts to:

```xml
<span size="xx-small">Smallest</span>
<span size="medium">Medium</span>
<span size="xx-large">Largest</span>
```

You can also use Pango size names directly:

```html
<font size="x-large">Large text</font>
```

### Font Face

```html
<font face="Arial">Arial text</font>
<font face="Courier">Monospace</font>
```

Converts to:

```xml
<span font_family="Arial">Arial text</span>
<span font_family="Courier">Monospace</span>
```

### Combined Attributes

```html
<font color="blue" size="5" face="Georgia">Styled text</font>
```

Converts to:

```xml
<span foreground="blue" size="large" font_family="Georgia">Styled text</span>
```

## Size Variations

### Small and Big Tags

```html
<small>Small text</small>
Normal text
<big>Big text</big>
```

Converts to:

```xml
<span size="small">Small text</span>
Normal text
<span size="large">Big text</span>
```

## Superscript and Subscript

```html
E = mc<sup>2</sup>
H<sub>2</sub>O
```

Converts to:

```xml
E = mc<span rise="5000">2</span>
H<span rise="-5000">2</span>O
```

## Headings

Headings are converted to bold text with appropriate sizes:

```html
<h1>Heading 1</h1>
<h2>Heading 2</h2>
<h3>Heading 3</h3>
<h4>Heading 4</h4>
<h5>Heading 5</h5>
<h6>Heading 6</h6>
```

Converts to:

```xml
<span size="xx-large" weight="bold">Heading 1</span>
<span size="x-large" weight="bold">Heading 2</span>
<span size="large" weight="bold">Heading 3</span>
<span size="medium" weight="bold">Heading 4</span>
<span size="small" weight="bold">Heading 5</span>
<span size="x-small" weight="bold">Heading 6</span>
```

## Block Elements

### Paragraphs and Divs

```html
<p>Paragraph 1</p>
<p>Paragraph 2</p>
```

Block elements add newlines after their content.

### Line Breaks

```html
Line 1<br>Line 2
```

Converts to:

```
Line 1
Line 2
```

## CSS Inline Styles

The `<span>` tag supports inline CSS styles:

### Color

```html
<span style="color: red;">Red text</span>
<span style="background-color: yellow;">Highlighted</span>
```

Converts to:

```xml
<span foreground="red">Red text</span>
<span background="yellow">Highlighted</span>
```

### Font Weight

```html
<span style="font-weight: bold;">Bold</span>
<span style="font-weight: 700;">Also bold</span>
```

Converts to:

```xml
<span weight="bold">Bold</span>
<span weight="bold">Also bold</span>
```

### Font Style

```html
<span style="font-style: italic;">Italic</span>
```

Converts to:

```xml
<span style="italic">Italic</span>
```

### Text Decoration

```html
<span style="text-decoration: underline;">Underlined</span>
<span style="text-decoration: line-through;">Strikethrough</span>
```

Converts to:

```xml
<span underline="single">Underlined</span>
<span strikethrough="true">Strikethrough</span>
```

### Font Family

```html
<span style="font-family: Arial;">Arial text</span>
```

Converts to:

```xml
<span font_family="Arial">Arial text</span>
```

### Font Size

CSS font sizes are converted to Pango's internal units:

```html
<span style="font-size: 16px;">16px text</span>
<span style="font-size: 12pt;">12pt text</span>
<span style="font-size: 1.5em;">1.5em text</span>
```

## Nested Tags

Tags can be nested:

```html
<strong><em>Bold and italic</em></strong>
<font color="red"><strong><u>Red, bold, underlined</u></strong></font>
```

Converts to:

```xml
<span weight="bold"><span style="italic">Bold and italic</span></span>
<span foreground="red"><span weight="bold"><span underline="single">Red, bold, underlined</span></span></span>
```

## Special Characters

HTML entities are properly handled:

```html
&lt;tag&gt; &amp; "quotes"
```

Converts to:

```xml
&lt;tag&gt; &amp; "quotes"
```

## Native Pango Attributes on Span

You can use Pango attributes directly on `<span>` tags:

```html
<span foreground="blue" size="20000" weight="bold">Custom styling</span>
```

This is passed through as-is to Pango.

## Complete Example

**HTML Input:**

```html
<h1>Document Title</h1>

<p>This is a paragraph with <strong>bold</strong> and <em>italic</em> text.</p>

<p>You can use <font color="red">colors</font> and <font size="5">different sizes</font>.</p>

<p>Mathematical expressions: E=mc<sup>2</sup>, H<sub>2</sub>O</p>

<p><span style="background-color: yellow; color: black;">Highlighted text</span></p>
```

**Pango Markup Output:**

```xml
<span size="xx-large" weight="bold">Document Title</span>

This is a paragraph with <span weight="bold">bold</span> and <span style="italic">italic</span> text.

You can use <span foreground="red">colors</span> and <span size="large">different sizes</span>.

Mathematical expressions: E=mc<span rise="5000">2</span>, H<span rise="-5000">2</span>O

<span background="yellow" foreground="black">Highlighted text</span>
```

## Limitations

1. **Block Layout**: HTML's box model and layout are not preserved. All text flows as inline content with optional line breaks.

2. **CSS Subset**: Only basic inline CSS properties are supported (color, font properties, text decoration).

3. **No Classes or IDs**: CSS classes and IDs are ignored.

4. **Limited Block Elements**: Only `<p>`, `<div>`, `<br>`, and headings have special handling.

5. **No Images or Links**: `<img>` and `<a>` tags are not supported.

## Best Practices

1. **Use Semantic Tags**: Prefer `<strong>` and `<em>` over `<b>` and `<i>`.

2. **Consistent Font Sizing**: Use consistent size units throughout your document.

3. **Test Complex Markup**: Test complex nested markup to ensure it renders as expected.

4. **Escape Content**: If your content contains `<` or `>` characters that aren't tags, escape them as `&lt;` and `&gt;`.

5. **Use CSS for Complex Styling**: For complex styling needs, use CSS inline styles on `<span>` elements.

## Debugging

To see the converted markup:

```javascript
const pango = new PangoView({
  text: '<strong>Your HTML</strong>',
  output: 'test.png'
});

console.log(pango.getMarkup());
```

This will show you exactly what Pango markup is being generated.
