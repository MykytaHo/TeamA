import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navigation.css';
import homeIcon from '../assets/home.svg'
import profileIcon from '../assets/user.svg'
import leaveIcon from '../assets/leave.svg'
import logo from '../assets/2-letter-house-logo.png'
import envelopeIcon from '../assets/message.svg'
import briefcaseIcon from '../assets/briefcase.svg'

export default function Navigation({ user, userProfile, onLogout }) {
    const navigate = useNavigate();
    const role = userProfile?.role;
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = () => {
        setMenuOpen(false);
        if (onLogout) {
            onLogout();
            navigate('/');
        }
    };

    const close = () => setMenuOpen(false);

    return (
        <nav className="navbar">
            <div className="nav-container">
                {/* Logo */}
                <Link to="/" className="nav-brand" onClick={close}>
                    <img src={logo} alt="TC logo" className="nav-logo-img" />
                    <span className="nav-brand-name">Traders Connect</span>
                </Link>

                {/* Desktop menu */}
                <ul className="nav-menu desktop-menu">
                    <li><Link to="/" className="nav-icon-link"><img src={homeIcon} alt="Home" /></Link></li>

                    {role === 'supplier' && (
                        <>
                            <li><Link to="/tenderjob" className="nav-pill">Apply for a Job</Link></li>
                            <li><Link to="/searchjobs" className="nav-pill">Search Jobs</Link></li>
                        </>
                    )}
                    {role === 'client' && (
                        <li><Link to="/accepttender" className="nav-pill">Accept Tender</Link></li>
                    )}

                    <li><Link to="/profile" className="nav-icon-link"><img src={profileIcon} alt="Profile" /></Link></li>
                    <li><Link to="/messaging" className="nav-icon-link"><img src={envelopeIcon} alt="Messages" /></Link></li>
                    <li><Link to="/leavereview" className="nav-icon-link"><img src={briefcaseIcon} alt="Leave a Review" /></Link></li>

                    {user && (
                        <li>
                            <button className="nav-logout-btn" onClick={handleLogout}>
                                <img src={leaveIcon} alt="Log out" />
                            </button>
                        </li>
                    )}
                </ul>

                {/* Hamburger button (mobile only) */}
                <button
                    className={`hamburger ${menuOpen ? 'open' : ''}`}
                    onClick={() => setMenuOpen(o => !o)}
                    aria-label="Toggle menu"
                >
                    <span /><span /><span />
                </button>
            </div>

            {/* Mobile dropdown */}
            {menuOpen && (
                <div className="mobile-menu">
                    <Link to="/" className="mobile-link" onClick={close}>
                        <img src={homeIcon} alt="" /> Home
                    </Link>

                    {role === 'supplier' && (
                        <>
                            <Link to="/tenderjob" className="mobile-link mobile-link-pill" onClick={close}>Apply for a Job</Link>
                            <Link to="/searchjobs" className="mobile-link mobile-link-pill" onClick={close}>Search Jobs</Link>
                        </>
                    )}
                    {role === 'client' && (
                        <Link to="/accepttender" className="mobile-link mobile-link-pill" onClick={close}>Accept Tender</Link>
                    )}

                    <Link to="/profile" className="mobile-link" onClick={close}>
                        <img src={profileIcon} alt="" /> Profile
                    </Link>
                    <Link to="/messaging" className="mobile-link" onClick={close}>
                        <img src={envelopeIcon} alt="" /> Messages
                    </Link>
                    <Link to="/leavereview" className="mobile-link" onClick={close}>
                        <img src={briefcaseIcon} alt="" /> Leave a Review
                    </Link>

                    {user && (
                        <button className="mobile-link mobile-logout" onClick={handleLogout}>
                            <img src={leaveIcon} alt="" /> Log Out
                        </button>
                    )}
                </div>
            )}
        </nav>
    );
}
