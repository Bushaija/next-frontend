import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db/config';
import { users, insertUserSchema } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('📥 Received registration request body:', body);
    
    // Validate the request body using insertUserSchema (without confirmPassword)
    const validationResult = insertUserSchema.safeParse(body);
    
    if (!validationResult.success) {
      console.log('❌ Validation failed:', validationResult.error.flatten().fieldErrors);
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { name, email, password, province, district, hospital } = validationResult.data;

    console.log('✅ Validation passed for user:', { name, email, province, district, hospital });

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      console.log('❌ User already exists with email:', email);
      return NextResponse.json(
        {
          error: 'User already exists',
          details: {
            email: ['An account with this email already exists'],
          },
        },
        { status: 400 }
      );
    }

    // Hash the password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    console.log('🔐 Password hashed successfully');

    // Create the user
    const newUser = await db
      .insert(users)
      .values({
        name,
        email,
        password: hashedPassword,
        province,
        district,
        hospital,
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        province: users.province,
        district: users.district,
        hospital: users.hospital,
        createdAt: users.createdAt,
      });

    console.log('🎉 User created successfully:', newUser[0]);

    return NextResponse.json(
      {
        message: 'User registered successfully',
        user: newUser[0],
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle specific database errors
    if (error instanceof Error) {
      if (error.message.includes('duplicate key') || error.message.includes('unique constraint')) {
        return NextResponse.json(
          {
            error: 'User already exists',
            details: {
              email: ['An account with this email already exists'],
            },
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'An unexpected error occurred during registration',
      },
      { status: 500 }
    );
  }
} 