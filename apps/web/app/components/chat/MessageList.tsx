'use client';

import { memo } from "react";
import { ChatStatus, UIMessage } from "ai";
import MessageItem from "./MessageItem";

export interface MessageListProps {
  chatId: string;
  chatStatus: ChatStatus;
  messages: UIMessage[];
}

const MessageList = memo(function MessageList({ chatStatus, messages }: MessageListProps) {
  return (
    <div className="flex-1 overflow-y-auto mb-4 space-y-4">
      {messages.length === 0 && (
        <div className="text-center text-gray-400 mt-8">
          Start conversation by typing a message
        </div>
      )}

      {messages.map((message, index) => (
        <MessageItem key={message.id || `${message.role}-${index}`} message={message} />
      ))}

      {chatStatus !== "ready" && (
        <div className="flex justify-start">
          <div className="bg-gray-800 text-gray-100 rounded-lg px-4 py-2">
            <div className="flex items-center space-x-2 gap-x-2">
              <div
                className="w-2 bg-gray-100 rounded-full animate-bounce"
                style={{ animationDelay: "0ms" }}
              ></div>
              <div
                className="w-2 bg-gray-100 rounded-full animate-bounce"
                style={{ animationDelay: "150ms" }}
              ></div>
              <div
                className="w-2 bg-gray-100 rounded-full animate-bounce"
                style={{ animationDelay: "300ms" }}
              ></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default MessageList;
