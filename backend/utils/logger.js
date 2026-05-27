const fs = require('fs');
const path = require('path');

const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const writeLog = (level, message) => {
  const timestamp = new Date().toISOString();
  const logEntry = JSON.stringify({ timestamp, level, message }) + '\n';
  
  try {
    fs.appendFileSync(path.join(logsDir, 'combined.log'), logEntry);
    if (level === 'ERROR') {
      fs.appendFileSync(path.join(logsDir, 'error.log'), logEntry);
    }
  } catch (err) {
    console.error('Error al escribir bitácora local:', err.message);
  }
};

const logger = {
  info: (message) => {
    const formatted = `[INFO] ${message}`;
    console.log(formatted);
    if (process.env.NODE_ENV === 'production') {
      writeLog('INFO', message);
    }
  },
  warn: (message) => {
    const formatted = `\x1b[33m[WARN] ${message}\x1b[0m`;
    console.warn(formatted);
    if (process.env.NODE_ENV === 'production') {
      writeLog('WARN', message);
    }
  },
  error: (message, stack = '') => {
    const msg = stack ? `${message}\nStack: ${stack}` : message;
    const formatted = `\x1b[31m[ERROR] ${msg}\x1b[0m`;
    console.error(formatted);
    if (process.env.NODE_ENV === 'production') {
      writeLog('ERROR', msg);
    }
  }
};

module.exports = logger;
