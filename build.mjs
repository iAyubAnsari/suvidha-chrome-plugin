import esbuild from 'esbuild';
import fs from 'fs';

const isWatch = process.argv.includes('--watch');

const buildOptions = {
  entryPoints: {
    popup: 'src/popup.js',
    content: 'src/content.js',
    background: 'src/background.js',
  },
  bundle: true,
  outdir: 'chrome-extensions',
  format: 'iife',
  target: ['chrome100'],
  sourcemap: process.env.NODE_ENV !== 'production',
};

async function copyStaticAssets() {
  fs.mkdirSync('chrome-extensions', { recursive: true });
  fs.copyFileSync('src/manifest.json', 'chrome-extensions/manifest.json');
  fs.copyFileSync('src/popup.html', 'chrome-extensions/popup.html');
  if (fs.existsSync('src/icons')) {
    fs.cpSync('src/icons', 'chrome-extensions/icons', { recursive: true });
  }
}

async function build() {
  await copyStaticAssets();

  if (isWatch) {
    const ctx = await esbuild.context(buildOptions);
    await ctx.watch();
    console.log('⚡ Watching src/ for changes... Outputting to chrome-extensions/');
  } else {
    await esbuild.build(buildOptions);
    console.log('✅ Build complete! Extension files ready in chrome-extensions/');
  }
}

build().catch(err => {
  console.error(err);
  process.exit(1);
});
