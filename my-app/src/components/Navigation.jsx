import {Link, useNavigate} from 'react-router-dom';
import './Navigation.css';
import {useState} from "react";

export default function Navigation({user, onLogout}) {

    const [dropDownOpacity, setDropDownOpacity] = useState(0);
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
                        <Link to="/" className="nav-link">Home</Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/dashboard" className="nav-link">Dashboard</Link>
                    </li>
                    <li className="nav-item" onMouseEnter={() => {
                        setDropDownOpacity(1)
                    }}
                        onMouseLeave={() => {
                            setDropDownOpacity(0)
                        }}>
                        <Link to="/jobs" className="nav-link">Jobs</Link>
                        <div className="jobs-dropdown"
                             style={{opacity: dropDownOpacity, pointerEvents: dropDownOpacity === 1 ? "auto" : "none"}
                             }>
                            <Link to="/postjob" className="dropdown-link">Post Job</Link>
                            <Link to="/searchjobs" className="dropdown-link">Search Jobs</Link>
                            <Link to="/tenderjob" className="dropdown-link">Submit Tender</Link>
                            <Link to="/accepttender" className="dropdown-link">Accept Tender</Link>

                        </div>
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