#!/usr/bin/env node

/**
 * Activity Planning API Test Suite
 * 
 * This script tests all the CRUD operations for the Activity Planning API:
 * - POST /api/plan (Create new plan)
 * - GET /api/plan (List all plans)
 * - GET /api/plan/[id] (Get specific plan)
 * - PUT /api/plan/[id] (Update plan)
 * - PATCH /api/plan/[id]/status (Update plan status)
 * - DELETE /api/plan/[id] (Delete plan)
 */

const http = require('http');
const https = require('https');
const { URL } = require('url');

const API_BASE_URL = 'http://localhost:3000';

// Test data for creating a plan
const samplePlanData = {
  activities: [
    {
      activityCategory: "Human Resources (HR)",
      typeOfActivity: "Salary",
      activity: "Provide salaries for health facilities staff (DHs, HCs)",
      frequency: 1,
      unitCost: 450000,
      countQ1: 10,
      countQ2: 10,
      countQ3: 12,
      countQ4: 12,
      comment: "Staff count increased in Q3 due to new hires"
    },
    {
      activityCategory: "Travel Related Costs (TRC)",
      typeOfActivity: "Supervision",
      activity: "Conduct home visit for lost to follow up",
      frequency: 4,
      unitCost: 15000,
      countQ1: 10,
      countQ2: 8,
      countQ3: 12,
      countQ4: 10,
      comment: "Increased visits in Q3 due to seasonal migration"
    }
  ],
  isHospital: true,
  metadata: {
    facilityName: "Kibagabaga Hospital",
    facilityType: "Hospital",
    district: "Gasabo",
    province: "Kigali",
    period: "FY 2024",
    program: "HIV",
    createdBy: "Dr. John Doe",
    status: "draft"
  }
};

// Helper function to make HTTP requests using Node.js built-in modules
function makeRequest(method, url, data = null) {
  return new Promise((resolve) => {
    const parsedUrl = new URL(url);
    const httpModule = parsedUrl.protocol === 'https:' ? https : http;
    
    const postData = data ? JSON.stringify(data) : null;
    
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    };

    if (postData) {
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = httpModule.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          resolve({
            status: res.statusCode,
            ok: res.statusCode >= 200 && res.statusCode < 300,
            data: result
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            ok: false,
            data: { error: 'Invalid JSON response', body }
          });
        }
      });
    });

    req.on('error', (error) => {
      resolve({
        status: 0,
        ok: false,
        error: error.message
      });
    });

    // Set a timeout for the request
    req.setTimeout(10000, () => {
      req.destroy();
      resolve({
        status: 0,
        ok: false,
        error: 'Request timeout'
      });
    });

    if (postData) {
      req.write(postData);
    }
    
    req.end();
  });
}

// Test functions
async function testCreatePlan() {
  console.log('\n🧪 Testing POST /api/plan (Create Plan)');
  console.log('='.repeat(50));
  
  const response = await makeRequest('POST', `${API_BASE_URL}/api/plan`, samplePlanData);
  
  if (response.ok) {
    console.log('✅ Plan created successfully');
    console.log(`📝 Plan ID: ${response.data.planId}`);
    console.log(`💰 Total Budget: ${response.data.data.generalTotalBudget.toLocaleString()}`);
    console.log(`📊 Activities Count: ${response.data.data.activities.length}`);
    return response.data.planId;
  } else {
    console.log('❌ Failed to create plan');
    console.log(`Status: ${response.status}`);
    console.log('Error:', JSON.stringify(response.data, null, 2));
    return null;
  }
}

async function testGetAllPlans() {
  console.log('\n🧪 Testing GET /api/plan (List All Plans)');
  console.log('='.repeat(50));
  
  const response = await makeRequest('GET', `${API_BASE_URL}/api/plan`);
  
  if (response.ok) {
    console.log('✅ Plans retrieved successfully');
    console.log(`📊 Total Plans: ${response.data.total}`);
    console.log(`📄 Page: ${response.data.page}, Limit: ${response.data.limit}`);
    console.log(`📋 Plans in response: ${response.data.data.length}`);
    
    if (response.data.data.length > 0) {
      const firstPlan = response.data.data[0];
      console.log(`🔍 First plan: ${firstPlan.planId} (${firstPlan.metadata.facilityName})`);
    }
    
    return response.data.data;
  } else {
    console.log('❌ Failed to get plans');
    console.log(`Status: ${response.status}`);
    console.log('Error:', JSON.stringify(response.data, null, 2));
    return [];
  }
}

