import { NavLink } from 'react-router-dom';

function Sidebar() {
  const linkClass = ({ isActive }) => `nav-link${isActive ? ' active' : ''}`;

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">NP</div>
        <div>
          <p className="brand-title">Nom du Projet</p>
          <span className="brand-sub">Centre de pilotage</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <NavLink className={linkClass} to="/historique">Historique</NavLink>
        <NavLink className={linkClass} to="/prediction">Prediction</NavLink>
        <NavLink className={linkClass} to="/carte">Carte</NavLink>
        <NavLink className={linkClass} to="/assistant-ia">Assistant IA</NavLink>
        <NavLink className={linkClass} to="/parametre">Parametre</NavLink>
        <NavLink className={linkClass} to="/support">Support</NavLink>
      </nav>

      <div className="sidebar-footer">
        <p className="footer-title">Etat de la plateforme</p>
        <div className="status-pill">Synchronisation OK</div>
        <p className="footer-note">Donnees connectees: Base metier (a integrer)</p>
      </div>
    </aside>
  );
}

export default Sidebar;
