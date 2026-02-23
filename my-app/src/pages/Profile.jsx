import { useState } from 'react';

export default function Profile(props) {
  // Determine if user is client or supplier
  const isClient = props.userRole === 'CLIENT';
  
  // Initialize state with current user data
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(props.currentUser.name || '');
  const [address, setAddress] = useState(props.currentUser.address || '');
  const [email, setEmail] = useState(props.currentUser.email || '');
  const [phone, setPhone] = useState(props.currentUser.phone || '');

  // Handle save - calls appropriate update function
  const handleSave = () => {
    const updatedUser = {
      id: props.currentUser.id,
      name: name,
      address: address,
      email: email,
      phone: phone,
      
    };

    if (isClient) {
      props.updateClient(updatedUser);
    } else {
      props.updateSupplier(updatedUser);
    }
    
    setIsEditing(false);
  };

  // Handle cancel - reset to original values
  const handleCancel = () => {
    setName(props.currentUser.name || '');
    setAddress(props.currentUser.address || '');
    setEmail(props.currentUser.email || '');
    setPhone(props.currentUser.phone || '');
    setIsEditing(false);
  };

  return (
    <div className="page">
      <h1>Profile</h1>
      
      {!isEditing ? (
        // VIEW MODE
        <div className="profile-view">
          <div className="profile-field">
            <label>Name:</label>
            <p>{name}</p>
          </div>
          
          <div className="profile-field">
            <label>Address:</label>
            <p>{address}</p>
          </div>
          
          <div className="profile-field">
            <label>Email:</label>
            <p>{email}</p>
          </div>
          
          <div className="profile-field">
            <label>Phone:</label>
            <p>{phone}</p>
          </div>
          
          
          <button onClick={() => setIsEditing(true)}>Edit Profile</button>
        </div>
      ) : (
        // EDIT MODE
        <div className="profile-edit">
          <div className="form-group">
            <label>Name:</label>
            <input 
              type="text" 
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          
          <div className="form-group">
            <label>Address:</label>
            <input 
              type="text" 
              value={address}
              onChange={(event) => setAddress(event.target.value)}
            />
          </div>
          
          <div className="form-group">
            <label>Email:</label>
            <input 
              type="email" 
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          
          <div className="form-group">
            <label>Phone:</label>
            <input 
              type="tel" 
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
          </div>
          
          <div className="button-group">
            <button onClick={handleSave}>Save Changes</button>
            <button onClick={handleCancel}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}