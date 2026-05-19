'use client';

import { Chat } from "../../chat.store";

export interface ChatPreviewProps {
  chat: Chat;
  currentChatId: string | null | undefined;
  draft: string;
  onPreviewClick: () => void;
}

export function ChatPreview({
  chat,
  currentChatId,
  draft,
  onPreviewClick,
}: ChatPreviewProps) {
  return (
    <button
      key={chat.id}
      className={`w-full px-3 py-2 rounded-lg transition-colors text-left ${currentChatId === chat.id
        ? "bg-gray-800 text-white"
        : "hover:bg-gray-800 text-gray-300"
        }`}
      onClick={onPreviewClick}
    >
      {chat.title && (
        <div className="font-semibold truncate mb-1">{chat.title}</div>
      )}
      {!draft && (
        <div className="text-xs font-semibold truncate mb-1">
          {chat.snippetRole === "user" ? "You" : "Assistant"}
        </div>
      )}
      {draft && <div className="truncate">
        <span className="text-red-400">Draft:</span>
        <span className=" pl-1.5">{draft}</span>
      </div>}
      {!draft && <div className="text-sm truncate mb-1">{chat.snippet}</div>}
      <div className="text-xs text-gray-500">
        {new Date(chat.updatedAt).toLocaleDateString()}
      </div>
    </button>
  );
}
