import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth";

export default function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/admin/login", { replace: true });
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link className="admin-brand" to="/admin/businesses">
          <span className="brand-mark">BD</span>
          <span>Business<br />Directory</span>
        </Link>

        <div className="sidebar-section-label">MANAGEMENT</div>
        <nav className="admin-nav" aria-label="Admin navigation">
          <NavLink className="admin-nav-link" to="/admin/businesses">
            <span className="nav-icon" aria-hidden="true">B</span>
            Businesses
          </NavLink>
          <NavLink className="admin-nav-link" to="/admin/categories">
            <span className="nav-icon" aria-hidden="true">C</span>
            Categories
          </NavLink>
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-user">
            <span className="user-avatar">AD</span>
            <span><strong>Administrator</strong><small>Admin account</small></span>
          </div>
          <button className="sidebar-logout" onClick={handleLogout}>Log out</button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div>
            <span className="topbar-eyebrow">WORKSPACE</span>
            <p>Directory management</p>
          </div>
          <span className="topbar-status"><span /> Admin portal</span>
        </header>
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
