import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from "@/lib/db/config";
import { plans } from "@/lib/db/schema";
import { eq, and, desc, count, sql } from "drizzle-orm";
import crypto from 'crypto';

// Schema for creating a new execution
const createExecutionSchema = z.object({
  planId: z.string().uuid("Invalid plan ID"),
  executionType: z.enum(['full', 'partial']).default('full'),
  startDate: z.string().datetime().optional(),
  notes: z.string().max(1000).optional(),
});

// Schema for listing executions with filters
const listExecutionsSchema = z.object({
  facilityType: z.string().optional(),
  district: z.string().optional(),
  province: z.string().optional(),
  program: z.string().optional(),
  period: z.string().optional(),
  status: z.enum(['active', 'completed', 'paused', 'cancelled']).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
});

// GET - List approved plans available for execution
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Fetching approved plans for execution...');
    
    const { searchParams } = new URL(request.url);
    const facilityType = searchParams.get('facilityType');
    const district = searchParams.get('district');
    const province = searchParams.get('province');
    const program = searchParams.get('program');
    const period = searchParams.get('period');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    console.log('🔍 Filters:', { facilityType, district, province, program, period, page, limit });

    // Build where conditions - only approved plans can be executed
    const conditions = [eq(plans.status, 'approved')];
    
    if (facilityType) conditions.push(eq(plans.facilityType, facilityType as any));
    if (district) conditions.push(eq(plans.district, district));
    if (province) conditions.push(eq(plans.province, province));
    if (program) conditions.push(eq(plans.program, program));
    if (period) conditions.push(eq(plans.period, period));

    const whereCondition = conditions.length > 1 ? and(...conditions) : conditions[0];
    
    console.log('🔍 Executing database query for approved plans...');
    
    // Get approved plans that can be executed
    const approvedPlans = await db
      .select({
        id: plans.id,
        planId: plans.planId,
        facilityName: plans.facilityName,
        facilityType: plans.facilityType,
        district: plans.district,
        province: plans.province,
        period: plans.period,
        program: plans.program,
        isHospital: plans.isHospital,
        generalTotalBudget: plans.generalTotalBudget,
        status: plans.status,
        createdBy: plans.createdBy,
        submittedBy: plans.submittedBy,
        submittedAt: plans.submittedAt,
        createdAt: plans.createdAt,
        updatedAt: plans.updatedAt,
      })
      .from(plans)
      .where(whereCondition)
      .orderBy(desc(plans.submittedAt))
      .limit(limit)
      .offset(offset);

    console.log('📊 Query completed, found:', approvedPlans.length, 'approved plans');

    // TODO: Check which plans already have executions
    // This would require creating an executions table first
    // For now, we'll return all approved plans as available for execution

    // Get total count for pagination
    const totalResult = await db
      .select({ count: sql`count(*)`.as('count') })
      .from(plans)
      .where(whereCondition);
    
    const total = Number(totalResult[0]?.count) || 0;

    // Enhance plans with execution status (mock for now)
    const enhancedPlans = approvedPlans.map(plan => ({
      ...plan,
      canExecute: true, // TODO: Check if execution already exists
      hasActiveExecution: false, // TODO: Check execution status
      activitiesCount: 0, // TODO: Get from activities table
      lastExecutionDate: null, // TODO: Get from executions table
    }));

    console.log(`✅ Found ${approvedPlans.length} approved plans available for execution (total: ${total})`);

    return NextResponse.json({
      success: true,
      data: enhancedPlans,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('💥 Error fetching approved plans:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

// POST - Create a new execution instance from an approved plan
export async function POST(request: NextRequest) {
  try {
    console.log('📝 Creating new execution instance...');
    
    const body = await request.json();
    console.log('📄 Received execution data:', JSON.stringify(body, null, 2));

    // Validate the request body
    const validation = createExecutionSchema.safeParse(body);
    if (!validation.success) {
      console.error('❌ Validation failed:', validation.error.format());
      return NextResponse.json({
        success: false,
        errors: validation.error.format(),
        message: 'Validation failed'
      }, { status: 400 });
    }

    const validatedData = validation.data;

    // Check if plan exists and is approved
    const plan = await db
      .select()
      .from(plans)
      .where(eq(plans.id, validatedData.planId))
      .limit(1);

    if (!plan.length) {
      return NextResponse.json({
        success: false,
        message: 'Plan not found'
      }, { status: 404 });
    }

    const targetPlan = plan[0];

    if (targetPlan.status !== 'approved') {
      return NextResponse.json({
        success: false,
        message: 'Only approved plans can be executed'
      }, { status: 400 });
    }

    console.log(`📋 Found approved plan: ${targetPlan.planId} (${targetPlan.facilityName})`);

    // TODO: Check if execution already exists for this plan
    // This validation would happen when we create the executions table
    // For now, we'll simulate successful execution creation

    const executionId = crypto.randomUUID();
    const executionNumber = `EXEC-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

    // TODO: Create execution record in database
    // This would involve creating an executions table and inserting the record

    console.log(`✅ Execution instance created: ${executionNumber}`);

    return NextResponse.json({
      success: true,
      data: {
        id: executionId,
        executionNumber,
        planId: targetPlan.id,
        planReference: targetPlan.planId,
        facilityName: targetPlan.facilityName,
        program: targetPlan.program,
        period: targetPlan.period,
        totalBudget: targetPlan.generalTotalBudget,
        status: 'active',
        createdAt: new Date().toISOString(),
        ...validatedData,
      },
      message: 'Execution instance created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('💥 Error creating execution:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
} 