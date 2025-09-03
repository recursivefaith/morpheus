const esbuild = require('esbuild');
const chokidar = require('chokidar');
const process = require('process');

// Build options shared between dev and prod
const buildOptions = {
  entryPoints: ['src/index.js'],
  bundle: true,
  outfile: 'main.js',
  allowOverwrite: true,
  format: 'cjs',
  external: ['obsidian'],
  logLevel: 'info',
};

// A simple debounce flag to prevent multiple builds at once
let isBuilding = false;

// Dev build function
const buildDev = async () => {
  if (isBuilding) return;
  isBuilding = true;
  console.log('Build starting...');
  try {
    await esbuild.build({
      ...buildOptions,
      sourcemap: 'inline',
    });
    console.log('Build finished successfully.');
  } catch (error) {
    console.error('Build failed:', error);
  } finally {
    isBuilding = false;
  }
};

// Production build function
const buildProd = async () => {
  console.log('Production build starting...');
  try {
    await esbuild.build({
      ...buildOptions,
      minify: true,
    });
    console.log('Production build complete.');
  } catch (error) {
    console.error('Production build failed:', error);
    process.exit(1);
  }
};

// Main logic
if (process.argv.includes('--watch')) {
  // Initial dev build
  buildDev();

  // Watch the 'src' directory ONLY.
  // This is the fix. It cannot see the output main.js.
  chokidar.watch('src', {
    ignored: /(^|[\/\\])\../, // ignore dotfiles
    persistent: true
  }).on('all', (event, path) => {
    console.log(`Change detected in ${path}. Rebuilding...`);
    buildDev();
  });

  console.log('--> Watching for changes in src/...');
} else {
  // Single production build
  buildProd();
}
