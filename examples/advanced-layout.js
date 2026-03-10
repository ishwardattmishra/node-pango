import { promises as fs } from 'node:fs';
import PangoView from '../src/index.js';

async function advancedLayoutExample() {
  console.log('=== Advanced Layout Example ===\n');

  const installCheck = await PangoView.checkInstallation();
  if (!installCheck.installed) {
    console.error('pango-view is not installed. Please install Pango first.');
    return;
  }

  const loremText = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.';

  console.log('1. Text alignment variations');
  
  for (const align of ['left', 'center', 'right']) {
    const pango = new PangoView({
      text: `<span size="large" weight="bold">${align.toUpperCase()} Aligned</span>\n\n${loremText}`,
      output: `examples/output/align-${align}.png`,
      width: 400,
      align: align,
      wrap: 'word',
      markup: true,
      font: 'Sans 12'
    });

    try {
      await pango.render();
      console.log(`✓ Rendered ${align} aligned text`);
    } catch (error) {
      console.error(`✗ Error (${align}):`, error.message);
    }
  }

  console.log('\n2. Text wrapping modes');
  
  const longWord = 'Supercalifragilisticexpialidocious-antidisestablishmentarianism-pneumonoultramicroscopicsilicovolcanoconiosis';
  
  for (const wrap of ['word', 'char', 'word-char']) {
    const pango = new PangoView({
      text: `<span size="large" weight="bold">Wrap: ${wrap}</span>\n\n${longWord}`,
      output: `examples/output/wrap-${wrap}.png`,
      width: 300,
      wrap: wrap,
      markup: true,
      font: 'Sans 12'
    });

    try {
      await pango.render();
      console.log(`✓ Rendered with ${wrap} wrapping`);
    } catch (error) {
      console.error(`✗ Error (${wrap}):`, error.message);
    }
  }

  console.log('\n3. Ellipsize modes');
  
  const longText = 'This is a very long text that will be truncated with ellipsis when it exceeds the specified width constraints.';
  
  for (const ellipsize of ['start', 'middle', 'end']) {
    const pango = new PangoView({
      text: `<span size="large" weight="bold">Ellipsize: ${ellipsize}</span>\n\n${longText}`,
      output: `examples/output/ellipsize-${ellipsize}.png`,
      width: 250,
      height: 80,
      ellipsize: ellipsize,
      markup: true,
      font: 'Sans 12'
    });

    try {
      await pango.render();
      console.log(`✓ Rendered with ${ellipsize} ellipsize`);
    } catch (error) {
      console.error(`✗ Error (${ellipsize}):`, error.message);
    }
  }

  console.log('\n4. Line spacing variations');
  
  for (const lineSpacing of [0.8, 1.0, 1.5, 2.0]) {
    const pango = new PangoView({
      text: `<span size="large" weight="bold">Line Spacing: ${lineSpacing}</span>\n\nFirst line\nSecond line\nThird line\nFourth line`,
      output: `examples/output/linespacing-${lineSpacing}.png`,
      width: 300,
      lineSpacing: lineSpacing,
      markup: true,
      font: 'Sans 14'
    });

    try {
      await pango.render();
      console.log(`✓ Rendered with line spacing ${lineSpacing}`);
    } catch (error) {
      console.error(`✗ Error (${lineSpacing}):`, error.message);
    }
  }

  console.log('\n5. Justified text with indentation');
  const pango5 = new PangoView({
    text: `<span size="x-large" weight="bold">Chapter 1</span>\n\n${loremText}\n\n${loremText}`,
    output: 'examples/output/justified-indent.png',
    width: 500,
    justify: true,
    indent: 30,
    spacing: 5,
    lineSpacing: 1.3,
    wrap: 'word',
    markup: true,
    font: 'Serif 12'
  });

  try {
    await pango5.render();
    console.log('✓ Rendered justified text with indentation');
  } catch (error) {
    console.error('✗ Error:', error.message);
  }

  console.log('\n6. Colored background and foreground');
  const pango6 = new PangoView({
    text: `<span size="xx-large" weight="bold">Colored Output</span>\n\nThis text has custom colors.`,
    output: 'examples/output/colors-bg.png',
    width: 400,
    background: '#1a1a2e',
    foreground: '#eaeaea',
    margin: 20,
    markup: true,
    font: 'Sans 16'
  });

  try {
    await pango6.render();
    console.log('✓ Rendered with custom background and foreground colors');
  } catch (error) {
    console.error('✗ Error:', error.message);
  }

  console.log('\n=== Advanced layout examples completed ===');
}

await fs.mkdir('examples/output', { recursive: true });
await advancedLayoutExample();
