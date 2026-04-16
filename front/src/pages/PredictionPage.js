import { predictionList } from '../data';

function PredictionPage() {
  return (
    <section className="section page-prediction">
      <header className="topbar">
        <div>
          <p className="eyebrow">Prediction</p>
          <h1>Alertes de prediction</h1>
        </div>
        <div className="topbar-actions">
          <button className="ghost-button">Simuler un scenario</button>
        </div>
      </header>

      <div className="section-header">
        <div>
          <h2>Risque eleve</h2>
          <p className="muted">Alertes a risque eleve sur 30 jours</p>
        </div>
        <div className="pill">Modeles en production</div>
      </div>

      <div className="grid-3">
        {predictionList.map((prediction) => (
          <div className="card" key={prediction.id}>
            <div className="card-header">
              <h3>{prediction.equipement}</h3>
              <span className="muted">{prediction.id}</span>
            </div>
            <div className="metric-row">
              <strong>{prediction.risque}</strong>
              <span className="muted">Risque</span>
            </div>
            <div className="metric-row">
              <strong>{prediction.horizon}</strong>
              <span className="muted">Horizon</span>
            </div>
            <div className="metric-row">
              <strong>{prediction.action}</strong>
              <span className="muted">Action recommendee</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default PredictionPage;
