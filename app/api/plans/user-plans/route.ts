import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import planningData from '@/constants/planning-data.json';

// Schema for validating the request
const UserPlansRequestSchema = z.object({
  facilityName: z.string().min(1, 'Facility name is required'),
  facilityType: z.string().min(1, 'Facility type is required'),
  district: z.string().min(1, 'District is required'),
  province: z.string().min(1, 'Province is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the request data
    const validatedData = UserPlansRequestSchema.parse(body);
    
    console.log('Fetching plans for user facility:', validatedData);
    
    // Filter plans based on user's facility information
    const userPlans = planningData.filter((plan: any) => 
      plan.facilityName === validatedData.facilityName &&
      plan.facilityType === validatedData.facilityType &&
      plan.facilityDistrict === validatedData.district &&
      plan.province === validatedData.province
    );
    
    console.log(`Found ${userPlans.length} plans for the user's facility`);
    
    return NextResponse.json({
      success: true,
      data: userPlans,
      message: `Found ${userPlans.length} plans for your facility`,
    });
    
  } catch (error) {
    console.error('Error fetching user plans:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid request data',
          errors: error.errors,
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
} 