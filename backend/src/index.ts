import app from './app.js';
import { config } from './config/index.js';
import { logger } from './utils/logger.js';

const PORT = config.port;

app.listen(PORT, () => {
  logger.info('server.started', {
    port: PORT,
    environment: config.nodeEnv,
    sessionDuration: `${config.sessionDurationMinutes} minutes`,
    mentorWorkHours: `${config.mentorWorkStart} - ${config.mentorWorkEnd} IST`,
  });
  console.log(`🚀 CodeYoung Backend running on http://localhost:${PORT}`);
});
