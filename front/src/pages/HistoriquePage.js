import { useMemo } from 'react';
import {
  resolutionBreakdown as fallbackResolution,
  pannesParEquipement as fallbackPannes,
} from '../data';
import ImportToolbar from '../components/ImportToolbar';
import { useHistoriqueData } from '../hooks/useHistoriqueData';
import { chartSizes, buildDonutGradient } from '../utils/charts';

function formatMonthLabel(period) {
  if (!period) return 'Mois: --';
  const date = new Date(period);
  if (Number.isNaN(date.getTime())) return `Mois: ${period}`;
  return `Mois: ${date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`;
}

function buildStepPaths(points, width, height, padding) {
  const values = points.map((point) => point.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const span = maxValue - minValue || 1;
  const step = (width - padding * 2) / (points.length - 1 || 1);

  const coords = points.map((point, index) => {
    const x = padding + index * step;
    const normalized = (point.value - minValue) / span;
    const y = height - padding - normalized * (height - padding * 2);
    return { x, y };
  });

  let line = '';
  coords.forEach((coord, index) => {
    if (index === 0) {
      line += `M ${coord.x} ${coord.y}`;
      return;
    }
    const prev = coords[index - 1];
    line += ` L ${coord.x} ${prev.y} L ${coord.x} ${coord.y}`;
  });

  const area = `${line} L ${width - padding} ${height - padding} L ${padding} ${height - padding} Z`;

  return { line, area };
}

function HistoriquePage() {
  const { summary, details, loading, error, reload } = useHistoriqueData();
  const trend = useMemo(() => (summary?.trend?.length ? summary.trend : []), [summary]);
  const resolution = summary?.resolutionBreakdown?.length ? summary.resolutionBreakdown : fallbackResolution;
  const pannesParEquipement = summary?.pannesParEquipement?.length ? summary.pannesParEquipement : fallbackPannes;
  const historiquePannes = details;
  const donutStyle = {
    background: buildDonutGradient(resolution),
  };

  const linePaths = useMemo(() => {
    if (!trend.length) {
      return buildStepPaths(
        [
          { label: 'J1', value: 0 },
          { label: 'J2', value: 0 },
        ],
        chartSizes.width,
        chartSizes.height,
        chartSizes.padding,
      );
    }

    return buildStepPaths(trend, chartSizes.width, chartSizes.height, chartSizes.padding);
  }, [trend]);

  return (
    <section className="section page-historique">
      <header className="topbar">
        <div>
          <p className="eyebrow">Historique</p>
          <h1>Historique des pannes</h1>
        </div>
        <div className="topbar-actions">
          <ImportToolbar onSuccess={reload} />
          <button className="ghost-button">Exporter</button>
          <button className="primary-button">Nouvelle analyse</button>
        </div>
      </header>

      <div className="section-header">
        <div>
          <h2>Vue mensuelle</h2>
          <p className="muted">{formatMonthLabel(summary?.period)}</p>
        </div>
        <div className="month-filter">
          <label className="muted" htmlFor="mois-select">Mois</label>
          <select id="mois-select" className="month-select">
            <option value="2026-01">Janvier 2026</option>
            <option value="2026-02">Fevrier 2026</option>
            <option value="2026-03">Mars 2026</option>
            <option value="2026-04">Avril 2026</option>
            <option value="2026-05">Mai 2026</option>
            <option value="2026-06">Juin 2026</option>
            <option value="2026-07" defaultValue>Juillet 2026</option>
            <option value="2026-08">Aout 2026</option>
            <option value="2026-09">Septembre 2026</option>
            <option value="2026-10">Octobre 2026</option>
            <option value="2026-11">Novembre 2026</option>
            <option value="2026-12">Decembre 2026</option>
          </select>
        </div>
        <div className="pill">
          {loading ? 'Chargement...' : error ? "Erreur de chargement de l'API" : 'Donnees issues de la base (connecte)'}
        </div>
      </div>

      <div className="grid-2">
        <div className="card large">
          <div className="card-header">
            <div>
              <h3>Evolution des pannes</h3>
              <span className="muted">{trend.length} points de mesure</span>
            </div>
            <div className="legend">
              <span className="legend-dot"></span>
              <span>Pannes / jour</span>
            </div>
          </div>
          <div className="chart">
            <svg width={chartSizes.width} height={chartSizes.height} viewBox={`0 0 ${chartSizes.width} ${chartSizes.height}`}>
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#9bb4ff" stopOpacity="0.55" />
                  <stop offset="100%" stopColor="#0f172a" stopOpacity="0.1" />
                </linearGradient>
              </defs>
              <path d={linePaths.area} fill="url(#areaGradient)" />
              <path d={linePaths.line} fill="none" stroke="#cbd5f5" strokeWidth="3" />
            </svg>
            <div className="chart-annotation">
              <p>Pic de pannes</p>
              <strong>{trend.length ? Math.max(...trend.map((point) => point.value)) : 0} alertes</strong>
            </div>
          </div>
          <div className="chart-footer">
            {trend.map((point) => (
              <span key={point.label}>{point.label}</span>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Taux de resolution</h3>
            <span className="muted">Repartition mensuelle</span>
          </div>
          <div className="donut-wrapper">
            <div className="donut" style={donutStyle}></div>
            <div className="donut-center">
              <strong>{resolution[0]?.value ?? 0}%</strong>
              <span className="muted">Resolus</span>
            </div>
          </div>
          <div className="donut-legend">
            {resolution.map((item) => (
              <div className="legend-row" key={item.label}>
                <span className="legend-chip" style={{ background: item.color }}></span>
                <span>{item.label}</span>
                <strong>{item.value}%</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <h3>Pannes par equipement</h3>
            <span className="muted">Top 5 sur la periode</span>
          </div>
          <div className="bars">
            {pannesParEquipement.map((item) => (
              <div key={item.equipement} className="bar-row">
                <span>{item.equipement}</span>
                <div className="bar">
                  <div style={{ width: `${Math.min(item.pannes * 8, 100)}%` }}></div>
                </div>
                <strong>{item.pannes}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Dernier incident</h3>
            <span className="muted">Resume du site</span>
          </div>
          <div className="info-list">
            <div>
              <span>Equipement</span>
              <strong>{summary?.dernierIncident?.equipement ?? '—'}</strong>
            </div>
            <div>
              <span>Date</span>
              <strong>{summary?.dernierIncident?.date ?? '—'}</strong>
            </div>
            <div>
              <span>Heure</span>
              <strong>{summary?.dernierIncident?.heure ?? '—'}</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="card table-card">
        <div className="card-header">
          <h3>Historique detaille</h3>
          <span className="muted">Dernieres alertes issues de la base</span>
        </div>
        <div className="table">
          {historiquePannes.map((item, index) => (
            <div key={`${item.equipement}-${item.date}-${index}`} className="table-row">
              <div>
                <strong>{item.equipement}</strong>
                <span className="muted">{item.categorie ?? '—'}</span>
              </div>
              <div>
                <span className="muted">Heure</span>
                <strong>{item.heure ?? '—'}</strong>
              </div>
              <div>
                <span className="muted">Date</span>
                <strong>{item.date ?? '—'}</strong>
              </div>
              <div>
                <span className="muted">Statut</span>
                <strong>{item.commentaires ?? '—'}</strong>
              </div>
              <div className="status">
                <span className={`status-pill ${item.commentaires === 'Panne' ? 'warning' : 'ok'}`}>
                  {item.commentaires === 'Panne' ? '1' : '0'}
                </span>
              </div>
            </div>
          ))}
          {!historiquePannes.length && (
            <div className="table-row">
              <div>
                <strong>Aucune donnee</strong>
                <span className="muted">Pas d'historique disponible</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default HistoriquePage;
