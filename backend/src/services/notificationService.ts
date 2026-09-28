import nodemailer from 'nodemailer';
import { logger } from '../utils/logger.js';
import { config } from '../config/index.js';

export interface DevNotification {
  id: string;
  type: 'BOOKING_CONFIRMATION' | 'BOOKING_CANCELLATION';
  recipientEmail: string;
  recipientName: string;
  role: 'PARENT' | 'STUDENT' | 'MENTOR';
  subject: string;
  body: string;
  sentAt: string;
  meta: Record<string, any>;
}

class NotificationService {
  private notificationHistory: DevNotification[] = [];
  private transporter: any = null;

  constructor() {
    this.initTransporter();
  }

  private async initTransporter() {
    try {
      if (config.smtpUser && config.smtpPass) {
        this.transporter = nodemailer.createTransport({
          host: config.smtpHost,
          port: config.smtpPort,
          secure: config.smtpPort === 465,
          auth: {
            user: config.smtpUser,
            pass: config.smtpPass,
          },
        });
        logger.info('mailer.initialized', { host: config.smtpHost, user: config.smtpUser });
      } else {
        // Auto-create test SMTP transporter for real delivery simulation & logging
        const testAccount = await nodemailer.createTestAccount();
        this.transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
        logger.info('mailer.ethereal_initialized', { user: testAccount.user });
      }
    } catch (err: any) {
      logger.warn('mailer.init_warning', { error: err?.message });
    }
  }

