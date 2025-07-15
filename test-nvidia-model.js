// Test script to verify Nvidia Llama model implementation
const axios = require('axios');

async function testNvidiaModel() {
  try {
    console.log('Testing Nvidia Llama-3.1 Nemotron Ultra model...');
    
    const response = await axios.post('http://localhost:3000/api/chat/stream', {
      messages: [
        {
          role: 'user',
          content: 'Hello! Please tell me about the Nvidia Llama-3.1 Nemotron Ultra model.'
        }
      ]
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
    
  } catch (error) {
    console.error('Test failed:', error.response?.data || error.message);
  }
}

testNvidiaModel();
