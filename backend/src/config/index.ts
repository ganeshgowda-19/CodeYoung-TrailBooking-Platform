import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from root or server dir
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  
  // Business rules configuration
  sessionDurationMinutes: parseInt(process.env.SESSION_DURATION_MINUTES || '30', 10),
  mentorWorkStart: process.env.MENTOR_WORK_START || '09:00',
  mentorWorkEnd: process.env.MENTOR_WORK_END || '21:00',
  // SMTP Real Mailer Configuration
  smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
  smtpPort: parseInt(process.env.SMTP_PORT || '587', 10),
  smtpUser: process.env.SMTP_USER || '',
  smtpPass: process.env.SMTP_PASS || '',
  smtpFrom: process.env.SMTP_FROM || '"CodeYoung 1:1 Trial Class" <noreply@codeyoung.com>',
};
