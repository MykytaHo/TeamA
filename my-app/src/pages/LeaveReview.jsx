import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { collection, addDoc, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';

export default function LeaveReview() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState('');
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [currentUser, setCurrentUser] = useState(null);
    const [showFavoritesModal, setShowFavoritesModal] = useState(false);
    const [selectedUserForFavorites, setSelectedUserForFavorites] = useState(null);
    const [copiedId, setCopiedId] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const current = auth.currentUser;
                if (!current) {
                    setError('No user logged in');
                    setLoading(false);
                    return;
                }
                setCurrentUser(current);

                // Check if user is specified in URL
                const userParam = searchParams.get('user');
                if (userParam) {
                    setSelectedUser(userParam);
                }

                // Load all users
                const usersSnapshot = await getDocs(collection(db, 'users'));
                const usersList = usersSnapshot.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }));
                
                setUsers(usersList);
                setLoading(false);
            } catch (err) {
                console.error('Error loading data:', err);
                setError('Failed to load data');
                setLoading(false);
            }
        };

        fetchData();
    }, [searchParams]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedUser) {
            setError('Please select a user to review');
            return;
        }

        try {
            setError('');
            setSuccess('');

            console.log('=== SUBMITTING REVIEW ===');
            console.log('Reviewed User ID (reviewedId):', selectedUser);
            console.log('Reviewer ID (reviewerId):', currentUser.uid);
            console.log('Rating:', parseInt(rating));
            console.log('Comment:', comment.trim());

            // Get reviewer name
            const reviewerDoc = await getDoc(doc(db, 'users', currentUser.uid));
            const reviewerName = reviewerDoc.exists() ? reviewerDoc.data().name : 'Anonymous';

            // Add review to Firestore
            const reviewRef = await addDoc(collection(db, 'reviews'), {
                reviewedId: selectedUser,
                reviewerId: currentUser.uid,
                rating: parseInt(rating),
                comment: comment.trim(),
                reviewerName,
                createdAt: new Date()
            });
            
            console.log('✅ Review saved! Document ID:', reviewRef.id);
            console.log('Now navigate to /profile?user=' + selectedUser + ' to see the review');

            // If rating is 5 stars, show favorites modal
            if (parseInt(rating) === 5) {
                const selectedUserData = users.find(u => u.id === selectedUser);
                setSelectedUserForFavorites(selectedUserData);
                setShowFavoritesModal(true);
            } else {
                setSuccess('Review submitted successfully!');
                setTimeout(() => {
                    navigate(`/profile?user=${selectedUser}`);
                }, 2000);
            }

            setSelectedUser('');
            setRating(5);
            setComment('');

            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('Error submitting review:', err);
            setError('Failed to submit review. Please try again.');
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopiedId(text);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const addToFavorites = async (userId) => {
        try {
            const userRef = doc(db, 'users', currentUser.uid);
            const userDoc = await getDoc(userRef);
            const currentFavorites = userDoc.data().favorites || [];
            
            if (!currentFavorites.includes(userId)) {
                await updateDoc(userRef, {
                    favorites: [...currentFavorites, userId]
                });
            }
            
            setSuccess('Review submitted! User added to favorites ⭐');
            setShowFavoritesModal(false);
            const reviewedUserId = selectedUserForFavorites?.id;
            setSelectedUserForFavorites(null);
            setTimeout(() => {
                navigate(`/profile?user=${reviewedUserId}`);
            }, 1500);
        } catch (err) {
            console.error('Error adding to favorites:', err);
            setError('Failed to add to favorites');
        }
    };

    const skipAddingToFavorites = () => {
        const reviewedUserId = selectedUserForFavorites?.id;
        setSuccess('Review submitted successfully!');
        setShowFavoritesModal(false);
        setSelectedUserForFavorites(null);
        setTimeout(() => {
            navigate(`/profile?user=${reviewedUserId}`);
        }, 1500);
    };

    if (loading) {
        return <div className="page"><p>Loading...</p></div>;
    }

    return (
        <div className="page">
            <h1>Leave a Review</h1>
            
            {error && <p style={{color: 'red'}}>{error}</p>}
            {success && <p style={{color: 'green'}}>{success}</p>}

            {/* Favorites Modal */}
            {showFavoritesModal && selectedUserForFavorites && (
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
                            You gave {selectedUserForFavorites.name} a 5-star review!
                        </p>
                        <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
                            Would you like to add them to your favorites?
                        </p>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                            <button
                                onClick={() => addToFavorites(selectedUserForFavorites.id)}
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

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Select User to Review:</label>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <select
                            value={selectedUser}
                            onChange={(e) => setSelectedUser(e.target.value)}
                            required
                            style={{ flex: 1 }}
                        >
                            <option value="">Choose a user...</option>
                            {users.map(user => (
                                <option key={user.id} value={user.id}>
                                    {user.name} ({user.role}) - ID: {user.id}
                                </option>
                            ))}
                        </select>
                        {selectedUser && (
                            <>
                                <a
                                    href={`/profile?user=${selectedUser}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        padding: '8px 12px',
                                        backgroundColor: '#17a2b8',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '5px',
                                        cursor: 'pointer',
                                        fontSize: '12px',
                                        textDecoration: 'none',
                                        display: 'inline-block'
                                    }}
                                    title="View Profile"
                                >
                                    👤 View Profile
                                </a>
                                <button
                                    type="button"
                                    onClick={() => copyToClipboard(selectedUser)}
                                    style={{
                                        padding: '8px 12px',
                                        backgroundColor: copiedId === selectedUser ? '#28a745' : '#007bff',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '5px',
                                        cursor: 'pointer',
                                        fontSize: '12px'
                                    }}
                                    title="Copy ID"
                                >
                                    {copiedId === selectedUser ? '✓ Copied' : '📋 Copy ID'}
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <div className="form-group">
                    <label>Rating (1-5 stars):</label>
                    <select
                        value={rating}
                        onChange={(e) => setRating(e.target.value)}
                        required
                    >
                        <option value={5}>⭐⭐⭐⭐⭐ (5 stars)</option>
                        <option value={4}>⭐⭐⭐⭐ (4 stars)</option>
                        <option value={3}>⭐⭐⭐ (3 stars)</option>
                        <option value={2}>⭐⭐ (2 stars)</option>
                        <option value={1}>⭐ (1 star)</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Comment (optional):</label>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Share your experience..."
                        rows={4}
                        maxLength={500}
                    />
                </div>

                <button type="submit">Submit Review</button>
            </form>
        </div>
    );
}