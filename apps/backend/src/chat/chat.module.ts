import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ToolsService } from './tools.service';

@Module({
  providers: [ChatService, ToolsService],
  controllers: [ChatController],
})
export class ChatModule {}
