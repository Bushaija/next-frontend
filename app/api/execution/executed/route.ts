import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Schema for filtering executed activities
const listExecutedActivitiesSchema = z.object({
  facilityType: z.string().optional(),
  district: z.string().optional(),
  province: z.string().optional(),
  program: z.string().optional(),
  period: z.string().optional(),
  status: z.enum(['completed', 'in-progress', 'pending-review']).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
});

// GET - List executed activities with filters
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Fetching executed activities...');
    
    const { searchParams } = new URL(request.url);
    const facilityType = searchParams.get('facilityType');
    const district = searchParams.get('district');
    const province = searchParams.get('province');
    const program = searchParams.get('program');
    const period = searchParams.get('period');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    console.log('🔍 Filters:', { facilityType, district, province, program, period, status, page, limit });

    // TODO: Replace with actual database query when executions table is created
    // For now, return mock data for testing purposes
    
    const mockExecutedActivities = [
      {
        id: 'exec-1',
        executionId: 'EXEC-2024-001',
        planId: 'PLAN-HIV-KGL-2024-001',
        facilityName: 'Kigali Hospital',
        facilityType: 'hospital',
        district: 'Kigali',
        province: 'Kigali',
        period: 'FY 2027',
        program: 'HIV',
        isHospital: true,
        plannedBudget: '500000',
        executedBudget: '485000',
        variance: '15000',
        variancePercentage: 3.0,
        status: 'completed',
        executedBy: 'Dr. Smith',
        executedAt: '2024-11-15T10:00:00Z',
        submittedAt: '2024-11-20T14:30:00Z',
        createdAt: '2024-11-01T09:00:00Z',
        updatedAt: '2024-11-20T14:30:00Z',
        activitiesCount: 15,
        completedActivities: 15,
      },
      {
        id: 'exec-2',
        executionId: 'EXEC-2024-002',
        planId: 'PLAN-TB-BUR-2024-001',
        facilityName: 'Burera Health Center',
        facilityType: 'health-center',
        district: 'Burera',
        province: 'Northern',
        period: 'FY 2027',
        program: 'TB',
        isHospital: false,
        plannedBudget: '250000',
        executedBudget: '180000',
        variance: '-70000',
        variancePercentage: -28.0,
        status: 'in-progress',
        executedBy: 'Nurse Jane',
        executedAt: '2024-11-10T08:00:00Z',
        submittedAt: '2024-11-18T16:00:00Z',
        createdAt: '2024-10-15T10:00:00Z',
        updatedAt: '2024-11-18T16:00:00Z',
        activitiesCount: 8,
        completedActivities: 5,
      },
      {
        id: 'exec-3',
        executionId: 'EXEC-2024-003',
        planId: 'PLAN-MAL-KAY-2024-001',
        facilityName: 'Kayonza Hospital',
        facilityType: 'hospital',
        district: 'Kayonza',
        province: 'Eastern',
        period: 'FY 2027',
        program: 'Malaria',
        isHospital: true,
        plannedBudget: '400000',
        executedBudget: '420000',
        variance: '20000',
        variancePercentage: 5.0,
        status: 'pending-review',
        executedBy: 'Dr. Johnson',
        executedAt: '2024-11-12T12:00:00Z',
        submittedAt: '2024-11-19T11:00:00Z',
        createdAt: '2024-10-20T11:00:00Z',
        updatedAt: '2024-11-19T11:00:00Z',
        activitiesCount: 12,
        completedActivities: 10,
      },
      {
        id: 'exec-4',
        executionId: 'EXEC-2024-004',
        planId: 'PLAN-HIV-KGL-2024-002',
        facilityName: 'Kigali Health Center',
        facilityType: 'health-center',
        district: 'Kigali',
        province: 'Kigali',
        period: 'FY 2026',
        program: 'HIV',
        isHospital: false,
        plannedBudget: '300000',
        executedBudget: '295000',
        variance: '-5000',
        variancePercentage: -1.7,
        status: 'completed',
        executedBy: 'Dr. Williams',
        executedAt: '2024-10-25T14:00:00Z',
        submittedAt: '2024-10-30T10:00:00Z',
        createdAt: '2024-09-01T08:00:00Z',
        updatedAt: '2024-10-30T10:00:00Z',
        activitiesCount: 10,
        completedActivities: 10,
      },
      {
        id: 'exec-5',
        executionId: 'EXEC-2024-005',
        planId: 'PLAN-MAT-BUR-2024-001',
        facilityName: 'Burera Hospital',
        facilityType: 'hospital',
        district: 'Burera',
        province: 'Northern',
        period: 'FY 2027',
        program: 'Maternal Health',
        isHospital: true,
        plannedBudget: '600000',
        executedBudget: '520000',
        variance: '-80000',
        variancePercentage: -13.3,
        status: 'in-progress',
        executedBy: 'Dr. Brown',
        executedAt: '2024-11-05T09:30:00Z',
        submittedAt: '2024-11-15T15:00:00Z',
        createdAt: '2024-10-01T07:00:00Z',
        updatedAt: '2024-11-15T15:00:00Z',
        activitiesCount: 18,
        completedActivities: 12,
      },
    ];

    // Apply filters to mock data
    let filteredData = mockExecutedActivities;

    if (facilityType && facilityType !== 'all') {
      filteredData = filteredData.filter(item => item.facilityType === facilityType);
    }
    if (district && district !== 'all') {
      filteredData = filteredData.filter(item => item.district === district);
    }
    if (province && province !== 'all') {
      filteredData = filteredData.filter(item => item.province === province);
    }
    if (program && program !== 'all') {
      filteredData = filteredData.filter(item => item.program === program);
    }
    if (period && period !== 'all') {
      filteredData = filteredData.filter(item => item.period === period);
    }
    if (status && status !== 'all') {
      filteredData = filteredData.filter(item => item.status === status);
    }

    // Apply pagination
    const total = filteredData.length;
    const offset = (page - 1) * limit;
    const paginatedData = filteredData.slice(offset, offset + limit);

    console.log(`✅ Found ${paginatedData.length} executed activities (total: ${total})`);

    return NextResponse.json({
      success: true,
      data: paginatedData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('💥 Error fetching executed activities:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
} 