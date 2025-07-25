# Project Socrates - Foundation Implementation

## Overview

This document outlines the foundational changes made to support Project Socrates, implementing the data structures and API routing necessary to handle both standard and Socratic chat modes.

## Implementation Summary

### 1. Data Contracts & Type Definitions

**Created:** `src/types/chat.ts`

```typescript
interface ChatRequest {
  messages: ChatMessage[];
  mode?: 'standard' | 'socratic';
}
```

This new interface supports:
- **Standard Mode**: Default behavior using existing Gemini/Enzo system
- **Socratic Mode**: Routes to Python microservice for pedagogical responses

### 2. API Route Updates

**Updated:** `src/app/api/chat/stream/route.ts`
**Updated:** `src/app/api/chat/route.ts`

#### Key Features:
- **Conditional Routing Logic**: 
  - `mode === 'socratic'` → Process with advanced Socratic system prompts
  - `mode === 'standard'` or `undefined` → Continue with existing flow

- **System Prompt Integration**:
  - Dynamic context engineering based on conversation state
  - Comprehensive Socratic methodology implementation
  - Direct Gemini API integration with enhanced prompts

- **Enhanced Reliability**: No external dependencies, integrated error handling

### 3. Service Layer Enhancement

**Updated:** `src/services/chat.service.ts`

#### New Methods:
- `sendChatRequest(request: ChatRequest)` - Unified interface for mode support
- `sendStreamingChatRequest(request: ChatRequest)` - Streaming with mode support

#### Backward Compatibility:
- All existing methods preserved
- Extended mode support to include `'socratic'` option

### 4. Environment Configuration

**Updated:** `.env.example`

```bash
# Project Socrates - Python Microservice Configuration
SOCRATIC_MICROSERVICE_URL="http://localhost:8000"
```

## API Flow Diagram

```
Client Request
     ↓
POST /api/chat/stream
     ↓
Parse ChatRequest { messages, mode }
     ↓
┌─────────────────────────────────┐
│ Conditional Routing Logic       │
├─────────────────────────────────┤
│ if mode === 'socratic':         │
│   → Proxy to Python Service    │
│                                 │
│ else (standard/undefined):      │
│   → Continue to Gemini/Enzo     │
└─────────────────────────────────┘
```

## Integration Points

### Python Microservice Expected Endpoints:

1. **Streaming**: `POST /api/socratic/stream`
   - Input: `{ messages: ChatMessage[] }`
   - Output: Server-sent events stream
   - Format: `data: {"chunk": "..."}\n\n`

2. **Non-streaming**: `POST /api/socratic`
   - Input: `{ messages: ChatMessage[] }`
   - Output: `{ response: string, timestamp: string }`

### Configuration Files:
- `src/config/socratic-system-prompt.ts`: Comprehensive Socratic system prompt and context engineering

## Usage Examples

### For Standard Mode:
```typescript
const request: ChatRequest = {
  messages: [{ role: 'user', content: 'Hello!' }],
  mode: 'standard' // or undefined
};

await chatService.sendStreamingChatRequest(request, onChunk);
```

### For Socratic Mode:
```typescript
const request: ChatRequest = {
  messages: [{ role: 'user', content: 'Explain photosynthesis' }],
  mode: 'socratic'
};

await chatService.sendStreamingChatRequest(request, onChunk);
```

## Next Steps

1. **Frontend Integration**: Create SuggestionChip component to switch between modes
2. **Python Microservice**: Build the Socratic questioning engine
3. **UI Enhancements**: Mode indicators and specialized Socratic UI components
4. **Testing**: End-to-end testing of both modes

## Error Handling

- **Microservice Unavailable**: Returns 503 with fallback message
- **Invalid Mode**: Defaults to standard mode
- **Network Errors**: Proper error propagation with helpful messages

## Backward Compatibility

All existing functionality remains intact. The implementation:
- Preserves all current API contracts
- Maintains existing tool modes ('default', 'markmap')
- Ensures no breaking changes to existing components

---

*This foundation enables seamless switching between standard AI assistance and Socratic pedagogical modes, setting the stage for an intelligent tutoring system.*
