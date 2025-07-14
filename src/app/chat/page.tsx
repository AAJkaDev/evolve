"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "@/hooks/useChat";
import { ChatHeader, ChatMessages, ChatInput, ChatLoading, ChatError } from "@/components";

export default function Chat() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [streamEnabled, setStreamEnabled] = useState(true);
  
  const { messages, isLoading, error, sendMessage, clearMessages, retry } = useChat({
    stream: streamEnabled,
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="w-full h-screen paper-texture flex flex-col overflow-hidden">
      <ChatHeader
        onClearMessages={clearMessages}
        streamEnabled={streamEnabled}
        onStreamToggle={setStreamEnabled}
      />

      <div className="flex-1 flex justify-center px-4 py-2 min-h-0">
        <div className="w-full max-w-4xl flex flex-col dotted-border rounded-lg h-full">
          <div className="flex-1 overflow-y-auto">
            <ChatMessages messages={messages} />
            {isLoading && <ChatLoading />}
            {error && <ChatError error={error} onRetry={retry} />}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      <ChatInput onSendMessage={sendMessage} isLoading={isLoading} />
    </div>
  );
}

