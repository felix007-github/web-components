import { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { WtScrollbar } from '@lpcp/components/react';
import { demoRoutes } from './router';

function App() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(localStorage.getItem('isSidebarCollapsed') === 'true');
  const location = useLocation();
  const activeRouterName = demoRoutes.find(route => route.path === location.pathname)?.label || 'Unknown Route';

  function clicktoggleSidebar() {
    localStorage.setItem('isSidebarCollapsed', String(!isSidebarCollapsed));
    setIsSidebarCollapsed(prev => !prev);
  }

  return (
    <main className={`shell${isSidebarCollapsed ? ' is-sidebar-collapsed' : ''}`}>
      <aside className="playground-sidebar">
        <div className="playground-sidebar__hero">
          <span className="playground-sidebar__eyebrow">Component Lab</span>
        </div>
        <div className="playground-sidebar__nav-scroll">
          <WtScrollbar wrapperClass={{ 'playground-sidebar__scrollbar': true }} style={{ height: '100%', width: '100%' }}>
            <nav className="playground-nav" aria-label="Component demo routes">
              {demoRoutes.map(route => (
                <NavLink
                  key={route.path}
                  to={route.path}
                  className={({ isActive }) => `playground-nav__link${isActive ? ' is-active' : ''}`}
                >
                  <span className="playground-nav__title">{route.label}</span>
                </NavLink>
              ))}
            </nav>
          </WtScrollbar>
        </div>
        <div className="playground-sidebar__footer">
          <div className="playground-sidebar__metric">
            <span className="playground-sidebar__metric-value">{demoRoutes.length}</span>
            <span className="playground-sidebar__metric-label">Routes</span>
          </div>
          <div className="playground-sidebar__metric">
            <span className="playground-sidebar__metric-value">Live</span>
            <span className="playground-sidebar__metric-label">Preview Mode</span>
          </div>
        </div>
      </aside>
      <section className="playground-main">
        <div className="playground-main__header">
          <div className="playground-main__header-left">
            <button
              type="button"
              className="playground-sidebar-toggle"
              aria-controls="playground-sidebar"
              aria-expanded={!isSidebarCollapsed}
              onClick={clicktoggleSidebar}
            >
              {isSidebarCollapsed ? 'Show Sidebar' : 'Hide Sidebar'}
            </button>
            <span className="playground-main__eyebrow">Workspace</span>
          </div>
          <div className="playground-main__status">
            <span className="playground-main__status-dot"></span>
            {activeRouterName}
          </div>
        </div>
        <section className="playground-grid">
          <Outlet />
        </section>
      </section>
    </main>
  );
}

export default App;
