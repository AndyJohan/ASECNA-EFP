import { Controller, Get } from '@nestjs/common';
import { HistoriqueService } from './historique.service';

@Controller('historique')
export class HistoriqueController {
  constructor(private readonly historiqueService: HistoriqueService) {}

  @Get()
  getHistorique() {
    return this.historiqueService.getHistorique();
  }
}
