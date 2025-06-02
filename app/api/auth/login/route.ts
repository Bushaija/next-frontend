import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db/config';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import jwt from 'jsonwebtoken';

// Login schema
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('📥 Received login request for email:', body.email);
    
    // Validate the request body
    const validationResult = loginSchema.safeParse(body);
    
    if (!validationResult.success) {
      console.log('❌ Login validation failed:', validationResult.error.flatten().fieldErrors);
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { email, password } = validationResult.data;

    // Find user by email
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (user.length === 0) {
      console.log('❌ User not found with email:', email);
      return NextResponse.json(
        {
          error: 'Invalid credentials',
          details: {
            email: ['Invalid email or password'],
          },
        },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user[0].password);

    if (!isPasswordValid) {
      console.log('❌ Invalid password for user:', email);
      return NextResponse.json(
        {
          error: 'Invalid credentials',
          details: {
            password: ['Invalid email or password'],
          },
        },
        { status: 401 }
      );
    }

    console.log('✅ User authenticated successfully:', user[0].email);

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user[0].id, 
        email: user[0].email,
        name: user[0].name 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    console.log('🔐 JWT token generated for user:', user[0].email);

    // Return user data and token
    const userData = {
      id: user[0].id,
      name: user[0].name,
      email: user[0].email,
      province: user[0].province,
      district: user[0].district,
      hospital: user[0].hospital,
      createdAt: user[0].createdAt,
    };

    // Create response with user data and token
    const response = NextResponse.json(
      {
        message: 'Login successful',
        user: userData,
        token,
      },
      { status: 200 }
    );

    // Set HTTP-only cookie for middleware authentication
    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
      domain: process.env.NODE_ENV === 'production' ? undefined : 'localhost',
    });

    console.log('🍪 Auth cookie set for user:', user[0].email);
    console.log('🔧 Cookie settings:', {
      name: 'auth_token',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
      domain: process.env.NODE_ENV === 'production' ? undefined : 'localhost',
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'An unexpected error occurred during login',
      },
      { status: 500 }
    );
  }
} 