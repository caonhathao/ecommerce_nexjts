import { GetNotificationsDto } from '@/features/notification/notification.dto';

export const getNotifications = async (
  userId: string,
  options: GetNotificationsDto
) => {
  const { role, page, limit, isRead } = options;
  const skip = (page - 1) * limit;
};
