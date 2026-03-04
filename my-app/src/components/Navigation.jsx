import { Link } from 'react-router-dom';
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
          Traders Connect 
        </Link>

        <ul className="nav-menu">
          <li className="nav-item">
            <Link to="/" className={linkClass('/')}>Home</Link>
          </li>
          <li className="nav-item">
            <Link to="/dashboard" className={linkClass('/dashboard')}>Dashboard</Link>
          </li>
          <li className="nav-item">
            <Link to="/jobs" className={linkClass('/jobs')}>Jobs</Link>
          </li>
          <li className="nav-item">
            <Link to="/profile" className={linkClass('/profile')}>Profile</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