async function testGetPlanById(planId) {
  console.log(`\n🧪 Testing GET /api/plan/${planId} (Get Specific Plan)`);
  console.log('='.repeat(50));
  
  const response = await makeRequest('GET', `${API_BASE_URL}/api/plan/${planId}`);
  
  if (response.ok) {
    console.log('✅ Plan retrieved successfully');
    console.log(`📝 Plan ID: ${response.data.planId}`);
    console.log(`🏥 Facility: ${response.data.metadata.facilityName} (${response.data.metadata.facilityType})`);
    console.log(`📍 Location: ${response.data.metadata.district}, ${response.data.metadata.province}`);
    console.log(`📊 Status: ${response.data.metadata.status}`);
    console.log(`💰 Total Budget: ${response.data.generalTotalBudget.toLocaleString()}`);
    console.log(`🎯 Activities Count: ${response.data.activities.length}`);
    return response.data;
  } else {
    console.log('❌ Failed to get plan');
    console.log(`Status: ${response.status}`);
    console.log('Error:', JSON.stringify(response.data, null, 2));
    return null;
  }
}

async function testUpdatePlan(planId) {
  console.log(`\n🧪 Testing PUT /api/plan/${planId} (Update Plan)`);
  console.log('='.repeat(50));
  
  // Create updated plan data
  const updatedPlanData = {
    ...samplePlanData,
    activities: [
      ...samplePlanData.activities,
      {
        activityCategory: "Program Administration Costs (PA)",
        typeOfActivity: "Communication",
        activity: "Infrastructure and Equipment",
        frequency: 12,
        unitCost: 20000,
        countQ1: 3,
        countQ2: 3,
        countQ3: 3,
        countQ4: 3,
        comment: "Monthly internet and equipment maintenance"
      }
    ],
    metadata: {
      ...samplePlanData.metadata,
      period: "FY 2024 (Updated)"
    }
  };
  
  const response = await makeRequest('PUT', `${API_BASE_URL}/api/plan/${planId}`, updatedPlanData);
  
  if (response.ok) {
    console.log('✅ Plan updated successfully');
    console.log(`📝 Plan ID: ${response.data.planId}`);
    console.log(`💰 New Total Budget: ${response.data.data.generalTotalBudget.toLocaleString()}`);
    console.log(`📊 Activities Count: ${response.data.data.activities.length}`);
    console.log(`📅 Updated Period: ${response.data.data.metadata.period}`);
    return response.data.data;
  } else {
    console.log('❌ Failed to update plan');
    console.log(`Status: ${response.status}`);
    console.log('Error:', JSON.stringify(response.data, null, 2));
    return null;
  }
}

async function testGetPlanStatus(planId) {
  console.log(`\n🧪 Testing GET /api/plan/${planId}/status (Get Plan Status)`);
  console.log('='.repeat(50));
  
  const response = await makeRequest('GET', `${API_BASE_URL}/api/plan/${planId}/status`);
  
  if (response.ok) {
    console.log('✅ Plan status retrieved successfully');
    console.log(`📊 Current Status: ${response.data.currentStatus}`);
    console.log(`🔄 Allowed Transitions: ${response.data.allowedTransitions.join(', ')}`);
    console.log(`✏️ Can Edit: ${response.data.canEdit ? 'Yes' : 'No'}`);
    console.log(`🗑️ Can Delete: ${response.data.canDelete ? 'Yes' : 'No'}`);
    return response.data;
  } else {
    console.log('❌ Failed to get plan status');
    console.log(`Status: ${response.status}`);
    console.log('Error:', JSON.stringify(response.data, null, 2));
    return null;
  }
}

async function testUpdatePlanStatus(planId, newStatus, comment = '') {
  console.log(`\n🧪 Testing PATCH /api/plan/${planId}/status (Update Plan Status to ${newStatus})`);
  console.log('='.repeat(50));
  
  const statusData = {
    status: newStatus,
    comment: comment,
    reviewedBy: 'Test Administrator'
  };
  
  const response = await makeRequest('PATCH', `${API_BASE_URL}/api/plan/${planId}/status`, statusData);
  
  if (response.ok) {
    console.log('✅ Plan status updated successfully');
    console.log(`🔄 Status Change: ${response.data.statusUpdate.previousStatus} → ${response.data.statusUpdate.newStatus}`);
    console.log(`📝 Description: ${response.data.statusUpdate.description}`);
    console.log(`👤 Reviewed By: ${response.data.statusUpdate.reviewedBy}`);
    if (response.data.statusUpdate.comment) {
      console.log(`💬 Comment: ${response.data.statusUpdate.comment}`);
    }
    return response.data;
  } else {
    console.log('❌ Failed to update plan status');
    console.log(`Status: ${response.status}`);
    console.log('Error:', JSON.stringify(response.data, null, 2));
    return null;
  }
}

