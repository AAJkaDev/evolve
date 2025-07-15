const axios = require('axios');

async function testFreeModels() {
  const apiKey = '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';
  
  const models = [
    'nvidia/llama-3.1-nemotron-ultra-253b-v1:free',
    'mistralai/mistral-7b-instruct:free',
    'microsoft/phi-3-mini-4k-instruct:free',
    'huggingfaceh4/zephyr-7b-beta:free',
    'openchat/openchat-7b:free',
    'gryphe/mythomist-7b:free',
    'nousresearch/nous-capybara-7b:free'
  ];
  
  console.log('Testing free models...\n');
  
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

testFreeModels();
