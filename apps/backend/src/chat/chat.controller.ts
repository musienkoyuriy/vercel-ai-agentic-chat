import { Body, Controller, Get, Param, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { UIMessage } from 'ai';
import { ChatService } from './chat.service';

@Controller('chats')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async chat(
    @Body() body: { message: UIMessage; id: string; model: string },
    @Res() res: Response,
  ) {
    await this.chatService.chat(body.message, res, body.id, body.model);
  }

  @Get()
  async getChats() {
    return await this.chatService.getChats();
  }

  @Get(':id/messages')
  async getChatMessages(@Param('id') id: string) {
    return await this.chatService.getChatMessages(id);
  }

  @Get(':id')
  async getChatById(@Param('id') id: string) {
    return await this.chatService.getChatById(id);
  }
}
