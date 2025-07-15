const axios = require('axios');

async function testGLMModel() {
  const apiKey = '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';
  
  console.log('Testing GLM-4-32b model...\n');
  
  try {
    console.log('Testing model: thudm/glm-4-32b:free');
    
    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: 'thudm/glm-4-32b:free',
      messages: [
        { role: 'user', content: 'Hello! Can you tell me about yourself?' }
      ],
      max_tokens: 1024,
      temperature: 0.7
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ GLM-4-32b model - Working!');
    console.log('Response:', response.data.choices[0].message.content);
    console.log('Usage:', response.data.usage);
    
  } catch (error) {
    console.log('❌ GLM-4-32b model - Error:', error.response?.data?.error?.message || error.message);
    console.log('Status:', error.response?.status);
    console.log('Full error:', error.response?.data);
  }
}

testGLMModel();
