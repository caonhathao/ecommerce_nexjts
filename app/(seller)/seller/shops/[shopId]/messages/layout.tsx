import { getSessionUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getUserOrShopConversations } from '@/app/data/chat.data';
import { ConversationList } from '@/components/chat/conversation-list';
import { getShopIdByUserId } from '@/app/data/shop.data';
import { Button } from '@/components/ui/button';
import { Link } from 'lucide-react';

export default async function MessageShopsLayout({children}: {children: React.ReactNode}) {
  const session = await getSessionUser()
  if(!session) {
    redirect('/login')
  }

  const shopId = await getShopIdByUserId(session.user.id)
  if(!shopId) redirect(
    '/seller/shops/create'
  )

  const sellerBaseUrl = `/seller/shops/${shopId}/messages`

  const conversations = await getUserOrShopConversations(session.user.id,shopId)
  return (
    <div className="flex min-h-screen">
      <ConversationList conversations={conversations} baseUrl={sellerBaseUrl} />
      <div className="flex-1 h-full">
        {children}
      </div>
    </div>
  )
}