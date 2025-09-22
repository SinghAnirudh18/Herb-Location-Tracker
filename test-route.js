#!/usr/bin/env node

/**
 * Simple route test
 */

const axios = require('axios');

async function testRoute() {
  try {
    // First login to get a token
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'processor@example.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    console.log('Token:', token.substring(0, 20) + '...');
    
    // Test the route
    const response = await axios.get('http://localhost:5000/api/processors/batches/TUR-2024-284168', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Response:', response.data);
    
  } catch (error) {
    console.error('Error:', error.response?.status, error.response?.data || error.message);
  }
}

testRoute();
