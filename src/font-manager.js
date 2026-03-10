import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execa } from 'execa';

const FONTS_CONF = `<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "fonts.dtd">
<fontconfig>
  <dir prefix="cwd">.</dir>
  <cachedir prefix="cwd">.</cachedir>
  <config></config>
</fontconfig>`;

class FontManager {
  constructor() {
    this.tempFiles = [];
  }

  async createFontConfig(fontPath, fontFamily = null) {
    const resolvedFontPath = path.resolve(fontPath);

    try {
      await fs.access(resolvedFontPath);
    } catch {
      throw new Error(`Font file not found: ${resolvedFontPath}`);
    }

    const fontDir  = path.dirname(resolvedFontPath);
    const fontFile = path.basename(resolvedFontPath);
    const detectedFamily = fontFamily ?? await this._detectFontFamily(resolvedFontPath, fontFile);

    let tempBase = os.tmpdir();
    try {
      await fs.access(tempBase);
    } catch {
      tempBase = '/tmp';
    }

    const tempDir      = await fs.mkdtemp(path.join(tempBase, 'node-pango-'));
    const configPath   = path.join(tempDir, 'fonts.conf');
    const fontDestPath = path.join(tempDir, fontFile);

    await fs.writeFile(configPath, FONTS_CONF, 'utf8');
    await fs.copyFile(resolvedFontPath, fontDestPath);

    this.tempFiles.push(tempDir);

    return { configPath, configDir: tempDir, fontFamily: detectedFamily, fontDir, fontFile };
  }

  async _detectFontFamily(fontPath, fontFile) {
    try {
      const result  = await execa('fc-query', ['-f', '%{family}', fontPath]);
      const families = result.stdout.trim();
      if (families) return families.split(',')[0].trim();
    } catch {
      // fc-query not available — fall back to filename parsing
    }

    const basename  = path.basename(fontFile, path.extname(fontFile));
    const cleanName = basename
      .replaceAll('-', ' ')
      .replaceAll('_', ' ')
      .replace(/\b(Regular|Bold|Italic|Light|Medium|Heavy|Black|Thin|Book|Demi|Semi|Extra|Ultra|Oblique)\b/gi, '')
      .replace(/\(.*?\)/g, '')
      .trim();

    return cleanName || basename.replaceAll(/[-_]/g, ' ');
  }

  async cleanup() {
    for (const dir of this.tempFiles) {
      try {
        await fs.rm(dir, { recursive: true, force: true });
      } catch {
        // best-effort cleanup
      }
    }
    this.tempFiles = [];
  }

  async withFontConfig(fontPath, fontFamily, callback) {
    let config = null;
    try {
      config = await this.createFontConfig(fontPath, fontFamily);
      return await callback(config);
    } finally {
      if (config) await this.cleanup();
    }
  }
}

export default FontManager;
