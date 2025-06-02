import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from "@/lib/db/config";
import { 
  plans, 
  planStatusHistory,
  updatePlanStatusSchema 
} from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

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

// Helper function to get status transition description
function getStatusTransitionDescription(from: string, to: string): string {
  const descriptions: Record<string, string> = {
    'draft->pending': 'Plan submitted for review',
    'pending->approved': 'Plan approved by reviewer',
    'pending->rejected': 'Plan rejected by reviewer',
    'pending->draft': 'Plan returned to draft for revision',
    'rejected->draft': 'Plan revised after rejection',
  };
  
  return descriptions[`${from}->${to}`] || `Status changed from ${from} to ${to}`;
}

// PATCH - Update plan status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const planId = params.id;
    console.log(`📝 Updating status for plan ${planId}...`);

    const body = await request.json();
    console.log("📄 Received status update data:", JSON.stringify(body, null, 2));

    // Validate request body
    const validation = updatePlanStatusSchema.safeParse(body);
    if (!validation.success) {
      console.error("❌ Validation failed:", validation.error.format());
      return NextResponse.json({
        success: false,
        errors: validation.error.format(),
        message: "Validation failed"
      }, { status: 400 });
    }

    const { status: newStatus, reviewedBy } = validation.data;

    // Check if plan exists and get current status
    const existingPlan = await db.query.plans.findFirst({
      where: eq(plans.id, planId),
    });

    if (!existingPlan) {
      return NextResponse.json({
        success: false,
        message: "Plan not found"
      }, { status: 404 });
    }

    console.log(`📋 Found plan: ${existingPlan.facilityName} (Current status: ${existingPlan.status})`);

    // Check if status is actually changing
    if (existingPlan.status === newStatus) {
      return NextResponse.json({
        success: true,
        data: {
          id: existingPlan.id,
          status: existingPlan.status,
          message: "Status is already set to the requested value"
        }
      });
    }

    // Validate status transition
    if (!isValidStatusTransition(existingPlan.status, newStatus)) {
      return NextResponse.json({
        success: false,
        message: `Invalid status transition from ${existingPlan.status} to ${newStatus}`
      }, { status: 400 });
    }

    console.log(`✅ Valid status transition: ${existingPlan.status} → ${newStatus}`);

    // Since neon-http doesn't support transactions, we'll do sequential operations
    try {
      // 1. Update plan status
      console.log("📋 Updating plan status...");
      const updateData: any = {
        status: newStatus,
        updatedAt: new Date()
      };

      // Set submission details if transitioning to pending
      if (newStatus === 'pending') {
        updateData.submittedAt = new Date();
        updateData.submittedBy = reviewedBy || existingPlan.submittedBy;
      }

      const [updatedPlan] = await db.update(plans)
        .set(updateData)
        .where(eq(plans.id, planId))
        .returning();

      console.log("✅ Plan status updated successfully");

      // 2. Create status history entry - using correct column names
      console.log("📜 Creating status history...");
      await db.insert(planStatusHistory).values({
        id: crypto.randomUUID(),
        planId, // This maps to plan_id column (foreign key)
        previousStatus: existingPlan.status, // This maps to previous_status column
        newStatus: newStatus, // This maps to new_status column  
        reviewedBy: reviewedBy || 'System', // This maps to reviewed_by column
        description: getStatusTransitionDescription(existingPlan.status, newStatus),
        createdAt: new Date() // This maps to created_at column
      });

      console.log("✅ Status history created");

      // Return success response
      const response = {
        success: true,
        data: {
          id: updatedPlan.id,
          status: updatedPlan.status,
          previousStatus: existingPlan.status,
          submittedAt: updatedPlan.submittedAt,
          submittedBy: updatedPlan.submittedBy
        },
        message: `Plan status updated from ${existingPlan.status} to ${newStatus}`
      };

      console.log("🎉 Status update completed successfully");
      return NextResponse.json(response);

    } catch (updateError) {
      console.error("💥 Error during status update:", updateError);
      throw updateError;
    }

  } catch (error) {
    console.error("💥 Error updating plan status:", error);
    
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to update plan status",
      error: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 });
  }
}

// GET - Get current status and allowed transitions
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`🔍 Getting status info for plan ID: ${params.id}`);

    // Get plan current status
    const plan = await db
      .select({
        id: plans.id,
        planId: plans.planId,
        status: plans.status,
        submittedAt: plans.submittedAt,
        submittedBy: plans.submittedBy,
      })
      .from(plans)
      .where(eq(plans.id, params.id))
      .limit(1);

    if (!plan.length) {
      return NextResponse.json({
        success: false,
        message: 'Plan not found'
      }, { status: 404 });
    }

    const currentPlan = plan[0];
    const currentStatus = currentPlan.status;

    // Get allowed transitions for current status
    const allowedTransitions = {
      draft: ['pending'],
      pending: ['approved', 'rejected', 'draft'],
      approved: [],
      rejected: ['draft'],
    }[currentStatus] || [];

    // Get status history
    const statusHistory = await db
      .select()
      .from(planStatusHistory)
      .where(eq(planStatusHistory.planId, params.id))
      .orderBy(desc(planStatusHistory.createdAt));

    console.log(`✅ Status info retrieved for plan: ${currentPlan.planId}`);

    return NextResponse.json({
      success: true,
      data: {
        planId: currentPlan.planId,
        currentStatus: currentStatus,
        allowedTransitions: allowedTransitions,
        submittedAt: currentPlan.submittedAt,
        submittedBy: currentPlan.submittedBy,
        statusHistory: statusHistory,
      }
    });

  } catch (error) {
    console.error('💥 Error getting status info:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
} 