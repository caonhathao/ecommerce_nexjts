import { getSessionUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getConversationMessages, getUserConversations } from '@/app/services/chat.service';
import { ChatArea } from '@/components/chat/chat-area';
import { Role } from '@/lib/generated/prisma';

export default async function MessagePage({params} : {params:{conversationId:string}}) {
  const {conversationId} = await params;
  const session = await getSessionUser();
  if(!session) redirect('/login');

  const messages = await getConversationMessages(conversationId);


  const conversations = await getUserConversations(session.user.id);
  const activeConv = conversations.find(c => c.id === conversationId);


  if (!activeConv) return <div>Conversation not found</div>;

  return (
    <ChatArea
      conversationId = {conversationId}
      currentUser={{id:session.user.id, globalRole: session.user.role ?? Role.user}}
      actingAs={{role:'USER'}}
      recipient={{
        name: activeConv.recipient.name || "Unknown",
        image: activeConv.recipient.image
    }}
      initialMessages={messages}
      />
  )
}