import { PrismaClient } from '@prisma/client';
import { DateTime } from 'luxon';

const prisma = new PrismaClient();

const BookingStatus = {
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
} as const;

const INITIAL_MENTORS = [
  { name: 'Arjun Sharma', email: 'arjun.sharma@trialflow.demo', timezone: 'America/New_York', maxDailyClasses: 2 },
  { name: 'Priya Patel', email: 'priya.patel@trialflow.demo', timezone: 'Europe/London', maxDailyClasses: 2 },
  { name: 'Rohan Mehta', email: 'rohan.mehta@trialflow.demo', timezone: 'Asia/Kolkata', maxDailyClasses: 2 },
  { name: 'Ananya Iyer', email: 'ananya.iyer@trialflow.demo', timezone: 'America/Los_Angeles', maxDailyClasses: 2 },
  { name: 'Vikram Verma', email: 'vikram.verma@trialflow.demo', timezone: 'Asia/Singapore', maxDailyClasses: 2 },
  { name: 'Sneha Reddy', email: 'sneha.reddy@trialflow.demo', timezone: 'America/Chicago', maxDailyClasses: 2 },
  { name: 'Kavita Joshi', email: 'kavita.joshi@trialflow.demo', timezone: 'Europe/Berlin', maxDailyClasses: 2 },
  { name: 'Rajesh Nair', email: 'rajesh.nair@trialflow.demo', timezone: 'Australia/Sydney', maxDailyClasses: 2 },
  { name: 'Devendra Singh', email: 'devendra.singh@trialflow.demo', timezone: 'America/Toronto', maxDailyClasses: 2 },
  { name: 'Meera Kapoor', email: 'meera.kapoor@trialflow.demo', timezone: 'Asia/Dubai', maxDailyClasses: 2 },
];

async function main() {
  console.log('🌱 Starting TrialFlow Database Seed...');

  // 1. Seed Mentors idempotently
  const createdMentors = [];
  for (const m of INITIAL_MENTORS) {
    const mentor = await prisma.mentor.upsert({
      where: { email: m.email },
      update: {
        name: m.name,
        timezone: m.timezone,
        maxDailyClasses: m.maxDailyClasses,
        isActive: true,
      },
      create: {
        name: m.name,
        email: m.email,
        timezone: m.timezone,
        maxDailyClasses: m.maxDailyClasses,
        isActive: true,
      },
    });
    createdMentors.push(mentor);
  }

  console.log(`✅ Seeded ${createdMentors.length} mentors.`);

  // 2. Create sample parents idempotently
  let parent1 = await prisma.parent.findFirst({ where: { email: 'sarah.jenkins@example.com' } });
  if (!parent1) {
    parent1 = await prisma.parent.create({
      data: {
        name: 'Sarah Jenkins',
        email: 'sarah.jenkins@example.com',
        timezone: 'America/New_York',
      },
    });
  }

  let parent2 = await prisma.parent.findFirst({ where: { email: 'david.miller@example.com' } });
  if (!parent2) {
    parent2 = await prisma.parent.create({
      data: {
        name: 'David Miller',
        email: 'david.miller@example.com',
        timezone: 'Europe/London',
      },
    });
  }

  let parent3 = await prisma.parent.findFirst({ where: { email: 'elena.rostova@example.com' } });
  if (!parent3) {
    parent3 = await prisma.parent.create({
      data: {
        name: 'Elena Rostova',
        email: 'elena.rostova@example.com',
        timezone: 'America/Los_Angeles',
      },
    });
  }

  // 3. Create sample bookings idempotently for Today
  const todayInKolkata = DateTime.now().setZone('Asia/Kolkata').toISODate();
  
  const slot1StartUtc = DateTime.fromISO(`${todayInKolkata}T10:00:00`, { zone: 'Asia/Kolkata' }).toJSDate();
  const slot1EndUtc = DateTime.fromISO(`${todayInKolkata}T10:30:00`, { zone: 'Asia/Kolkata' }).toJSDate();

  const slot2StartUtc = DateTime.fromISO(`${todayInKolkata}T11:00:00`, { zone: 'Asia/Kolkata' }).toJSDate();
  const slot2EndUtc = DateTime.fromISO(`${todayInKolkata}T11:30:00`, { zone: 'Asia/Kolkata' }).toJSDate();

  await prisma.booking.upsert({
    where: { bookingReference: 'TF-SEED01' },
    update: {
      parentId: parent1.id,
      mentorId: createdMentors[0].id,
      startTimeUtc: slot1StartUtc,
      endTimeUtc: slot1EndUtc,
      parentTimezone: parent1.timezone,
      mentorTimezone: createdMentors[0].timezone,
      status: BookingStatus.CONFIRMED,
      classLink: '/class/TF-SEED01',
    },
    create: {
      bookingReference: 'TF-SEED01',
      parentId: parent1.id,
      mentorId: createdMentors[0].id,
      startTimeUtc: slot1StartUtc,
      endTimeUtc: slot1EndUtc,
      parentTimezone: parent1.timezone,
      mentorTimezone: createdMentors[0].timezone,
      status: BookingStatus.CONFIRMED,
      classLink: '/class/TF-SEED01',
    },
  });

  await prisma.booking.upsert({
    where: { bookingReference: 'TF-SEED02' },
    update: {
      parentId: parent2.id,
      mentorId: createdMentors[0].id,
      startTimeUtc: slot2StartUtc,
      endTimeUtc: slot2EndUtc,
      parentTimezone: parent2.timezone,
      mentorTimezone: createdMentors[0].timezone,
      status: BookingStatus.CONFIRMED,
      classLink: '/class/TF-SEED02',
    },
    create: {
      bookingReference: 'TF-SEED02',
      parentId: parent2.id,
      mentorId: createdMentors[0].id,
      startTimeUtc: slot2StartUtc,
      endTimeUtc: slot2EndUtc,
      parentTimezone: parent2.timezone,
      mentorTimezone: createdMentors[0].timezone,
      status: BookingStatus.CONFIRMED,
      classLink: '/class/TF-SEED02',
    },
  });

  if (parent3 && createdMentors[1]) {
    await prisma.booking.upsert({
      where: { bookingReference: 'TF-SEED03' },
      update: {
        parentId: parent3.id,
        mentorId: createdMentors[1].id,
        startTimeUtc: slot1StartUtc,
        endTimeUtc: slot1EndUtc,
        parentTimezone: parent3.timezone,
        mentorTimezone: createdMentors[1].timezone,
        status: BookingStatus.CONFIRMED,
        classLink: '/class/TF-SEED03',
      },
      create: {
        bookingReference: 'TF-SEED03',
        parentId: parent3.id,
        mentorId: createdMentors[1].id,
        startTimeUtc: slot1StartUtc,
        endTimeUtc: slot1EndUtc,
        parentTimezone: parent3.timezone,
        mentorTimezone: createdMentors[1].timezone,
        status: BookingStatus.CONFIRMED,
        classLink: '/class/TF-SEED03',
      },
    });
  }

  console.log('✅ Seeded sample bookings demonstrating capacity limits and timezones.');
  console.log('🎉 Seed complete successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
