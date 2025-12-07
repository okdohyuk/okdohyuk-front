/* eslint-disable no-console */

const shouldLog = process.env.NODE_ENV !== 'test';

const logger = {
  error: (...args: unknown[]) => {
    if (shouldLog) {
      console.error(...args);
    }
  },
  warn: (...args: unknown[]) => {
    if (shouldLog) {
      console.warn(...args);
    }
  },
  info: (...args: unknown[]) => {
    if (shouldLog) {
      console.info(...args);
    }
  },
};

export default logger;
