const axios = require('axios');

async function testNvidiaModel() {
  const apiKey = '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';
  
  const models = [
    'nvidia/llama-3.1-nemotron-ultra-253b-v1',
    'nvidia/llama-3.1-nemotron-ultra-253b-v1:free',
    'mistralai/mistral-7b-instruct:free',
    'google/gemma-2-9b-it:free',
    'meta-llama/llama-3-8b-instruct:free',
    'microsoft/phi-3-mini-128k-instruct:free'
  ];
  
  console.log('Testing Nvidia model variations...\n');
  
  for (const model of models) {
    try {
      console.log(`Testing model: ${model}`);
      
      const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
        model: model,
        messages: [
          { role: 'user', content: 'Hello' }
        ],
        max_tokens: 50
      }, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`✅ ${model} - Working!`);
      console.log(`Response: ${response.data.choices[0].message.content.substring(0, 100)}...\n`);
      
    } catch (error) {
      console.log(`❌ ${model} - Error: ${error.response?.data?.error?.message || error.message}\n`);
    }
  }
}

testNvidiaModel();
