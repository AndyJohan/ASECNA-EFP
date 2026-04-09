import {
  panneTrend,
  resolutionBreakdown,
  dataTransfers,
  visitesParSite,
  historiquePannes,
} from '../data';
import { chartSizes, buildLinePath, buildDonutGradient } from '../utils/charts';

function HistoriquePage() {
  const linePaths = buildLinePath(panneTrend, chartSizes.width, chartSizes.height, chartSizes.padding);
  const donutStyle = {
    background: buildDonutGradient(resolutionBreakdown),
  };

  return (
    <section className="section">
      <header className="topbar">
        <div>
          <p className="eyebrow">Historique</p>
          <h1>Historique des pannes</h1>
        </div>
        <div className="topbar-actions">
          <button className="ghost-button">Exporter</button>
          <button className="primary-button">Nouvelle analyse</button>
        </div>
      </header>

      <div className="section-header">
        <div>
          <h2>Vue mensuelle</h2>
          <p className="muted">Mois: Juillet 2026</p>
        </div>
        <div className="pill">Donnees issues de la base (a connecter)</div>
      </div>

      <div className="grid-2">
        <div className="card large">
          <div className="card-header">
            <div>
              <h3>Evolution des pannes</h3>
              <span className="muted">12 points de mesure</span>
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
              <strong>52 alertes</strong>
            </div>
          </div>
          <div className="chart-footer">
            {panneTrend.map((point) => (
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
              <strong>62%</strong>
              <span className="muted">Resolus</span>
            </div>
          </div>
          <div className="donut-legend">
            {resolutionBreakdown.map((item) => (
              <div className="legend-row" key={item.label}>
                <span className="legend-chip" style={{ background: item.color }}></span>
                <span>{item.label}</span>
                <strong>{item.value}%</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid-3">
        <div className="card">
          <div className="card-header">
            <h3>Data transfer</h3>
            <span className="muted">12 derniers jours</span>
          </div>
          <div className="spark-grid">
            {dataTransfers.map((value, index) => (
              <span
                key={`${value}-${index}`}
                className="spark"
                style={{ height: `${value * 5}px` }}
              ></span>
            ))}
          </div>
          <div className="metric-row">
            <span>7.45 KB</span>
            <span className="muted">Moyenne par jour</span>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Visites uniques</h3>
            <span className="muted">Sites critiques</span>
          </div>
          <div className="bars">
            {visitesParSite.map((site) => (
              <div key={site.site} className="bar-row">
                <span>{site.site}</span>
                <div className="bar">
                  <div style={{ width: `${Math.min(site.visits / 14, 100)}%` }}></div>
                </div>
                <strong>{site.visits}</strong>
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
              <span>Nom du site</span>
              <strong>Antananarivo</strong>
            </div>
            <div>
              <span>Probleme</span>
              <strong>Perturbation</strong>
            </div>
            <div>
              <span>Nombre de panne</span>
              <strong>199 452</strong>
            </div>
            <div>
              <span>Date derniere panne</span>
              <strong>10 Fevrier 2026</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="card table-card">
        <div className="card-header">
          <h3>Historique detaille</h3>
          <span className="muted">Dernieres alertes issues de la base (a integrer)</span>
        </div>
        <div className="table">
          {historiquePannes.map((item) => (
            <div key={item.id} className="table-row">
              <div>
                <strong>{item.id}</strong>
                <span className="muted">{item.equipement}</span>
              </div>
              <div>
                <span className="muted">Categorie</span>
                <strong>{item.categorie}</strong>
              </div>
              <div>
                <span className="muted">Gravite</span>
                <strong>{item.gravite}</strong>
              </div>
              <div>
                <span className="muted">Date</span>
                <strong>{item.date}</strong>
              </div>
              <div className="status">
                <span className={`status-pill ${item.resolution === 'Resolu' ? 'ok' : item.resolution === 'En cours' ? 'warn' : 'neutral'}`}>
                  {item.resolution}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HistoriquePage;
