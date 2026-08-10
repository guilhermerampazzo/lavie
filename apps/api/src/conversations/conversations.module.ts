import { Module } from '@nestjs/common';
import { AiService } from '@lavie/ai';
import { ConversationsController } from './conversations.controller';
import { ConversationsService } from './conversations.service';
import { EvolutionModule } from '../evolution/evolution.module';

@Module({
  imports: [EvolutionModule],
  controllers: [ConversationsController],
  providers: [ConversationsService, AiService],
})
export class ConversationsModule {}
