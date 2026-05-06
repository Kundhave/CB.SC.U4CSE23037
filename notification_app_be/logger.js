const http = require('http');

const VALID_STACKS = ['backend', 'frontend'];
const VALID_LEVELS = ['debug', 'info', 'warn', 'error', 'fatal'];
const VALID_PACKAGES = [
  'cache',
  'controller',
  'cron_job',
  'db',
  'domain',
  'api',
  'component',
  'hook',
  'page',
  'state',
  'style',
  'auth',
  'config',
  'middleware',
  'utils'
];
const LOG_HOST = '20.207.122.201';
const LOG_PATH = '/evaluation-service/logs';
const AUTH_TOKEN = process.env.LOG_AUTH_TOKEN || '';

function Log(stack, level, packageName, message) {
  if (
    !VALID_STACKS.includes(stack) ||
    !VALID_LEVELS.includes(level) ||
    !VALID_PACKAGES.includes(packageName) ||
    typeof message !== 'string'
  ) {
    return;
  }

  const payload = JSON.stringify({
    stack,
    level,
    package: packageName,
    message,
  });

  const options = {
    hostname: LOG_HOST,
    path: LOG_PATH,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload),
    },
  };

  if (AUTH_TOKEN) {
    options.headers.Authorization = `Bearer ${AUTH_TOKEN}`;
  }

  const req = http.request(options, (res) => {
    res.on('data', () => {});
  });

  req.on('error', () => {});
  req.write(payload);
  req.end();
}

module.exports = { Log };