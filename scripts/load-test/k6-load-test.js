import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

// Test configuration
export const options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up to 100 users
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 500 }, // Ramp up to 500 users
    { duration: '5m', target: 500 }, // Stay at 500 users
    { duration: '2m', target: 1000 }, // Ramp up to 1000 users
    { duration: '10m', target: 1000 }, // Stay at 1000 users
    { duration: '2m', target: 0 }, // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<200'], // 95% of requests must complete below 200ms
    http_req_failed: ['rate<0.05'], // Error rate must be less than 5%
    errors: ['rate<0.05'],
  },
};

// Test data
const testUsers = [
  { phone: '1234567890', email: 'test1@example.com' },
  { phone: '1234567891', email: 'test2@example.com' },
  { phone: '1234567892', email: 'test3@example.com' },
  { phone: '1234567893', email: 'test4@example.com' },
  { phone: '1234567894', email: 'test5@example.com' },
];

// Helper function to get random user
function getRandomUser() {
  return testUsers[Math.floor(Math.random() * testUsers.length)];
}

// Main test function
export default function () {
  const user = getRandomUser();
  const baseUrl = __ENV.BASE_URL || 'http://localhost:3000';
  
  // Test 1: Homepage load
  const homeResponse = http.get(`${baseUrl}/`);
  check(homeResponse, {
    'homepage loads successfully': (r) => r.status === 200,
    'homepage loads fast': (r) => r.timings.duration < 1000,
  });
  
  if (homeResponse.status !== 200) {
    errorRate.add(1);
  }
  
  sleep(1);
  
  // Test 2: Authentication flow
  const authData = {
    phoneNumber: user.phone,
  };
  
  const otpResponse = http.post(`${baseUrl}/api/auth/loginPhone`, JSON.stringify(authData), {
    headers: { 'Content-Type': 'application/json' },
  });
  
  check(otpResponse, {
    'OTP request successful': (r) => r.status === 200,
    'OTP response time acceptable': (r) => r.timings.duration < 500,
  });
  
  if (otpResponse.status !== 200) {
    errorRate.add(1);
  }
  
  sleep(1);
  
  // Test 3: OTP verification
  const verifyData = {
    phoneNumber: user.phone,
    otpCode: '123456', // Test OTP
  };
  
  const verifyResponse = http.post(`${baseUrl}/api/auth/verifyPhoneOtp`, JSON.stringify(verifyData), {
    headers: { 'Content-Type': 'application/json' },
  });
  
  check(verifyResponse, {
    'OTP verification successful': (r) => r.status === 200,
    'verification response time acceptable': (r) => r.timings.duration < 500,
  });
  
  if (verifyResponse.status !== 200) {
    errorRate.add(1);
  }
  
  sleep(1);
  
  // Test 4: Dashboard load
  const dashboardResponse = http.get(`${baseUrl}/dashboard`);
  check(dashboardResponse, {
    'dashboard loads successfully': (r) => r.status === 200,
    'dashboard loads fast': (r) => r.timings.duration < 1500,
  });
  
  if (dashboardResponse.status !== 200) {
    errorRate.add(1);
  }
  
  sleep(1);
  
  // Test 5: Create escrow deal
  const dealData = {
    title: `Load Test Deal ${Date.now()}`,
    description: 'Load test deal description',
    amount: '1000',
    currency: 'USDC',
    sellerAddress: '0x1234567890123456789012345678901234567890',
  };
  
  const dealResponse = http.post(`${baseUrl}/api/escrow/create`, JSON.stringify(dealData), {
    headers: { 'Content-Type': 'application/json' },
  });
  
  check(dealResponse, {
    'deal creation successful': (r) => r.status === 200,
    'deal creation response time acceptable': (r) => r.timings.duration < 1000,
  });
  
  if (dealResponse.status !== 200) {
    errorRate.add(1);
  }
  
  sleep(2);
  
  // Test 6: API health check
  const healthResponse = http.get(`${baseUrl}/api/health`);
  check(healthResponse, {
    'health check successful': (r) => r.status === 200,
    'health check fast': (r) => r.timings.duration < 100,
  });
  
  if (healthResponse.status !== 200) {
    errorRate.add(1);
  }
  
  sleep(1);
}

// Setup function (runs once before the test)
export function setup() {
  console.log('Starting load test with configuration:', JSON.stringify(options, null, 2));
  return { timestamp: new Date().toISOString() };
}

// Teardown function (runs once after the test)
export function teardown(data) {
  console.log('Load test completed at:', data.timestamp);
} 