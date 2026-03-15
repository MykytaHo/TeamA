import {Link, useNavigate} from 'react-router-dom';
import './Navigation.css';
import homeIcon from '../assets/home.svg'
import jobIcon from '../assets/briefcase.svg'
import profileIcon from '../assets/user.svg'
import leaveIcon from '../assets/leave.svg'
import logo from '../assets/2-letter-house-logo.png'

export default function Navigation({user, onLogout}) {

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
                <Link to="/" className="nav-logo"> <img src={logo} alt="TC logo"
                                                        style={{width: '30px', height: '30px'}}/></Link>
                <ul className="nav-menu">
                    <li className="nav-icon">
                        <Link to="/" className="nav-icon"><img src={homeIcon} alt="home icon"
                                                               style={{width: '20px'}}/></Link>
                    </li>

                    <li className="nav-icon">
                        <Link to="/jobs" className="nav-link"><img src={jobIcon} alt="job icon"
                                                                   style={{width: '20px', height: '20px'}}/></Link>
                    </li>

                    <li className="nav-icon">
                        <Link to="/profile" className="nav-link"><img src={profileIcon} alt="user icon"
                                                                      style={{width: '20px', height: '20px'}}/></Link>
                    </li>
                    {user && (
                        <li className="nav-icon">
                            <Link onClick={handleLogout} to="" className="nav-link"><img src={leaveIcon}
                                                                                         alt="leave icon"
                                                                                         className="nav-link"
                                                                                         style={{
                                                                                             width: '20px',
                                                                                             height: '20px'
                                                                                         }}/>
                            </Link>
                        </li>
                    )}
                </ul>
            </div>
        </nav>
    );
}