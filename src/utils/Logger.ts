import { appendFileSync, mkdirSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import path from 'node:path';

type LogLevel = 'INFO' | 'DEBUG' | 'WARN' | 'ERROR';

const sensitiveKey = /password|token|authorization|cookie|secret|api[-_]?key/i;
const sensitiveAssignment =
  /((?:password|token|authorization|cookie|secret|api[-_]?key)\s*[:=]\s*)(?:"[^"]*"|'[^']*'|[^&\s,;]+)/gi;
const queryValue = /([?&][^=&#]+)=([^&#]*)/g;

function redact(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redact);
  if (typeof value === 'string') return redactText(value);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        sensitiveKey.test(key) ? '[REDACTED]' : redact(item),
      ]),
    );
  }
  return value;
}

export function redactText(value: string): string {
  return value
    .replace(sensitiveAssignment, '$1[REDACTED]')
    .replace(queryValue, '$1=[REDACTED]');
}

export class Logger {
  private scenarioName: string;
  private logFile: string;

  constructor(scenarioName = 'framework') {
    this.scenarioName = scenarioName;
    this.logFile = this.createLogFileName(scenarioName);
  }

  setScenarioName(name: string): void {
    this.scenarioName = name;
    this.logFile = this.createLogFileName(name);
  }

  get logFilePath(): string {
    return this.logFile;
  }

  info(message: string, details?: unknown): void {
    this.write('INFO', message, details);
  }

  debug(message: string, details?: unknown): void {
    this.write('DEBUG', message, details);
  }

  warn(message: string, details?: unknown): void {
    this.write('WARN', message, details);
  }

  error(message: string, details?: unknown): void {
    this.write('ERROR', message, details);
  }

  private write(level: LogLevel, message: string, details?: unknown): void {
    const suffix = details === undefined ? '' : ` ${JSON.stringify(redact(details))}`;
    const output = `${new Date().toISOString()} [${level}] [${this.scenarioName}] ${redactText(message)}${suffix}`;
    mkdirSync(path.dirname(this.logFile), { recursive: true });
    appendFileSync(this.logFile, `${output}\n`, 'utf8');
    if (level === 'ERROR') console.error(output);
    else if (level === 'WARN') console.warn(output);
    else console.log(output);
  }

  private createLogFileName(name: string): string {
    const safeName = name.replace(/[^a-zA-Z0-9_-]+/g, '_').slice(0, 80) || 'scenario';
    return path.resolve(process.cwd(), 'logs', `${safeName}-${randomUUID()}.log`);
  }
}
