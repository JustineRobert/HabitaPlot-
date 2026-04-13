/**
 * Winston logger configuration
 */

const { createLogger, format, transports } = require('winston');

const logLevel = process.env.LOG_LEVEL || 'info';

const logger = createLogger({
  level: logLevel,
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize({ all: true }),
        format.printf(({ level, message, timestamp, stack }) => {
          return stack
            ? `${timestamp} ${level}: ${message} - ${stack}`
            : `${timestamp} ${level}: ${message}`;
        })
      )
    })
  ]
});

module.exports = logger;
