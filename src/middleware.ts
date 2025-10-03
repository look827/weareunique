import { NextResponse, type NextRequest } from 'next/server';
import { getSession } from '@/lib/auth';
import { USERS } from '@/lib/data/users';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const session = await getSession();

  const publicRoutes = ['/'];
  const isPublicRoute = publicRoutes.includes(pathname);
  const adminRoutes = ['/dashboard', '/attendance', '/goals'];

  if (session) {
    const user = USERS.find((u) => u.id === session.userId);
    // If logged in and on a public route (like login page), redirect to dashboard/my-requests
    if (isPublicRoute) {
      const url = user?.role === 'admin' ? '/dashboard' : '/my-requests';
      return NextResponse.redirect(new URL(url, request.url));
    }
    // Prevent employees from accessing admin routes
    if (adminRoutes.some(p => pathname.startsWith(p)) && user?.role !== 'admin') {
        return NextResponse.redirect(new URL('/my-requests', request.url));
    }
  } else {
    // If not logged in and not on a public route, redirect to login
    if (!isPublicRoute) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
