import {useState, useEffect} from 'react';
import {useSearchParams} from 'react-router-dom';
import {auth, db} from '../firebase';
import {doc, getDoc, updateDoc, collection, query, where, getDocs} from 'firebase/firestore';

export default function Profile() {
    const [searchParams] = useSearchParams();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // User data states
    const [userId, setUserId] = useState('');
    const [currentUserId, setCurrentUserId] = useState('');
    const [userRole, setUserRole] = useState('');
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [bio, setBio] = useState('');
    const [skills, setSkills] = useState('');

    // Rating and reviews states
    const [rating, setRating] = useState(0);
    const [reviewsCount, setReviewsCount] = useState(0);
    const [reviews, setReviews] = useState([]);
    const [showReviews, setShowReviews] = useState(false);

    // Favorites states
    const [favorites, setFavorites] = useState([]);
    const [favoritesLoading, setFavoritesLoading] = useState(false);

    // Store original values for cancel functionality
    const [originalData, setOriginalData] = useState({});

    // Fetch user data from Firebase on component mount
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setLoading(true);

                // Get current authenticated user
                const currentUser = auth.currentUser;
                if (!currentUser) {
                    setError('No user logged in');
                    setLoading(false);
                    return;
                }

                setCurrentUserId(currentUser.uid);

                // Check if viewing another user's profile
                const userParam = searchParams.get('user');
                console.log('🔍 DEBUG - URL user param:', userParam);
                console.log('🔍 DEBUG - searchParams:', searchParams);
                console.log('🔍 DEBUG - window.location.search:', window.location.search);
                
                const profileUserId = userParam || currentUser.uid;
                
                console.log('📋 Profile loading for userId:', profileUserId);
                
                setUserId(profileUserId);

                // Fetch from 'users' collection
                const userDoc = await getDoc(doc(db, 'users', profileUserId));

                if (userDoc.exists()) {
                    const data = userDoc.data();

                    // Set all state values
                    setUserRole(data.role || '');
                    setName(data.name || '');
                    setAddress(data.address || '');
                    setEmail(data.email || '');
                    setPhone(data.phone || '');
                    setBio(data.bio || '');
                    setSkills(data.skills || '');

                    // Load favorites only for current user's profile
                    if (profileUserId === currentUser.uid) {
                        const userFavorites = data.favorites || [];
                        if (userFavorites.length > 0) {
                            loadFavorites(userFavorites);
                        }
                    }

                    // Store original data for cancel
                    setOriginalData({
                        role: data.role || '',
                        name: data.name || '',
                        address: data.address || '',
                        email: data.email || '',
                        phone: data.phone || '',
                        bio: data.bio || '',
                        skills: data.skills || ''
                    });
                } else {
                    setError('User profile not found');
                }

                // Load rating and reviews count - use profileUserId, not currentUser.uid!
                await loadRating(profileUserId);

                setLoading(false);
            } catch (err) {
                console.error('Error fetching user data:', err);
                setError('Failed to load profile data');
                setLoading(false);
            }
        };

        fetchUserData();
    }, [searchParams]);

    // Load user rating from reviews
    const loadRating = async (uid) => {
        try {
            console.log('=== LOADING REVIEWS ===');
            console.log('Looking for reviews where reviewedId =', uid);
            
            const reviewsQuery = query(collection(db, 'reviews'), where('reviewedId', '==', uid));
            const reviewsSnapshot = await getDocs(reviewsQuery);
            
            console.log('Found', reviewsSnapshot.docs.length, 'reviews');
            
            if (!reviewsSnapshot.empty) {
                const reviewsData = reviewsSnapshot.docs.map(doc => {
                    const data = doc.data();
                    console.log('Review data:', {
                        reviewedId: data.reviewedId,
                        reviewerId: data.reviewerId,
                        reviewerName: data.reviewerName,
                        rating: data.rating,
                        comment: data.comment
                    });
                    
                    let createdAtFormatted = 'Unknown date';
                    
                    // Handle both Firestore Timestamp and regular Date
                    if (data.createdAt) {
                        if (data.createdAt.seconds) {
                            // Firestore Timestamp
                            createdAtFormatted = new Date(data.createdAt.seconds * 1000).toLocaleDateString();
                        } else if (data.createdAt instanceof Date) {
                            // Regular Date
                            createdAtFormatted = data.createdAt.toLocaleDateString();
                        } else if (typeof data.createdAt === 'string') {
                            createdAtFormatted = data.createdAt;
                        }
                    }
                    
                    return {
                        id: doc.id,
                        ...data,
                        reviewerName: data.reviewerName || 'Anonymous',
                        reviewerId: data.reviewerId || null,
                        rating: data.rating || 0,
                        comment: data.comment || '',
                        createdAt: createdAtFormatted
                    };
                });
                setReviews(reviewsData);
                console.log('✅ Reviews loaded successfully:', reviewsData.length, 'reviews');
                
                const totalRating = reviewsData.reduce((sum, review) => sum + review.rating, 0);
                const avgRating = totalRating / reviewsData.length;
                setRating(Math.round(avgRating * 10) / 10);
                setReviewsCount(reviewsData.length);
            } else {
                console.log('❌ No reviews found for this user');
                setReviews([]);
                setRating(0);
                setReviewsCount(0);
            }
        } catch (err) {
            console.error('Error loading rating:', err);
        }
    };

    // Load favorites data with email
    const loadFavorites = async (favoriteIds) => {
        try {
            setFavoritesLoading(true);
            const favoritesData = [];
            
            for (const id of favoriteIds) {
                const userDoc = await getDoc(doc(db, 'users', id));
                if (userDoc.exists()) {
                    const data = userDoc.data();
                    favoritesData.push({
                        id,
                        name: data.name || 'Unknown',
                        role: data.role || 'Unknown',
                        email: data.email || ''
                    });
                }
            }
            
            setFavorites(favoritesData);
        } catch (err) {
            console.error('Error loading favorites:', err);
        } finally {
            setFavoritesLoading(false);
        }
    };

    // Save updated data to Firebase
    const handleSave = async () => {
        try {
            setError('');
            setSuccessMessage('');

            const userRef = doc(db, 'users', userId);

            await updateDoc(userRef, {
                name: name,
                address: address,
                email: email,
                phone: phone,
                bio: bio,
                skills: skills
            });

            setOriginalData({
                ...originalData,
                name,
                address,
                email,
                phone,
                bio,
                skills
            });

            setSuccessMessage('Profile updated successfully!');
            setIsEditing(false);

            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            console.error('Error updating profile:', err);
            setError('Failed to update profile. Please try again.');
        }
    };

    const handleCancel = () => {
        setName(originalData.name || '');
        setAddress(originalData.address || '');
        setEmail(originalData.email || '');
        setPhone(originalData.phone || '');
        setBio(originalData.bio || '');
        setSkills(originalData.skills || '');
        setIsEditing(false);
        setError('');
    };

    // Add user to favorites
    const addToFavorites = async (favoriteId) => {
        try {
            const userRef = doc(db, 'users', currentUserId);
            const userDoc = await getDoc(userRef);
            const currentFavorites = userDoc.data().favorites || [];
            
            if (!currentFavorites.includes(favoriteId)) {
                await updateDoc(userRef, {
                    favorites: [...currentFavorites, favoriteId]
                });
                
                setSuccessMessage('Added to favorites!');
                setTimeout(() => setSuccessMessage(''), 3000);
            }
        } catch (err) {
            console.error('Error adding to favorites:', err);
            setError('Failed to add to favorites');
        }
    };

    // Remove user from favorites
    const removeFromFavorites = async (favoriteId) => {
        try {
            const userRef = doc(db, 'users', currentUserId);
            const userDoc = await getDoc(userRef);
            const currentFavorites = userDoc.data().favorites || [];
            
            const updatedFavorites = currentFavorites.filter(id => id !== favoriteId);
            await updateDoc(userRef, {
                favorites: updatedFavorites
            });
            
            loadFavorites(updatedFavorites);
            setSuccessMessage('Removed from favorites!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            console.error('Error removing from favorites:', err);
            setError('Failed to remove from favorites');
        }
    };

    if (loading) {
        return <div className="page"><p>Loading profile...</p></div>;
    }

    return (
        <div className="page">
            <form>
                <h1>User Profile {userId !== currentUserId && '(View Only)'}</h1>

                {error && <p style={{color: 'red'}}>{error}</p>}
                {successMessage && <p style={{color: 'green'}}>{successMessage}</p>}

                {!isEditing ? (
                    <div className="profile-view">
                        <p><strong>Role:</strong> {userRole || 'Not set'}</p>
                        <p><strong>Name:</strong> {name || 'Not set'}</p>
                        <p><strong>Address:</strong> {address || 'Not set'}</p>
                        <p><strong>Email:</strong> {email || 'Not set'}</p>
                        <p><strong>Phone:</strong> {phone || 'Not set'}</p>
                        {bio && <p><strong>About:</strong> {bio}</p>}
                        {skills && <p><strong>Skills:</strong> {skills}</p>}
                        <p><strong>Rating:</strong> {rating > 0 ? `${rating} ⭐ (${reviewsCount} reviews)` : 'No reviews yet'}
                        {reviewsCount > 0 && (
                            <button 
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setShowReviews(!showReviews);
                                }}
                                style={{ marginLeft: '10px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '3px', padding: '2px 8px', cursor: 'pointer', fontSize: '12px' }}
                            >
                                {showReviews ? 'Hide' : 'View'} Reviews
                            </button>
                        )}</p>
                        {showReviews && reviews.length > 0 && (
                            <div style={{ marginTop: '10px', padding: '10px', border: '1px solid #eee', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
                                <h3>Reviews:</h3>
                                {reviews.map(review => (
                                    <div key={review.id} style={{ marginBottom: '10px', padding: '8px', border: '1px solid #ddd', borderRadius: '3px', backgroundColor: '#fff' }}>
                                        <p><strong>Rating:</strong> {'⭐'.repeat(review.rating)}</p>
                                        <p><strong>From:</strong> <a href={`/profile?user=${review.reviewerId}`} style={{ color: '#007bff', textDecoration: 'none', cursor: 'pointer' }}>{review.reviewerName}</a></p>
                                        <p><strong>Comment:</strong> {review.comment || 'No comment'}</p>
                                        <p style={{ fontSize: '12px', color: '#666' }}>Date: {review.createdAt}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                        {userId === currentUserId && (
                            <button onClick={() => setIsEditing(true)}>Edit Profile</button>
                        )}
                        {userId !== currentUserId && (
                            <button onClick={() => addToFavorites(userId)} style={{ backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '3px', padding: '8px 16px', cursor: 'pointer' }}>
                                Add to Favorites ⭐
                            </button>
                        )}
                    </div>
                ) : (
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        handleSave();
                    }} className="profile-edit">
                        <div className="form-group">
                            <label>Full Name:</label>
                            <input
                                type="text"
                                placeholder="Full Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Email:</label>
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Phone:</label>
                            <input
                                type="tel"
                                placeholder="Phone"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Address:</label>
                            <input
                                type="text"
                                placeholder="Address"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label>About Me:</label>
                            <textarea
                                placeholder="Tell about yourself..."
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                rows="3"
                            />
                        </div>

                        <div className="form-group">
                            <label>Skills (comma-separated):</label>
                            <textarea
                                placeholder="e.g., React, Node.js, Python"
                                value={skills}
                                onChange={(e) => setSkills(e.target.value)}
                                rows="2"
                            />
                        </div>

                        <div className="button-group">
                            <button type="submit">Save Changes</button>
                            <button type="button" onClick={handleCancel}>Cancel</button>
                        </div>
                    </form>
                )}
            </form>

            {/* Supplier Documents Link */}
            {userRole === 'supplier' && (
                <>
                    <hr style={{ margin: '20px 0' }} />
                    <div className="supplier-section" style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
                        <h2>Supplier Credentials</h2>
                        <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
                            Upload and manage your certification documents to build trust with clients.
                        </p>
                        <a 
                            href="/documents" 
                            style={{ 
                                display: 'inline-block', 
                                padding: '10px 20px', 
                                backgroundColor: '#0066cc', 
                                color: '#fff', 
                                borderRadius: '5px', 
                                textDecoration: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            Manage Credentials
                        </a>
                    </div>
                </>
            )}

            {/* Favorites Section - Only for current user */}
            {userId === currentUserId && (
                <>
                    <hr style={{ margin: '20px 0' }} />
                    <div className="favorites-section" style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
                        <h2>My Favorites</h2>
                        <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
                            Saved workers and clients you want to work with.
                        </p>
                        
                        {/* Add to favorites form */}
                        <div style={{ marginBottom: '20px' }}>
                            <input
                                type="text"
                                placeholder="Enter user ID to add to favorites"
                                id="favoriteId"
                                style={{ padding: '8px', marginRight: '10px', border: '1px solid #ccc', borderRadius: '3px', width: '250px' }}
                            />
                            <button 
                                onClick={() => {
                                    const id = document.getElementById('favoriteId').value.trim();
                                    if (id) {
                                        addToFavorites(id);
                                        document.getElementById('favoriteId').value = '';
                                    }
                                }}
                                style={{ padding: '8px 15px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
                            >
                                Add to Favorites
                            </button>
                        </div>

                        {favoritesLoading ? (
                            <p>Loading favorites...</p>
                        ) : favorites.length > 0 ? (
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                {favorites.map(fav => (
                                    <li key={fav.id} style={{ padding: '10px', border: '1px solid #eee', borderRadius: '5px', marginBottom: '10px', backgroundColor: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <a href={`/profile?user=${fav.id}`} style={{ color: '#007bff', textDecoration: 'none', cursor: 'pointer' }}><strong>{fav.name}</strong></a> ({fav.role})
                                            {fav.email && <p style={{fontSize: '12px', color: '#666', margin: '5px 0 0 0'}}>{fav.email}</p>}
                                        </div>
                                        <div style={{ display: 'flex', gap: '5px' }}>
                                            <a 
                                                href={`/messaging?userId=${fav.id}`}
                                                style={{ padding: '5px 10px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '3px', textDecoration: 'none', cursor: 'pointer', fontSize: '12px' }}
                                            >
                                                Message
                                            </a>
                                            <a 
                                                href={`mailto:${fav.email}`}
                                                style={{ padding: '5px 10px', backgroundColor: '#6c757d', color: '#fff', border: 'none', borderRadius: '3px', textDecoration: 'none', cursor: 'pointer', fontSize: '12px' }}
                                            >
                                                Email
                                            </a>
                                            <button 
                                                onClick={() => removeFromFavorites(fav.id)}
                                                style={{ padding: '5px 10px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer', fontSize: '12px' }}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No favorites yet. Start adding users you want to work with!</p>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
