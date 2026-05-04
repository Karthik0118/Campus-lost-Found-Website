import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../state/auth.jsx";

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="appShell">
      <header className="topbar">
        <div className="container topbarInner">
          <Link to="/dashboard" className="brand">
            Campus Lost &amp; Found
          </Link>
          <nav className="nav">
            <NavLink to="/dashboard" className="navLink">
              Dashboard
            </NavLink>
            {user ? (
              <>
                <NavLink to="/add" className="navLink">
                  Add Item
                </NavLink>
                <NavLink to="/myposts" className="navLink">
                  My Posts
                </NavLink>
                <button
                  className="btn btnGhost"
                  onClick={() => {
                    logout();
                    navigate("/login");
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className="navLink">
                  Login
                </NavLink>
                <NavLink to="/register" className="navLink">
                  Register
                </NavLink>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="container main">{children}</main>

      <footer className="footer">
        <div className="container footerInner">
          <span className="muted">Beginner MERN Lost &amp; Found Portal</span>
        </div>
      </footer>
    </div>
  );
}

