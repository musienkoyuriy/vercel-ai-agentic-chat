import { create } from "zustand";
import { persist, createJSONStorage } from 'zustand/middleware';

export type SnippetRole = "user" | "assistant";

export interface Chat {
  id: string;
  updatedAt: Date;
  snippet: string;
  snippetRole?: SnippetRole;
  title?: string;
}

interface ChatStore {
  chats: Chat[];
  activeChatId: string | null;
  drafts: Record<string, { value: string; commited: boolean }>,
  setChats: (chats: Chat[]) => void;
  upsertChat: (chat: Chat) => void;
  upsertDraft: (chatId: string, draft: { value: string; commited: boolean }) => void;
  setActiveChatId: (chatId: string) => void;
}

export const useChatStore = create<ChatStore>()(
  persist((set) => ({
    chats: [],

    activeChatId: null,

    drafts: {},

    setActiveChatId: (chatId: string) => set({ activeChatId: chatId }),

    setChats: (chats: Chat[]) => set({ chats }),

    upsertChat: (chat: Chat) =>
      set((state) => {
        const exists = state.chats.some((c) => c.id === chat.id);

        if (!exists) {
          return {
            ...state,
            chats: [chat, ...state.chats],
          };
        }

        return {
          ...state,
          chats: state.chats
            .map((c) => (c.id === chat.id ? chat : c))
            .sort(
              (a, b) =>
                new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
            ),
        };
      }),

    upsertDraft: (chatId, draft) =>
      set((state) => ({
        drafts: {
          ...state.drafts,
          [chatId]: draft,
        },
      })),
  }), {
    name: 'chat-storage',
    storage: createJSONStorage(() => localStorage)
  }));
