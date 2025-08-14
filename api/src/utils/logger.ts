import pino from 'pino';

const logLevel = process.env.LOG_LEVEL || 'info';

const transport =
  process.env.NODE_ENV !== 'production'
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'yyyy-mm-dd HH:MM:ss.l',
          ignore: 'pid,hostname',
          levelFirst: true,
          singleLine: true,
          messageFormat: '{msg}',
        },
      }
    : undefined;

export const logger = pino({
  level: logLevel,
  ...(transport ? { transport } : {}),
  formatters: {
    level: (label: string) => {
      return { level: label };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});
