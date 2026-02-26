import { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // User data states
  const [userId, setUserId] = useState('');
  const [userRole, setUserRole] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

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

        setUserId(currentUser.uid);

        // Fetch from 'users' collection
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        
        if (userDoc.exists()) {
          const data = userDoc.data();
          
          // Set all state values
          setUserRole(data.role || '');
          setName(data.name || '');
          setAddress(data.address || '');
          setEmail(data.email || '');
          setPhone(data.phone || '');
          
          // Store original data for cancel
          setOriginalData({
            role: data.role || '',
            name: data.name || '',
            address: data.address || '',
            email: data.email || '',
            phone: data.phone || ''
          });
        } else {
          setError('User profile not found');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load profile data');
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

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
        phone: phone
      });
      
      // Update original data after successful save
      setOriginalData({
        ...originalData,
        name,
        address,
        email,
        phone
      });
      
      setSuccessMessage('Profile updated successfully!');
      setIsEditing(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
    }
  };

  const handleCancel = () => {
    // Reset to original values
    setName(originalData.name || '');
    setAddress(originalData.address || '');
    setEmail(originalData.email || '');
    setPhone(originalData.phone || '');
    setIsEditing(false);
    setError('');
  };

  if (loading) {
    return <div className="page"><p>Loading profile...</p></div>;
  }

  return (
    <div className="page">
      <h1>User Profile</h1>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
      
      {!isEditing ? (
        <div className="profile-view">
          <p><strong>Role:</strong> {userRole || 'Not set'}</p>
          <p><strong>Name:</strong> {name || 'Not set'}</p>
          <p><strong>Address:</strong> {address || 'Not set'}</p>
          <p><strong>Email:</strong> {email || 'Not set'}</p>
          <p><strong>Phone:</strong> {phone || 'Not set'}</p>
          <button onClick={() => setIsEditing(true)}>Edit Profile</button>
        </div>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="profile-edit">
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
          
          <div className="button-group">
            <button type="submit">Save Changes</button>
            <button type="button" onClick={handleCancel}>Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
}