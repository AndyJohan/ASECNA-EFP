import { Controller, Get } from '@nestjs/common';
import { ParametreService } from './parametre.service';

@Controller('parametre')
export class ParametreController {
  constructor(private readonly parametreService: ParametreService) {}

  @Get()
  getParametres() {
    return this.parametreService.getParametres();
  }
}
