export const logger = {
  info: (event: string, meta?: Record<string, any>) => {
    console.log(JSON.stringify({ timestamp: new Date().toISOString(), level: 'INFO', event, ...meta }));
  },
  warn: (event: string, meta?: Record<string, any>) => {
    console.warn(JSON.stringify({ timestamp: new Date().toISOString(), level: 'WARN', event, ...meta }));
  },
  error: (event: string, meta?: Record<string, any>) => {
    console.error(JSON.stringify({ timestamp: new Date().toISOString(), level: 'ERROR', event, ...meta }));
  },
};
