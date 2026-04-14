import React, { useState, useEffect } from 'react';
import { db} from "../firebase.js";
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

export const SupplierComponents = () => {
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