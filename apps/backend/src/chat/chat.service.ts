import { Inject, Injectable } from '@nestjs/common';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import {
  convertToModelMessages,
  generateText,
  ModelMessage,
  streamText,
  UIMessage,
} from 'ai';
import type { Response } from 'express';
import { ToolsService } from './tools.service';
import { DATABASE_CONNECTION, schema } from 'src/database.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import { StoredChat } from './schema';
import { markdownToText } from './chat.utils';

@Injectable()
export class ChatService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<typeof schema>,
    private readonly toolsService: ToolsService,
  ) {}

  async chat(message: UIMessage, res: Response, chatId: string, model: string) {
    const normalisedMessage = { ...message, id: message.id ?? randomUUID() };

    let chat = await this.db.query.chats.findFirst({
      where: eq(schema.chats.id, chatId),
      with: {
        messages: {
          orderBy: schema.messages.createdAt,
        },
      },
    });

    if (!chat) {
      const [newChat] = await this.db
        .insert(schema.chats)
        .values({
          id: chatId,
          snippet: 'No messages',
        })
        .returning();

      chat = { ...newChat, messages: [] };
    }

    const storedMessages = chat.messages.map((message) => message.content);

    const updatedAt = new Date();
    await this.db
      .insert(schema.messages)
      .values({
        chatId: chat.id,
        role: normalisedMessage.role,
        content: normalisedMessage,
        createdAt: updatedAt,
      })
      .returning();

    await this.db
      .update(schema.chats)
      .set({
        updatedAt,
        snippet: this.#getSnippetFromMessage(normalisedMessage),
        snippetRole: message.role === 'user' ? 'user' : 'assistant',
      })
      .where(eq(schema.chats.id, chat.id));

    const uiMessages = [...storedMessages, normalisedMessage];
    const originalCount = uiMessages.length;

    const modelMessages: ModelMessage[] = [
      { role: 'system', content: await this.#getSystemPrompt() },
      ...(await convertToModelMessages(uiMessages)),
    ];

    const result = streamText({
      model,
      messages: modelMessages,
      tools: this.toolsService.getAllTools(),
    });

    result.pipeUIMessageStreamToResponse(res, {
      originalMessages: uiMessages,
      onFinish: async ({ messages }) => {
        const newMessages = messages.slice(originalCount);

        if (newMessages.length === 0) return;

        const normalized = newMessages.map((m) => ({
          ...m,
          id: m.id ?? randomUUID(),
        }));

        const baseTime = Date.now();

        await this.db.insert(schema.messages).values(
          normalized.map((newMessage, idx) => ({
            chatId: chat.id,
            role: newMessage.role,
            content: {
              ...newMessage,
              id: newMessage.id,
            },
            createdAt: new Date(baseTime + idx),
          })),
        );

        const lastMessage = normalized.at(-1);

        const snippet = lastMessage
          ? this.#getSnippetFromMessage(lastMessage)
          : 'No messages...';
        const updatedAt = new Date(baseTime + newMessages.length - 1);

        const meaningfulMessages = this.#findMeaningfulMessages(messages);

        await this.db
          .update(schema.chats)
          .set({
            snippet,
            snippetRole: 'assistant',
            updatedAt,
            title:
              !chat.title && meaningfulMessages.length > 0
                ? await this.#generateChatTitle(meaningfulMessages)
                : undefined,
          })
          .where(eq(schema.chats.id, chatId));
      },
    });
  }

  async getChats(): Promise<StoredChat[]> {
    return await this.db.query.chats.findMany();
  }

  async getChatById(id: string) {
    return await this.db.query.chats.findFirst({
      where: eq(schema.chats.id, id),
    });
  }

  async getChatMessages(id: string): Promise<UIMessage[]> {
    const messages = await this.db.query.messages.findMany({
      where: eq(schema.messages.chatId, id),
      orderBy: schema.messages.createdAt,
    });

    return messages.map((m) => m.content);
  }

  async #generateChatTitle(
    messages: { role: 'user' | 'assistant'; message: string }[],
  ): Promise<string> {
    const prompt = `
      You are a chat title generator. Given the following messages, generate a concise and descriptive title for the chat.
      ${messages.map((m) => `${m.role}: ${m.message}`).join('\n')}
    `;
    const generatedTitle = generateText({
      model: 'google/gemini-2.5-flash-lite',
      prompt,
    });

    return markdownToText((await generatedTitle).output);
  }

  async #getSystemPrompt(): Promise<string> {
    const promptPath = join(process.cwd(), 'src/chat/system-prompt.md');

    return (await readFile(promptPath, 'utf-8')).trim();
  }

  #getSnippetFromMessage(message: UIMessage): string {
    const textPart = message.parts.find((p) => p.type === 'text');

    if (!textPart?.text) return '';

    const text = textPart.text.trim();

    return text.length > 60 ? `${text.slice(0, 60)}...` : text;
  }

  #findMeaningfulMessages(
    messages: UIMessage[],
  ): { message: string; role: 'user' | 'assistant' }[] {
    return messages
      .filter(
        (message): message is UIMessage & { role: 'user' | 'assistant' } =>
          message.role !== 'system',
      )
      .map((message) => ({
        role: message.role,
        message: message.parts
          .filter((message) => message.type === 'text')
          .map((message) => message.text)
          .join(' '),
      }))
      .filter(({ message }) => this.#isMeaningfulMessage(message))
      .slice(0, 3);
  }

  #isMeaningfulMessage = (text: string): boolean => {
    if (!text) return false;

    const t = text.toLowerCase().trim();

    return !['hi', 'hello', 'hey', 'thanks', 'ok', 'okay', 'test'].includes(t);
  };
}
