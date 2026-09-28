import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';
import { bookingService } from '../services/bookingService.js';

const MENTOR_MILESTONES: Record<string, {
  title: string;
  milestone: string;
  rating: number;
  totalSessionsCompleted: number;
  badges: string[];
}> = {
  'arjun.sharma@trialflow.demo': {
    title: 'Python AI & Robotics Lead',
    milestone: '🏆 520+ Trial Sessions • 4.98 Parent Rating • Top 1% Faculty',
    rating: 4.98,
    totalSessionsCompleted: 520,
    badges: ['🏆 500+ Sessions', '⭐ 4.98 Rating', 'Top 1% Certified'],
  },
  'priya.patel@trialflow.demo': {
    title: 'System Design & Full-Stack Specialist',
    milestone: '🏆 450+ Trial Sessions • 4.96 Parent Rating • MIT Alumna',
    rating: 4.96,
    totalSessionsCompleted: 450,
    badges: ['🏆 450+ Sessions', '⭐ 4.96 Rating', 'MIT Alumna'],
  },
  'rohan.mehta@trialflow.demo': {
    title: 'Math Olympiad & Competitive Logic',
    milestone: '🏆 610+ Trial Sessions • 4.99 Parent Rating • Gold Medalist',
    rating: 4.99,
    totalSessionsCompleted: 610,
    badges: ['🏆 600+ Sessions', '⭐ 4.99 Rating', 'Gold Medalist'],
  },
  'ananya.iyer@trialflow.demo': {
    title: 'Data Structures & Algorithmic Pacing',
    milestone: '🏆 390+ Trial Sessions • 4.95 Parent Rating • Stanford CS',
    rating: 4.95,
    totalSessionsCompleted: 390,
    badges: ['🏆 380+ Sessions', '⭐ 4.95 Rating', 'Stanford CS'],
  },
  'vikram.verma@trialflow.demo': {
    title: 'Web Development & Game Design',
    milestone: '🏆 480+ Trial Sessions • 4.97 Parent Rating • Senior Staff',
    rating: 4.97,
    totalSessionsCompleted: 480,
    badges: ['🏆 480+ Sessions', '⭐ 4.97 Rating', 'Senior Staff'],
  },
  'sneha.reddy@trialflow.demo': {
    title: 'Medical Science & Clinical Physiology',
    milestone: '🏆 340+ Trial Sessions • 4.94 Parent Rating • M.D. Educator',
    rating: 4.94,
    totalSessionsCompleted: 340,
    badges: ['🏆 340+ Sessions', '⭐ 4.94 Rating', 'M.D. Educator'],
  },
  'kavita.joshi@trialflow.demo': {
    title: 'Mental Math & K-12 STEM Foundation',
    milestone: '🏆 530+ Trial Sessions • 4.98 Parent Rating • 100% Retention',
    rating: 4.98,
    totalSessionsCompleted: 530,
    badges: ['🏆 530+ Sessions', '⭐ 4.98 Rating', '100% Retention'],
  },
  'rajesh.nair@trialflow.demo': {
    title: 'Machine Learning & Neural Networks',
    milestone: '🏆 500+ Trial Sessions • 4.96 Parent Rating • Ex-Google Lead',
    rating: 4.96,
    totalSessionsCompleted: 500,
    badges: ['🏆 500+ Sessions', '⭐ 4.96 Rating', 'Ex-Google'],
  },
  'devendra.singh@trialflow.demo': {
    title: 'Cyber Security & Microservices',
    milestone: '🏆 370+ Trial Sessions • 4.93 Parent Rating • Tech Author',
    rating: 4.93,
    totalSessionsCompleted: 370,
    badges: ['🏆 370+ Sessions', '⭐ 4.93 Rating', 'Tech Author'],
  },
  'meera.kapoor@trialflow.demo': {
    title: 'Bio-Tech & Healthcare Analytics',
    milestone: '🏆 420+ Trial Sessions • 4.97 Parent Rating • Research Fellow',
    rating: 4.97,
    totalSessionsCompleted: 420,
    badges: ['🏆 420+ Sessions', '⭐ 4.97 Rating', 'Research Fellow'],
  },
};

export async function getMentors(_req: Request, res: Response, next: NextFunction) {
  try {
    const mentors = await prisma.mentor.findMany({
      where: { isActive: true },
      include: {
        bookings: {
          where: { status: 'CONFIRMED' },
        },
      },
    });

    const enrichedMentors = mentors.map((m) => {
      const todayCount = m.bookings.length;
      const meta = MENTOR_MILESTONES[m.email] || {
        title: 'Senior EdTech Mentor',
        milestone: '🏆 300+ Trial Sessions • 4.9 Parent Rating',
        rating: 4.9,
        totalSessionsCompleted: 300,
        badges: ['🏆 300+ Sessions', '⭐ 4.9 Rating'],
      };

      let availabilityStatus = 'AVAILABLE_ZERO_SESSIONS';
      if (todayCount === 1) {
        availabilityStatus = 'AVAILABLE_ONE_SESSION';
      } else if (todayCount >= m.maxDailyClasses) {
        availabilityStatus = 'FULLY_BOOKED';
      }

      return {
        id: m.id,
        name: m.name,
        email: m.email,
        timezone: m.timezone,
        maxDailyClasses: m.maxDailyClasses,
        todayBookingsCount: todayCount,
        remainingCapacity: Math.max(0, m.maxDailyClasses - todayCount),
        isAvailable: todayCount < m.maxDailyClasses,
        availabilityStatus,
        milestone: meta.milestone,
        title: meta.title,
        rating: meta.rating,
        totalSessionsCompleted: meta.totalSessionsCompleted,
        badges: meta.badges,
      };
    });

    // Priority Sort Order required:
    // 1. Mentors with 0 sessions engaged today (FIRST)
    // 2. Mentors with 1 session engaged today (SECOND)
    // 3. Mentors with 2 sessions engaged (FULLY_BOOKED)
    enrichedMentors.sort((a, b) => {
      if (a.todayBookingsCount !== b.todayBookingsCount) {
        return a.todayBookingsCount - b.todayBookingsCount;
      }
      return b.totalSessionsCompleted - a.totalSessionsCompleted;
    });

    return res.status(200).json({
      success: true,
      data: enrichedMentors,
      error: null,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getMentorBookings(req: Request, res: Response, next: NextFunction) {
  try {
    const mentorId = req.params.mentorId;
    const data = await bookingService.getMentorBookings(mentorId);

    return res.status(200).json({
      success: true,
      data,
      error: null,
    });
  } catch (error) {
    return next(error);
  }
}
