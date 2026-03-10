import { promises as fs } from 'node:fs';
import PangoView from '../src/index.js';

async function basicUsage() {
  console.log('=== Basic Usage Example ===\n');

  const installCheck = await PangoView.checkInstallation();
  console.log('Installation check:', installCheck);

  if (!installCheck.installed) {
    console.error('pango-view is not installed. Please install Pango first.');
    return;
  }

  console.log('\n1. Simple text rendering with HTML tags');
  const pango1 = new PangoView({
    text: 'Hello, <strong>World</strong>! This is <em>italic</em> and <u>underlined</u>.',
    output: 'examples/output/basic.png',
    width: 400,
    font: 'Sans 16'
  });

  try {
    await pango1.render();
    console.log('✓ Rendered to examples/output/basic.png');
  } catch (error) {
    console.error('✗ Error:', error.message);
  }

  console.log('\n2. HTML with colors and formatting');
  const pango2 = new PangoView({
    text: `
      <h1>Title</h1>
      <p>This is a paragraph with <font color="red">red text</font> and <font color="blue">blue text</font>.</p>
      <p>You can also use <big>big</big> and <small>small</small> text.</p>
    `,
    output: 'examples/output/colors.png',
    width: 500,
    font: 'Sans 14'
  });

  try {
    await pango2.render();
    console.log('✓ Rendered to examples/output/colors.png');
  } catch (error) {
    console.error('✗ Error:', error.message);
  }

  console.log('\n3. SVG output with justified text');
  const pango3 = new PangoView({
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    output: 'examples/output/justified.svg',
    backend: 'svg',
    width: 400,
    justify: true,
    wrap: 'word',
    font: 'Serif 12'
  });

  try {
    await pango3.render();
    console.log('✓ Rendered to examples/output/justified.svg');
  } catch (error) {
    console.error('✗ Error:', error.message);
  }

  console.log('\n4. PDF output');
  const pango4 = new PangoView({
    text: '<span weight="bold" size="x-large">PDF Document</span>\n\nThis is a PDF.',
    output: 'examples/output/annotated.pdf',
    backend: 'pdf',
    width: 600,
    markup: true,
    font: 'Sans 14'
  });

  try {
    await pango4.render();
    console.log('✓ Rendered to examples/output/annotated.pdf');
  } catch (error) {
    console.error('✗ Error:', error.message);
  }

  console.log('\n5. Getting markup without rendering');
  const pango5 = new PangoView({
    text: 'This is <strong>bold</strong> and <em>italic</em>.',
    output: 'dummy.png',
    htmlMode: true
  });

  const markup = pango5.getMarkup();
  console.log('Generated Pango markup:');
  console.log(markup);

  console.log('\n6. Render to buffer');
  const pango6 = new PangoView({
    text: 'Buffer output example',
    output: 'examples/output/buffer.png',
    width: 300,
    font: 'Sans 14'
  });

  try {
    const buffer = await pango6.renderToBuffer();
    console.log(`✓ Rendered to buffer (${buffer.length} bytes)`);
  } catch (error) {
    console.error('✗ Error:', error.message);
  }

  console.log('\n=== All examples completed ===');
}

await fs.mkdir('examples/output', { recursive: true });
await basicUsage();