async function testDeletePlan(planId) {
  console.log(`\n🧪 Testing DELETE /api/plan/${planId} (Delete Plan)`);
  console.log('='.repeat(50));
  
  const response = await makeRequest('DELETE', `${API_BASE_URL}/api/plan/${planId}`);
  
  if (response.ok) {
    console.log('✅ Plan deleted successfully');
    console.log(`🗑️ Deleted Plan ID: ${response.data.planId}`);
    return true;
  } else {
    console.log('❌ Failed to delete plan');
    console.log(`Status: ${response.status}`);
    console.log('Error:', JSON.stringify(response.data, null, 2));
    return false;
  }
}

async function testFilteredPlans() {
  console.log('\n🧪 Testing GET /api/plan with filters (Filtered Plans)');
  console.log('='.repeat(50));
  
  const queryParams = 'facilityType=Hospital&province=Kigali&status=draft&page=1&limit=5';
  
  const response = await makeRequest('GET', `${API_BASE_URL}/api/plan?${queryParams}`);
  
  if (response.ok) {
    console.log('✅ Filtered plans retrieved successfully');
    console.log(`🔍 Filters: Hospital facilities in Kigali with draft status`);
    console.log(`📊 Total Matching: ${response.data.total}`);
    console.log(`📋 Plans in response: ${response.data.data.length}`);
    return response.data.data;
  } else {
    console.log('❌ Failed to get filtered plans');
    console.log(`Status: ${response.status}`);
    console.log('Error:', JSON.stringify(response.data, null, 2));
    return [];
  }
}

// Simple server check
async function checkServerStatus() {
  console.log('🔍 Checking if Next.js development server is running...');
  
  const response = await makeRequest('GET', `${API_BASE_URL}/api/plan`);
  
  if (response.status === 0) {
    console.log('❌ Cannot connect to server. Please ensure:');
    console.log('   1. Next.js development server is running (npm run dev)');
    console.log('   2. Server is accessible at http://localhost:3000');
    console.log('   3. No firewall blocking the connection');
    return false;
  }
  
  console.log('✅ Server is accessible');
  return true;
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Activity Planning API Test Suite');
  console.log('='.repeat(60));
  console.log(`📡 API Base URL: ${API_BASE_URL}`);
  console.log(`🕐 Test Started: ${new Date().toISOString()}`);
  
  // Check server status first
  const isServerRunning = await checkServerStatus();
  if (!isServerRunning) {
    console.log('\n❌ Cannot proceed with tests - server is not accessible');
    return;
  }
  
  try {
    // Test 1: Create a new plan
    const planId = await testCreatePlan();
    if (!planId) {
      console.log('❌ Cannot continue tests without a valid plan ID');
      return;
    }

    // Test 2: Get all plans
    await testGetAllPlans();

    // Test 3: Get specific plan
    await testGetPlanById(planId);

    // Test 4: Update the plan
    await testUpdatePlan(planId);

    // Test 5: Get plan status
    await testGetPlanStatus(planId);

    // Test 6: Update plan status to pending
    await testUpdatePlanStatus(planId, 'pending', 'Submitting plan for review');

    // Test 7: Try to update status to approved
    await testUpdatePlanStatus(planId, 'approved', 'Plan looks good, approving for implementation');

    // Test 8: Get filtered plans
    await testFilteredPlans();

    // Test 9: Try to delete approved plan (should fail)
    await testDeletePlan(planId);

    // Test 10: Create another plan and delete it (should succeed)
    const draftPlanId = await testCreatePlan();
    if (draftPlanId) {
      await testDeletePlan(draftPlanId);
    }

    console.log('\n🎉 All tests completed!');
    console.log('='.repeat(60));
    console.log(`🕐 Test Finished: ${new Date().toISOString()}`);

  } catch (error) {
    console.error('💥 Test suite failed with error:', error);
  }
}

// Check if this script is being run directly
if (require.main === module) {
  runAllTests();
}

module.exports = {
  testCreatePlan,
  testGetAllPlans,
  testGetPlanById,
  testUpdatePlan,
  testUpdatePlanStatus,
  testDeletePlan,
  testFilteredPlans,
  runAllTests
}; 