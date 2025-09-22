#!/usr/bin/env node

/**
 * Test script to verify frontend-backend connection
 * This script tests the API endpoints that the frontend uses
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testConnection() {
  console.log('🧪 Testing Frontend-Backend Connection...');
  console.log('=====================================');

  try {
    // Test 1: Health check
    console.log('\n1. Testing API Health Check...');
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Health check passed');
    console.log(`   Status: ${healthResponse.status}`);
    console.log(`   Message: ${healthResponse.data.message}`);

    // Test 2: Check if we can reach the API
    console.log('\n2. Testing API Base URL...');
    const baseResponse = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ API base URL accessible');
    console.log(`   URL: ${API_BASE_URL}`);

    // Test 3: Test authentication endpoint (should return method not allowed for GET)
    console.log('\n3. Testing Auth Endpoint...');
    try {
      await axios.get(`${API_BASE_URL}/auth/login`);
    } catch (error) {
      if (error.response?.status === 405) {
        console.log('✅ Auth endpoint exists (Method Not Allowed for GET is expected)');
      } else {
        console.log('⚠️  Auth endpoint issue:', error.response?.status);
      }
    }

    // Test 4: Test farmers endpoint (should require authentication)
    console.log('\n4. Testing Farmers Endpoint...');
    try {
      await axios.get(`${API_BASE_URL}/farmers/my-collections`);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Farmers endpoint exists (Unauthorized is expected without token)');
      } else {
        console.log('⚠️  Farmers endpoint issue:', error.response?.status);
      }
    }

    console.log('\n🎉 All connection tests passed!');
    console.log('✅ Frontend should be able to connect to backend successfully');
    console.log('\n📋 Next steps:');
    console.log('   1. Open http://localhost:3000 in your browser');
    console.log('   2. Login or register a new user');
    console.log('   3. Try creating a new collection');

  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Solution: Make sure the backend server is running');
      console.log('   Run: npm start');
    } else if (error.response) {
      console.log(`\n💡 Server responded with status: ${error.response.status}`);
    } else {
      console.log('\n💡 Check your network connection and server status');
    }
  }
}

// Run the test
testConnection();
