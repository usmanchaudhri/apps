import pino, { type LevelWithSilent } from "pino";

const isProd = process.env.NODE_ENV === "production";

const VALID_LEVELS = new Set<string>([
  "fatal",
  "error",
  "warn",
  "info",
  "debug",
  "trace",
  "silent",
]);

function resolveLogLevel(): LevelWithSilent {
  const raw = (process.env.LOG_LEVEL || "info").toLowerCase();
  return (VALID_LEVELS.has(raw) ? raw : "info") as LevelWithSilent;
}

// pino-pretty transport breaks in Next production bundles on Railway.
export const logger = pino({
  level: resolveLogLevel(),
  ...(isProd
    ? {}
    : {
        transport: {
          target: "pino-pretty",
        },
      }),
});

export const createLogger = (name: string) => logger.child({ name });
