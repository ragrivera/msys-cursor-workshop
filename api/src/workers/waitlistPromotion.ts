import { Queue, Worker } from 'bullmq';
import { promoteWaitlist } from '@/modules/participants/participants.service';
import dotenv from 'dotenv';

dotenv.config();

const connection = { url: process.env.REDIS_URL || 'redis://localhost:6379' };

export const promotionQueue = new Queue('waitlist-promotion', { connection });

// Worker processes promotion jobs
new Worker(
  'waitlist-promotion',
  async job => {
    const { appointmentId } = job.data as { appointmentId: number };
    await promoteWaitlist(appointmentId);
  },
  { connection }
);

