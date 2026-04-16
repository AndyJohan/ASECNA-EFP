function ParametrePage() {
  return (
    <section className="section page-parametre">
      <header className="topbar">
        <div>
          <p className="eyebrow">Parametre</p>
          <h1>Reglages de la plateforme</h1>
        </div>
        <div className="topbar-actions">
          <button className="ghost-button">Sauvegarder</button>
        </div>
      </header>

      <div className="section-header">
        <div>
          <h2>Configuration</h2>
          <p className="muted">Reglages du modele et notifications</p>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <h3>Seuils d'alerte</h3>
            <span className="muted">Configuration modele</span>
          </div>
          <div className="info-list">
            <div>
              <span>Critique</span>
              <strong>80%</strong>
            </div>
            <div>
              <span>Eleve</span>
              <strong>65%</strong>
            </div>
            <div>
              <span>Moyen</span>
              <strong>45%</strong>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <h3>Notifications</h3>
            <span className="muted">Equipes connectees</span>
          </div>
          <div className="info-list">
            <div>
              <span>SMS</span>
              <strong>Equipe terrain</strong>
            </div>
            <div>
              <span>Email</span>
              <strong>Direction operations</strong>
            </div>
            <div>
              <span>Webhook</span>
              <strong>Portail maintenance</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ParametrePage;
