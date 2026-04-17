import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navigation.css';
import homeIcon from '../assets/home.svg';
import profileIcon from '../assets/user.svg';
import leaveIcon from '../assets/leave.svg';
import logo from '../assets/2-letter-house-logo.png';
import envelopeIcon from '../assets/message.svg';
import briefcaseIcon from '../assets/briefcase.svg';

export default function Navigation({ user, userProfile, onLogout, onSwitch }) {
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

    const fastAccounts = JSON.parse(localStorage.getItem('fastAccounts') || '{}');
    const accountEmails = Object.keys(fastAccounts);

    return (
        <nav className="navbar">
            <div className="nav-container">
                <Link to="/" className="nav-brand" onClick={close}>
                    <img src={logo} alt="TC logo" className="nav-logo-img" />
                    <span className="nav-brand-name">Traders Connect</span>
                </Link>

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
                    <li><Link to="/leavereview" className="nav-icon-link"><img src={briefcaseIcon} alt="Review" /></Link></li>

                    {user && (
                        <li>
                            <select 
                                className="nav-account-select"
                                onChange={(e) => {
                                    if (e.target.value === 'logout') handleLogout();
                                    else if (e.target.value !== 'current') onSwitch(e.target.value);
                                    e.target.value = 'current';
                                }}
                                style={{ padding: '5px 10px', borderRadius: '20px', border: '1px solid #ddd', fontSize: '12px', cursor: 'pointer', backgroundColor: '#fff' }}
                            >
                                <option value="current">{user.email}</option>
                                <optgroup label="Fast Switch">
                                    {accountEmails.filter(e => e !== user.email).map(e => (
                                        <option key={e} value={e}>⚡ {e}</option>
                                    ))}
                                </optgroup>
                                <option value="logout">Log Out / Add New</option>
                            </select>
                        </li>
                    )}
                </ul>

                <button className={`hamburger ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(o => !o)}>
                    <span /><span /><span />
                </button>
            </div>

            {menuOpen && (
                <div className="mobile-menu">
                    <Link to="/" className="mobile-link" onClick={close}><img src={homeIcon} alt="" /> Home</Link>
                    {role === 'supplier' && (
                        <>
                            <Link to="/tenderjob" className="mobile-link" onClick={close}>Apply for a Job</Link>
                            <Link to="/searchjobs" className="mobile-link" onClick={close}>Search Jobs</Link>
                        </>
                    )}
                    {role === 'client' && (
                        <Link to="/accepttender" className="mobile-link" onClick={close}>Accept Tender</Link>
                    )}
                    <Link to="/profile" className="mobile-link" onClick={close}><img src={profileIcon} alt="" /> Profile</Link>
                    <Link to="/messaging" className="mobile-link" onClick={close}><img src={envelopeIcon} alt="" /> Messages</Link>
                    <Link to="/leavereview" className="mobile-link" onClick={close}><img src={briefcaseIcon} alt="" /> Review</Link>

                    {user && (
                        <div style={{ borderTop: '1px solid #eee', marginTop: '10px', padding: '10px' }}>
                            <p style={{ fontSize: '12px', color: '#999', marginBottom: '8px' }}>Fast Switch:</p>
                            {accountEmails.filter(e => e !== user.email).map(e => (
                                <button key={e} className="mobile-link" onClick={() => { onSwitch(e); close(); }} style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', color: '#2563eb', padding: '10px' }}>
                                    ⚡ {e}
                                </button>
                            ))}
                            <button className="mobile-link mobile-logout" onClick={handleLogout} style={{ border: 'none', background: 'none', width: '100%', textAlign: 'left' }}>
                                <img src={leaveIcon} alt="" /> Log Out
                            </button>
                        </div>
                    )}
                </div>
            )}
        </nav>
    );
}