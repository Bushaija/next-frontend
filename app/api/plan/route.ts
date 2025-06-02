import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from "@/lib/db/config";
import { 
  plans, 
  activities, 
  planStatusHistory,
  insertPlanSchema,
  insertActivitySchema 
} from "@/lib/db/schema";
import { eq, and, desc, count } from "drizzle-orm";

// Request schemas
const createPlanSchema = insertPlanSchema;
const activitySchema = insertActivitySchema;

// Helper function to calculate amounts
function calculateAmounts(activity: z.infer<typeof activitySchema>) {
  const amounts = {
    amountQ1: activity.frequency * activity.unitCost * activity.countQ1,
    amountQ2: activity.frequency * activity.unitCost * activity.countQ2,
    amountQ3: activity.frequency * activity.unitCost * activity.countQ3,
    amountQ4: activity.frequency * activity.unitCost * activity.countQ4,
  };
  
  const totalBudget = amounts.amountQ1 + amounts.amountQ2 + amounts.amountQ3 + amounts.amountQ4;
  
  return { ...amounts, totalBudget };
}

// Helper function to generate plan ID
async function generatePlanId() {
  const year = new Date().getFullYear();
  const planCount = await db.select({ count: count() }).from(plans);
  const nextNumber = (planCount[0]?.count || 0) + 1;
  return `plan-${year}-${nextNumber.toString().padStart(3, '0')}`;
}

