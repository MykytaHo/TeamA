import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase.js";
import { onAuthStateChanged } from "firebase/auth";
import PostJob from "./PostJob.jsx";
import { doc, getDoc, collection, query, orderBy, where, onSnapshot, deleteDoc, updateDoc } from "firebase/firestore";
import LoadingScreen from "../components/LoadingScreen.jsx";


const SupplierComponents = () => {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [myTenders, setMyTenders] = useState([]);
    const [withdrawMessage, setWithdrawMessage] = useState('');

    useEffect(() => {
        const q = query(collection(db, 'jobList'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setJobs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        let unsubscribeTenders = null;
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            if (!user) return;
            const q = query(collection(db, 'tenderList'), where('supplierID', '==', user.uid));
            unsubscribeTenders = onSnapshot(q, async (snapshot) => {
                const tenders = await Promise.all(
                    snapshot.docs.map(async (d) => {
                        const tender = { id: d.id, ...d.data() };
                        const jobDoc = await getDoc(doc(db, 'jobList', tender.jobID));
                        tender.jobName = jobDoc.exists() ? jobDoc.data().jobName : 'Unknown Job';
                        return tender;
                    })
                );
                setMyTenders(tenders);
            });
        });
        return () => {
            unsubscribeAuth();
            unsubscribeTenders?.();
        };
    }, []);

    const handleWithdraw = async (tender) => {
        if (!window.confirm(`Withdraw your tender for "${tender.jobName}"?`)) return;
        try {
            await deleteDoc(doc(db, 'tenderList', tender.id));
            const jobRef = doc(db, 'jobList', tender.jobID);
            const jobDoc = await getDoc(jobRef);
            if (jobDoc.exists()) {
                const current = jobDoc.data().tenderCount || 1;
                await updateDoc(jobRef, { tenderCount: Math.max(0, current - 1) });
            }
            setWithdrawMessage(`Tender for "${tender.jobName}" withdrawn.`);
            setTimeout(() => setWithdrawMessage(''), 3000);
        } catch (err) {
            console.error('Error withdrawing tender:', err);
            setWithdrawMessage('Failed to withdraw tender.');
        }
    };

    return (
        <div className="page">
            {/* My Tenders */}
            {myTenders.length > 0 && (
                <div style={{ marginBottom: '32px' }}>
                    <h2>My Tenders</h2>
                    {withdrawMessage && (
                        <p style={{ color: '#166534', background: '#dcfce7', padding: '10px 14px', borderRadius: '8px', marginBottom: '12px' }}>
                            {withdrawMessage}
                        </p>
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {myTenders.map(tender => (
                            <div key={tender.id} style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px',
                                padding: '14px 18px', flexWrap: 'wrap', gap: '10px'
                            }}>
                                <div>
                                    <p style={{ margin: 0, fontWeight: 600, color: '#0f172a' }}>{tender.jobName}</p>
                                    <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748b' }}>
                                        Your quote: <strong style={{ color: '#0f172a' }}>€{tender.tenderAmount}</strong>
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleWithdraw(tender)}
                                    style={{
                                        padding: '6px 14px', fontSize: '13px',
                                        backgroundColor: '#fee2e2', color: '#dc2626',
                                        border: '1px solid #fca5a5', borderRadius: '6px',
                                        cursor: 'pointer', fontWeight: 600
                                    }}
                                >
                                    Withdraw Tender
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Available Jobs */}
            <h2>Available Jobs</h2>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '20px',
            }}>
                {jobs.map(job => (
                    <div key={job.id} style={{
                        border: "1px solid #e2e8f0",
                        padding: "20px",
                        borderRadius: '10px',
                        backgroundColor: '#fff',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
                    }}>
                        <h3 style={{ margin: '0 0 8px', color: '#0f172a' }}>{job.jobName} — €{job.budget}</h3>
                        {job.jobImage && <img src={job.jobImage} alt="Job" style={{maxWidth: '100%', borderRadius: '8px', marginBottom: '8px'}} />}
                        <p style={{ fontSize: '14px', color: '#475569', margin: '0 0 6px' }}>{job.description}</p>
                        <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 4px' }}>
                            Status: {job.status ? job.status.charAt(0).toUpperCase() + job.status.slice(1) : 'Posted'}
                        </p>
                        <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 12px' }}>Tenders: {job.tenderCount || 0}</p>
                        <button onClick={() => navigate(`/tenderjob?jobId=${job.id}`)}>Apply Now</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default function HomeDash() {  // ✅ Moved to top level
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getUserRole = async () => {
            let user = auth.currentUser;
            if (!user) {
                await new Promise(resolve => setTimeout(resolve, 500));
                user = auth.currentUser;
            }
            if (user) {
                const userDocRef = doc(db, "users", user.uid);  // ✅ Renamed to userDocRef for clarity
                const userDoc = await getDoc(userDocRef);        // ✅ Pass the ref, not the result

                if (userDoc.exists()) {
                    setRole(userDoc.data().role);
                }
            }
            setLoading(false);
        };
        getUserRole();
    }, []);

    return (
        <>
            {loading && <LoadingScreen/>}
            {!loading && role === "supplier" && <SupplierComponents/>}
            {!loading && role === "client" && <PostJob/>}
        </>
    );
}