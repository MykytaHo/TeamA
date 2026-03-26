import { useState, useEffect } from 'react';
import { auth, db, storage } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';


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
  const [profilePicture, setProfilePicture] = useState('');

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

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
          setProfilePicture(data.profilePicture || '');

          // Store original data for cancel
          setOriginalData({
            role: data.role || '',
            name: data.name || '',
            address: data.address || '',
            email: data.email || '',
            phone: data.phone || '',
            profilePicture: data.profilePicture || '',
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

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      setSelectedFile(file);
      setError('');
    }
  };

  // Upload profile picture
  const handleUploadPicture = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      setError('');

      // Create storage reference
      const storageRef = ref(storage, `profilePictures/${userId}`);
      
      // Upload file
      await uploadBytes(storageRef, selectedFile);
      
      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);
      
      // Update Firestore with new profile picture URL
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        profilePicture: downloadURL
      });
      
      setProfilePicture(downloadURL);
      setOriginalData({ ...originalData, profilePicture: downloadURL });
      setSelectedFile(null);
      setSuccessMessage('Profile picture updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      
      setUploading(false);
    } catch (err) {
      console.error('Error uploading picture:', err);
      setError('Failed to upload profile picture');
      setUploading(false);
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
      
            {/* Profile Picture Section */}
      <div className="profile-picture-section">
        <h2>Profile Picture</h2>
        {profilePicture ? (
          <img 
            src={profilePicture} 
            alt="Profile" 
            style={{ width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{ width: '150px', height: '150px', borderRadius: '50%', backgroundColor: '#ccc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            No Picture
          </div>
        )}
        
        <div style={{ marginTop: '10px' }}>
          <input 
            type="file" 
            accept="image/*"
            onChange={handleFileSelect}
            disabled={uploading}
          />
          {selectedFile && (
            <button 
              onClick={handleUploadPicture} 
              disabled={uploading}
              style={{ marginLeft: '10px' }}
            >
              {uploading ? 'Uploading...' : 'Upload Picture'}
            </button>
          )}
        </div>
      </div>

      <hr style={{ margin: '20px 0' }} />
      
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
      {/* Supplier Documents Link - only show for suppliers */}
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
    </div>
  );
}