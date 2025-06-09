import winston, { format, transports } from "winston";

// Winston Logger Configuration
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: format.combine(format.timestamp(), format.json()),
  transports: [
    // 1️⃣ Console Transport
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    }),

    // 2️⃣ File Transport - All Logs
    new transports.File({
      filename: "logs/combined.log",
    }),

    // 2️⃣ File Transport - Errors Only
    new transports.File({
      filename: "logs/error.log",
      level: "error",
    }),

    // 3️⃣ HTTP Transport - Streams to an HTTP endpoint
    new transports.Http({
      host: "localhost",
      port: 3000,
      path: "/logs", // API endpoint to receive logs
      ssl: false, // Set to true if using HTTPS
      level: "warn",
    }),
  ],
});
