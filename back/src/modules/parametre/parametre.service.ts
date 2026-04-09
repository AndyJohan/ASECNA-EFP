import { Injectable } from '@nestjs/common';

@Injectable()
export class ParametreService {
  getParametres() {
    return {
      source: 'db-placeholder',
      seuils: {
        critique: 0.8,
        eleve: 0.65,
        moyen: 0.45,
      },
      message: 'Expose la configuration et les notifications.',
    };
  }
}
