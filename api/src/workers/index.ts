import { promotionQueue } from './waitlistPromotion';

// Enqueue periodic jobs every minute
setInterval(async () => {
  // This could inspect appointments but for simplicity schedule job for all future appointment IDs.
  // Assume appointments with id 1..100 for now (demo)
  for (let id = 1; id <= 100; id++) {
    await promotionQueue.add(
      'promote',
      { appointmentId: id },
      { jobId: `appointment-${id}` }
    );
  }
}, 60 * 1000);

console.log('Waitlist promotion worker started');
