import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';

const DESKTOP_BREAKPOINT = 860;

const navItems = [
  { to: '/historique', label: 'Historique', icon: '/icons/historique.png' },
  { to: '/prediction', label: 'Prediction', icon: '/icons/prediction.png' },
  { to: '/carte', label: 'Carte', icon: '/icons/adresse.png' },
  { to: '/assistant-ia', label: 'Assistant IA', icon: '/icons/assistant.png' },
  { to: '/parametre', label: 'Parametre', icon: '/icons/parametre.png' },
  { to: '/support', label: 'Support', icon: '/icons/support.png' },
];

function Sidebar() {
  const linkClass = ({ isActive }) => `nav-link${isActive ? ' active' : ''}`;
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window === 'undefined') {
      return true;
    }
    return window.innerWidth >= DESKTOP_BREAKPOINT;
  });

  useEffect(() => {
    document.body.classList.toggle('sidebar-open', isOpen);
    return () => document.body.classList.remove('sidebar-open');
  }, [isOpen]);

  return (
    <div className="sidebar-shell">
      <div className="brand-bar">
        <div className="brand-left">
          <button
            className="icon-button brand-toggle"
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-label={isOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          >
            <span className={isOpen ? 'icon-arrow' : 'icon-bars'}></span>
          </button>
          <div className="brand-icon">
            <img src="/logo.png" alt="Logo ASECNA" />
          </div>
          <div>
            <p className="brand-title">ASECNA EFP</p>
            <span className="brand-sub">Centre de pilotage</span>
          </div>
        </div>
      </div>

      <div
        className={`sidebar-overlay ${isOpen ? 'show' : ''}`}
        onClick={() => setIsOpen(false)}
        role="button"
        tabIndex={0}
        aria-label="Fermer le menu"
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            setIsOpen(false);
          }
        }}
      ></div>

      <aside className={`sidebar ${isOpen ? 'open' : 'collapsed'}`}>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink key={item.to} className={linkClass} to={item.to}>
              <span className="nav-icon" aria-hidden="true">
                <img src={item.icon} alt="" />
              </span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <p className="footer-title">Etat de la plateforme</p>
          <div className="status-pill">Synchronisation OK</div>
          <p className="footer-note">Donnees connectees: Base metier (a integrer)</p>
        </div>
      </aside>
    </div>
  );
}

export default Sidebar;
