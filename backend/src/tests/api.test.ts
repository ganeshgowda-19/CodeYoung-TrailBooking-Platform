import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { DateTime } from 'luxon';

describe('TrialFlow Express REST API Endpoints', () => {
  it('GET /api/health should return UP status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.app).toBe('CodeYoung API');
  });

  it('GET /api/timezones should return list of supported IANA timezones', async () => {
    const res = await request(app).get('/api/timezones');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.some((tz: any) => tz.identifier === 'America/New_York')).toBe(true);
  });

  it('GET /api/mentors should return list of mentors', async () => {
    const res = await request(app).get('/api/mentors');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('GET /api/slots should return slots formatted in parent timezone', async () => {
    const tomorrowStr = DateTime.now().plus({ days: 1 }).setZone('America/New_York').toISODate()!;
    const res = await request(app).get(`/api/slots?date=${tomorrowStr}&timezone=America/New_York`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.slots.length).toBeGreaterThan(0);
    expect(res.body.data.slots[0].displayTime).toBeDefined();
  });

  it('GET /api/admin/dashboard should return dashboard metrics', async () => {
    const res = await request(app).get('/api/admin/dashboard');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.overview.totalMentors).toBeGreaterThan(0);
  });
});
