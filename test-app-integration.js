const axios = require('axios');

async function testAppIntegration() {
  console.log('Testing app integration with GLM-4-32b model...\n');
  
  // Test the streaming API endpoint
  try {
    console.log('Testing streaming API endpoint...');
    
    const response = await axios.post('http://localhost:3001/api/chat/stream', {
      messages: [
        { role: 'user', content: 'Hello! Can you tell me about yourself?' }
      ]
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Streaming API - Status:', response.status);
    console.log('✅ Streaming API - Working!');
    
  } catch (error) {
    console.log('❌ Streaming API - Error:', error.response?.data || error.message);
  }
  
  // Test the non-streaming API endpoint
  try {
    console.log('\nTesting non-streaming API endpoint...');
    
    const response = await axios.post('http://localhost:3001/api/chat', {
      messages: [
        { role: 'user', content: 'Hello!' }
      ]
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Non-streaming API - Status:', response.status);
    console.log('✅ Non-streaming API - Working!');
    console.log('Response:', response.data.message);
    
  } catch (error) {
    console.log('❌ Non-streaming API - Error:', error.response?.data || error.message);
  }
}

testAppIntegration();
