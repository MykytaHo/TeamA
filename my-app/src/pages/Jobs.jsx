import {useNavigate} from 'react-router-dom';
import {useState, useEffect} from 'react';
import {auth, db} from '../firebase';
import {collection, getDocs, doc, getDoc} from 'firebase/firestore';
 
export default function Jobs() {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [tenders, setTenders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState('');
    const [currentUserRole, setCurrentUserRole] = useState('');
 
    useEffect(() => {
        const loadData = async () => {
            try {
                const user = auth.currentUser;
                if (!user) return;
                
                setCurrentUserId(user.uid);
 
                // Get current user role
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                if (userDoc.exists()) {
                    setCurrentUserRole(userDoc.data().role || '');
                }
 
                // Load jobs
                const jobsSnapshot = await getDocs(collection(db, 'jobs'));
                setJobs(jobsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })));
 
                // Load tenders
                const tendersSnapshot = await getDocs(collection(db, 'tenders'));
                setTenders(tendersSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })));
 
                setLoading(false);
            } catch (err) {
                console.error('Error loading jobs:', err);
                setLoading(false);
            }
        };
 
        loadData();
    }, []);
 
    const handlePostJob = () => navigate('/postjob');
    const handleSearchJobs = () => navigate('/searchjobs');
    const handleSubmitTender = () => navigate('/tenderjob');
    const handleAcceptTender = () => navigate('/accepttender');
    const handleViewJob = (jobId) => navigate(`/job-details?id=${jobId}`);
 
    if (loading) {
        return <div className="page"><p>Loading jobs...</p></div>;
    }
 
    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 40px' }}>
 
            <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Jobs & Tenders</h1>
 
            {/* Action Buttons */}
            <div style={{ 
                marginBottom: '30px', 
                display: 'flex', 
                gap: '10px', 
                flexWrap: 'wrap',
                justifyContent: 'center'
            }}>
                <button 
                    type="button" 
                    onClick={handlePostJob}
                    style={{ backgroundColor: '#28a745', color: '#fff', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                >
                    ➕ Post a New Job
                </button>
 
                <button 
                    type="button" 
                    onClick={handleSearchJobs}
                    style={{ backgroundColor: '#007bff', color: '#fff', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                >
                    🔍 Search Jobs
                </button>
 
                {currentUserRole === 'supplier' && (
                    <button 
                        type="button" 
                        onClick={handleSubmitTender}
                        style={{ backgroundColor: '#17a2b8', color: '#fff', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                    >
                        📋 Submit Tender
                    </button>
                )}
 
                <button 
                    type="button" 
                    onClick={handleAcceptTender}
                    style={{ backgroundColor: '#ffc107', color: '#000', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                >
                    ✅ Accept Tender
                </button>
            </div>
 
            {/* Available Jobs Section */}
            <hr style={{ margin: '20px 0' }} />
            <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Available Jobs</h2>
            {jobs.length > 0 ? (
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
                    gap: '15px' 
                }}>
                    {jobs.map(job => (
                        <div 
                            key={job.id}
                            style={{
                                border: '1px solid #ddd',
                                borderRadius: '8px',
                                padding: '15px',
                                backgroundColor: '#f9f9f9',
                                cursor: 'pointer',
                            }}
                            onClick={() => handleViewJob(job.id)}
                        >
                            <h3>{job.title}</h3>
                            <p><strong>Category:</strong> {job.category || 'N/A'}</p>
                            <p><strong>Location:</strong> {job.location || 'N/A'}</p>
                            <p><strong>Budget:</strong> €{job.budget || 'Negotiable'}</p>
                            <p style={{ fontSize: '14px', color: '#666' }}>{job.description?.substring(0, 100)}...</p>
                            <button 
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewJob(job.id);
                                }}
                                style={{ 
                                    marginTop: '10px',
                                    backgroundColor: '#007bff',
                                    color: '#fff',
                                    padding: '8px 15px',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: 'pointer',
                                    fontSize: '12px'
                                }}
                            >
                                View Details
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <p style={{ textAlign: 'center' }}>
                    No jobs available yet.{' '}
                    <button 
                        type="button" 
                        onClick={handlePostJob} 
                        style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                        Post one now!
                    </button>
                </p>
            )}
 
            {/* Active Tenders Section */}
            <hr style={{ margin: '20px 0' }} />
            <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Active Tenders</h2>
            {tenders.length > 0 ? (
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
                    gap: '15px' 
                }}>
                    {tenders.map(tender => (
                        <div 
                            key={tender.id}
                            style={{
                                border: '2px solid #17a2b8',
                                borderRadius: '8px',
                                padding: '15px',
                                backgroundColor: '#f0f8ff'
                            }}
                        >
                            <h3>{tender.jobTitle}</h3>
                            <p><strong>Supplier:</strong> {tender.supplierName || 'Anonymous'}</p>
                            <p><strong>Category:</strong> {tender.category || 'N/A'}</p>
                            <p><strong>Quote:</strong> €{tender.quote || 'N/A'}</p>
                            <p style={{ fontSize: '14px', color: '#666' }}>{tender.description?.substring(0, 100)}...</p>
                            <p style={{ fontSize: '12px', color: '#999' }}>
                                Submitted: {tender.createdAt ? new Date(tender.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                            </p>
                        </div>
                    ))}
                </div>
            ) : (
                <p style={{ textAlign: 'center' }}>No tenders submitted yet.</p>
            )}
        </div>
    );
}