import { MessageRole } from '@/lib/generated/prisma';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, Store } from 'lucide-react';

interface MessageProps {
  content: string;
  senderRole: MessageRole;
  senderName?: string | null;
  senderImage?: string | null;
  createdAt: Date;
  isMe: boolean;
}

export function MessageBubble({
  content,
  senderRole,
  senderName,
  senderImage,
  createdAt,
  isMe,
}: MessageProps) {
  const isSystemAdmin = senderRole === MessageRole.ADMIN;
  const isShop = senderRole === MessageRole.SHOP;

  return (
    <div
      className={cn(
        'flex w-full gap-3 mb-4',
        isMe ? 'justify-end' : 'justify-start'
      )}
    >
      {/*  Avatar */}
      {!isMe && (
        <Avatar
          className={cn(
            'h-8 w-8 mt-1 border',
            isSystemAdmin && 'border-yellow-400 ring-2 ring-yellow-100'
          )}
        >
          <AvatarImage src={senderImage || ''} />
          <AvatarFallback
            className={isSystemAdmin ? 'bg-yellow-100 text-yellow-700' : ''}
          >
            {senderName?.[0]}
          </AvatarFallback>
        </Avatar>
      )}

      <div
        className={cn(
          'flex flex-col max-w-[75%]',
          isMe ? 'items-end' : 'items-start'
        )}
      >
        {!isMe && (
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-muted-foreground font-medium">
              {senderName}
            </span>

            {isSystemAdmin && (
              <Badge
                variant="outline"
                className="h-5 px-1 bg-yellow-50 text-yellow-700 border-yellow-200 gap-1"
              >
                <ShieldCheck className="w-3 h-3" /> Admin Support
              </Badge>
            )}

            {isShop && (
              <Badge
                variant="outline"
                className="h-5 px-1 bg-blue-50 text-blue-700 border-blue-200 gap-1"
              >
                <Store className="w-3 h-3" /> Seller
              </Badge>
            )}
          </div>
        )}

        <div
          className={cn(
            'px-4 py-2 text-sm shadow-sm rounded-2xl',
            isMe ? 'rounded-tr-sm' : 'rounded-tl-sm',
            // Color Logic
            isMe
              ? 'bg-primary text-primary-foreground' // My message
              : isSystemAdmin
                ? 'bg-yellow-50 border border-yellow-100 text-gray-900' // Admin message
                : 'bg-white border text-gray-900' // received
          )}
        >
          {content}
        </div>
        <span className="text-[10px] text-muted-foreground mt-1 px-1">
          {new Date(createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
    </div>
  );
}
