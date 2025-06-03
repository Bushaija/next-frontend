import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/config';
import { plans } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

// Schema for updating execution status
const updateExecutionStatusSchema = z.object({
  status: z.enum(['active', 'completed', 'paused', 'cancelled']),
  progress: z.number().min(0).max(100).optional(),
  notes: z.string().optional(),
  data: z.record(z.any()).optional(),
});

// GET /api/execution/[id] - Get execution details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const executionId = params.id;
    console.log('🔍 Fetching execution:', executionId);

    // Since we don't have a separate executions table yet, we'll simulate execution data
    // based on the plan data and return mock execution details
    const planRecord = await db
      .select()
      .from(plans)
      .where(eq(plans.id, executionId))
      .limit(1);

    if (!planRecord || planRecord.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Execution not found' },
        { status: 404 }
      );
    }

    const plan = planRecord[0];

    // Simulate execution data
    const execution = {
      id: executionId,
      executionId: `exec-${Date.now()}`,
      planId: plan.planId,
      planData: {
        facilityName: plan.facilityName,
        facilityType: plan.facilityType,
        district: plan.district,
        province: plan.province,
        period: plan.period,
        program: plan.program,
        generalTotalBudget: plan.generalTotalBudget,
      },
      status: 'active' as const,
      progress: 45,
      startDate: new Date().toISOString(),
      endDate: null,
      estimatedCompletion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      totalBudget: parseFloat(plan.generalTotalBudget),
      spentBudget: parseFloat(plan.generalTotalBudget) * 0.45, // 45% spent
      remainingBudget: parseFloat(plan.generalTotalBudget) * 0.55, // 55% remaining
      activities: [
        {
          id: '1',
          name: 'HIV Testing and Counseling',
          status: 'completed',
          progress: 100,
          budget: 50000,
          spent: 50000,
          remaining: 0,
        },
        {
          id: '2',
          name: 'ART Provision',
          status: 'in-progress',
          progress: 65,
          budget: 120000,
          spent: 78000,
          remaining: 42000,
        },
        {
          id: '3',
          name: 'Prevention Programs',
          status: 'pending',
          progress: 0,
          budget: 80000,
          spent: 0,
          remaining: 80000,
        },
      ],
      milestones: [
        {
          id: '1',
          name: 'Q1 Activities Completion',
          dueDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'completed',
          description: 'Complete all Q1 planned activities',
        },
        {
          id: '2',
          name: 'Mid-year Review',
          dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'upcoming',
          description: 'Conduct mid-year progress review',
        },
      ],
      notes: 'Execution proceeding according to plan. Some delays in procurement but overall on track.',
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
    };

    console.log('✅ Execution data retrieved successfully');
    return NextResponse.json({
      success: true,
      data: execution,
    });

  } catch (error) {
    console.error('❌ Error fetching execution:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch execution' },
      { status: 500 }
    );
  }
}

// PATCH /api/execution/[id] - Update execution status and data
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const executionId = params.id;
    const body = await request.json();
    
    console.log('🔄 Updating execution status:', executionId, body);

    // Validate request body
    const validatedData = updateExecutionStatusSchema.parse(body);

    // Check if execution exists (simulated by checking if plan exists)
    const planRecord = await db
      .select()
      .from(plans)
      .where(eq(plans.id, executionId))
      .limit(1);

    if (!planRecord || planRecord.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Execution not found' },
        { status: 404 }
      );
    }

    // In a real implementation, you would update the execution record here
    // For now, we'll just return success with the updated data
    console.log('✅ Execution status updated successfully');
    
    return NextResponse.json({
      success: true,
      message: 'Execution status updated successfully',
      data: {
        id: executionId,
        status: validatedData.status,
        progress: validatedData.progress,
        notes: validatedData.notes,
        updatedAt: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('❌ Error updating execution:', error);
    
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
      { success: false, message: 'Failed to update execution' },
      { status: 500 }
    );
  }
}

// DELETE /api/execution/[id] - Cancel/Delete execution
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const executionId = params.id;
    
    console.log('Cancelling execution:', executionId);

    // Check if execution exists (for now, check if plan exists)
    const planRecord = await db
      .select()
      .from(plans)
      .where(eq(plans.id, executionId))
      .limit(1);

    if (planRecord.length === 0) {
      return NextResponse.json(
        { error: 'Execution not found' },
        { status: 404 }
      );
    }

    // In a real implementation, you would update the execution status to 'cancelled'
    // or soft delete the record
    
    console.log('Execution cancelled successfully:', executionId);

    return NextResponse.json({
      success: true,
      message: 'Execution cancelled successfully',
      data: {
        id: executionId,
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('Error cancelling execution:', error);
    return NextResponse.json(
      { error: 'Failed to cancel execution' },
      { status: 500 }
    );
  }
} 