import { Injectable } from '@nestjs/common';

@Injectable()
export class AssistantService {
  getAssistantSummary() {
    return {
      source: 'db-placeholder',
      recommandations: [],
      message: 'Expose la synthese IA et les recommandations.',
    };
  }
}
