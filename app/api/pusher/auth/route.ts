import { getSessionUser } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { Role } from '@/lib/generated/prisma';
import { pusherServer } from '@/lib/pusher';

export async function POST(req: Request) {
  const session = await getSessionUser();

  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const data = await req.formData();
  const socketId = data.get('socket_id') as string;
  const channel = data.get('channel_name') as string;

  // private-chat-[conversationId]
  const chatPrefix = 'private-chat-';

  if (channel.startsWith(chatPrefix)) {
    const conversationId = channel.slice(chatPrefix.length);

    if (!conversationId || conversationId.length !== 36) {
      return new NextResponse('Invalid Conversation ID', { status: 400 });
    }

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
      return new NextResponse('Forbidden', { status: 403 });
    }

    const authResponse = pusherServer.authorizeChannel(socketId, channel, {
      user_id: session.user.id,
      user_info: {
        name: session.user.name,
        role: session.user.role,
      },
    });

    return NextResponse.json(authResponse);
  }

  return new NextResponse('Channel not allowed', { status: 403 });
}
