import {useNavigate} from 'react-router-dom';
import {useState, useEffect} from 'react';
import {auth, db} from '../firebase';
import {collection, getDocs, doc, getDoc, onSnapshot, updateDoc, deleteDoc} from 'firebase/firestore';

export default function Jobs() {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [tenders, setTenders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState('');
    const [currentUserRole, setCurrentUserRole] = useState('');
    const [error, setError] = useState('');

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

                setLoading(false);
            } catch (err) {
                console.error('Error loading user data:', err);
                setLoading(false);
            }
        };
 
        loadData();

        // Real-time listener for jobs
        const jobsUnsub = onSnapshot(collection(db, 'jobList'), (snapshot) => {
            setJobs(snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })));
        });

        // Real-time listener for tenders
        const tendersUnsub = onSnapshot(collection(db, 'tenderList'), (snapshot) => {
            setTenders(snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })));
        });

        return () => {
            jobsUnsub();
            tendersUnsub();
        };
    }, []);

    const handlePostJob = () => {
        navigate('/postjob');
    };

    const handleSearchJobs = () => {
        navigate('/searchjobs');
    };

    const handleSubmitTender = () => {
        navigate('/tenderjob');
    };

  

   const handleAcceptTenderClick = async (tenderId, jobId) => {
    try {
        // Delete all competing tenders for the same job
        const competingTenders = tenders.filter(t => t.jobID === jobId && t.id !== tenderId);
        for (const tender of competingTenders) {
            await deleteDoc(doc(db, 'tenderList', tender.id));
        }

        // Update the winning tender status to accepted
        await updateDoc(doc(db, 'tenderList', tenderId), {
            status: 'accepted'
        });

        // Update job status to contracted
        await updateDoc(doc(db, 'jobList', jobId), {
            status: 'contracted'
        });

        alert('Tender accepted! Other competing tenders have been deleted.');
    } catch (err) {
        console.error('Error accepting tender:', err);
        setError('Failed to accept tender');
    }
};

    const handleViewJob = (jobId) => {
         navigate(`/job/${jobId}`);
    };

    if (loading) {
        return <div className="page"><p>Loading jobs...</p></div>;
    }

    const handleDeleteJob = async (jobId) => {
        try {
            await deleteDoc(doc(db, 'jobList', jobId));
            alert('Job deleted!');
        } catch (err) {
            console.error('Error deleting job:', err);
            setError('Failed to delete job');
        }
    };

    const handleDeleteTender = async (tenderId) => {
    try {
        await deleteDoc(doc(db, 'tenderList', tenderId));
        alert('Tender deleted!');
    } catch (err) {
        console.error('Error deleting tender:', err);
        setError('Failed to delete tender');
    }
};

    const handleEditTender = (tender) => {
        navigate('/tenderjob', { state: { editTender: tender } });
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 40px' }}>
 
            <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Jobs & Tenders</h1>
 
            {/* Action Buttons */}
            <div style={{ marginBottom: '30px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {currentUserRole === 'client' && (
                    <>
                        <button 
                            type="button" 
                            onClick={handlePostJob}
                            style={{ backgroundColor: '#28a745', color: '#fff', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                        >
                            ➕ Post a New Job
                        </button>

                        

                    </>
                )}

            {currentUserRole === 'supplier' && (
                <>
                    <button 
                        type="button" 
                        onClick={handleSearchJobs}
                        style={{ backgroundColor: '#007bff', color: '#fff', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                    >
                        🔍 Search Jobs
                    </button>

                    <button 
                        type="button" 
                        onClick={handleSubmitTender}
                        style={{ backgroundColor: '#17a2b8', color: '#fff', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                    >
                        📋 Submit Tender
                    </button>
                </>
            )}
            </div>
            {/* Available Jobs Section - Only for Clients */}
            {currentUserRole === 'client' && (
                <>
                <hr style={{ margin: '20px 0' }} />
                <h2>Available Jobs</h2>
                {jobs.filter(job => job.clientID === currentUserId).length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '15px' }}>
                    {jobs.filter(job => job.clientID === currentUserId).map(job => (
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
                            <h3>{job.jobName}</h3>
                            <p><strong>Category:</strong> {job.category || 'N/A'}</p>
                            <p><strong>Location:</strong> {job.location || 'N/A'}</p>
                            <p><strong>Budget:</strong> €{job.budget || 'Negotiable'}</p>
                            <p style={{ fontSize: '14px', color: '#666' }}>{job.description?.substring(0, 100)}...</p>
                            <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                                <button 
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleViewJob(job.id);
                                    }}
                                    style={{ 
                                        flex: 1,
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
                                <button 
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/postjob`, { state: { editJob: job } });
                                    }}
                                    style={{ 
                                        backgroundColor: '#28a745',
                                        color: '#fff',
                                        padding: '8px 15px',
                                        border: 'none',
                                        borderRadius: '5px',
                                        cursor: 'pointer',
                                        fontSize: '12px'
                                    }}
                                >
                                    Edit
                                </button>
                                <button 
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (window.confirm('Delete this job?')) {
                                            handleDeleteJob(job.id);
                                        }
                                    }}
                                    style={{ 
                                        backgroundColor: '#dc3545',
                                        color: '#fff',
                                        padding: '8px 15px',
                                        border: 'none',
                                        borderRadius: '5px',
                                        cursor: 'pointer',
                                        fontSize: '12px'
                                    }}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
             ) : (
                <p>No jobs available yet...</p>
            )}
            </>
        )}

            {/* Tenders on My Jobs - Only for Clients */}
            {currentUserRole === 'client' && (
                <>
                    <hr style={{ margin: '20px 0' }} />
                    <h2>Tenders on My Jobs</h2>
                    {tenders.filter(tender => tender.clientID === currentUserId).length > 0 ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '15px' }}>
                        {tenders.filter(tender => tender.clientID === currentUserId).map(tender => (
                                <div 
                                    key={tender.id}
                                    style={{
                                        border: '2px solid #28a745',
                                        borderRadius: '8px',
                                        padding: '15px',
                                        backgroundColor: '#f0fff4'
                                    }}
                                >
                                    <h3>{tender.jobName || 'Job'}</h3>
                                    <p><strong>Supplier:</strong> {tender.supplierName || 'Anonymous'}</p>
                                    <p><strong>Quote:</strong> €{tender.tenderAmount || 'N/A'}</p>
                                    <p><strong>Budget:</strong> €{tender.clientBudget || 'N/A'}</p>
                                    <p style={{ fontSize: '12px', color: '#999' }}>
                                        Submitted: {tender.createdAt ? new Date(tender.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                                    </p>
                                   <button 
                                        type="button"
                                        onClick={() => handleAcceptTenderClick(tender.id, tender.jobID)}
                                        style={{ 
                                            marginTop: '10px',
                                            backgroundColor: '#28a745',
                                            color: '#fff',
                                            padding: '8px 15px',
                                            border: 'none',
                                            borderRadius: '5px',
                                            cursor: 'pointer',
                                            fontSize: '12px',
                                            width: '100%'
                                        }}
                                    >
                                        Accept Tender
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>No tenders received yet.</p>
                    )}
                </>
            )}

            {/* Active Tenders Section - Only for Suppliers */}
            {currentUserRole === 'supplier' && (
                <>
                    <hr style={{ margin: '20px 0' }} />
                    <h2>Active Tenders</h2>
                    {tenders.filter(tender => tender.supplierID === currentUserId && tender.status !== 'accepted').length > 0 ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '15px' }}>
                            {tenders.filter(tender => tender.supplierID === currentUserId && tender.status !== 'accepted').map(tender => (
                                <div 
                                    key={tender.id}
                                    style={{
                                        border: '2px solid #17a2b8',
                                        borderRadius: '8px',
                                        padding: '15px',
                                        backgroundColor: '#f0f8ff'
                                    }}
                                >
                                    <h3>{tender.jobName || 'Job'}</h3>
                                    <p><strong>Your Quote:</strong> €{tender.tenderAmount || 'N/A'}</p>
                                    <p><strong>Client Budget:</strong> €{tender.clientBudget || 'N/A'}</p>
                                    <p><strong>Status:</strong> {tender.status || 'Pending'}</p>
                                    <p style={{ fontSize: '12px', color: '#999' }}>
                                        Submitted: {tender.createdAt ? new Date(tender.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                                    </p>
                                    <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                                        <button 
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEditTender(tender);
                                            }}
                                            style={{ 
                                                flex: 1,
                                                backgroundColor: '#28a745',
                                                color: '#fff',
                                                padding: '8px 15px',
                                                border: 'none',
                                                borderRadius: '5px',
                                                cursor: 'pointer',
                                                fontSize: '12px'
                                            }}
                                        >
                                            Edit
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (window.confirm('Delete this tender?')) {
                                                    handleDeleteTender(tender.id);
                                                }
                                            }}
                                            style={{ 
                                                flex: 1,
                                                backgroundColor: '#dc3545',
                                                color: '#fff',
                                                padding: '8px 15px',
                                                border: 'none',
                                                borderRadius: '5px',
                                                cursor: 'pointer',
                                                fontSize: '12px'
                                            }}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>No active tenders.</p>
                    )}
                </>
            )}

            {/* Accepted Tenders Section - Only for Suppliers */}
            {currentUserRole === 'supplier' && (
                <>
                    <hr style={{ margin: '20px 0' }} />
                    <h2>Accepted Tenders</h2>
                    {tenders.filter(tender => tender.supplierID === currentUserId && tender.status === 'accepted').length > 0 ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '15px' }}>
                            {tenders.filter(tender => tender.supplierID === currentUserId && tender.status === 'accepted').map(tender => (
                                <div 
                                    key={tender.id}
                                    style={{
                                        border: '2px solid #28a745',
                                        borderRadius: '8px',
                                        padding: '15px',
                                        backgroundColor: '#f0fff4'
                                    }}
                                >
                                    <h3>{tender.jobName || 'Job'}</h3>
                                    <p><strong>Your Quote:</strong> €{tender.tenderAmount || 'N/A'}</p>
                                    <p><strong>Client Budget:</strong> €{tender.clientBudget || 'N/A'}</p>
                                    <p><strong>Status:</strong> <span style={{ color: '#28a745', fontWeight: 'bold' }}>Contracted</span></p>
                                    <p style={{ fontSize: '12px', color: '#999' }}>
                                        Accepted: {tender.createdAt ? new Date(tender.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                                    </p>
                                    <button 
                                        type="button"
                                        onClick={() => navigate(`/messaging?clientID=${tender.clientID}&tenderId=${tender.id}`)}
                                        style={{ 
                                            marginTop: '10px',
                                            backgroundColor: '#17a2b8',
                                            color: '#fff',
                                            padding: '8px 15px',
                                            border: 'none',
                                            borderRadius: '5px',
                                            cursor: 'pointer',
                                            fontSize: '12px',
                                            width: '100%'
                                        }}
                                    >
                                        💬 Message Client
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>No accepted tenders yet.</p>
                    )}
                </>
            )}
      </div>
    );
}