const testData = {
  activities: [
    {
      activityCategory: "Human Resources (HR)",
      typeOfActivity: "Salary",
      activity: "Provide salaries for health facilities staff",
      frequency: 1,
      unitCost: 450000,
      countQ1: 10,
      countQ2: 10,
      countQ3: 12,
      countQ4: 12,
      comment: "Test activity"
    }
  ],
  isHospital: true,
  metadata: {
    facilityName: "Test Hospital",
    facilityType: "Hospital",
    district: "Test District",
    province: "Test Province",
    period: "FY 2024",
    program: "HIV",
    createdBy: "Test User",
    status: "draft"
  }
};

console.log('✅ Activity Planning API Test Data Structure:');
console.log('==========================================');
console.log(JSON.stringify(testData, null, 2));
console.log('\n🎯 Ready to test the API endpoints!');
console.log('📡 API Endpoints created:');
console.log('  - POST /api/plan (Create new plan)');
console.log('  - GET /api/plan (List all plans)');
console.log('  - GET /api/plan/[id] (Get specific plan)');
console.log('  - PUT /api/plan/[id] (Update plan)');
console.log('  - PATCH /api/plan/[id]/status (Update plan status)');
console.log('  - DELETE /api/plan/[id] (Delete plan)');
console.log('\n🚀 To test the APIs:');
console.log('  1. Start the dev server: npm run dev');
console.log('  2. Run the test suite: node test-api.js');
console.log('  3. Or test manually via frontend at http://localhost:3000'); 