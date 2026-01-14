'use server';

import { notificationQueue } from '../queue';
import { NotificationPayload } from '../server/notification.type';

/**
 * Enqueues a notification to be processed by the worker.
 * This is the entry point for sending notifications from the application.
 */
export async function sendNotification(payload: NotificationPayload) {
  try {
    await notificationQueue.add(payload.type, payload);
    return { success: true };
  } catch (error) {
    console.error('Failed to enqueue notification:', error);
    return { success: false, error: 'Failed to queue notification' };
  }
}
