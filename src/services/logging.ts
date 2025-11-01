type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const ENABLED = (import.meta.env.VITE_LOGGING ?? 'true') !== 'false';

function log(level: LogLevel, message: string, meta?: Record<string, unknown>) {
  if (!ENABLED) return;
  const payload = { level, message, meta, ts: new Date().toISOString() };
  // eslint-disable-next-line no-console
  console[level === 'debug' ? 'log' : level](payload);
}

export const logger = {
  debug: (m: string, meta?: Record<string, unknown>) => log('debug', m, meta),
  info: (m: string, meta?: Record<string, unknown>) => log('info', m, meta),
  warn: (m: string, meta?: Record<string, unknown>) => log('warn', m, meta),
  error: (m: string, meta?: Record<string, unknown>) => log('error', m, meta),
};

export function track(event: string, props?: Record<string, unknown>) {
  if ((import.meta.env.VITE_ANALYTICS ?? 'false') === 'true') {
    logger.info('analytics', { event, props });
  }
}

