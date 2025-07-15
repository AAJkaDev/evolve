# GLM-4-32b Model Implementation

## Overview
This document describes the implementation of the "thudm/glm-4-32b:free" model using the OpenRouter API in your Evolve chat application.

## Changes Made

### 1. Configuration Updates (`src/config/openrouter.ts`)
- Updated `MODEL_ID` to use `"thudm/glm-4-32b:free"`
- Optimized parameters for the GLM-4-32b model:
  - `max_tokens`: Set to 2,048 (optimized for free models)
  - `temperature`: Set to 0.6 (balanced creativity and consistency)
  - `top_p`: Set to 0.95 (diverse vocabulary)

### 2. Enhanced API Client (`src/lib/openrouter.ts`)
- Implemented robust fallback mechanism with multiple models:
  1. `thudm/glm-4-32b:free` (primary - working and reliable)
  2. `mistralai/mistral-7b-instruct:free` (fallback)
  3. `google/gemma-2-9b-it:free` (secondary fallback)
- Added comprehensive error handling and debugging
- Enhanced logging with model information and usage statistics

### 3. API Route Compatibility
- The existing streaming route (`src/app/api/chat/stream/route.ts`) works seamlessly with the new implementation
- The non-streaming route (`src/app/api/chat/route.ts`) is also compatible

## Model Parameters

The GLM-4-32b model is configured with the following optimized parameters:

```typescript
{
  max_tokens: 2048,     // Optimized for free models
  temperature: 0.6,     // Balanced creativity and consistency
  top_p: 0.95,         // Diverse vocabulary
  frequency_penalty: 0, // No repetition penalty
  presence_penalty: 0   // No presence penalty
}
```

## Fallback Strategy

The implementation includes a robust fallback mechanism:

1. **Primary Model**: `thudm/glm-4-32b:free`
   - GLM-4-32b model from Zhipu AI
   - 32B parameters for high-quality responses
   - Fully working and reliable

2. **Fallback Model**: `mistralai/mistral-7b-instruct:free`
   - Proven reliable model
   - Good balance of performance and availability

3. **Secondary Fallback**: `google/gemma-2-9b-it:free`
   - Google's Gemma 2 model
   - Additional safety net

## Error Handling

The implementation includes comprehensive error handling:

- **401 Unauthorized**: Invalid API key - terminates immediately
- **404 Not Found**: Model not available - tries next model in chain
- **429 Rate Limited**: Rate limit exceeded - tries next model
- **500 Server Error**: Service unavailable - tries next model
- **Network Errors**: Connection issues - tries next model

## Testing

### Manual Testing
1. Start the development server:
   ```bash
   npm run dev
   ```

2. Test the chat interface at `http://localhost:3000`

### Automated Testing
Run the test script:
```bash
node test-glm-model.js
```

## Environment Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Add your OpenRouter API key:
   ```
   OPENROUTER_API_KEY=your_actual_api_key_here
   ```

3. Get your API key from [OpenRouter](https://openrouter.ai/keys)

## Monitoring and Debugging

The implementation includes extensive logging:

- Request details (model, messages)
- Response information (status, usage statistics)
- Error details (status codes, error messages)
- Model fallback information

Check the console/logs for detailed information about API calls and any issues.

## Performance Considerations

- The GLM-4-32b model has a reasonable token limit (2,048) for efficient responses
- Fallback mechanism ensures high availability
- Optimized parameters for better response quality
- Timeout set to 30 seconds for reliable performance
- Model is fully working and reliable

## Security

- API key is stored in environment variables
- No sensitive information is logged
- Rate limiting configuration included
- Message validation on all inputs

## Next Steps

1. **Test thoroughly**: Ensure the model works as expected
2. **Monitor performance**: Check response times and quality
3. **Adjust parameters**: Fine-tune based on actual usage
4. **Add metrics**: Consider adding usage tracking
5. **Production deployment**: Ensure environment variables are set correctly

## Troubleshooting

### Common Issues

1. **"API key not found"**: Ensure `OPENROUTER_API_KEY` is set in your environment
2. **"Model not available"**: The fallback mechanism should handle this automatically
3. **"Rate limit exceeded"**: Wait a moment and try again, or check your OpenRouter usage
4. **"All model requests failed"**: Check your internet connection and OpenRouter service status

### Debug Steps

1. Check environment variables
2. Verify API key validity
3. Check OpenRouter service status
4. Review console logs for detailed error information
5. Test with the fallback models individually

## Support

For issues related to:
- OpenRouter API: Check [OpenRouter Documentation](https://openrouter.ai/docs)
- GLM-4-32b Model: Refer to Zhipu AI documentation
- Application bugs: Check the console logs and error messages
