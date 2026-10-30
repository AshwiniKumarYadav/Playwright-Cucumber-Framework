const path = require('node:path');
require('tsx/cjs');
const { automationConfig } = require('../playwright.config.ts');
const reportFile = process.env.CUCUMBER_REPORT_FILE
  ? path.resolve(process.env.CUCUMBER_REPORT_FILE)
  : path.resolve(process.cwd(), automationConfig.reports.cucumberJson);

module.exports = {
  default: {
    paths: ['src/features/**/*.feature'],
    requireModule: ['tsx/cjs'],
    require: ['src/core/hooks/Hooks.ts', 'src/step-definitions/**/*.ts'],
    format: [
      'progress',
      ['json', reportFile],
    ],
    parallel: automationConfig.workers,
    worldParameters: {},
  },
};
