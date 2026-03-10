import { promises as fs } from 'node:fs';
import path from 'node:path';
import PangoView from '../src/index.js';

async function customFontExample() {
  console.log('=== Custom Font Example ===\n');

  const installCheck = await PangoView.checkInstallation();
  if (!installCheck.installed) {
    console.error('pango-view is not installed. Please install Pango first.');
    return;
  }

  console.log('This example demonstrates rendering with a custom font file.');
  console.log('You need to provide a path to a .ttf or .otf font file.\n');

  const fontPath = process.argv[2];

  if (!fontPath) {
    console.log('Usage: node custom-font.js <path-to-font-file.ttf>');
    console.log('\nExample:');
    console.log('  node custom-font.js /path/to/MyFont.ttf');
    return;
  }

  console.log(`Using font file: ${fontPath}\n`);

  console.log('1. Rendering with custom font by path');
  const pango1 = new PangoView({
    text: 'This text is rendered using a custom font loaded from a file path.',
    fontFile: fontPath,
    font: 'CustomFont 24',
    output: 'examples/output/custom-font.png',
    width: 600,
    background: '#ffffff',
    foreground: '#000000'
  });

  try {
    await pango1.render();
    console.log('✓ Rendered to examples/output/custom-font.png');
  } catch (error) {
    console.error('✗ Error:', error.message);
  }

  console.log('\n2. Custom font with HTML formatting');
  const pango2 = new PangoView({
    text: `
      <h1>Custom Font Example</h1>
      <p>This is <strong>bold</strong> and <em>italic</em> text.</p>
      <p>Using font loaded from: ${path.basename(fontPath)}</p>
    `,
    fontFile: fontPath,
    font: 'CustomFont 16',
    output: 'examples/output/custom-font-html.png',
    width: 600,
    htmlMode: true
  });

  try {
    await pango2.render();
    console.log('✓ Rendered to examples/output/custom-font-html.png');
  } catch (error) {
    console.error('✗ Error:', error.message);
  }

  console.log('\n3. Custom font with SVG output');
  const pango3 = new PangoView({
    text: 'Custom Font in SVG Format',
    fontFile: fontPath,
    font: 'CustomFont 32',
    output: 'examples/output/custom-font.svg',
    backend: 'svg',
    width: 500,
    align: 'center'
  });

  try {
    await pango3.render();
    console.log('✓ Rendered to examples/output/custom-font.svg');
  } catch (error) {
    console.error('✗ Error:', error.message);
  }

  console.log('\n=== Custom font examples completed ===');
}

await fs.mkdir('examples/output', { recursive: true });
await customFontExample();
