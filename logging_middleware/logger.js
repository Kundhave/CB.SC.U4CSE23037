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
const HOST = '20.207.122.201';
const PATH = '/evaluation-service/logs';
const ACCESS_TOKEN = process.env.ACCESS_TOKEN ;
function Log(stack, level, packageName, message) {
  // Check if all parameters are valid
  if (!VALID_STACKS.includes(stack) || !VALID_LEVELS.includes(level) || !VALID_PACKAGES.includes(packageName) || typeof message !== 'string') {
    return;
  }
  
  const payload = JSON.stringify({
    stack,
    level,
    package: packageName,
    message,
  });
  const options = {
    hostname: HOST,
    path: PATH,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload),
    },
  };
  if (ACCESS_TOKEN) {
    options.headers.Authorization = `Bearer ${ACCESS_TOKEN}`;
  }
  const req = http.request(options, (res) => {
    res.on('data', () => {});});
  req.on('error', () => {});
  req.write(payload);
  req.end();
}
module.exports = { Log };