import { assistantMessages } from '../data';

function AssistantPage() {
  return (
    <section className="section page-assistant">
      <header className="topbar">
        <div>
          <p className="eyebrow">Assistant IA</p>
          <h1>Assistant intelligent</h1>
        </div>
        <div className="topbar-actions">
          <button className="primary-button">Nouvelle requete</button>
        </div>
      </header>

      <div className="section-header">
        <div>
          <h2>Synthese & recommandations</h2>
          <p className="muted">Automatisation des alertes et conseils</p>
        </div>
        <div className="pill">Connecte a la base (a integrer)</div>
      </div>

      <div className="card chat-card">
        <div className="chat-window">
          {assistantMessages.map((message, index) => (
            <div key={`${message.from}-${index}`} className={`chat-bubble ${message.from === 'IA' ? 'ai' : 'user'}`}>
              <strong>{message.from}</strong>
              <p>{message.text}</p>
            </div>
          ))}
        </div>
        <div className="chat-input">
          <input type="text" placeholder="Demander une analyse..." />
          <button className="primary-button">Envoyer</button>
        </div>
      </div>
    </section>
  );
}

export default AssistantPage;
