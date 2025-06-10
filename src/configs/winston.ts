import winston, { format, transports } from "winston";
import "winston-daily-rotate-file";

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.errors({ stack: true }),
    format.splat()
  ),
  transports: [
    // Console Transport with better formatting
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple(),
        format.printf(({ timestamp, level, message, ...meta }) => {
          const metaString = Object.keys(meta).length
            ? JSON.stringify(meta, null, 2)
            : "";
          return `[${timestamp}] ${level}: ${message} ${metaString}`;
        })
      ),
    }),

    // Rotating File Transport - All Logs
    new winston.transports.DailyRotateFile({
      filename: "logs/combined-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      maxSize: "20m",
      maxFiles: "14d",
      format: format.combine(format.timestamp(), format.json()),
    }),

    // Rotating File Transport - Errors Only
    new winston.transports.DailyRotateFile({
      filename: "logs/error-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      maxSize: "20m",
      maxFiles: "14d",
      level: "error",
      format: format.combine(format.timestamp(), format.json()),
    }),
  ],
  // Exit on error: false
  exitOnError: false,
});

// Add exception handling
logger.exceptions.handle(
  new transports.File({ filename: "logs/exceptions.log" })
);

// Add rejection handling
logger.rejections.handle(
  new transports.File({ filename: "logs/rejections.log" })
);
