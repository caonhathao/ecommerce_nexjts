import {auth} from '@/lib/auth';
import {headers} from 'next/headers';
import {NextRequest, NextResponse} from 'next/server';

export function withAuth(
    handler: (userId: string, request: NextRequest) => Promise<NextResponse>
) {
    return async function (request: NextRequest) {
        // const session = await getServerSession(authOptions);
        // const userId = session?.user?.id;
        const userId = "60a66e52-ebbe-40e5-9a74-f5a013ffb6ee"; // ✅ Dùng tạm để test

        if (!userId) {
            return NextResponse.json({error: 'Unauthorized'}, {status: 401});
        }

        // ✅ Gọi handler với userId và request
        return handler(userId, request);
    };
}
