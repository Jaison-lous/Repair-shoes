import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Protect /store
    if (pathname.startsWith('/store')) {
        const storeSession = request.cookies.get('store_session');
        if (!storeSession) {
            return NextResponse.redirect(new URL('/login?role=store', request.url));
        }
    }

    // Protect /hub
    if (pathname.startsWith('/hub')) {
        const hubSession = request.cookies.get('hub_session');
        if (!hubSession) {
            return NextResponse.redirect(new URL('/login?role=hub', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/store/:path*', '/hub/:path*'],
};
