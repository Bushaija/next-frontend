import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
  console.log('🔍 Middleware running for:', request.url);
  
  const token = request.cookies.get("auth_token");
  
  // If no token, redirect to sign-in
  if (!token) {
    console.log('🔒 No auth token found, redirecting to sign-in');
    console.log('🍪 Available cookies:', request.cookies.getAll().map(c => c.name));
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  console.log('🔑 Auth token found:', token.value.substring(0, 20) + '...');

  try {
    // Use jose for JWT verification in Edge Runtime
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || 'your-secret-key'
    );
    
    const { payload } = await jwtVerify(token.value, secret);
    
    console.log('✅ Valid token for user:', payload.email);

    // Token is valid, allow the request to continue
    const response = NextResponse.next();
    
    // Add user info to headers for downstream use
    response.headers.set('x-user-id', payload.userId as string);
    response.headers.set('x-user-email', payload.email as string);
    response.headers.set('x-user-name', payload.name as string);
    
    return response;

  } catch (error) {
    console.log('❌ Invalid or expired token:', error);
    
    // Clear the invalid token cookie and redirect to sign-in
    const response = NextResponse.redirect(new URL("/sign-in", request.url));
    response.cookies.set('auth_token', '', {
      expires: new Date(0),
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
    
    return response;
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*"
  ],
};