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
import { eq, and } from "drizzle-orm";

// Request schemas
const updatePlanSchema = insertPlanSchema.partial().extend({
  activities: z.array(insertActivitySchema).optional(),
});

// Helper function to calculate amounts
function calculateAmounts(activity: z.infer<typeof insertActivitySchema>) {
  const amounts = {
    amountQ1: activity.frequency * activity.unitCost * activity.countQ1,
    amountQ2: activity.frequency * activity.unitCost * activity.countQ2,
    amountQ3: activity.frequency * activity.unitCost * activity.countQ3,
    amountQ4: activity.frequency * activity.unitCost * activity.countQ4,
  };
  
  const totalBudget = amounts.amountQ1 + amounts.amountQ2 + amounts.amountQ3 + amounts.amountQ4;
  
  return { ...amounts, totalBudget };
}

// Helper function to validate status transitions
function isValidStatusTransition(currentStatus: string, newStatus: string): boolean {
  const validTransitions: Record<string, string[]> = {
    draft: ['pending'],
    pending: ['approved', 'rejected', 'draft'],
    approved: [],
    rejected: ['draft'],
  };
  
  return validTransitions[currentStatus]?.includes(newStatus) || false;
}

// GET - Get specific plan by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`🔍 Fetching plan with ID: ${params.id}`);

    // Get plan with activities
    const plan = await db
      .select()
      .from(plans)
      .where(eq(plans.id, params.id))
      .limit(1);

    if (!plan.length) {
      return NextResponse.json({
        success: false,
        message: 'Plan not found'
      }, { status: 404 });
    }

    // Get activities for this plan
    const planActivities = await db
      .select()
      .from(activities)
      .where(eq(activities.planId, params.id))
      .orderBy(activities.sortOrder, activities.createdAt);

    // Get status history for this plan
    const statusHistory = await db
      .select()
      .from(planStatusHistory)
      .where(eq(planStatusHistory.planId, params.id))
      .orderBy(planStatusHistory.createdAt);

    const result = {
      ...plan[0],
      activities: planActivities,
      statusHistory: statusHistory,
    };

    console.log(`✅ Plan found: ${plan[0].planId} with ${planActivities.length} activities`);

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('💥 Error fetching plan:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

// PUT - Update specific plan by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const planId = params.id;
    console.log(`📝 Updating plan ${planId}...`);

    const body = await request.json();
    console.log("📄 Received update data:", JSON.stringify(body, null, 2));

    // Validate request body
    const validation = updatePlanSchema.safeParse(body);
    if (!validation.success) {
      console.error("❌ Validation failed:", validation.error.format());
      return NextResponse.json({
        success: false,
        errors: validation.error.format(),
        message: "Validation failed"
      }, { status: 400 });
    }

    const validatedData = validation.data;

    // Check if plan exists
    const existingPlan = await db.query.plans.findFirst({
      where: eq(plans.id, planId),
    });

    if (!existingPlan) {
      return NextResponse.json({
        success: false,
        message: "Plan not found"
      }, { status: 404 });
    }

    console.log(`📋 Found existing plan: ${existingPlan.facilityName} (${existingPlan.status})`);

    // Check if status change is valid
    if (validatedData.status && validatedData.status !== existingPlan.status) {
      if (!isValidStatusTransition(existingPlan.status, validatedData.status)) {
        return NextResponse.json({
          success: false,
          message: `Invalid status transition from ${existingPlan.status} to ${validatedData.status}`
        }, { status: 400 });
      }
    }

    // Calculate plan totals from activities
    const planActivities = validatedData.activities || [];
    let totalBudget = 0;
    let totalAmountQ1 = 0;
    let totalAmountQ2 = 0;
    let totalAmountQ3 = 0;
    let totalAmountQ4 = 0;

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
    let updatedPlan = null;
    let updatedActivities = [];

    try {
      // 1. Update plan first
      console.log("📋 Updating plan...");
      const planUpdateData: any = {
        updatedAt: new Date()
      };

      // Only update fields that are provided
      if (validatedData.facilityName !== undefined) planUpdateData.facilityName = validatedData.facilityName;
      if (validatedData.facilityType !== undefined) planUpdateData.facilityType = validatedData.facilityType;
      if (validatedData.district !== undefined) planUpdateData.district = validatedData.district;
      if (validatedData.province !== undefined) planUpdateData.province = validatedData.province;
      if (validatedData.period !== undefined) planUpdateData.period = validatedData.period;
      if (validatedData.program !== undefined) planUpdateData.program = validatedData.program;
      if (validatedData.isHospital !== undefined) planUpdateData.isHospital = validatedData.isHospital;
      if (validatedData.status !== undefined) planUpdateData.status = validatedData.status;

      // Update totals if activities are provided
      if (validatedData.activities) {
        planUpdateData.generalTotalBudget = totalBudget.toString();
      }

      const [plan] = await db.update(plans)
        .set(planUpdateData)
        .where(eq(plans.id, planId))
        .returning();

      updatedPlan = plan;
      console.log("✅ Plan updated successfully");

      // 2. Update activities if provided
      if (validatedData.activities && validatedData.activities.length > 0) {
        console.log(`📊 Updating ${validatedData.activities.length} activities...`);
        
        // Delete existing activities first
        await db.delete(activities).where(eq(activities.planId, planId));
        console.log("🗑️ Existing activities deleted");

        // Insert new activities - using correct column names
        const activitiesData = validatedData.activities.map((activity, index) => {
          const freq = activity.frequency || 1;
          const cost = activity.unitCost || 0;
          const q1Amount = (activity.countQ1 || 0) * freq * cost;
          const q2Amount = (activity.countQ2 || 0) * freq * cost;
          const q3Amount = (activity.countQ3 || 0) * freq * cost;
          const q4Amount = (activity.countQ4 || 0) * freq * cost;

          return {
            id: crypto.randomUUID(),
            planId,
            activityCategory: activity.activityCategory,
            typeOfActivity: activity.typeOfActivity,
            activity: activity.activity || "",
            frequency: freq,
            unitCost: cost.toString(),
            countQ1: activity.countQ1 || 0,
            countQ2: activity.countQ2 || 0,
            countQ3: activity.countQ3 || 0,
            countQ4: activity.countQ4 || 0,
            amountQ1: q1Amount.toString(),
            amountQ2: q2Amount.toString(),
            amountQ3: q3Amount.toString(),
            amountQ4: q4Amount.toString(),
            totalBudget: (q1Amount + q2Amount + q3Amount + q4Amount).toString(),
            comment: activity.comment || "",
            sortOrder: activity.sortOrder || index,
            createdAt: new Date(),
            updatedAt: new Date()
          };
        });

        updatedActivities = await db.insert(activities).values(activitiesData).returning();
        console.log(`✅ ${updatedActivities.length} activities updated successfully`);
      }

      // 3. Create status history if status changed - using correct column names
      if (validatedData.status && validatedData.status !== existingPlan.status) {
        console.log(`📜 Creating status history: ${existingPlan.status} → ${validatedData.status}`);
        await db.insert(planStatusHistory).values({
          id: crypto.randomUUID(),
          planId,
          previousStatus: existingPlan.status,
          newStatus: validatedData.status,
          description: `Status changed from ${existingPlan.status} to ${validatedData.status}`,
          createdAt: new Date()
        });
        console.log("✅ Status history created");
      }

      // Return success response
      const response = {
        success: true,
        data: {
          ...updatedPlan,
          activities: updatedActivities.length > 0 ? updatedActivities : undefined
        },
        message: "Plan updated successfully"
      };

      console.log("🎉 Plan update completed successfully");
      return NextResponse.json(response, { status: 200 });

    } catch (updateError) {
      console.error("💥 Error during update:", updateError);
      throw updateError;
    }

  } catch (error) {
    console.error("💥 Error updating plan:", error);
    
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to update plan",
      error: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 });
  }
}

// DELETE - Delete specific plan by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`🗑️ Deleting plan with ID: ${params.id}`);

    // Check if plan exists and get its status
    const existingPlan = await db
      .select()
      .from(plans)
      .where(eq(plans.id, params.id))
      .limit(1);

    if (!existingPlan.length) {
      return NextResponse.json({
        success: false,
        message: 'Plan not found'
      }, { status: 404 });
    }

    const plan = existingPlan[0];

    // Only allow deletion of draft plans
    if (plan.status !== 'draft') {
      return NextResponse.json({
        success: false,
        message: 'Only draft plans can be deleted'
      }, { status: 400 });
    }

    // Delete plan (activities and status history will be deleted due to cascade)
    await db.delete(plans).where(eq(plans.id, params.id));

    console.log('✅ Plan deleted successfully:', plan.planId);

    return NextResponse.json({
      success: true,
      message: 'Plan deleted successfully'
    });

  } catch (error) {
    console.error('💥 Error deleting plan:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
} 