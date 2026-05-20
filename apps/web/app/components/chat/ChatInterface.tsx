"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, UIMessage } from "ai";
import { useChatStore } from "../../chat.store";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";

export interface ChatInterfaceProps {
  chatId: string;
}

export default function ChatInterface({ chatId }: ChatInterfaceProps) {
  const [selectedModel, setSelectedModel] = useState(
    "google/gemini-2.5-flash-lite",
  );
  const selectedModelRef = useRef(selectedModel);
  const lastAssistantSnippetRef = useRef<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const userInput = useChatStore(
    (s) => s.drafts[chatId]?.value ?? ''
  );

  selectedModelRef.current = selectedModel;

  const upsertChat = useChatStore((store) => store.upsertChat);
  const upsertDraft = useChatStore((store) => store.upsertDraft);

  const { messages, sendMessage, setMessages, status } = useChat({
    id: chatId,
    transport: new DefaultChatTransport({
      api: `${process.env.NEXT_PUBLIC_API_URL}/chats`,
      prepareSendMessagesRequest({ messages }) {
        return {
          body: {
            message: messages.at(-1),
            id: chatId,
            model: selectedModelRef.current,
          },
        };
      },
    }),
    onFinish({ message }) {
      const textPart = message.parts.find((part) => part.type === "text");

      if (!textPart?.text) return;

      const snippet = textPart.text.slice(0, 80);

      if (lastAssistantSnippetRef.current === snippet) return;

      lastAssistantSnippetRef.current = snippet;

      upsertChat({
        id: chatId,
        snippet,
        snippetRole: "assistant",
        updatedAt: new Date(),
      });
    },
  });

  const scrollToBottom = () => {
    const el = bottomRef.current;
    if (!el) return;

    requestAnimationFrame(() =>
      bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
    );
  };

  useLayoutEffect(scrollToBottom, [chatId]);
  useLayoutEffect(scrollToBottom, [messages]);

  useEffect(() => {
    const loadMessages = async () => {
      const res = await fetch(`/api/chats/${chatId}/messages`);
      const messages = (await res.json()) as UIMessage[];

      if (messages.length > 0) {
        setMessages(messages);
      }
    };

    loadMessages();
  }, [chatId, setMessages]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (userInput.trim() === "") return;

    const text = userInput;

    upsertChat({
      id: chatId,
      snippet: userInput.slice(0, 80),
      updatedAt: new Date(),
      snippetRole: "user",
    });

    useChatStore.getState().upsertDraft(chatId, {
      value: '',
      committed: false,
    })

    await sendMessage({ text });
  };

  return (
    <div className="flex-1 flex flex-col h-screen max-w-4xl mx-auto p-4">
      <div className="mb-4">
        <label
          className="block text-sm font-medium text-gray-400 mb-2"
          htmlFor="modelInput"
        >
          Model use
        </label>
        <input
          type="text"
          id="modelInput"
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        <MessageList chatId={chatId} messages={messages} chatStatus={status} />
        <div ref={bottomRef} />
      </div>

      <ChatInput
        value={userInput}
        onChange={(value) => {
          upsertDraft(chatId, { value });

          if (value === '') {
            upsertDraft(chatId, { committed: false });
          }
        }}
        onSubmit={handleSubmit}
        disabled={status !== "ready"}
      />
    </div>
  );
}
