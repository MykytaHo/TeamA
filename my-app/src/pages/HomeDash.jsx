import React, { useState, useEffect } from "react";
import { auth, db, storage } from "../firebase.js"; 
import { doc, getDoc, collection, setDoc, serverTimestamp, query, orderBy, onSnapshot, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import LoadingScreen from "../components/LoadingScreen.jsx";
import PostJob from "./PostJob.jsx";

const ClientComponents = () => {
    const [formData, setFormData] = useState({ 
        jobName: '', 
        categoryID: '', 
        description: '', 
        budget: '' 
    });
    const [imageFile, setImageFile] = useState(null);
    const [categories, setCategories] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchCategories = async () => {
        const querySnapshot = await getDocs(collection(db, 'jobCategories'));
        setCategories(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        };
        fetchCategories();
    }, []);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    
    const handleImageChange = (e) => {
        if (e.target.files[0]) {
        setImageFile(e.target.files[0]);
        }
    };

    const handlePostJob = async (e) => {
        e.preventDefault();
        const user = auth.currentUser;
        if (!user) return;

        setIsSubmitting(true);

        try {
        const newJobRef = doc(collection(db, 'jobList'));
        let imageUrl = "";

        if (imageFile) {
            const imageRef = ref(storage, `jobImages/${newJobRef.id}_${imageFile.name}`);
            await uploadBytes(imageRef, imageFile);
            imageUrl = await getDownloadURL(imageRef);
        }

        await setDoc(newJobRef, { 
            jobID: newJobRef.id,
            jobName: formData.jobName,
            categoryID: formData.categoryID,
            description: formData.description,
            budget: Number(formData.budget),
            jobImage: imageUrl,
            clientID: user.uid,
            createdAt: serverTimestamp(),
            status: "tendered",
            tenderCount: 0
        });
        
        setFormData({ jobName: '', categoryID: '', description: '', budget: '' });
        setImageFile(null);
        alert('Job posted successfully');
        } catch (error) {
        console.error(error);
        } finally {
        setIsSubmitting(false);
        }
    };

    return (
        <div>
        <form onSubmit={handlePostJob}>
            <input name="jobName" value={formData.jobName} onChange={handleChange} placeholder="Job Title" required />
            <select name="categoryID" value={formData.categoryID} onChange={handleChange} required>
            <option value="" disabled>Select Category</option>
            {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.category || "Error"}</option>
            ))}
            </select>

            <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" required />
            <input name="budget" value={formData.budget} onChange={handleChange} placeholder="Budget" type="number" required />
            
            <input type="file" accept="image/*" onChange={handleImageChange} required />

            <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Posting...' : 'Post Job'}
            </button>
        </form>
        </div>
    );
    };

    const SupplierComponents = () => {
    const [jobs, setJobs] = useState([]);

    useEffect(() => {
        const q = query(collection(db, 'jobList'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
        setJobs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsubscribe();
    }, []);

    return (
        <div>
        {jobs.map(job => (
            <div key={job.id} style={{ border: "1px solid #ccc", padding: "10px", margin: "10px 0" }}>
            <h3>{job.jobName} - €{job.budget}</h3>
            {job.jobImage && <img src={job.jobImage} alt="Job" style={{maxWidth: '200px', borderRadius: '8px'}} />}
            <p>{job.description}</p>
            <p>Status: {job.status}</p>
            <p>Tenders: {job.tenderCount}</p>
            <button>Apply Now</button>
            </div>
        ))}
        </div>
    );
};

export default function HomeDash() {
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getUserRole = async () => {
            let user = auth.currentUser;
            if (!user) {
                await new Promise(resolve => setTimeout(resolve, 500));
                user = auth.currentUser;
            }
            if (user) {
                const userDocSnap = doc(db, "users", user.uid);
                const userDoc = await getDoc(userDocSnap);

                if (userDoc.exists()) {
                    setRole(userDoc.data().role);
                }
            }
            setLoading(false);
        };
        getUserRole();
    }, []);

    return (
        <>
            {loading && <LoadingScreen/>}
            {!loading && role === "supplier" && <SupplierComponents/>}
            {!loading && role === "client" && <PostJob/>}
        </>
    );
}