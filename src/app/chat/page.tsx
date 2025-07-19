"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "@/hooks/useChat";
import { ChatHeader, ChatInput, ChatLoading, ChatError } from "@/components";
import ChatMessage from "@/components/chat/ChatMessage";
export default function Chat() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [streamEnabled, setStreamEnabled] = useState(true);
  
  const { 
    turns, 
    isLoading, 
    error, 
    sendMessage, 
    clearMessages, 
    retry, 
    handleRetry, 
    handleEditAndResubmit,
    stopGeneration
  } = useChat({
    stream: streamEnabled,
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Get the last user message for media search context
  const lastUserPrompt = turns.length > 0 ? turns[turns.length - 1].userMessage.content : '';



  useEffect(() => {
    scrollToBottom();
  }, [turns]);

  return (
    <div className="w-full h-screen paper-texture flex flex-col overflow-hidden">
      <ChatHeader
        onClearMessages={clearMessages}
        streamEnabled={streamEnabled}
        onStreamToggle={setStreamEnabled}
      />

      {/* Full-page scrollable chat area */}
      <div className="flex-1 overflow-y-auto px-4 py-2">
        <div className="max-w-4xl mx-auto space-y-4 pb-4">
          {turns.length === 0 ? (
            <div className="text-center text-[var(--evolve-dark-gray)] mt-20">
              <p className="text-lg mb-2 text-[var(--evolve-charcoal)] font-medium">Welcome to EVOLVE Chat!</p>
              <p className="text-sm">Start a conversation by typing a message below.</p>
            </div>
          ) : (
            turns.map((turn, turnIndex) => (
              <div key={turn.id} className="space-y-4">
                {/* Render User Message */}
                <ChatMessage 
                  message={turn.userMessage} 
                  turnIndex={turnIndex}
                  onEdit={(newContent) => handleEditAndResubmit(turnIndex, newContent)}
                />
                
                {/* Render AI Responses */}
                {turn.aiResponses.map((response, responseIndex) => (
                  <ChatMessage 
                    key={response.id}
                    message={response} 
                    turnIndex={turnIndex}
                    responseIndex={responseIndex}
                    totalResponses={turn.aiResponses.length}
                    onRetry={() => handleRetry(turnIndex)}
                  />
                ))}
              </div>
            ))
          )}
          {isLoading && <ChatLoading />}
          {error && <ChatError error={error} onRetry={retry} />}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Fixed chat input at bottom */}
      <div className="flex-shrink-0">
        <ChatInput 
          onSendMessage={sendMessage} 
          isLoading={isLoading}
          lastUserPrompt={lastUserPrompt}
          onStop={stopGeneration}
        />
      </div>
    </div>
  );
}

