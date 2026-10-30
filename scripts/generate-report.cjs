const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
require('tsx/cjs');
const { automationConfig } = require('../playwright.config.ts');
const reporter = require('multiple-cucumber-html-reporter');

const root = path.resolve(__dirname, '..');
const reportsDirectory = path.resolve(root, automationConfig.reports.cucumberHtmlDirectory);
const jsonFiles = fs.readdirSync(reportsDirectory)
  .filter((name) => /^cucumber-report(?:-[a-z]+)?\.json$/.test(name));
if (jsonFiles.length === 0) {
  throw new Error(`Cucumber JSON report not found in ${reportsDirectory}. Run a test command first.`);
}

const browserInfoFile = path.join(reportsDirectory, 'browser-info.txt');
const browserInfos = fs.existsSync(browserInfoFile)
  ? JSON.parse(fs.readFileSync(browserInfoFile, 'utf8'))
  : [{ name: process.env.BROWSER ?? 'chromium', version: 'Not recorded' }];
const browserInfo = browserInfos.length === 1
  ? browserInfos[0]
  : {
      name: browserInfos.map((info) => info.name).join(', '),
      version: 'Multiple browser versions',
    };
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const reportPath = path.join(reportsDirectory, timestamp);
reporter.generate({
  jsonDir: reportsDirectory,
  reportPath,
  openReportInBrowser: false,
  pageFooter: '<div></div>',
  displayDuration: true,
  metadata: {
    browser: {
      name: browserInfo.name,
      version: browserInfo.version,
    },
    platform: { name: process.platform, version: os.release() },
    device: 'Playwright automation',
  },
  customData: {
    title: 'Execution details',
    data: [
      { label: 'Environment', value: process.env.TEST_ENV ?? 'qa' },
      { label: 'Browser', value: `${browserInfo.name} ${browserInfo.version}` },
      { label: 'Playwright', value: require('playwright/package.json').version },
      { label: 'Headless', value: String(automationConfig.headless) },
      { label: 'Generated at', value: new Date().toISOString() },
    ],
  },
});
console.log(`HTML report generated: ${path.join(reportPath, 'index.html')}`);
