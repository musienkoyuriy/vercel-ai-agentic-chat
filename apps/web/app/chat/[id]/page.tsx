'use client';

import { useParams } from "next/navigation";
import { ChatSidebar } from "../../components/sidebar/ChatSidebar";
import ChatInterface from "../../components/chat/ChatInterface";

export default function ChatPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  return (
    <div className="flex h-screen">
      <ChatSidebar />
      <ChatInterface chatId={id} />
    </div>
  );
}
