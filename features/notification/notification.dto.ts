import { NotificationRole, NotificationType } from '@/lib/generated/prisma';
import { z } from 'zod';

/**
 * Validator for GET /api/notifications query parameters
 * Using z.coerce to handle string-to-number/boolean conversions from URL search params
 */
export const GetNotificationsSchema = z.object({
  role: z.nativeEnum(NotificationRole).default(NotificationRole.BUYER),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  isRead: z
    .enum(['true', 'false'])
    .optional()
    .transform((val) => val === 'true'),
});

/**
 * Validator for PATCH /api/notifications body
 * Used for marking single or all notifications as read
 */
export const UpdateNotificationSchema = z
  .object({
    id: z.string().uuid().optional(),
    markAll: z.boolean().optional(),
    role: z.nativeEnum(NotificationRole).optional(),
  })
  .refine((data) => data.id || (data.markAll && data.role), {
    message: "Either 'id' must be provided, or 'markAll' with 'role'.",
    path: ['id'], // Error will attach to 'id' field
  });

export type GetNotificationsDto = z.infer<typeof GetNotificationsSchema>;
export type UpdateNotificationDto = z.infer<typeof UpdateNotificationSchema>;

/**
 * Standard Notification shape sent to the frontend.
 * We omit sensitive internal DB fields if any exist.
 */
export interface NotificationResponseDto {
  id: string;
  title: string;
  body: string;
  type: NotificationType;
  recipientRole: NotificationRole;
  isRead: boolean;
  image: string | null;
  referenceId: string | null;
  referenceType: string | null;
  metadata: Record<string, any> | null;
  createdAt: Date;
}

/**
 * Wrapper for the Paginated API Response
 * This matches your ResponseFactory.paginated<T> generic
 */
export type NotificationListResponse = NotificationResponseDto[];
