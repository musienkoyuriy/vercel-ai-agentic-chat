'use client';

import { ChatSidebar } from "./components/ChatSidebar";

export default function Home() {
  return (
    <div className="flex h-screen">
      <ChatSidebar />
      <div className="flex-1 flex items-center justify-center bg-gray-950">
        <div className="text-4xl font-bold text-white mb-4">
          Welcome to AI Chatbot
        </div>
        <p className="text-gray-400 mb-6">Select a chat from the sidebar or create a new one to get started</p>
      </div>
    </div>
  );
}
