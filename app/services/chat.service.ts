import { prisma } from '@/lib/db';

export async function getUserConversations(
  userId: string,
  activeShopId?: string
) {
  // If activeShopId is provided, we fetch chats for that Shop.
  // Otherwise, we fetch chats for the User.

  const whereCondition = activeShopId
    ? { participants: { some: { shopId: activeShopId } } }
    : { participants: { some: { userId: userId } } };

  console.log('whereCondition:', whereCondition);

  const conversations = await prisma.conversation.findMany({
    where: whereCondition,
    include: {
      participants: {
        include: {
          user: { select: { id: true, name: true, image: true, email: true } },
          shop: { select: { id: true, name: true, logoUrl: true } },
        },
      },
      messages: {
        take: 1,
        orderBy: { createdAt: 'desc' },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  return conversations.map((conv) => {
    const otherParticipant = conv.participants.find((p) => {
      if (activeShopId) return p.shopId !== activeShopId;
      return p.userId !== userId;
    });

    // Determine name/image based on whether the other participant is a User or Shop
    const info = otherParticipant?.shop
      ? {
          name: otherParticipant.shop.name,
          image: otherParticipant.shop.logoUrl,
          id: otherParticipant.shop.id,
          type: 'SHOP',
        }
      : {
          name: otherParticipant?.user?.name,
          image: otherParticipant?.user?.image,
          id: otherParticipant?.user?.id,
          type: 'USER',
        };

    return {
      id: conv.id,
      updatedAt: conv.updatedAt,
      lastMessage: conv.messages[0]?.content || 'No messages yet',
      recipient: info,
    };
  });
}

export async function getConversationMessages(conversationId: string) {
  return prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'asc' },
    include: {
      senderUser: { select: { id: true, name: true, image: true } },
      senderShop: { select: { id: true, name: true, logoUrl: true } },
    },
  });
}
