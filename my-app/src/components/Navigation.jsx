import {Link, useNavigate} from 'react-router-dom';
import './Navigation.css';
import homeIcon from '../assets/home.svg'
import profileIcon from '../assets/user.svg'
import leaveIcon from '../assets/leave.svg'
import logo from '../assets/2-letter-house-logo.png'
import envelopeIcon from '../assets/message.svg'

export default function Navigation({user, userProfile, onLogout}) {

    const navigate = useNavigate();
    const role = userProfile?.role;

    const handleLogout = () => {
        if (onLogout) {
            onLogout();
            navigate('/');
        }
    };

    return (
        <nav className="navbar">
            <div className="nav-container">
                <Link to="/" className="logo-nav-icon">
                    <img src={logo} alt="TC logo" style={{ width: '32px', height: '32px' }}/>
                    <span className="nav-brand-name">Traders Connect</span>
                </Link>

                <ul className="nav-menu">
                    <li className="nav-icon">
                        <Link tooltip="Home" to="/" className="nav-icon">
                            <img src={homeIcon} alt="Home" style={{ width: '20px' }}/>
                        </Link>
                    </li>

                    {/* Role-specific job actions */}
                    {role === 'supplier' && (
                        <>
                            <li className="nav-item-text">
                                <Link to="/tenderjob" className="nav-link-text">Apply for a Job</Link>
                            </li>
                            <li className="nav-item-text">
                                <Link to="/searchjobs" className="nav-link-text">Search Jobs</Link>
                            </li>
                        </>
                    )}
                    {role === 'client' && (
                        <>
                            <li className="nav-item-text">
                                <Link to="/postjob" className="nav-link-text">Post a Job</Link>
                            </li>
                            <li className="nav-item-text">
                                <Link to="/accepttender" className="nav-link-text">Accept Tender</Link>
                            </li>
                        </>
                    )}

                    <li className="nav-icon">
                        <Link tooltip="Profile" to="/profile" className="nav-link">
                            <img src={profileIcon} alt="Profile" style={{ width: '20px', height: '20px' }}/>
                        </Link>
                    </li>

                    <li className="nav-icon">
                        <Link tooltip="Messages" to="/messaging" className="nav-link">
                            <img src={envelopeIcon} alt="Messages" style={{ width: '20px', height: '20px' }}/>
                        </Link>
                    </li>

                    <li className="nav-icon">
                        <Link tooltip="Leave a Review" to="/leavereview" className="nav-link">⭐</Link>
                    </li>

                    {user && (
                        <li className="nav-icon">
                            <Link onClick={handleLogout} to="" className="nav-link">
                                <img src={leaveIcon} alt="Log out" style={{ width: '26px', height: '26px' }}/>
                            </Link>
                        </li>
                    )}
                </ul>
            </div>
        </nav>
    );
}
