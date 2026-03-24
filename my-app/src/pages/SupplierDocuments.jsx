import { useState, useEffect } from 'react';
import { auth, db, storage } from '../firebase';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function SupplierDocuments() {
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const [userRole, setUserRole] = useState('');
  const [documents, setDocuments] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentType, setDocumentType] = useState('License');

  const documentTypes = ['License', 'Insurance', 'Certification', 'Tax Certificate', 'Other'];

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        const currentUser = auth.currentUser;
        if (!currentUser) {
          setError('No user logged in');
          setLoading(false);
          return;
        }

        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserRole(data.role || '');
          setDocuments(data.documents || []);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load documents');
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
      setError('');
    }
  };

  const handleUploadDocument = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setError('Please select a file');
      return;
    }

    if (userRole !== 'supplier') {
      setError('Only suppliers can upload documents');
      return;
    }

    try {
      setUploading(true);
      setError('');

      const currentUser = auth.currentUser;
      const timestamp = Date.now();
      const fileName = `${documentType}_${timestamp}_${selectedFile.name}`;
      
      // Create storage reference
      const storageRef = ref(storage, `supplierDocuments/${currentUser.uid}/${fileName}`);
      
      // Upload file
      await uploadBytes(storageRef, selectedFile);
      
      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);
      
      // Create document object
      const newDocument = {
        id: timestamp.toString(),
        documentType: documentType,
        fileName: selectedFile.name,
        fileUrl: downloadURL,
        uploadDate: new Date().toISOString(),
        status: 'Pending'
      };
      
      // Update Firestore with new document
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        documents: arrayUnion(newDocument)
      });
      
      setDocuments([...documents, newDocument]);
      setSelectedFile(null);
      setSuccessMessage('Document uploaded successfully!');
      
      // Reset file input
      document.getElementById('fileInput').value = '';
      
      setTimeout(() => setSuccessMessage(''), 3000);
      setUploading(false);
    } catch (err) {
      console.error('Error uploading document:', err);
      setError('Failed to upload document');
      setUploading(false);
    }
  };

  if (loading) {
    return <div className="page"><p>Loading documents...</p></div>;
  }

  if (userRole !== 'supplier') {
    return (
      <div className="page">
        <h1>Supplier Documents</h1>
        <p style={{ color: 'red' }}>This page is only accessible to suppliers.</p>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>Supplier Documents</h1>
      <p>Upload and manage your verification documents.</p>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
      
      {/* Upload Form */}
      <div className="upload-section" style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ccc', borderRadius: '5px' }}>
        <h2>Upload New Document</h2>
        <form onSubmit={handleUploadDocument}>
          <div style={{ marginBottom: '15px' }}>
            <label>Document Type:</label>
            <select 
              value={documentType} 
              onChange={(e) => setDocumentType(e.target.value)}
              style={{ marginLeft: '10px', padding: '5px' }}
            >
              {documentTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label>Select File:</label>
            <input 
              id="fileInput"
              type="file" 
              accept="image/*,.pdf"
              onChange={handleFileSelect}
              disabled={uploading}
              style={{ marginLeft: '10px' }}
            />
          </div>
          
          <button type="submit" disabled={!selectedFile || uploading}>
            {uploading ? 'Uploading...' : 'Upload Document'}
          </button>
        </form>
      </div>

      {/* Documents List */}
      <div className="documents-list">
        <h2>Your Documents</h2>
        {documents.length === 0 ? (
          <p>No documents uploaded yet.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f0f0f0' }}>
                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Type</th>
                <th style={{ padding: '10px', border: '1px solid #ddd' }}>File Name</th>
                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Upload Date</th>
                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Status</th>
                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc.id}>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{doc.documentType}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{doc.fileName}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                    {new Date(doc.uploadDate).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                    <span style={{ 
                      color: doc.status === 'Approved' ? 'green' : doc.status === 'Rejected' ? 'red' : 'orange'
                    }}>
                      {doc.status}
                    </span>
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                    <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">View</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}