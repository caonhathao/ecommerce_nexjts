import { getSessionUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getUserConversations } from '@/app/services/chat.service';
import { ConversationList } from '@/components/chat/conversation-list';

export default async function MessagesLayout({children}: {children: React.ReactNode}) {
  const session = await getSessionUser()
  if(!session) {
    redirect('/login')
  }

  // typescript
// test-utils/fake-conversations.ts
   type ConversationItem = {
    id: string;
    updatedAt: Date;
    lastMessage: string;
    recipient: {
      id?: string;
      name?: string | null;
      image?: string | null;
    };
  };

  const SAMPLE_NAMES = [
    'Alice Nguyen',
    'Bao Tran',
    'Camila Ruiz',
    'Daniel Park',
    'Eva Smith',
    'Felix Ho',
  ];

  const SAMPLE_MESSAGES = [
    'Hey, are we still on for tomorrow?',
    'I sent the invoice — please confirm.',
    'Thanks! That worked perfectly.',
    'Can you review the latest design?',
    'Shipping update: it has left the warehouse.',
    'Let me know when you’re free to chat.',
  ];

   function makeFakeConversations(count = 6): ConversationItem[] {
    const now = Date.now();
    return Array.from({ length: count }, (_, i) => {
      const idx = i % SAMPLE_NAMES.length;
      return {
        id: `conv-${i + 1}`,
        updatedAt: new Date(now - i * 1000 * 60 * 60 * 4), // staggered timestamps
        lastMessage: SAMPLE_MESSAGES[i % SAMPLE_MESSAGES.length],
        recipient: {
          id: `user-${i + 1}`,
          name: SAMPLE_NAMES[idx],
          // use avatar for some items, null for others to test initials fallback
          image: i % 3 === 0 ? null : `https://avatars.githubusercontent.com/u/34010622`,
        },
      };
    });
  }

// export a default sample set for quick usage in stories/tests

  const conversations = await getUserConversations(session.user.id)
  // const conversations = makeFakeConversations(26)
  console.log(`conversations: ${JSON.stringify(conversations)}
  `)

  return (
    <div className="flex h-[calc(100vh-64px)]">
      <ConversationList conversations={conversations} />
      <div className="flex-1 h-full">
        {children}
      </div>
    </div>
  )
}