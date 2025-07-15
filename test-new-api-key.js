const axios = require('axios');

const testNewApiKey = async () => {
  console.log('Testing new OpenRouter API key...');
  
  try {
    // Test the production deployment
    console.log('Testing production deployment...');
    const response = await axios.post(
      'https://evolve-l449c1pb8-aajs-projects-6d581e87.vercel.app/api/chat',
      {
        messages: [
          { role: 'user', content: 'Hello, this is a test from production!' }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );
    
    console.log('✅ Production API is working!');
    console.log('Response status:', response.status);
    console.log('Response message:', response.data.message);
    console.log('Timestamp:', response.data.timestamp);
    
  } catch (error) {
    console.error('❌ Production API test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Status Text:', error.response.statusText);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
};

testNewApiKey();
