import {useState, useEffect} from 'react';
import {BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendEmailVerification,
    onAuthStateChanged,
    signOut
} from 'firebase/auth';
import {doc, setDoc, getDoc} from 'firebase/firestore';
import {auth, db} from './firebase';
import './App.css';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import Jobs from './pages/Jobs';
import Profile from './pages/Profile';
import PostJob from './pages/PostJob.jsx'
import TenderJob from './pages/TenderJob'
import SupplierDocuments from './pages/SupplierDocuments';
import SearchJobs from "./pages/SearchJobs.jsx";
import AcceptTender from "./pages/AcceptTender.jsx";
import LeaveReview from "./pages/LeaveReview.jsx";
import JobDetails from "./pages/JobDetails.jsx";
import Messaging from "./pages/Messaging.jsx";

import HomeDash from "./pages/HomeDash.jsx";

function App() {
    const [user, setUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    const [isLogin, setIsLogin] = useState(false);
    const [message, setMessage] = useState('');
    const [role, setRole] = useState('client');

    const [formData, setFormData] = useState({
        email: '', password: '', name: '', phone: ''
    });

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            try {
                if (currentUser) {
                    await currentUser.reload();
                    setUser(currentUser);

                    if (currentUser.emailVerified) {
                        const snap = await getDoc(doc(db, "users", currentUser.uid));
                        if (snap.exists()) {
                            setUserProfile(snap.data());
                        }
                    }
                } else {
                    setUser(null);
                    setUserProfile(null);
                }
            } catch (err) {
                console.error("Auth error:", err);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };

    const handleAuth = async (e) => {
        e.preventDefault();
        setMessage('Processing...');

        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, formData.email, formData.password);
            } else {
                const res = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
                const currentUser = res.user;

                await sendEmailVerification(currentUser);

                await setDoc(doc(db, "users", currentUser.uid), {
                    uid: currentUser.uid,
                    email: formData.email,
                    role: role,
                    name: formData.name,
                    phone: formData.phone,
                    createdAt: new Date()
                });
            }
        } catch (err) {
            setMessage(err.message);
        }
    };

    const handleLogout = () => {
        signOut(auth);
        setFormData({email: '', password: '', name: '', phone: ''});
        setMessage('');
    };

    if (loading) return <div className="loading">⏳ Loading...</div>;

    if (user && user.emailVerified && userProfile) {
        return (
            <>
                <Router>
                    <Navigation user={user} userProfile={userProfile} onLogout={handleLogout}/>
                    <div className="app-container">
                        <Routes>
                            <Route path="/" element={<HomeDash/>}/>
                            <Route path="/dashboard" element={<Dashboard/>}/>
                            <Route path="/jobs" element={<Jobs/>}/>
                            <Route path="/profile" element={<Profile/>}/>
                            {/*<Route path="/search-traders" element={<SearchTraders/>}/>*/}
                            {/*<Route path="*" element={<Navigate to="/"/>}/>*/}
                            <Route path="/postjob" element={<PostJob/>}/>
                            <Route path="/tenderjob" element={<TenderJob/>}/>
                            <Route path="/searchjobs" element={<SearchJobs/>}/>
                            <Route path="/accepttender" element={<AcceptTender/>}/>
                            <Route path="/leavereview" element={<LeaveReview/>}/>
                            <Route path="/job/:jobId" element={<JobDetails/>}/>
                            <Route path="/messaging" element={<Messaging/>}/>
                            <Route path="/documents" element={<SupplierDocuments/>}/>
                        </Routes>
                    </div>
                </Router>
            </>
        );
    }

    if (user && !user.emailVerified) {
        return (
            <div>
                <h2>Verify your Email</h2>
                <p>We sent a verification link to: <b>{user.email}</b></p>
                <button onClick={() => window.location.reload()}>I verified my email</button>
                <br/><br/>
                <button onClick={handleLogout}>Back / Logout</button>
            </div>
        );
    }

    return (
        <div className="page auth-page">
            <h2>{isLogin ? 'Login' : 'Register'}</h2>

            {message && <p className="message">{message}</p>}

            <form onSubmit={handleAuth}>
                {!isLogin && (
                    <>
                        <label>I am a: </label>
                        <select value={role} onChange={(e) => setRole(e.target.value)}>
                            <option value="client">Client</option>
                            <option value="supplier">Supplier</option>
                        </select>

                        <input type="text" name="name" placeholder="Full Name" onChange={handleChange} required/>

                        <input type="tel" name="phone" placeholder="Phone Number" onChange={handleChange} required/>
                    </>
                )}

                <input type="email" name="email" placeholder="Email" onChange={handleChange} required/>

                <input type="password" name="password" placeholder="Password" onChange={handleChange} required/>

                <button type="submit">
                    {isLogin ? 'Login' : 'Register'}
                </button>
            </form>

            <button className="toggle-btn" onClick={() => {
                setIsLogin(!isLogin);
                setMessage('');
            }}>
                {isLogin ? 'Need an account? Register' : 'Have an account? Login'}
            </button>

        </div>
    );
}

export default App;