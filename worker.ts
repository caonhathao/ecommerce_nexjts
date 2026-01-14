import { Worker } from 'bullmq';
import { connection } from '@/lib/queue/ioredis-connection';
import { notificationDispatcher } from '@/features/notification/server/notification.dispatcher';
import { NotificationPayload } from '@/features/notification/server/notification.type';
import dotenv from 'dotenv';

dotenv.config();

const NOTIFICATION_QUEUE_NAME = 'notification-queue';

console.log('[Worker] Starting notification worker...');

const worker = new Worker<NotificationPayload>(
  NOTIFICATION_QUEUE_NAME,
  async (job) => {
    console.log(`[Worker] Processing job ${job.id}:`, job.name);
    try {
      await notificationDispatcher.notify(job.data);
      console.log(`[Worker] Job ${job.id} completed successfully`);
    } catch (error) {
      console.error(`[Worker] Job ${job.id} failed:`, error);
      throw error;
    }
  },
  {
    connection,
    concurrency: 5,
  }
);

worker.on('completed', (job) => {
  console.log(`[Worker] Job ${job.id} has completed!`);
});

worker.on('failed', (job, err) => {
  console.error(`[Worker] Job ${job?.id} has failed with ${err.message}`);
});

worker.on('error', (err) => {
  console.error('[Worker] Worker error:', err);
});

console.log('[Worker] Notification worker is ready and listening for jobs.');
