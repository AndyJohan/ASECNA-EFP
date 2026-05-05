import { BadRequestException, Injectable } from '@nestjs/common';
import { UpdateParametresDto } from './dto/update-parametres.dto';

type ParametresState = {
  source: string;
  seuils: {
    critique: number;
    eleve: number;
    moyen: number;
  };
  notifications: {
    sms: string;
    email: string;
    webhook: string;
    dailySummary: boolean;
  };
  assistant: {
    defaultPeriodMode: 'latest' | 'manual';
    defaultCategory: 'ALL' | 'COM' | 'SURV' | 'MET' | 'RESEAU';
    requestTimeoutSeconds: number;
    includeDatabaseContext: boolean;
    maxHistoryMessages: number;
  };
  import: {
    skipOperationalValues: boolean;
    ignoreInvalidDates: boolean;
    normalizeLabels: boolean;
    duplicatePolicy: 'skip' | 'update';
  };
  dashboard: {
    defaultCategory: 'ALL' | 'COM' | 'SURV' | 'MET' | 'RESEAU';
    autoSelectLatestPeriod: boolean;
    trendYAxisMax: number;
    showAssistantContext: boolean;
  };
  message: string;
};

@Injectable()
export class ParametreService {
  private parametres: ParametresState = {
    source: 'runtime-memory',
    seuils: {
      critique: 80,
      eleve: 65,
      moyen: 45,
    },
    notifications: {
      sms: 'Equipe terrain',
      email: 'Direction operations',
      webhook: 'Portail maintenance',
      dailySummary: true,
    },
    assistant: {
      defaultPeriodMode: 'latest',
      defaultCategory: 'ALL',
      requestTimeoutSeconds: 60,
      includeDatabaseContext: true,
      maxHistoryMessages: 20,
    },
    import: {
      skipOperationalValues: true,
      ignoreInvalidDates: true,
      normalizeLabels: true,
      duplicatePolicy: 'skip',
    },
    dashboard: {
      defaultCategory: 'ALL',
      autoSelectLatestPeriod: true,
      trendYAxisMax: 10,
      showAssistantContext: true,
    },
    message: 'Expose la configuration du projet, de l assistant, des imports et du dashboard.',
  };

  getParametres() {
    return this.parametres;
  }

  updateParametres(payload: UpdateParametresDto) {
    this.validate(payload);
    this.parametres = {
      ...this.parametres,
      ...payload,
      seuils: {
        ...this.parametres.seuils,
        ...(payload.seuils ?? {}),
      },
      notifications: {
        ...this.parametres.notifications,
        ...(payload.notifications ?? {}),
      },
      assistant: {
        ...this.parametres.assistant,
        ...(payload.assistant ?? {}),
      },
      import: {
        ...this.parametres.import,
        ...(payload.import ?? {}),
      },
      dashboard: {
        ...this.parametres.dashboard,
        ...(payload.dashboard ?? {}),
      },
    };

    return this.parametres;
  }

  private validate(payload: UpdateParametresDto) {
    const seuils = payload.seuils;
    if (seuils) {
      const values = [seuils.critique, seuils.eleve, seuils.moyen].filter(
        (value) => value !== undefined,
      ) as number[];

      values.forEach((value) => {
        if (value < 0 || value > 100) {
          throw new BadRequestException('Les seuils doivent etre compris entre 0 et 100.');
        }
      });
    }

    if (
      payload.assistant?.requestTimeoutSeconds !== undefined &&
      payload.assistant.requestTimeoutSeconds < 5
    ) {
      throw new BadRequestException(
        "Le delai de l'assistant doit etre d'au moins 5 secondes.",
      );
    }

    if (
      payload.assistant?.maxHistoryMessages !== undefined &&
      payload.assistant.maxHistoryMessages < 1
    ) {
      throw new BadRequestException("L'historique assistant doit contenir au moins 1 message.");
    }

    if (
      payload.dashboard?.trendYAxisMax !== undefined &&
      payload.dashboard.trendYAxisMax < 1
    ) {
      throw new BadRequestException("L'echelle du graphe doit etre au minimum egale a 1.");
    }
  }
}