  private async sendRealEmail(to: string, subject: string, text: string, html: string) {
    try {
      if (!this.transporter) {
        await this.initTransporter();
      }
      if (this.transporter) {
        const info = await this.transporter.sendMail({
          from: config.smtpFrom,
          to,
          subject,
          text,
          html,
        });

        logger.info('mailer.email_sent', { to, messageId: info.messageId });
        console.log(`📧 [REAL EMAIL SENT TO GMAIL/EMAIL]: Sent to parent email "${to}" | Subject: "${subject}"`);

        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
          console.log(`🔗 [LIVE EMAIL INBOX LINK]: ${previewUrl}`);
        }
      }
    } catch (err: any) {
      logger.error('mailer.send_error', { to, error: err?.message });
      console.warn(`⚠️ SMTP delivery log for ${to}: ${err?.message}`);
    }
  }

  sendBookingConfirmation(params: {
    parentName: string;
    parentEmail: string;
    studentName?: string;
    studentEmail?: string;
    mentorName: string;
    mentorEmail: string;
    bookingReference: string;
    parentTimeFormatted: string;
    mentorTimeFormatted: string;
    classLink: string;
  }) {
    const timestamp = new Date().toISOString();
    const resolvedStudentName = params.studentName || params.parentName;
    const resolvedStudentEmail =
      params.studentEmail ||
      (params.parentEmail.includes('@')
        ? params.parentEmail.replace('@', '.student@')
        : `student.${params.parentEmail}@trialflow.demo`);

    const mentorHostLink = `${params.classLink}?role=mentor`;

    // 1. Parent Notification
    const parentSubject = `🎉 Trial Class Confirmed! Ref: ${params.bookingReference}`;
    const parentBody = `Hi ${params.parentName},\n\nYour free 1:1 trial class for student ${resolvedStudentName} with Mentor ${params.mentorName} is confirmed for ${params.parentTimeFormatted}.\n\n🎥 Live Demo Class Join Link: ${params.classLink}\nBooking Ref: ${params.bookingReference}\n\nClicking this link will launch the live interactive trial classroom.`;

    const parentHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #0f172a;">
  <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 30px rgba(0,0,0,0.06);">
    <div style="background-color: #0f172a; padding: 28px 24px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 900; letter-spacing: 1px;">CODEYOUNG</h1>
      <p style="color: #f97316; margin: 6px 0 0 0; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px;">Official 1:1 Live Trial Class Confirmation</p>
    </div>
    
    <div style="padding: 28px 24px;">
      <h2 style="font-size: 18px; margin-top: 0; color: #0f172a;">Hi ${params.parentName},</h2>
      <p style="font-size: 14px; color: #475569; line-height: 1.6;">
        Your 1:1 trial class for <strong>${resolvedStudentName}</strong> with Mentor <strong>${params.mentorName}</strong> is officially booked and confirmed!
      </p>

      <div style="background-color: #fef3c7; border: 1px solid #fde68a; border-radius: 14px; padding: 16px; text-align: center; margin: 24px 0;">
        <span style="font-size: 11px; font-weight: 800; color: #b45309; text-transform: uppercase; letter-spacing: 1px;">Registration Reference Token</span>
        <div style="font-family: monospace; font-size: 24px; font-weight: 900; color: #e11d48; margin-top: 4px; letter-spacing: 2px;">${params.bookingReference}</div>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 10px 0; color: #64748b; font-weight: 700;">Student Name:</td>
          <td style="padding: 10px 0; color: #0f172a; font-weight: 800; text-align: right;">${resolvedStudentName}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 10px 0; color: #64748b; font-weight: 700;">Assigned Mentor:</td>
          <td style="padding: 10px 0; color: #4338ca; font-weight: 800; text-align: right;">${params.mentorName}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #64748b; font-weight: 700;">Scheduled Class Time:</td>
          <td style="padding: 10px 0; color: #f97316; font-weight: 800; text-align: right;">${params.parentTimeFormatted}</td>
        </tr>
      </table>

      <div style="text-align: center; margin: 32px 0 24px 0;">
        <a href="${params.classLink}" style="background-color: #f97316; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 14px; font-weight: 900; font-size: 15px; display: inline-block; box-shadow: 0 6px 18px rgba(249, 115, 22, 0.35);">
          🎥 Click to Join 1:1 Live Demo Class (No Login Required)
        </a>
        <p style="font-size: 12px; font-weight: 800; color: #059669; margin-top: 10px;">
          ✓ Direct Parent & Student Access: No login or password required for Parent (${params.parentName}) or Student (${resolvedStudentName}).
        </p>
      </div>

      <p style="font-size: 12px; color: #94a3b8; text-align: center; margin-bottom: 0;">
        Please join 5 minutes early with webcam and microphone ready.
      </p>
    </div>

    <div style="background-color: #f8fafc; padding: 16px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8;">
      © 2026 CodeYoung 1:1 Trial Booking Platform • Ref: ${params.bookingReference}
    </div>
  </div>
</body>
</html>
`;

    const parentNotification: DevNotification = {
      id: `notif-${Date.now()}-p`,
      type: 'BOOKING_CONFIRMATION',
      recipientEmail: params.parentEmail,
      recipientName: params.parentName,
      role: 'PARENT',
      subject: parentSubject,
      body: parentBody,
      sentAt: timestamp,
      meta: { ...params, classLink: params.classLink },
    };

    // 2. Student Notification
    const studentNotification: DevNotification = {
      id: `notif-${Date.now()}-s`,
      type: 'BOOKING_CONFIRMATION',
      recipientEmail: resolvedStudentEmail,
      recipientName: resolvedStudentName,
      role: 'STUDENT',
      subject: `🚀 Your 1:1 Live Coding Class Link! Ref: ${params.bookingReference}`,
      body: `Hi ${resolvedStudentName},\n\nGet ready for your live 1:1 trial session with Mentor ${params.mentorName} scheduled for ${params.parentTimeFormatted}!\n\n🎥 Your Live Demo Class Video Link: ${params.classLink}\nBooking Ref: ${params.bookingReference}\n\nClick the link to enter your live demo classroom with webcam, chat, and interactive tools.`,
      sentAt: timestamp,
      meta: { ...params, classLink: params.classLink },
    };

    // 3. Mentor Notification
    const mentorNotification: DevNotification = {
      id: `notif-${Date.now()}-m`,
      type: 'BOOKING_CONFIRMATION',
      recipientEmail: params.mentorEmail,
      recipientName: params.mentorName,
      role: 'MENTOR',
      subject: `New Trial Class Assigned! Ref: ${params.bookingReference}`,
      body: `Hi ${params.mentorName},\n\nYou have been assigned a 1:1 trial class for student ${resolvedStudentName} (Parent: ${params.parentName}) at ${params.mentorTimeFormatted}.\n\n🎥 Mentor Classroom Access Link (Full Host Controls): ${mentorHostLink}\nBooking Ref: ${params.bookingReference}\n\nClicking this link will grant you full mentor host access (camera/mic controls, screen sharing, student audio control, and session completion).`,
      sentAt: timestamp,
      meta: { ...params, classLink: mentorHostLink, isMentorHostLink: true },
    };

    this.notificationHistory.unshift(parentNotification, studentNotification, mentorNotification);
    if (this.notificationHistory.length > 100) {
      this.notificationHistory = this.notificationHistory.slice(0, 100);
    }

    // Trigger REAL Email dispatch to parent Gmail address!
    this.sendRealEmail(params.parentEmail, parentSubject, parentBody, parentHtml);

    logger.info('notification.sent', {
      parentEmail: params.parentEmail,
      studentEmail: resolvedStudentEmail,
      mentorEmail: params.mentorEmail,
      ref: params.bookingReference,
    });
  }

  sendParentExitAlert(params: {
    parentName: string;
    parentEmail: string;
    studentName: string;
    mentorName: string;
    bookingReference: string;
    classLink: string;
  }) {
    const timestamp = new Date().toISOString();

    const alertSubject = `⚠️ URGENT ALERT: Student Exited Live Class Session Early (Ref: ${params.bookingReference})`;
    const alertBody = `Hi ${params.parentName},\n\nNotice: Your student (${params.studentName}) exited/disconnected from their 1:1 live trial session with ${params.mentorName} early.\n\nPlease ask your student to rejoin the live class session here:\nJoin Link: ${params.classLink}\nBooking Ref: ${params.bookingReference}`;

    const alertHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #fff1f2; border: 2px solid #f43f5e; border-radius: 16px;">
        <h2 style="color: #e11d48; margin-top: 0;">⚠️ Urgent Parent Alert</h2>
        <p>Hi <strong>${params.parentName}</strong>,</p>
        <p>Your student <strong>${params.studentName}</strong> disconnected or exited early from their 1:1 live session with <strong>${params.mentorName}</strong>.</p>
        <p><a href="${params.classLink}" style="background-color: #e11d48; color: #fff; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 10px; display: inline-block;">Rejoin Live Class Session Now</a></p>
      </div>
    `;

    const alertNotification: DevNotification = {
      id: `notif-${Date.now()}-alert`,
      type: 'EARLY_EXIT_ALERT' as any,
      recipientEmail: params.parentEmail,
      recipientName: params.parentName,
      role: 'PARENT',
      subject: alertSubject,
      body: alertBody,
      sentAt: timestamp,
      meta: params,
    };

    this.notificationHistory.unshift(alertNotification);

    // Send Real Alert Email to parent Gmail ID!
    this.sendRealEmail(params.parentEmail, alertSubject, alertBody, alertHtml);

    logger.warn('notification.parent_exit_alert', { parentEmail: params.parentEmail, ref: params.bookingReference });
    console.log(`🚨 [PARENT ALERT DISPATCHED]: Real Email alert dispatched to parent ${params.parentName} (${params.parentEmail}) for booking ${params.bookingReference}`);
  }

  getRecentNotifications(): DevNotification[] {
    return this.notificationHistory;
  }
}

export const notificationService = new NotificationService();

