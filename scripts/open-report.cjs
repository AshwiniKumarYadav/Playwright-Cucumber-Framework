const { execFile } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const reportsDirectory = path.resolve(__dirname, '..', 'reports');
const reportDirectories = fs.readdirSync(reportsDirectory, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort()
  .reverse();

if (reportDirectories.length === 0) {
  throw new Error('No generated HTML report found. Run a test command first.');
}

const reportFile = path.join(reportsDirectory, reportDirectories[0], 'index.html');
execFile('cmd.exe', ['/c', 'start', '""', reportFile], (error) => {
  if (error) throw new Error(`Unable to open report at ${reportFile}.`, { cause: error });
});
