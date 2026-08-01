import pino from "pino";

const isProd = process.env.NODE_ENV === "production";

// pino-pretty transport breaks in Next production bundles on Railway.
export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  ...(isProd
    ? {}
    : {
        transport: {
          target: "pino-pretty",
        },
      }),
});

export const createLogger = (name: string) => logger.child({ name });
