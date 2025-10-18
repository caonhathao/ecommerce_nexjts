import {auth} from '@/lib/auth';
import {headers} from 'next/headers';
import {NextRequest, NextResponse} from 'next/server';

export function withAuth<
    T extends (...args: any[]) => Promise<NextResponse>
>(
    handler: (userId: string, ...args: Parameters<T>) => ReturnType<T>
) {
    return async function (...args: Parameters<T>) {
        const req = args[0] as NextRequest;
        const session = await auth.api.getSession({headers: await headers()});
        const userId = session?.user?.id;

        if (!userId) {
            return NextResponse.json({error: 'Unauthorized'}, {status: 401});
        }

        return handler(userId, ...args);
    };
}