export async function POST(request: NextRequest) {
  try {
    console.log("📝 Creating new activity plan...");
    
    const body = await request.json();
    console.log("📄 Received data:", JSON.stringify(body, null, 2));

    // Validate the request body
    const validation = insertPlanSchema.safeParse(body);
    if (!validation.success) {
      console.error("❌ Validation failed:", validation.error.format());
      return NextResponse.json({
        success: false,
        errors: validation.error.format(),
        message: "Validation failed"
      }, { status: 400 });
    }

    const validatedData = validation.data;
    const planId = crypto.randomUUID();
    const humanReadablePlanId = await generatePlanId();

    console.log("✅ Data validated successfully");
    console.log("🆔 Generated plan ID:", planId);
    console.log("🏷️ Human readable plan ID:", humanReadablePlanId);

    // Calculate plan totals
    const planActivities = validatedData.activities || [];
    let totalBudget = 0;
    let totalAmountQ1 = 0;
    let totalAmountQ2 = 0;
    let totalAmountQ3 = 0;
    let totalAmountQ4 = 0;

    // Calculate totals from activities
    planActivities.forEach(activity => {
      const freq = activity.frequency || 1;
      const cost = activity.unitCost || 0;
      const q1 = (activity.countQ1 || 0) * freq * cost;
      const q2 = (activity.countQ2 || 0) * freq * cost;
      const q3 = (activity.countQ3 || 0) * freq * cost;
      const q4 = (activity.countQ4 || 0) * freq * cost;

      totalAmountQ1 += q1;
      totalAmountQ2 += q2;
      totalAmountQ3 += q3;
      totalAmountQ4 += q4;
      totalBudget += q1 + q2 + q3 + q4;
    });

    console.log("💰 Calculated totals:", {
      totalBudget,
      totalAmountQ1,
      totalAmountQ2,
      totalAmountQ3,
      totalAmountQ4,
      activitiesCount: planActivities.length
    });

    // Since neon-http doesn't support transactions, we'll do sequential operations
    // with manual cleanup on errors
    let newPlan = null;
    let insertedActivities = [];

    try {
      // 1. Insert plan first - using correct database column names
      console.log("📋 Inserting plan...");
      const planData = {
        id: planId,
        planId: humanReadablePlanId, // This maps to plan_id column
        facilityName: validatedData.facilityName, // This maps to facility_name column
        facilityType: validatedData.facilityType, // This maps to facility_type column
        district: validatedData.district,
        province: validatedData.province,
        period: validatedData.period,
        program: validatedData.program,
        isHospital: validatedData.isHospital || false, // This maps to is_hospital column
        generalTotalBudget: totalBudget.toString(), // This maps to general_total_budget column
        status: 'draft',
        createdBy: validatedData.createdBy || 'System', // This maps to created_by column
        submittedBy: validatedData.submittedBy || validatedData.createdBy || 'System', // This maps to submitted_by column
        createdAt: new Date(), // This maps to created_at column
        updatedAt: new Date() // This maps to updated_at column
      };

      const [insertedPlan] = await db.insert(plans).values(planData).returning();
      newPlan = insertedPlan;
      console.log("✅ Plan inserted successfully:", newPlan.id);

      // 2. Insert activities if any
      if (planActivities.length > 0) {
        console.log(`📊 Inserting ${planActivities.length} activities...`);
        
        const activitiesData = planActivities.map((activity, index) => {
          const freq = activity.frequency || 1;
          const cost = activity.unitCost || 0;
          const q1Amount = (activity.countQ1 || 0) * freq * cost;
          const q2Amount = (activity.countQ2 || 0) * freq * cost;
          const q3Amount = (activity.countQ3 || 0) * freq * cost;
          const q4Amount = (activity.countQ4 || 0) * freq * cost;

          return {
            id: crypto.randomUUID(),
            planId: newPlan.id, // This maps to plan_id column (foreign key)
            activityCategory: activity.activityCategory, // This maps to activity_category column
            typeOfActivity: activity.typeOfActivity, // This maps to type_of_activity column
            activity: activity.activity || "",
            frequency: freq,
            unitCost: cost.toString(), // This maps to unit_cost column (decimal)
            countQ1: activity.countQ1 || 0, // This maps to count_q1 column
            countQ2: activity.countQ2 || 0, // This maps to count_q2 column
            countQ3: activity.countQ3 || 0, // This maps to count_q3 column
            countQ4: activity.countQ4 || 0, // This maps to count_q4 column
            amountQ1: q1Amount.toString(), // This maps to amount_q1 column (decimal)
            amountQ2: q2Amount.toString(), // This maps to amount_q2 column (decimal)
            amountQ3: q3Amount.toString(), // This maps to amount_q3 column (decimal)
            amountQ4: q4Amount.toString(), // This maps to amount_q4 column (decimal)
            totalBudget: (q1Amount + q2Amount + q3Amount + q4Amount).toString(), // This maps to total_budget column (decimal)
            comment: activity.comment || "",
            sortOrder: activity.sortOrder || index, // This maps to sort_order column
            createdAt: new Date(), // This maps to created_at column
            updatedAt: new Date() // This maps to updated_at column
          };
        });

        insertedActivities = await db.insert(activities).values(activitiesData).returning();
        console.log(`✅ ${insertedActivities.length} activities inserted successfully`);
      }

      // 3. Create initial status history
      console.log("📜 Creating status history...");
      await db.insert(planStatusHistory).values({
        id: crypto.randomUUID(),
        planId: newPlan.id, // This maps to plan_id column (foreign key)
        previousStatus: null, // This maps to previous_status column
        newStatus: 'draft', // This maps to new_status column
        description: 'Plan created',
        createdAt: new Date() // This maps to created_at column
      });
      console.log("✅ Status history created");

      // Return success response
      const response = {
        success: true,
        data: {
          id: newPlan.id,
          planId: newPlan.planId,
          ...newPlan,
          activities: insertedActivities
        },
        message: "Plan created successfully"
      };

      console.log("🎉 Plan creation completed successfully");
      return NextResponse.json(response, { status: 201 });

    } catch (insertError) {
      console.error("💥 Error during insertion:", insertError);
      
      // Manual cleanup if plan was created but activities failed
      if (newPlan) {
        try {
          console.log("🧹 Cleaning up partially created plan...");
          await db.delete(planStatusHistory).where(eq(planStatusHistory.planId, newPlan.id));
          await db.delete(activities).where(eq(activities.planId, newPlan.id));
          await db.delete(plans).where(eq(plans.id, newPlan.id));
          console.log("✅ Cleanup completed");
        } catch (cleanupError) {
          console.error("💥 Error during cleanup:", cleanupError);
        }
      }

      throw insertError;
    }

  } catch (error) {
    console.error("💥 Error creating plan:", error);
    
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to create plan",
      error: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('📋 Listing activity plans...');
    console.log('🌐 Request URL:', request.url);
    
    const { searchParams } = new URL(request.url);
    const facilityType = searchParams.get('facilityType');
    const district = searchParams.get('district');
    const province = searchParams.get('province');
    const period = searchParams.get('period');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    console.log('🔍 Filters:', { facilityType, district, province, period, status, page, limit });

    // Test database connection first
    console.log('🔧 Testing database connection...');
    
    // Build where conditions
    const conditions = [];
    if (facilityType) conditions.push(eq(plans.facilityType, facilityType as any));
    if (district) conditions.push(eq(plans.district, district));
    if (province) conditions.push(eq(plans.province, province));
    if (period) conditions.push(eq(plans.period, period));
    if (status) conditions.push(eq(plans.status, status as any));

    console.log('📝 Built conditions:', conditions.length);

    // Get plans with activities count
    const whereCondition = conditions.length > 0 ? and(...conditions) : undefined;
    
    console.log('🔍 Executing database query...');
    
    const plansList = await db
      .select({
        id: plans.id,
        planId: plans.planId, // This maps to plan_id column
        facilityName: plans.facilityName, // This maps to facility_name column
        facilityType: plans.facilityType, // This maps to facility_type column
        district: plans.district,
        province: plans.province,
        period: plans.period,
        program: plans.program,
        isHospital: plans.isHospital, // This maps to is_hospital column
        generalTotalBudget: plans.generalTotalBudget, // This maps to general_total_budget column
        status: plans.status,
        createdBy: plans.createdBy, // This maps to created_by column
        submittedBy: plans.submittedBy, // This maps to submitted_by column
        submittedAt: plans.submittedAt, // This maps to submitted_at column
        createdAt: plans.createdAt, // This maps to created_at column
        updatedAt: plans.updatedAt, // This maps to updated_at column
      })
      .from(plans)
      .where(whereCondition)
      .orderBy(desc(plans.createdAt))
      .limit(limit)
      .offset(offset);

    console.log('📊 Query completed, found:', plansList.length, 'plans');

    // Get total count for pagination
    const totalResult = await db
      .select({ count: count() })
      .from(plans)
      .where(whereCondition);
    
    const total = totalResult[0]?.count || 0;

    console.log(`✅ Found ${plansList.length} plans (total: ${total})`);

    return NextResponse.json({
      success: true,
      data: plansList,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('💥 Error listing plans:', error);
    console.error('💥 Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('💥 Error name:', error instanceof Error ? error.name : 'Unknown error type');
    
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      } : undefined
    }, { status: 500 });
  }
} 