import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('📤 Processing logout request');
    
    // Create response
    const response = NextResponse.json(
      {
        message: 'Logout successful',
      },
      { status: 200 }
    );

    // Clear the auth cookie
    response.cookies.set({
      name: 'auth_token',
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // Expire immediately
      path: '/',
    });

    console.log('🍪 Auth cookie cleared');

    return response;

  } catch (error) {
    console.error('Logout error:', error);
    
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'An unexpected error occurred during logout',
      },
      { status: 500 }
    );
  }
} 