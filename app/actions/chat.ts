'use server';

import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { ConversationType, MessageRole, Role } from '@/lib/generated/prisma';
import { pusherServer } from '@/lib/pusher';

export async function sendMessage(
  conversationId: string,
  content: string,
  senderRole: MessageRole,
  shopId?: string
) {
  const session = await getSessionUser();
  if (!session) throw new Error('Unauthorized');

  const participant = await prisma.conversationParticipant.findFirst({
    where: {
      conversationId,
      OR: [
        { userId: session.user.id },
        // participant linked to a shop owned by the current user
        { shop: { ownerId: session.user.id } },
        // participant linked to a shop where current user is a member
        { shop: { members: { some: { userId: session.user.id } } } },
      ],
    },
  });

  if (!participant && session.user.role !== Role.admin) {
    throw new Error('You are not part of this conversation');
  }

  let finalUserId = null;
  let finalShopId = null;

  if (senderRole === MessageRole.ADMIN) {
    if (session.user.role !== Role.admin) {
      throw new Error('You are not authorized to send messages as admin');
    }
    finalUserId = session.user.id;
  } else if (senderRole === MessageRole.SHOP) {
    if (!shopId) throw new Error('ShopId is required for shop sender');

    const membership = await prisma.shopMember.findUnique({
      where: {
        shopId_userId: { shopId, userId: session.user.id },
      },
    });

    const shop = await prisma.shop.findUnique({ where: { id: shopId } });
    const isOwner = shop?.ownerId === session.user.id;
    if (!membership && !isOwner) {
      throw new Error('You are not authorized to send messages as shop member');
    }
    finalShopId = shopId;
  } else {
    // Default: USER
    finalUserId = session.user.id;
  }

  const message = await prisma.message.create({
    data: {
      conversationId,
      content,
      type: 'TEXT',
      senderRole,
      senderUserId: finalUserId,
      senderShopId: finalShopId,
    },
    include: {
      senderUser: { select: { name: true, image: true } },
      senderShop: { select: { name: true, logoUrl: true } },
    },
  });

  await prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  });

  await pusherServer.trigger(
    `private-chat-${conversationId}`,
    'new-message',
    message
  );

  return message;
}

export async function startConversation(
  type: ConversationType,
  targetId?: string, // shopId (for order inquiry) or null (for admin support)
  orderId?: string
) {
  const session = await getSessionUser();
  if (!session) throw new Error('Unauthorized');

  if (type === 'ORDER_INQUIRY' && !targetId)
    throw new Error('ShopId is required for order inquiry');

  if (type === 'ORDER_INQUIRY') {
    const existing = await prisma.conversation.findFirst({
      where: {
        type: ConversationType.ORDER_INQUIRY,
        shopId: targetId,
        participants: { some: { userId: session.user.id } },
      },
    });

    if (existing) return existing.id;

    const conversation = await prisma.conversation.create({
      data: {
        type: ConversationType.ORDER_INQUIRY,
        shopId: targetId,
        orderId: orderId,
        participants: {
          create: [{ userId: session.user.id }, { shopId: targetId }],
        },
      },
    });

    return conversation.id;
  }

  // Logic for Support (User/Shop -> Admin)
  if (type === ConversationType.SUPPORT_TICKET) {
    const conversation = await prisma.conversation.create({
      data: {
        type: ConversationType.SUPPORT_TICKET,
        participants: {
          create: [{ userId: session.user.id }],
        },
      },
    });
    return conversation.id;
  }
}
