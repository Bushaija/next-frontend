import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Schema for validating the check request
const checkPlanSchema = z.object({
  facilityName: z.string().min(1, "Facility name is required"),
  facilityType: z.string().min(1, "Facility type is required"),
  program: z.string().min(1, "Program is required"),
  fiscalYear: z.string().min(1, "Fiscal year is required"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('📋 Checking existing plan for:', body);
    
    // Validate the request body
    const validationResult = checkPlanSchema.safeParse(body);
    
    if (!validationResult.success) {
      console.log('❌ Plan check validation failed:', validationResult.error.flatten().fieldErrors);
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { facilityName, facilityType, program, fiscalYear } = validationResult.data;

    // TODO: Replace this with actual database query
    // For now, we'll simulate checking against existing plans
    // In a real implementation, you would query your plans table like:
    // const existingPlan = await db
    //   .select()
    //   .from(plans)
    //   .where(
    //     and(
    //       eq(plans.facilityName, facilityName),
    //       eq(plans.facilityType, facilityType),
    //       eq(plans.program, program),
    //       eq(plans.fiscalYear, fiscalYear)
    //     )
    //   )
    //   .limit(1);

    // Simulate some existing plans for demonstration
    const mockExistingPlans = [
      {
        facilityName: "Butaro Hospital",
        facilityType: "Hospital",
        program: "HIV",
        fiscalYear: "FY 2024",
      },
      {
        facilityName: "Kigali Hospital",
        facilityType: "Hospital", 
        program: "TB",
        fiscalYear: "FY 2025",
      }
    ];

    // Check if plan already exists
    const planExists = mockExistingPlans.some(plan => 
      plan.facilityName.toLowerCase() === facilityName.toLowerCase() &&
      plan.facilityType.toLowerCase() === facilityType.toLowerCase() &&
      plan.program.toLowerCase() === program.toLowerCase() &&
      plan.fiscalYear === fiscalYear
    );

    if (planExists) {
      console.log('⚠️ Plan already exists for:', { facilityName, facilityType, program, fiscalYear });
      return NextResponse.json(
        {
          exists: true,
          message: `A plan already exists for ${program} program at ${facilityName} for ${fiscalYear}`,
        },
        { status: 200 }
      );
    }

    console.log('✅ No existing plan found, can proceed');
    return NextResponse.json(
      {
        exists: false,
        message: 'Plan can be created',
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error checking existing plan:', error);
    
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'An unexpected error occurred while checking existing plans',
      },
      { status: 500 }
    );
  }
} 