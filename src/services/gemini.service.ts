import { GoogleGenerativeAI, GenerativeModel, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { ChatMessage } from './chat.service';

// Comprehensive system instruction for Enzo with advanced mind map capabilities
export const enzoSystemInstruction = `
You are Enzo, a helpful AI assistant created by Evolve. You are knowledgeable, friendly, and always strive to provide accurate and helpful responses.

## Core Personality
- Be conversational, warm, and approachable
- Provide clear, concise, and actionable information
- Maintain professionalism while being personable
- Always aim to be helpful and constructive

## Advanced Mind Map Generation Capabilities

### When to Generate Mind Maps
- When users ask for visual organization of information
- For complex topics that benefit from hierarchical structure
- When summarizing multi-layered concepts
- For brainstorming sessions and idea organization
- When users explicitly request a mind map

### Enhanced Mind Map Syntax Rules
**CRITICAL:** All mind maps must start with exactly '# Mind Map' as the first line.

**RICH MARKDOWN FEATURES - USE EXTENSIVELY:**
Utilize the FULL potential of markdown to create visually rich and engaging mind maps:

1. **Text Formatting:**
   - **Bold text** for emphasis and key concepts
   - *Italic text* for definitions, quotes, or secondary information
   - ***Bold italic*** for critical highlights
   - ~~Strikethrough~~ for deprecated or incorrect information
   - \`Inline code\` for technical terms, commands, or variables

2. **Code Blocks with Syntax Highlighting:**
   \`\`\`python
   def example_function():
       return "Use code blocks for examples"
   \`\`\`

3. **Interactive Elements:**
   - [ ] Unchecked checkbox for tasks/todo items
   - [x] Checked checkbox for completed items
   - [?] Question checkbox for areas needing research

4. **Mathematical Formulas:**
   - Inline math: \$E = mc^2\$ for simple equations
   - Block math for complex formulas:
   \$\$\\frac{d}{dx}\\int_a^x f(t)dt = f(x)\$\$

5. **Tables for Structured Data:**
   | Feature | Description | Status |
   |---------|-------------|--------|
   | Feature A | Core functionality | ✅ Complete |
   | Feature B | Enhancement | 🔄 In Progress |

6. **Symbols and Emojis:**
   - Use relevant emojis: 🚀 📊 💡 ⚡ 🎯 🔍 📚 💻 🌟 ⚠️
   - Technical symbols: → ← ↑ ↓ ⟷ ∆ ∑ ∏ ∞ ≈ ≠ ≤ ≥
   - Status indicators: ✅ ❌ ⚠️ 🔄 📋 🎯

7. **Hyperlinks and References:**
   - [Link text](URL) for external resources
   - [Internal references](#section) for cross-references

8. **Advanced Formatting:**
   - > Blockquotes for important principles or quotes
   - Horizontal rules (---) for section breaks
   - Nested lists with mixed numbering:
     1. First item
        - Sub-item A
        - Sub-item B
     2. Second item
        a) Sub-option 1
        b) Sub-option 2

**Enhanced Example Format with Rich Features:**
\`\`\`
# Mind Map

## 🚀 **Core Concepts**
- **Primary Focus** *(Most Important)*
  - [ ] Task to complete
  - [x] Already implemented
  - \`technical_term\` or command
  - \$formula = value\$ for calculations
- *Secondary Aspect*
  - > "Important principle or quote"
  - Status: ✅ Ready | 🔄 In Progress | ❌ Blocked

## 📊 **Technical Implementation**
- **Code Examples:**
  \`\`\`javascript
  function processData(input) {
    return input.map(item => transform(item));
  }
  \`\`\`
- **Performance Metrics:**
  | Metric | Value | Target |
  |--------|-------|--------|
  | Speed | 100ms | < 50ms |
  | Memory | 2GB | < 1GB |

## 💡 **Key Insights & Formulas**
- **Mathematical Relationships:**
  - Growth rate: \$\$r = \\frac{\\Delta N}{N \\cdot \\Delta t}\$\$
  - Simple calculation: \$efficiency = \\frac{output}{input} \\times 100\\%\$
- **Decision Matrix:**
  - [ ] Option A: High impact, low effort
  - [ ] Option B: Medium impact, medium effort
  - [x] Option C: Selected solution ⭐

## 🎯 **Action Items & Next Steps**
- **Immediate Actions** (⚡ High Priority)
  1. Complete \`setup()\` function
  2. Test with sample data
  3. Optimize performance
- **Future Considerations** (📋 Backlog)
  - Research alternative approaches
  - Consider scalability: *Can this handle 10x growth?*
  - ~~Previous approach~~ (deprecated)

---

### 📚 **Resources & References**
- [Documentation](https://example.com/docs)
- Internal guide: [Best Practices](#best-practices)
- Key insight: > "Optimization without measurement is premature"
\`\`\`

### Mind Map Best Practices (Enhanced)
1. **Rich Visual Hierarchy**: Use headers, formatting, and symbols
2. **Interactive Elements**: Include checkboxes for actionable items
3. **Technical Precision**: Use code blocks and formulas where relevant
4. **Status Indicators**: Show progress with symbols and emojis
5. **Structured Data**: Use tables for comparisons and metrics
6. **Cross-References**: Link related sections and external resources
7. **Memorable Symbols**: Use emojis to make concepts stick
8. **Mixed Content Types**: Combine text, code, math, and tables

### Content Guidelines (Enhanced)
- Maximum 6 levels of hierarchy (# to ######)
- Each main branch should have 2-8 sub-items
- Use **bold** for key concepts, *italics* for context
- Include \`inline code\` for technical terms
- Add checkboxes [ ] for actionable items
- Use tables for structured comparisons
- Include relevant mathematical formulas with $ or $$
- Add emojis and symbols for visual appeal
- Use blockquotes > for important principles
- Include code blocks with proper syntax highlighting
- Maintain EVOLVE brand tone: innovative, accessible, empowering

## Response Protocols

### Regular Responses
- Provide comprehensive, well-structured answers
- Use formatting (bold, italics, lists) for clarity
- Include examples when appropriate
- Offer follow-up questions or suggestions

### Enhanced Mind Map Responses
- Start immediately with '# Mind Map'
- No additional text before or after the mind map
- Use the FULL range of markdown features available
- Include multiple content types: text, code, tables, formulas, checkboxes
- Make it visually rich and engaging for maximum learning impact
- Focus on essential information hierarchy with enhanced formatting
- Use emojis and symbols strategically for visual learning
- Include interactive elements like checkboxes for engagement

## Technical Capabilities
- Generate code examples and explanations
- Create step-by-step guides
- Provide analysis and recommendations
- Offer troubleshooting assistance
- Support multiple programming languages and frameworks

## Brand Alignment
- Embody EVOLVE's values: innovation, growth, accessibility
- Encourage continuous learning and improvement
- Provide solutions that empower users
- Maintain a forward-thinking, optimistic perspective

**CRITICAL INSTRUCTION:** When generating mind maps, utilize the MAXIMUM potential of markdown formatting. Don't just use plain text - incorporate bold, italics, code blocks, tables, formulas, checkboxes, emojis, symbols, and all other available markdown features to create the most visually engaging and educational experience possible. This is essential for optimal visual learning.
`;

export interface GeminiConfig {
  model: string;
  apiKey: string;
  generationConfig?: {
    temperature?: number;
    topK?: number;
    topP?: number;
    maxOutputTokens?: number;
  };
  safetySettings?: Array<{
    category: string;
    threshold: string;
  }>;
}

export class GeminiService {
  private static instance: GeminiService;
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;
  private apiKey: string;
  private modelName: string = 'gemini-1.5-flash';

  private constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('Gemini API key is required');
    }
    
    this.apiKey = apiKey;
    this.genAI = new GoogleGenerativeAI(apiKey);
    
    // Configure the model with optimized settings
    this.model = this.genAI.getGenerativeModel({
      model: this.modelName,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    });
  }

  static getInstance(apiKey?: string): GeminiService {
    if (!GeminiService.instance) {
      // For server-side usage, prioritize server-side API key
      const key = apiKey || process.env.GEMINI_API_KEY;
      if (!key) {
        throw new Error('Gemini API key not found. Please set GEMINI_API_KEY environment variable for server-side usage.');
      }
      GeminiService.instance = new GeminiService(key);
    }
    return GeminiService.instance;
  }

  /**
   * Convert chat messages to Gemini format
   */
  private formatMessagesForGemini(messages: ChatMessage[]): Array<{ role: string; parts: Array<{ text: string }> }> {
    const formattedMessages: Array<{ role: string; parts: Array<{ text: string }> }> = [];
    
    for (const message of messages) {
      // Skip system messages for now - we'll handle them separately
      if (message.role === 'system') {
        continue;
      }
      
      // Map OpenAI roles to Gemini roles
      const geminiRole = message.role === 'assistant' ? 'model' : 'user';
      
      formattedMessages.push({
        role: geminiRole,
        parts: [{ text: message.content }],
      });
    }
    
    return formattedMessages;
  }

  /**
   * Get system prompt from messages
   */
  private getSystemPrompt(messages: ChatMessage[]): string {
    const systemMessage = messages.find(msg => msg.role === 'system');
return systemMessage ? systemMessage.content : enzoSystemInstruction;
  }

  /**
   * Send a non-streaming message to Gemini
   */
  async sendMessage(messages: ChatMessage[]): Promise<string> {
    try {
      console.log('Sending request to Gemini API with model:', this.modelName);
      console.log('Messages:', JSON.stringify(messages, null, 2));

      const systemPrompt = this.getSystemPrompt(messages);
      const formattedMessages = this.formatMessagesForGemini(messages);

      // If we have conversation history, use chat session
      if (formattedMessages.length > 1) {
        const chat = this.model.startChat({
          history: formattedMessages.slice(0, -1), // All but the last message
        });

        // Add system prompt to the last user message
        const lastMessage = formattedMessages[formattedMessages.length - 1];
        const promptWithSystem = `${systemPrompt}\n\nUser: ${lastMessage.parts[0].text}`;

        const result = await chat.sendMessage(promptWithSystem);
        const response = await result.response;
        const text = response.text();

        console.log('✅ Gemini API SUCCESS:', {
          model: this.modelName,
          responseLength: text.length,
        });

        return text;
      } else {
        // Single message - use generateContent
        const userMessage = formattedMessages[0]?.parts[0]?.text || '';
        const promptWithSystem = `${systemPrompt}\n\nUser: ${userMessage}`;

        const result = await this.model.generateContent(promptWithSystem);
        const response = await result.response;
        const text = response.text();

        console.log('✅ Gemini API SUCCESS:', {
          model: this.modelName,
          responseLength: text.length,
        });

        return text;
      }
    } catch (error) {
      console.error('❌ Gemini API Error:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('API_KEY_INVALID')) {
          throw new Error('Invalid Gemini API key. Please check your API key configuration.');
        } else if (error.message.includes('QUOTA_EXCEEDED')) {
          throw new Error('Gemini API quota exceeded. Please try again later.');
        } else if (error.message.includes('RATE_LIMIT_EXCEEDED')) {
          throw new Error('Rate limit exceeded. Please wait before sending another message.');
        } else {
          throw new Error(`Gemini API request failed: ${error.message}`);
        }
      }
      
      throw new Error('Unknown error occurred while communicating with Gemini API');
    }
  }

  /**
   * Send a streaming message to Gemini
   */
  async sendStreamedMessage(
    messages: ChatMessage[],
    onChunk: (chunk: string) => void,
    abortSignal?: AbortSignal
  ): Promise<void> {
    try {
      console.log('Sending streaming request to Gemini API with model:', this.modelName);

      const systemPrompt = this.getSystemPrompt(messages);
      const formattedMessages = this.formatMessagesForGemini(messages);

      // If we have conversation history, use chat session
      if (formattedMessages.length > 1) {
        const chat = this.model.startChat({
          history: formattedMessages.slice(0, -1), // All but the last message
        });

        // Add system prompt to the last user message
        const lastMessage = formattedMessages[formattedMessages.length - 1];
        const promptWithSystem = `${systemPrompt}\n\nUser: ${lastMessage.parts[0].text}`;

        const result = await chat.sendMessageStream(promptWithSystem);
        
        for await (const chunk of result.stream) {
          // Check if request was aborted
          if (abortSignal?.aborted) {
            console.log('Streaming aborted by client');
            return;
          }
          
          const chunkText = chunk.text();
          if (chunkText) {
            onChunk(chunkText);
          }
        }
      } else {
        // Single message - use generateContentStream
        const userMessage = formattedMessages[0]?.parts[0]?.text || '';
        const promptWithSystem = `${systemPrompt}\n\nUser: ${userMessage}`;

        const result = await this.model.generateContentStream(promptWithSystem);
        
        for await (const chunk of result.stream) {
          // Check if request was aborted
          if (abortSignal?.aborted) {
            console.log('Streaming aborted by client');
            return;
          }
          
          const chunkText = chunk.text();
          if (chunkText) {
            onChunk(chunkText);
          }
        }
      }

      console.log('✅ Gemini streaming completed successfully');
    } catch (error) {
      console.error('❌ Gemini streaming error:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('API_KEY_INVALID')) {
          throw new Error('Invalid Gemini API key. Please check your API key configuration.');
        } else if (error.message.includes('QUOTA_EXCEEDED')) {
          throw new Error('Gemini API quota exceeded. Please try again later.');
        } else if (error.message.includes('RATE_LIMIT_EXCEEDED')) {
          throw new Error('Rate limit exceeded. Please wait before sending another message.');
        } else {
          throw new Error(`Gemini streaming failed: ${error.message}`);
        }
      }
      
      throw new Error('Unknown error occurred during Gemini streaming');
    }
  }

  /**
   * Test the Gemini API connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const testMessage: ChatMessage = {
        role: 'user',
        content: 'Hello, this is a test message.'
      };
      
      const response = await this.sendMessage([testMessage]);
      return response.length > 0;
    } catch (error) {
      console.error('Gemini connection test failed:', error);
      return false;
    }
  }

  /**
   * Get model information
   */
  getModelInfo(): { name: string; apiKey: string } {
    return {
      name: this.modelName,
      apiKey: this.apiKey ? `${this.apiKey.substring(0, 10)}...` : 'Not set'
    };
  }
}

export const createGeminiService = (apiKey?: string): GeminiService => {
  return GeminiService.getInstance(apiKey);
};
