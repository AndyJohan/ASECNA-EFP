function CartePage() {
  return (
    <section className="section page-carte">
      <header className="topbar">
        <div>
          <p className="eyebrow">Carte</p>
          <h1>Cartographie des equipements</h1>
        </div>
        <div className="topbar-actions">
          <button className="ghost-button">Filtrer les zones</button>
        </div>
      </header>

      <div className="section-header">
        <div>
          <h2>Zones d'equipements en surveillance</h2>
          <p className="muted">Vue globale des sites critiques</p>
        </div>
        <div className="pill">Carte interactive a connecter</div>
      </div>

      <div className="card map-card">
        <div className="map">
          <div className="map-grid"></div>
          <div className="map-marker m1">A</div>
          <div className="map-marker m2">B</div>
          <div className="map-marker m3">C</div>
        </div>
        <div className="map-info">
          <h3>Zone Nord</h3>
          <p>32 equipements surveilles, 6 alertes actives</p>
          <button className="ghost-button">Ouvrir le detail</button>
        </div>
      </div>
    </section>
  );
}

export default CartePage;
