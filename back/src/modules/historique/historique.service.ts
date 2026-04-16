import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Panne } from '../../entities/panne.entity';
import { SummaryQueryDto } from './dto/summary-query.dto';

@Injectable()
export class HistoriqueService {
  constructor(
    @InjectRepository(Panne)
    private readonly panneRepository: Repository<Panne>,
  ) {}

  async getSummary(query: SummaryQueryDto) {
    const period = await this.resolvePeriod(query.period);

    if (!period) {
      return {
        period: null,
        trend: [],
        resolutionBreakdown: [],
        pannesParEquipement: [],
        dernierIncident: null,
      };
    }

    const [trend, pannesParEquipement, dernierIncident] = await Promise.all([
      this.getTrend(period),
      this.getPannesParEquipement(period),
      this.getDernierIncident(period),
    ]);

    return {
      period,
      trend,
      resolutionBreakdown: [],
      pannesParEquipement,
      dernierIncident,
    };
  }

  async getDetails(query: SummaryQueryDto) {
    const period = await this.resolvePeriod(query.period);

    if (!period) {
      return [];
    }

    const rows = await this.panneRepository
      .createQueryBuilder('panne')
      .innerJoin('panne.equipement', 'equipement')
      .select('equipement.nomEquipement', 'equipement')
      .addSelect('equipement.categorie', 'categorie')
      .addSelect('panne.dates', 'date')
      .addSelect('panne.heure', 'heure')
      .addSelect('panne.commentaires', 'commentaires')
      .where("date_trunc('month', panne.dates) = :period", { period })
      .orderBy('panne.dates', 'DESC')
      .addOrderBy('panne.heure', 'DESC')
      .limit(50)
      .getRawMany<{
        equipement: string;
        categorie: string | null;
        date: string;
        heure: string | null;
        commentaires: string | null;
      }>();

    return rows.map((row) => ({
      equipement: row.equipement,
      categorie: row.categorie ?? null,
      date: row.date,
      heure: row.heure ?? null,
      commentaires: row.commentaires ?? null,
    }));
  }

  private async resolvePeriod(period?: string) {
    if (period) {
      return `${period}-01`;
    }

    const row = await this.panneRepository
      .createQueryBuilder('panne')
      .select("date_trunc('month', panne.dates)", 'period')
      .where('panne.dates IS NOT NULL')
      .orderBy('period', 'DESC')
      .limit(1)
      .getRawOne<{ period: string }>();

    return row?.period ?? null;
  }

  private async getTrend(period: string) {
    const rows = await this.panneRepository
      .createQueryBuilder('panne')
      .select('EXTRACT(DAY FROM panne.dates)', 'day')
      .addSelect('COUNT(*)', 'value')
      .where("date_trunc('month', panne.dates) = :period", { period })
      .groupBy('day')
      .orderBy('day', 'ASC')
      .getRawMany<{ day: string; value: string }>();

    return rows.map((row) => ({
      label: String(row.day).padStart(2, '0'),
      value: Number(row.value),
    }));
  }

  private async getPannesParEquipement(period: string) {
    const rows = await this.panneRepository
      .createQueryBuilder('panne')
      .innerJoin('panne.equipement', 'equipement')
      .select('equipement.nomEquipement', 'equipement')
      .addSelect('COUNT(*)', 'pannes')
      .where("date_trunc('month', panne.dates) = :period", { period })
      .groupBy('equipement.nomEquipement')
      .orderBy('COUNT(*)', 'DESC')
      .limit(5)
      .getRawMany<{ equipement: string; pannes: string }>();

    return rows.map((row) => ({
      equipement: row.equipement,
      pannes: Number(row.pannes),
    }));
  }

  private async getDernierIncident(period: string) {
    const row = await this.panneRepository
      .createQueryBuilder('panne')
      .innerJoin('panne.equipement', 'equipement')
      .select('equipement.nomEquipement', 'equipement')
      .addSelect('equipement.categorie', 'categorie')
      .addSelect('panne.dates', 'date')
      .addSelect('panne.heure', 'heure')
      .addSelect('panne.commentaires', 'commentaires')
      .where("date_trunc('month', panne.dates) = :period", { period })
      .orderBy('panne.dates', 'DESC')
      .addOrderBy('panne.heure', 'DESC')
      .limit(1)
      .getRawOne<{
        equipement: string;
        categorie: string | null;
        date: string;
        heure: string | null;
        commentaires: string | null;
      }>();

    if (!row) {
      return null;
    }

    return {
      equipement: row.equipement,
      categorie: row.categorie ?? null,
      date: row.date,
      heure: row.heure ?? null,
      commentaires: row.commentaires ?? null,
    };
  }
}
