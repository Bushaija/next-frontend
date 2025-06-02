import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/config';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import crypto from 'crypto';

// Add password reset fields to the schema
const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('📥 Received forgot password request for email:', body.email);
    
    // Validate the request body
    const validationResult = forgotPasswordSchema.safeParse(body);
    
    if (!validationResult.success) {
      console.log('❌ Forgot password validation failed:', validationResult.error.flatten().fieldErrors);
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { email } = validationResult.data;

    // Find user by email
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    // Always return success message for security (don't reveal if email exists)
    // But only send reset token if user exists
    if (user.length > 0) {
      console.log('✅ User found, generating reset token for:', email);
      
      // Generate a secure reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now
      
      // TODO: Store reset token in database (you'll need to add these fields to your users table)
      // For now, we'll just log it - in production, you'd update the user record with:
      // resetToken, resetTokenExpiry
      
      console.log('🔐 Reset token generated:', resetToken);
      console.log('⏰ Reset token expires at:', resetTokenExpiry);
      
      // TODO: Send email with reset link
      // In production, you'd integrate with an email service like:
      // - SendGrid
      // - Nodemailer
      // - AWS SES
      // - Resend
      
      const resetLink = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
      console.log('📧 Reset link (would be sent via email):', resetLink);
      
      // You would typically save the token to the database here
      // await db.update(users)
      //   .set({ 
      //     resetToken, 
      //     resetTokenExpiry 
      //   })
      //   .where(eq(users.email, email));
    } else {
      console.log('❌ User not found with email:', email);
      // Don't reveal that user doesn't exist for security
    }

    // Always return success for security reasons
    return NextResponse.json(
      {
        message: 'If an account with that email exists, we have sent a password reset link.',
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Forgot password error:', error);
    
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'An unexpected error occurred while processing your request',
      },
      { status: 500 }
    );
  }
} 