import { Injectable } from '@nestjs/common';

@Injectable()
export class CarteService {
  getCarte() {
    return {
      source: 'db-placeholder',
      zones: [],
      message: 'Expose les zones et equipements surveilles.',
    };
  }
}
