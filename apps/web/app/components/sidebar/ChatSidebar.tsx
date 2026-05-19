"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";
import { Chat, useChatStore } from "../../chat.store";
import { ChatPreview } from "./ChatPreview";

export function ChatSidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const chats = useChatStore((store) => store.chats);
  const setChats = useChatStore((store) => store.setChats);
  const setActiveChatId = useChatStore((store) => store.setActiveChatId);

  const fetchChats = useCallback(async () => {
    const res = await fetch("/api/chats");
    const chats = await res.json();

    setChats(chats);
  }, [setChats]);

  useEffect(() => void fetchChats(), [fetchChats]);

  const createNewChat = () => {
    const newChatId = crypto.randomUUID();

    router.push(`/chat/${newChatId}`);
  };

  const getCurrentChatId = () => {
    if (pathname.includes("/chat/")) {
      return pathname.split("/")[2];
    }

    return null;
  };

  const currentChatId = getCurrentChatId();

  const drafts = useChatStore((store) => store.drafts);

  const onPreviewClick = (chat: Chat) => {
    setActiveChatId(chat.id);
    router.push(`/chat/${chat.id}`);
  }

  return (
    <div className="flex flex-col h-screen w-64 bg-gray-900 border-r border-gray-700">
      <div className="p-4 border-b border-gray-700">
        <button
          onClick={createNewChat}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          + New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {chats.length === 0 ? (
          <div className="text-center text-gray-500 py-8 text-sm">
            Not chats yet
          </div>
        ) : (
          <div className="space-y-1">
            {chats.map((chat) =>
              <ChatPreview
                key={chat.id}
                chat={chat}
                draft={drafts[chat.id]?.value ?? ''}
                currentChatId={currentChatId}
                onPreviewClick={() => onPreviewClick(chat)}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
