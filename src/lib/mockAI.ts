// Mock AI responses for when OpenRouter is rate limited
export const mockAIResponses = [
  "Hello! I'm Kimi-K2, your AI assistant. I'm here to help you with any questions or tasks you have. How can I assist you today?",
  "I understand you're looking for help. As an AI assistant, I can help with various tasks including answering questions, writing, coding, analysis, and more. What would you like to work on?",
  "Thank you for your question! I'm designed to be helpful, harmless, and honest. I can assist with a wide range of topics. Could you please provide more details about what you need help with?",
  "That's an interesting question! I'm here to provide helpful and accurate information. Let me know what specific topic or task you'd like assistance with.",
  "I appreciate you reaching out! As your AI assistant, I'm ready to help with whatever you need. Please feel free to ask me anything or let me know how I can be of service.",
  "Great question! I'm designed to be a helpful AI assistant that can provide information, help with tasks, and engage in meaningful conversations. What would you like to explore today?",
  "I'm here to help! Whether you need information, want to brainstorm ideas, need help with a project, or just want to have a conversation, I'm ready to assist. What's on your mind?",
  "Thanks for using the chat! I'm Kimi-K2, and I'm designed to be helpful across many different areas. From answering questions to helping with creative tasks, I'm here for you. How can I help?",
  "I'm glad you're here! As an AI assistant, I can help with research, writing, problem-solving, coding, and much more. What would you like to work on together?",
  "Hello! I'm ready to assist you with whatever you need. Whether it's answering questions, helping with analysis, creative writing, or technical tasks, I'm here to help. What can I do for you?"
];

export function getMockAIResponse(userMessage: string): string {
  // Simple keyword-based response selection
  const message = userMessage.toLowerCase();
  
  if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
    return "Hello! I'm Kimi-K2, your AI assistant. It's nice to meet you! How can I help you today?";
  }
  
  if (message.includes('help') || message.includes('assist')) {
    return "I'm here to help! I can assist with a wide variety of tasks including answering questions, writing, coding, analysis, creative projects, and much more. What would you like to work on?";
  }
  
  if (message.includes('what') && (message.includes('you') || message.includes('kimi'))) {
    return "I'm Kimi-K2, an AI assistant designed to be helpful, harmless, and honest. I can help with questions, creative tasks, technical problems, writing, and engaging conversations. What would you like to know more about?";
  }
  
  if (message.includes('code') || message.includes('programming') || message.includes('develop')) {
    return "I'd be happy to help with coding and programming tasks! I can assist with various programming languages, debug code, explain concepts, help with algorithms, and provide coding best practices. What programming challenge are you working on?";
  }
  
  if (message.includes('write') || message.includes('essay') || message.includes('article')) {
    return "I can definitely help with writing tasks! Whether you need help with essays, articles, creative writing, emails, or any other written content, I'm here to assist. What type of writing project are you working on?";
  }
  
  if (message.includes('explain') || message.includes('how') || message.includes('why')) {
    return "I'd be happy to explain that for you! I can break down complex topics into understandable explanations, provide step-by-step instructions, and help clarify concepts. What would you like me to explain?";
  }
  
  if (message.includes('thank') || message.includes('thanks')) {
    return "You're very welcome! I'm glad I could help. If you have any other questions or need assistance with anything else, please don't hesitate to ask. I'm here whenever you need me!";
  }
  
  // Default responses for other messages
  const randomIndex = Math.floor(Math.random() * mockAIResponses.length);
  return mockAIResponses[randomIndex];
}

export function simulateTyping(text: string, onChunk: (chunk: string) => void): Promise<void> {
  return new Promise((resolve) => {
    const words = text.split(' ');
    let currentIndex = 0;
    
    const typeWord = () => {
      if (currentIndex < words.length) {
        const chunk = currentIndex === 0 ? words[currentIndex] : ' ' + words[currentIndex];
        onChunk(chunk);
        currentIndex++;
        setTimeout(typeWord, 50 + Math.random() * 100); // Random delay between 50-150ms
      } else {
        resolve();
      }
    };
    
    typeWord();
  });
}
