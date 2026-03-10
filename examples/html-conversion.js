import { promises as fs } from 'node:fs';
import PangoView from '../src/index.js';

async function htmlConversionExample() {
  console.log('=== HTML Conversion Example ===\n');

  const installCheck = await PangoView.checkInstallation();
  if (!installCheck.installed) {
    console.error('pango-view is not installed. Please install Pango first.');
    return;
  }

  console.log('1. Basic HTML tags');
  const pango1 = new PangoView({
    text: `
      <p>This is <strong>bold</strong> and <b>also bold</b>.</p>
      <p>This is <em>italic</em> and <i>also italic</i>.</p>
      <p>This is <u>underlined</u>.</p>
      <p>This is <s>strikethrough</s> and <strike>also strikethrough</strike>.</p>
    `,
    output: 'examples/output/html-basic.png',
    width: 500,
    font: 'Sans 14'
  });

  try {
    await pango1.render();
    console.log('✓ Rendered basic HTML tags');
    console.log('  Generated markup:', pango1.getMarkup().substring(0, 100) + '...');
  } catch (error) {
    console.error('✗ Error:', error.message);
  }

  console.log('\n2. Font element with attributes');
  const pango2 = new PangoView({
    text: `
      <p>Default color text</p>
      <p><font color="red">Red text</font></p>
      <p><font color="#0000ff">Blue text</font></p>
      <p><font color="green" size="5">Large green text</font></p>
      <p><font face="monospace">Monospace font</font></p>
    `,
    output: 'examples/output/html-font.png',
    width: 500,
    font: 'Sans 14'
  });

  try {
    await pango2.render();
    console.log('✓ Rendered font elements');
  } catch (error) {
    console.error('✗ Error:', error.message);
  }

  console.log('\n3. Text size variations');
  const pango3 = new PangoView({
    text: `
      <p>Normal size text</p>
      <p><small>Small text</small></p>
      <p><big>Big text</big></p>
      <p><font size="1">Size 1</font></p>
      <p><font size="3">Size 3</font></p>
      <p><font size="5">Size 5</font></p>
      <p><font size="7">Size 7</font></p>
    `,
    output: 'examples/output/html-sizes.png',
    width: 500,
    font: 'Sans 14'
  });

  try {
    await pango3.render();
    console.log('✓ Rendered size variations');
  } catch (error) {
    console.error('✗ Error:', error.message);
  }

  console.log('\n4. Superscript and subscript');
  const pango4 = new PangoView({
    text: `
      <p>E = mc<sup>2</sup></p>
      <p>H<sub>2</sub>O is water</p>
      <p>x<sup>n</sup> + y<sup>n</sup> = z<sup>n</sup></p>
      <p>C<sub>6</sub>H<sub>12</sub>O<sub>6</sub> is glucose</p>
    `,
    output: 'examples/output/html-supsub.png',
    width: 400,
    font: 'Sans 16'
  });

  try {
    await pango4.render();
    console.log('✓ Rendered superscript and subscript');
  } catch (error) {
    console.error('✗ Error:', error.message);
  }

  console.log('\n5. Nested HTML tags');
  const pango5 = new PangoView({
    text: `
      <p>This is <strong><em>bold and italic</em></strong> text.</p>
      <p><font color="blue"><strong><u>Bold, underlined, blue text</u></strong></font></p>
      <p><big><strong>Big and bold</strong></big></p>
    `,
    output: 'examples/output/html-nested.png',
    width: 500,
    font: 'Sans 14'
  });

  try {
    await pango5.render();
    console.log('✓ Rendered nested tags');
  } catch (error) {
    console.error('✗ Error:', error.message);
  }

  console.log('\n6. Headings');
  const pango6 = new PangoView({
    text: `
      <h1>Heading 1</h1>
      <h2>Heading 2</h2>
      <h3>Heading 3</h3>
      <h4>Heading 4</h4>
      <h5>Heading 5</h5>
      <h6>Heading 6</h6>
    `,
    output: 'examples/output/html-headings.png',
    width: 400,
    font: 'Sans 12'
  });

  try {
    await pango6.render();
    console.log('✓ Rendered headings');
  } catch (error) {
    console.error('✗ Error:', error.message);
  }

  console.log('\n7. Span with inline styles');
  const pango7 = new PangoView({
    text: `
      <p><span style="color: red;">Red text using CSS</span></p>
      <p><span style="font-weight: bold;">Bold using CSS</span></p>
      <p><span style="font-style: italic;">Italic using CSS</span></p>
      <p><span style="text-decoration: underline;">Underline using CSS</span></p>
      <p><span style="background-color: yellow; color: black;">Highlighted text</span></p>
    `,
    output: 'examples/output/html-css.png',
    width: 500,
    font: 'Sans 14'
  });

  try {
    await pango7.render();
    console.log('✓ Rendered CSS inline styles');
  } catch (error) {
    console.error('✗ Error:', error.message);
  }

  console.log('\n8. Complex HTML document');
  const pango8 = new PangoView({
    text: `
      <h1>Document Title</h1>
      
      <h2>Introduction</h2>
      <p>This is an <strong>example document</strong> that demonstrates the 
      <em>HTML-to-Pango conversion</em> capabilities.</p>
      
      <h2>Features</h2>
      <p>The converter supports:</p>
      <p>• <font color="red">Colored text</font></p>
      <p>• <strong>Bold</strong> and <em>italic</em> formatting</p>
      <p>• <u>Underlined text</u></p>
      <p>• Mathematical expressions like E=mc<sup>2</sup></p>
      
      <h2>Conclusion</h2>
      <p>This demonstrates <big><strong>comprehensive HTML support</strong></big>
      for rich text rendering.</p>
    `,
    output: 'examples/output/html-document.png',
    width: 600,
    font: 'Sans 12'
  });

  try {
    await pango8.render();
    console.log('✓ Rendered complex HTML document');
  } catch (error) {
    console.error('✗ Error:', error.message);
  }

  console.log('\n=== HTML conversion examples completed ===');
}

await fs.mkdir('examples/output', { recursive: true });
await htmlConversionExample();
