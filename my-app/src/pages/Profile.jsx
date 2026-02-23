import { useState } from 'react';

export default function Profile(props = {}) {
  const currentUser = props.currentUser || { name: '', address: '', email: '', phone: '' };
  const userRole = props.userRole || 'CLIENT';
  
  const isClient = userRole === 'CLIENT';
  
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentUser.name || '');
  const [address, setAddress] = useState(currentUser.address || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [phone, setPhone] = useState(currentUser.phone || '');

  const handleSave = () => {
    const updatedUser = {
      id: currentUser.id,
      name: name,
      address: address,
      email: email,
      phone: phone,
    };

    if (isClient && props.updateClient) {
      props.updateClient(updatedUser);
    } else if (!isClient && props.updateSupplier) {
      props.updateSupplier(updatedUser);
    }
    
    setIsEditing(false);
  };

  const handleCancel = () => {
    setName(currentUser.name || '');
    setAddress(currentUser.address || '');
    setEmail(currentUser.email || '');
    setPhone(currentUser.phone || '');
    setIsEditing(false);
  };

  return (
    <div className="page">
      <h1>User Profile</h1>
      
      {!isEditing ? (
        <div className="profile-view">
          <p><strong>Name:</strong> {name || 'Not set'}</p>
          <p><strong>Address:</strong> {address || 'Not set'}</p>
          <p><strong>Email:</strong> {email || 'Not set'}</p>
          <p><strong>Phone:</strong> {phone || 'Not set'}</p>
          <button onClick={() => setIsEditing(true)}>Edit Profile</button>
        </div>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="profile-edit">
          <input 
            type="text" 
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input 
            type="email" 
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input 
            type="tel" 
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <input 
            type="text" 
            placeholder="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          <button type="submit">Save</button>
          <button type="button" onClick={handleCancel}>Cancel</button>
        </form>
      )}
    </div>
  );
}