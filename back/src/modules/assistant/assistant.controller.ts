import { Controller, Get } from '@nestjs/common';
import { AssistantService } from './assistant.service';

@Controller('assistant-ia')
export class AssistantController {
  constructor(private readonly assistantService: AssistantService) {}

  @Get()
  getAssistantSummary() {
    return this.assistantService.getAssistantSummary();
  }
}
