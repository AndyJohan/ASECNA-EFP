import { Injectable } from '@nestjs/common';

@Injectable()
export class HistoriqueService {
  getHistorique() {
    return {
      source: 'db-placeholder',
      periode: 'Juillet 2026',
      totalPannes: 199452,
      message: 'Brancher la base de donnees pour alimenter cette route.',
    };
  }
}
