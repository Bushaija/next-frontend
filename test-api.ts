// Test script for the registration API
// Run with: bun run test-api.ts

const testUser = {
  name: "Test User",
  email: `test-${Date.now()}@example.com`,
  password: "TestPassword123!",
  confirmPassword: "TestPassword123!",
  province: "Kigali",
  district: "Gasabo",
  hospital: "King Faisal Hospital"
};

async function testRegistrationAPI() {
  try {
    console.log('🧪 Testing registration API...');
    
    const response = await fetch('http://localhost:3001/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser),
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Registration successful!');
      console.log('User data:', data.user);
    } else {
      console.log('❌ Registration failed:');
      console.log('Status:', response.status);
      console.log('Error:', data);
    }
  } catch (error) {
    console.error('❌ Network error:', error);
  }
}

// Test duplicate email
async function testDuplicateEmail() {
  try {
    console.log('\n🧪 Testing duplicate email...');
    
    const response = await fetch('http://localhost:3001/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser), // Same email
    });

    const data = await response.json();
    
    if (response.status === 400 && data.error === 'User already exists') {
      console.log('✅ Duplicate email handling works correctly!');
    } else {
      console.log('❌ Unexpected response for duplicate email:');
      console.log('Status:', response.status);
      console.log('Data:', data);
    }
  } catch (error) {
    console.error('❌ Network error:', error);
  }
}

// Test validation errors
async function testValidationErrors() {
  try {
    console.log('\n🧪 Testing validation errors...');
    
    const invalidUser = {
      name: "",
      email: "invalid-email",
      password: "123", // Too short
      confirmPassword: "456", // Doesn't match
      province: "",
      district: "",
      hospital: ""
    };
    
    const response = await fetch('http://localhost:3001/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invalidUser),
    });

    const data = await response.json();
    
    if (response.status === 400 && data.error === 'Validation failed') {
      console.log('✅ Validation error handling works correctly!');
      console.log('Validation errors:', data.details);
    } else {
      console.log('❌ Unexpected response for validation errors:');
      console.log('Status:', response.status);
      console.log('Data:', data);
    }
  } catch (error) {
    console.error('❌ Network error:', error);
  }
}

// Run all tests
async function runTests() {
  console.log('🚀 Starting API tests...\n');
  
  await testRegistrationAPI();
  await testDuplicateEmail();
  await testValidationErrors();
  
  console.log('\n✨ All tests completed!');
}

runTests(); 