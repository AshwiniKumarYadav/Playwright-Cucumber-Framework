const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
require('tsx/cjs');
const { automationConfig } = require('../playwright.config.ts');
const cucumberBin = path.join(root, 'node_modules', '@cucumber', 'cucumber', 'bin', 'cucumber.js');
const reportScript = path.join(__dirname, 'generate-report.cjs');
const reportsDirectory = path.resolve(root, automationConfig.reports.cucumberHtmlDirectory);

if (!fs.existsSync(cucumberBin)) {
  throw new Error(`Cucumber executable not found at ${cucumberBin}. Run npm install first.`);
}

const browserInfos = [];
const reportFiles = [];
let testExitCode = 0;
for (const browser of automationConfig.browsers) {
  const reportFile = automationConfig.browsers.length === 1
    ? path.resolve(root, automationConfig.reports.cucumberJson)
    : path.join(reportsDirectory, `cucumber-report-${browser}.json`);
  const testResult = spawnSync(
    process.execPath,
    [cucumberBin, '--config', 'config/cucumber.config.cjs', ...process.argv.slice(2)],
    {
      cwd: root,
      env: {
        ...process.env,
        BROWSER: browser,
        CUCUMBER_REPORT_FILE: reportFile,
      },
      stdio: 'inherit',
    },
  );
  if (testResult.error) throw testResult.error;
  if (testResult.status !== 0) testExitCode = testResult.status ?? 1;
  if (fs.existsSync(reportFile)) reportFiles.push(reportFile);

  const browserInfoFiles = fs.readdirSync(reportsDirectory)
    .filter((name) => /^browser-info-\d+\.json$/.test(name))
    .map((name) => path.join(reportsDirectory, name));
  if (browserInfoFiles.length > 0) {
    const workerInfos = browserInfoFiles.map((file) =>
      JSON.parse(fs.readFileSync(file, 'utf8')));
    const versions = new Set(workerInfos.map((info) => info.version));
    if (versions.size !== 1) {
      throw new Error(
        `Cucumber workers launched different ${browser} versions: ${[...versions].join(', ')}`,
      );
    }
    browserInfos.push({ name: browser, version: workerInfos[0].version });
    for (const file of browserInfoFiles) fs.rmSync(file, { force: true });
  }
}

if (browserInfos.length > 0) {
  fs.writeFileSync(
    path.join(reportsDirectory, 'browser-info.txt'),
    JSON.stringify(browserInfos),
    'utf8',
  );
}

if (reportFiles.length > 0) {
  const reportResult = spawnSync(process.execPath, [reportScript], {
    cwd: root,
    env: process.env,
    stdio: 'inherit',
  });
  if (reportResult.error) throw reportResult.error;
  if (reportResult.status !== 0 && testExitCode === 0) {
    process.exitCode = reportResult.status ?? 1;
  } else {
    process.exitCode = testExitCode;
  }
} else {
  process.exitCode = testExitCode || 1;
}
