const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const reportsDirectory = path.join(root, 'reports');
const requested = process.argv[2] ?? 'all';

if (requested === 'current') {
  fs.mkdirSync(reportsDirectory, { recursive: true });
  for (const entry of fs.readdirSync(reportsDirectory)) {
    if (/^cucumber-report(?:-[a-z]+)?\.json$/.test(entry)) {
      fs.rmSync(path.join(reportsDirectory, entry), { force: true });
    }
  }
  fs.rmSync(path.join(reportsDirectory, 'browser-info.txt'), { force: true });
  for (const entry of fs.readdirSync(reportsDirectory)) {
    if (/^browser-info-\d+\.json$/.test(entry)) {
      fs.rmSync(path.join(reportsDirectory, entry), { force: true });
    }
  }
} else if (requested === 'all') {
  fs.mkdirSync(reportsDirectory, { recursive: true });
  for (const entry of fs.readdirSync(reportsDirectory, { withFileTypes: true })) {
    if (entry.name !== '.gitkeep') {
      fs.rmSync(path.join(reportsDirectory, entry.name), { recursive: true, force: true });
    }
  }
} else {
  throw new Error(`Refusing to clean unsupported target "${requested}".`);
}
