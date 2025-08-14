import { db } from '@/database';
import { getRemainingCapacity } from '@/modules/appointments/appointments.service';

describe('AppointmentService', () => {
  beforeAll(async () => {
    // ensure DB seeded
  });

  afterAll(async () => {
    await db.destroy();
  });

  it('should return remaining capacity as a number', async () => {
    const remaining = await getRemainingCapacity(1);
    expect(typeof remaining).toBe('number');
  });
});
