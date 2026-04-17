import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, getDoc, collection, query, where, getDocs, addDoc, serverTimestamp, updateDoc } from 'firebase/firestore';

export default function JobDetails() {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [job, setJob] = useState(null);
    const [client, setClient] = useState(null);
    const [supplier, setSupplier] = useState(null);
    const [tenders, setTenders] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Review states
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [reviewTarget, setReviewTarget] = useState(null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [showFavoritesModal, setShowFavoritesModal] = useState(false);

    useEffect(() => {
        const user = auth.currentUser;
        if (!user) {
            navigate('/');
            return;
        }
        setCurrentUser(user);
        loadJobDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [jobId]);

    const loadJobDetails = async () => {
        try {
            setLoading(true);

            // Load job details
            const jobDoc = await getDoc(doc(db, 'jobList', jobId));
            if (!jobDoc.exists()) {
                setError('Job not found');
                setLoading(false);
                return;
            }

            const jobData = { id: jobDoc.id, ...jobDoc.data() };
            setJob(jobData);

            // Load client details
            if (jobData.clientID) {
                const clientDoc = await getDoc(doc(db, 'users', jobData.clientID));
                if (clientDoc.exists()) {
                    setClient({ id: clientDoc.id, ...clientDoc.data() });
                }
            }

            // Load supplier details if assigned
            if (jobData.supplierID) {
                const supplierDoc = await getDoc(doc(db, 'users', jobData.supplierID));
                if (supplierDoc.exists()) {
                    setSupplier({ id: supplierDoc.id, ...supplierDoc.data() });
                }
            }

            // Load tenders for this job
            const tendersQuery = query(collection(db, 'tenderList'), where('jobID', '==', jobId));
            const tendersSnapshot = await getDocs(tendersQuery);
            const tendersData = tendersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setTenders(tendersData);

        } catch (err) {
            console.error('Error loading job details:', err);
            setError('Failed to load job details');
        } finally {
            setLoading(false);
        }
    };

    const handleLeaveReview = (targetUser) => {
        setReviewTarget(targetUser);
        setShowReviewForm(true);
    };

    const submitReview = async () => {
        if (!reviewTarget) return;

        try {
            setError('');
            setSuccess('');

            // Get reviewer name
            const reviewerDoc = await getDoc(doc(db, 'users', currentUser.uid));
            const reviewerName = reviewerDoc.exists() ? reviewerDoc.data().name : 'Anonymous';

            await addDoc(collection(db, 'reviews'), {
                reviewedId: reviewTarget.id,
                reviewerId: currentUser.uid,
                rating: parseInt(rating),
                comment: comment.trim(),
                reviewerName,
                jobId: jobId,
                createdAt: serverTimestamp()
            });

            // If rating is 5 stars, show favorites modal
            if (parseInt(rating) === 5) {
                setShowFavoritesModal(true);
            } else {
                setSuccess('Review submitted successfully!');
                setShowReviewForm(false);
                setReviewTarget(null);
                setRating(5);
                setComment('');
                setTimeout(() => setSuccess(''), 3000);
            }
        } catch (err) {
            console.error('Error submitting review:', err);
            setError('Failed to submit review');
        }
    };

    const addToFavorites = async () => {
        try {
            const userRef = doc(db, 'users', currentUser.uid);
            const userDoc = await getDoc(userRef);
            const currentFavorites = userDoc.data().favorites || [];
            
            if (!currentFavorites.includes(reviewTarget.id)) {
                await updateDoc(userRef, {
                    favorites: [...currentFavorites, reviewTarget.id]
                });
            }
            
            setSuccess('Review submitted! User added to favorites ⭐');
            setShowFavoritesModal(false);
            setShowReviewForm(false);
            setReviewTarget(null);
            setRating(5);
            setComment('');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('Error adding to favorites:', err);
            setError('Failed to add to favorites');
        }
    };

    const skipAddingToFavorites = () => {
        setSuccess('Review submitted successfully!');
        setShowFavoritesModal(false);
        setShowReviewForm(false);
        setReviewTarget(null);
        setRating(5);
        setComment('');
        setTimeout(() => setSuccess(''), 3000);
    };

    const canLeaveReview = (targetUserId) => {
        // User can leave review if they are not reviewing themselves
        // and if they are either the client or the supplier of this job
        if (!currentUser || !job) return false;

        const isClient = job.clientID === currentUser.uid;
        const isSupplier = job.supplierID === currentUser.uid;
        const isTargetClient = targetUserId === job.clientID;
        const isTargetSupplier = targetUserId === job.supplierID;

        return (isClient && isTargetSupplier) || (isSupplier && isTargetClient);
    };

    if (loading) {
        return <div className="page"><p>Loading job details...</p></div>;
    }

    if (!job) {
        return <div className="page"><p>Job not found</p></div>;
    }

    return (
        <div className="page">
            <h1>Job Details</h1>

            {error && <p style={{color: 'red'}}>{error}</p>}
            {success && <p style={{color: 'green'}}>{success}</p>}

            {/* Favorites Modal */}
            {showFavoritesModal && reviewTarget && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: '#fff',
                        padding: '30px',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                        maxWidth: '400px',
                        textAlign: 'center'
                    }}>
                        <h2>⭐ Perfect Rating!</h2>
                        <p style={{ fontSize: '16px', marginBottom: '20px' }}>
                            You gave {reviewTarget.name} a 5-star review!
                        </p>
                        <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
                            Would you like to add them to your favorites?
                        </p>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                            <button
                                onClick={addToFavorites}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#28a745',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: 'pointer',
                                    fontSize: '14px'
                                }}
                            >
                                ❤️ Yes, Add to Favorites
                            </button>
                            <button
                                onClick={skipAddingToFavorites}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#6c757d',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: 'pointer',
                                    fontSize: '14px'
                                }}
                            >
                                No, Skip
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="job-details" style={{ marginBottom: '20px', padding: '20px', border: '1px solid #ddd', borderRadius: '5px' }}>
                <h2>{job.jobName}</h2>
                <p><strong>Category:</strong> {job.jobCategory}</p>
                <p><strong>Description:</strong> {job.jobDescription}</p>
                <p><strong>Budget:</strong> €{job.budget}</p>
                <p><strong>Status:</strong> {job.status ? job.status.charAt(0).toUpperCase() + job.status.slice(1) : 'Posted'}</p>
                <p><strong>Tenders:</strong> {job.tenderCount || 0}</p>
            </div>

            <div className="participants-row">
                {client && (
                    <div className="participant-card" style={{ flex: 1, padding: '15px', border: '1px solid #ddd', borderRadius: '5px' }}>
                        <h3>Client (Posted by)</h3>
                        <p><strong>Name:</strong> {client.name}</p>
                        <p><strong>Email:</strong> {client.email}</p>
                        <p><strong>Role:</strong> {client.role ? client.role.charAt(0).toUpperCase() + client.role.slice(1) : ''}</p>
                        <a href={`/profile?user=${client.id}`} style={{ display: 'inline-block', marginBottom: '8px', fontSize: '13px', color: '#2563eb' }}>View Profile</a>
                        {canLeaveReview(client.id) && (
                            <button
                                onClick={() => handleLeaveReview(client)}
                                style={{ marginTop: '10px', padding: '8px 15px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
                            >
                                Leave Review for Client
                            </button>
                        )}
                    </div>
                )}

                {supplier && (
                    <div className="participant-card" style={{ flex: 1, padding: '15px', border: '1px solid #ddd', borderRadius: '5px' }}>
                        <h3>Supplier (Assigned)</h3>
                        <p><strong>Name:</strong> {supplier.name}</p>
                        <p><strong>Email:</strong> {supplier.email}</p>
                        <p><strong>Role:</strong> {supplier.role ? supplier.role.charAt(0).toUpperCase() + supplier.role.slice(1) : ''}</p>
                        <a href={`/profile?user=${supplier.id}`} style={{ display: 'inline-block', marginBottom: '8px', fontSize: '13px', color: '#2563eb' }}>View Profile</a>
                        {canLeaveReview(supplier.id) && (
                            <button
                                onClick={() => handleLeaveReview(supplier)}
                                style={{ marginTop: '10px', padding: '8px 15px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
                            >
                                Leave Review for Supplier
                            </button>
                        )}
                    </div>
                )}
            </div>

            {tenders.length > 0 && (
                <div className="tenders-section" style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '5px' }}>
                    <h3>Tenders ({tenders.length})</h3>
                    {tenders.map(tender => (
                        <div key={tender.id} style={{ padding: '10px', border: '1px solid #eee', borderRadius: '3px', marginBottom: '10px' }}>
                            <p><strong>Amount:</strong> €{tender.tenderAmount}</p>
                            <p><strong>Supplier ID:</strong> {tender.supplierID}</p>
                            <p><strong>Date:</strong> {tender.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}</p>
                        </div>
                    ))}
                </div>
            )}

            {showReviewForm && reviewTarget && (
                <div className="review-form" style={{ marginTop: '20px', padding: '20px', border: '1px solid #ddd', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
                    <h3>Leave Review for {reviewTarget.name}</h3>
                    <div style={{ marginBottom: '10px' }}>
                        <label>Rating:</label>
                        <select value={rating} onChange={(e) => setRating(e.target.value)}>
                            <option value={5}>⭐⭐⭐⭐⭐ (5 stars)</option>
                            <option value={4}>⭐⭐⭐⭐ (4 stars)</option>
                            <option value={3}>⭐⭐⭐ (3 stars)</option>
                            <option value={2}>⭐⭐ (2 stars)</option>
                            <option value={1}>⭐ (1 star)</option>
                        </select>
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                        <label>Comment:</label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Share your experience..."
                            rows={4}
                            style={{ width: '100%', padding: '8px' }}
                        />
                    </div>
                    <div>
                        <button
                            onClick={submitReview}
                            style={{ marginRight: '10px', padding: '8px 15px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
                        >
                            Submit Review
                        </button>
                        <button
                            onClick={() => setShowReviewForm(false)}
                            style={{ padding: '8px 15px', backgroundColor: '#6c757d', color: '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            <div style={{ marginTop: '20px' }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{ padding: '10px 20px', backgroundColor: '#6c757d', color: '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
                >
                    Back
                </button>
            </div>
        </div>
    );
}
