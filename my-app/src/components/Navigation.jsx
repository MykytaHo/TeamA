import { Link, useNavigate } from 'react-router-dom';
import './Navigation.css';

export default function Navigation({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
      navigate('/');
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          Local Services
        </Link>
        <ul className="nav-menu">
          <li className="nav-item">
            <Link to="/" className="nav-link">Home</Link>
          </li>
          <li className="nav-item">
            <Link to="/dashboard" className="nav-link">Dashboard</Link>
          </li>
          <li className="nav-item">
            <Link to="/jobs" className="nav-link">Jobs</Link>
          </li>
          <li className="nav-item">
            <Link to="/profile" className="nav-link">Profile</Link>
          </li>
          {user && (
            <li className="nav-item">
              <button className="logout-btn" onClick={handleLogout}>
                Log out
              </button>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
}
