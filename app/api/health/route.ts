import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🏥 Health check requested');
    
    return NextResponse.json({
      success: true,
      message: 'API is healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown'
    });
  } catch (error) {
    console.error('💥 Health check failed:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Health check failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 