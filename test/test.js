import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert';
import PangoView, { HtmlToPangoConverter, FontManager, ArgBuilder, CONSTANTS } from '../src/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function runTests() {
  console.log('Running node-pango tests...\n');

  let passed = 0;
  let failed = 0;

  const testOutputDir = path.join(__dirname, 'test-output');
  await fs.mkdir(testOutputDir, { recursive: true });

  async function test(name, fn) {
    try {
      await fn();
      console.log(`✓ ${name}`);
      passed++;
    } catch (error) {
      console.error(`✗ ${name}`);
      console.error(`  Error: ${error.message}`);
      failed++;
    }
  }

  const installCheck = await PangoView.checkInstallation();

  if (!installCheck.installed) {
    console.error('⚠ pango-view is not installed. Some tests will be skipped.');
    console.error('  Please install Pango to run full test suite.\n');
  } else {
    console.log(`✓ pango-view detected: ${installCheck.version}\n`);
  }

  // ─── HTML-to-Pango conversion tests ───

  await test('HtmlToPangoConverter - <strong> becomes <b>', async () => {
    const converter = new HtmlToPangoConverter();
    const markup = converter.convert('This is <strong>bold</strong> text');
    assert(markup.includes('<b>bold</b>'), `Got: ${markup}`);
  });

  await test('HtmlToPangoConverter - <em> becomes <i>', async () => {
    const converter = new HtmlToPangoConverter();
    const markup = converter.convert('<em>italic</em>');
    assert(markup.includes('<i>italic</i>'), `Got: ${markup}`);
  });

  await test('HtmlToPangoConverter - Native Pango tags passed through', async () => {
    const converter = new HtmlToPangoConverter();
    const markup = converter.convert('<b>bold</b> <u>under</u> <s>strike</s>');
    assert(markup.includes('<b>bold</b>'), `Got: ${markup}`);
    assert(markup.includes('<u>under</u>'), `Got: ${markup}`);
    assert(markup.includes('<s>strike</s>'), `Got: ${markup}`);
  });

  await test('HtmlToPangoConverter - Font color', async () => {
    const converter = new HtmlToPangoConverter();
    const markup = converter.convert('<font color="red">Red text</font>');
    assert(markup.includes('foreground="red"'));
  });

  await test('HtmlToPangoConverter - Nested tags', async () => {
    const converter = new HtmlToPangoConverter();
    const markup = converter.convert('<strong><em>Bold and italic</em></strong>');
    assert(markup.includes('<b>'), `Got: ${markup}`);
    assert(markup.includes('<i>'), `Got: ${markup}`);
  });

  await test('HtmlToPangoConverter - Escape special characters', async () => {
    const converter = new HtmlToPangoConverter();
    const markup = converter.convert('Text with <b>&amp; &lt; &gt;</b>');
    assert(markup.includes('&amp;'));
    assert(markup.includes('&lt;'));
    assert(markup.includes('&gt;'));
  });

  await test('HtmlToPangoConverter - CSS inline styles', async () => {
    const converter = new HtmlToPangoConverter();
    const markup = converter.convert('<span style="color: red; font-weight: bold;">styled</span>');
    assert(markup.includes('foreground="red"'), `Got: ${markup}`);
    assert(markup.includes('weight="bold"'), `Got: ${markup}`);
  });

  await test('HtmlToPangoConverter - Pango span attributes passed through', async () => {
    const converter = new HtmlToPangoConverter();
    const markup = converter.convert('<span font_features="dlig=1" letter_spacing="1024">text</span>');
    assert(markup.includes('font_features="dlig=1"'), `Got: ${markup}`);
    assert(markup.includes('letter_spacing="1024"'), `Got: ${markup}`);
  });

  // ─── PangoView constructor tests ───

  await test('PangoView - Constructor with options', async () => {
    const pango = new PangoView({
      text: 'Test',
      output: 'test.png',
      width: 300,
      font: 'Sans 12'
    });

    assert.strictEqual(pango.options.text, 'Test');
    assert.strictEqual(pango.options.width, 300);
    assert.strictEqual(pango.options.font, 'Sans 12');
  });

  await test('PangoView - Falsy values preserved (width: 0)', async () => {
    const pango = new PangoView({
      text: 'Test',
      output: 'test.png',
      width: 0,
      indent: 0,
      margin: 0
    });

    assert.strictEqual(pango.options.width, 0);
    assert.strictEqual(pango.options.indent, 0);
    assert.strictEqual(pango.options.margin, 0);
  });

  await test('PangoView - Backend defaults to cairo', async () => {
    const p1 = new PangoView({ text: 'Test', output: 'test.png' });
    assert.strictEqual(p1.options.backend, 'cairo');

    const p2 = new PangoView({ text: 'Test', output: 'test.svg' });
    assert.strictEqual(p2.options.backend, 'cairo');
  });

  await test('PangoView - getMarkup with htmlMode', async () => {
    const pango = new PangoView({
      text: '<strong>Bold</strong>',
      output: 'test.png',
      htmlMode: true
    });

    const markup = pango.getMarkup();
    assert(markup.includes('<b>Bold</b>'), `Got: ${markup}`);
  });

  await test('PangoView - getMarkup with markup mode (passthrough)', async () => {
    const pango = new PangoView({
      text: '<span weight="bold">Bold</span>',
      output: 'test.png',
      markup: true
    });

    const markup = pango.getMarkup();
    assert.strictEqual(markup, '<span weight="bold">Bold</span>');
  });

  await test('PangoView - Static helper methods', async () => {
    const formats = PangoView.getSupportedFormats();
    assert(formats.includes('png'));
    assert(formats.includes('svg'));
    assert(formats.includes('pdf'));

    const alignments = PangoView.getSupportedAlignments();
    assert(alignments.includes('left'));
    assert(alignments.includes('center'));
    assert(alignments.includes('right'));
  });

  // ─── Integration tests (require pango-view installed) ───

  if (installCheck.installed) {
    await test('PangoView - Render simple text', async () => {
      const outputPath = path.join(testOutputDir, 'simple.png');
      const pango = new PangoView({
        text: 'Hello, World!',
        output: outputPath,
        width: 200,
        font: 'Sans 12'
      });

      const result = await pango.render();
      assert.strictEqual(result.success, true);

      const stats = await fs.stat(outputPath);
      assert(stats.size > 0);
    });

    await test('PangoView - Render with HTML', async () => {
      const outputPath = path.join(testOutputDir, 'html.png');
      const pango = new PangoView({
        text: 'This is <strong>bold</strong> and <em>italic</em>',
        output: outputPath,
        width: 300,
        font: 'Sans 14'
      });

      await pango.render();

      const stats = await fs.stat(outputPath);
      assert(stats.size > 0);
    });

    await test('PangoView - Render to buffer', async () => {
      const outputPath = path.join(testOutputDir, 'buffer.png');
      const pango = new PangoView({
        text: 'Buffer test',
        output: outputPath,
        width: 200,
        font: 'Sans 12'
      });

      const buffer = await pango.renderToBuffer();
      assert(buffer instanceof Buffer);
      assert(buffer.length > 0);
    });

    await test('PangoView - SVG output', async () => {
      const outputPath = path.join(testOutputDir, 'output.svg');
      const pango = new PangoView({
        text: 'SVG test',
        output: outputPath,
        width: 200,
        font: 'Sans 12'
      });

      await pango.render();

      const stats = await fs.stat(outputPath);
      assert(stats.size > 0);

      const content = await fs.readFile(outputPath, 'utf8');
      assert(content.includes('<svg'));
    });

    await test('PangoView - Text alignment', async () => {
      const outputPath = path.join(testOutputDir, 'aligned.png');
      const pango = new PangoView({
        text: 'Centered text',
        output: outputPath,
        width: 300,
        align: 'center',
        font: 'Sans 12'
      });

      await pango.render();

      const stats = await fs.stat(outputPath);
      assert(stats.size > 0);
    });

    await test('PangoView - Justified text', async () => {
      const outputPath = path.join(testOutputDir, 'justified.png');
      const pango = new PangoView({
        text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        output: outputPath,
        width: 300,
        justify: true,
        wrap: 'word',
        font: 'Sans 12'
      });

      await pango.render();

      const stats = await fs.stat(outputPath);
      assert(stats.size > 0);
    });
  }

  // ─── FontManager unit tests ───

  await test('FontManager - Font family detection from filename', async () => {
    const manager = new FontManager();
    const family = await manager._detectFontFamily('/nonexistent/Roboto-Regular.ttf', 'Roboto-Regular.ttf');
    assert.strictEqual(family, 'Roboto');
  });

  console.log(`\n${'='.repeat(50)}`);
  console.log(`Tests completed: ${passed + failed}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log('='.repeat(50));

  if (failed > 0) {
    process.exit(1);
  }
  // ─── ArgBuilder unit tests ───

  await test('ArgBuilder - builds required flags', async () => {
    const opts = {
      text: 'ignored',
      output: '/tmp/out.png',
      width: null, height: null, align: null,
      justify: false, justifyLastLine: false,
      indent: null, spacing: null, lineSpacing: null, singlePar: false,
      markup: false, htmlMode: true, wrap: null, ellipsize: null,
      backend: 'cairo', dpi: null, pixels: false,
      foreground: null, background: null, margin: null,
      rotateAngle: null, gravity: null, gravityHint: null,
      hinting: null, antialias: null, hintMetrics: null,
      subpixelOrder: null, subpixelPositions: false,
      language: null, noAutoDir: false, rtl: false, header: false, waterfall: false,
      pangoViewPath: 'pango-view',
    };
    const args = new ArgBuilder(opts, 'Hello').build();
    assert(args.includes('--no-display'),       `Missing --no-display: ${args}`);
    assert(args.includes('--markup'),            `Missing --markup: ${args}`);
    assert(args.includes('--text'),              `Missing --text: ${args}`);
    assert(args.includes('Hello'),               `Missing markup value: ${args}`);
    assert(args.includes('--output'),            `Missing --output: ${args}`);
    assert(args.includes('--backend=cairo'),     `Missing --backend: ${args}`);
  });

  await test('ArgBuilder - optional flags only present when set', async () => {
    const base = {
      text: '', output: '/tmp/x.png',
      width: null, height: null, align: null,
      justify: false, justifyLastLine: false,
      indent: null, spacing: null, lineSpacing: null, singlePar: false,
      markup: false, htmlMode: true, wrap: null, ellipsize: null,
      backend: 'cairo', dpi: null, pixels: false,
      foreground: null, background: null, margin: null,
      rotateAngle: null, gravity: null, gravityHint: null,
      hinting: null, antialias: null, hintMetrics: null,
      subpixelOrder: null, subpixelPositions: false,
      language: null, noAutoDir: false, rtl: false, header: false, waterfall: false,
      pangoViewPath: 'pango-view',
    };

    const argsNoWidth = new ArgBuilder(base, '').build();
    assert(!argsNoWidth.includes('--width'), 'width should be absent');
    assert(!argsNoWidth.includes('--rtl'),   'rtl should be absent');

    const argsWithWidth = new ArgBuilder({ ...base, width: 600, rtl: true }, '').build();
    assert(argsWithWidth.includes('--width'),  '--width should be present');
    assert(argsWithWidth.includes('600'),       '--width value should be 600');
    assert(argsWithWidth.includes('--rtl'),     '--rtl should be present');
  });

  await test('ArgBuilder - width: 0 is included (falsy-safe)', async () => {
    const opts = {
      text: '', output: '/tmp/x.png',
      width: 0, height: null, align: null,
      justify: false, justifyLastLine: false,
      indent: 0, spacing: null, lineSpacing: null, singlePar: false,
      markup: false, htmlMode: true, wrap: null, ellipsize: null,
      backend: 'cairo', dpi: null, pixels: false,
      foreground: null, background: null, margin: 0,
      rotateAngle: null, gravity: null, gravityHint: null,
      hinting: null, antialias: null, hintMetrics: null,
      subpixelOrder: null, subpixelPositions: false,
      language: null, noAutoDir: false, rtl: false, header: false, waterfall: false,
      pangoViewPath: 'pango-view',
    };
    const args = new ArgBuilder(opts, '').build();
    assert(args.includes('--width'),  '--width 0 must appear');
    assert(args.includes('--indent'), '--indent 0 must appear');
    assert(args.includes('--margin'), '--margin 0 must appear');
  });

  // ─── Dependency Injection test ───

  await test('PangoView - accepts injected HtmlToPangoConverter', async () => {
    const mockConverter = { convert: () => '<b>MOCKED</b>' };
    const pango = new PangoView(
      { text: '<strong>real</strong>', output: 'x.png', htmlMode: true },
      { htmlConverter: mockConverter },
    );
    assert.strictEqual(pango.getMarkup(), '<b>MOCKED</b>');
  });

  // ─── CONSTANTS tests ───

  await test('CONSTANTS - all required keys exported', async () => {
    assert(Array.isArray(CONSTANTS.SUPPORTED_FORMATS),         'SUPPORTED_FORMATS missing');
    assert(Array.isArray(CONSTANTS.SUPPORTED_ALIGNMENTS),      'SUPPORTED_ALIGNMENTS missing');
    assert(Array.isArray(CONSTANTS.SUPPORTED_WRAP_MODES),      'SUPPORTED_WRAP_MODES missing');
    assert(Array.isArray(CONSTANTS.SUPPORTED_ELLIPSIZE_MODES), 'SUPPORTED_ELLIPSIZE_MODES missing');
    assert(CONSTANTS.SUPPORTED_FORMATS.includes('png'),        'png missing from formats');
    assert(CONSTANTS.SUPPORTED_ALIGNMENTS.includes('center'),  'center missing from alignments');
  });

  await test('CONSTANTS - arrays are frozen (immutable)', async () => {
    assert(Object.isFrozen(CONSTANTS.SUPPORTED_FORMATS),    'SUPPORTED_FORMATS should be frozen');
    assert(Object.isFrozen(CONSTANTS.SUPPORTED_ALIGNMENTS), 'SUPPORTED_ALIGNMENTS should be frozen');
  });

}

runTests().catch(error => {
  console.error('Test runner error:', error);
  process.exit(1);
});
