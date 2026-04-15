import { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { collection, query, where, getDocs, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';

export default function AcceptTender() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [accepting, setAccepting] = useState(null);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchJobsAndTenders = async () => {
            try {
                const user = auth.currentUser;
                if (!user) return;

                // Fetch client's jobs
                const jobsSnap = await getDocs(
                    query(collection(db, 'jobList'), where('clientID', '==', user.uid))
                );
                const jobsData = jobsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

                // For each job, fetch its tenders and supplier names
                const jobsWithTenders = await Promise.all(
                    jobsData.map(async (job) => {
                        const tendersSnap = await getDocs(
                            query(collection(db, 'tenderList'), where('jobID', '==', job.id))
                        );

                        const tenders = await Promise.all(
                            tendersSnap.docs.map(async (t) => {
                                const tender = { id: t.id, ...t.data() };
                                // Look up supplier name
                                if (tender.supplierID) {
                                    const supplierDoc = await getDoc(doc(db, 'users', tender.supplierID));
                                    tender.supplierName = supplierDoc.exists()
                                        ? supplierDoc.data().name
                                        : 'Unknown';
                                }
                                return tender;
                            })
                        );

                        return { ...job, tenders };
                    })
                );

                setJobs(jobsWithTenders);
            } catch (err) {
                console.error('Error loading jobs:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchJobsAndTenders();
    }, []);

    const handleDelete = async (job) => {
        if (!window.confirm(`Delete "${job.jobName}"? This will also remove all tenders for this job.`)) return;
        try {
            setMessage('');
            // Delete all tenders for this job
            const tendersSnap = await getDocs(
                query(collection(db, 'tenderList'), where('jobID', '==', job.id))
            );
            await Promise.all(tendersSnap.docs.map(t => deleteDoc(doc(db, 'tenderList', t.id))));
            // Delete the job itself
            await deleteDoc(doc(db, 'jobList', job.id));
            setJobs(prev => prev.filter(j => j.id !== job.id));
            setMessage(`"${job.jobName}" has been deleted.`);
            setTimeout(() => setMessage(''), 4000);
        } catch (err) {
            console.error('Error deleting job:', err);
            setMessage('Failed to delete job. Please try again.');
        }
    };

    const handleAccept = async (job, tender) => {
        try {
            setAccepting(tender.id);
            setMessage('');

            await updateDoc(doc(db, 'jobList', job.id), {
                status: 'accepted',
                supplierID: tender.supplierID,
            });

            // Update local state so UI reflects the change immediately
            setJobs(prev => prev.map(j =>
                j.id === job.id ? { ...j, status: 'accepted', supplierID: tender.supplierID } : j
            ));

            setMessage(`Tender from ${tender.supplierName} accepted for "${job.jobName}".`);
            setTimeout(() => setMessage(''), 4000);
        } catch (err) {
            console.error('Error accepting tender:', err);
            setMessage('Failed to accept tender. Please try again.');
        } finally {
            setAccepting(null);
        }
    };

    const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

    const statusColour = (status) => {
        if (status === 'accepted') return { background: '#dcfce7', color: '#166534' };
        if (status === 'tendered') return { background: '#dbeafe', color: '#1d4ed8' };
        return { background: '#f1f5f9', color: '#475569' };
    };

    if (loading) return <div className="page"><p>Loading tenders...</p></div>;

    return (
        <div className="page">
            <h1>Accept Tender</h1>

            {message && (
                <p style={{ color: '#166534', background: '#dcfce7', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px' }}>
                    {message}
                </p>
            )}

            {jobs.length === 0 ? (
                <p>You have not posted any jobs yet.</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {jobs.map(job => (
                        <div key={job.id} style={{
                            background: '#fff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '12px',
                            padding: '24px',
                            boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
                        }}>
                            {/* Job header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                                <div>
                                    <h2 style={{ margin: 0 }}>{job.jobName}</h2>
                                    <p style={{ margin: '4px 0 0', fontSize: '13px' }}>{job.description}</p>
                                </div>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Budget: €{job.budget}</span>
                                    <span style={{
                                        fontSize: '12px', fontWeight: 600, padding: '3px 12px',
                                        borderRadius: '20px', ...statusColour(job.status)
                                    }}>
                                        {capitalize(job.status) || 'Posted'}
                                    </span>
                                    <button
                                        onClick={() => handleDelete(job)}
                                        style={{
                                            padding: '4px 12px', fontSize: '12px',
                                            backgroundColor: '#fee2e2', color: '#dc2626',
                                            border: '1px solid #fca5a5', borderRadius: '6px',
                                            cursor: 'pointer', fontWeight: 600
                                        }}
                                    >
                                        Delete Job
                                    </button>
                                </div>
                            </div>

                            {/* Tenders */}
                            {job.tenders.length === 0 ? (
                                <p style={{ color: '#94a3b8', fontSize: '14px', fontStyle: 'italic' }}>No tenders submitted yet.</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <p style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', margin: 0 }}>
                                        {job.tenders.length} tender{job.tenders.length !== 1 ? 's' : ''} received:
                                    </p>
                                    {job.tenders.map(tender => (
                                        <div key={tender.id} style={{
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            padding: '14px 16px', background: '#f8fafc',
                                            border: '1px solid #e2e8f0', borderRadius: '8px', flexWrap: 'wrap', gap: '10px'
                                        }}>
                                            <div>
                                                <p style={{ margin: 0, fontWeight: 600, color: '#0f172a' }}>{tender.supplierName}</p>
                                                <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748b' }}>
                                                    Quote: <strong style={{ color: '#0f172a' }}>€{tender.tenderAmount}</strong>
                                                    {tender.tenderAmount < job.budget && (
                                                        <span style={{ marginLeft: '8px', fontSize: '12px', color: '#059669', fontWeight: 600 }}>
                                                            €{job.budget - tender.tenderAmount} under budget
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                            {job.status === 'accepted' ? (
                                                job.supplierID === tender.supplierID ? (
                                                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#059669' }}>✓ Accepted</span>
                                                ) : (
                                                    <span style={{ fontSize: '13px', color: '#94a3b8' }}>Not selected</span>
                                                )
                                            ) : (
                                                <button
                                                    onClick={() => handleAccept(job, tender)}
                                                    disabled={accepting === tender.id}
                                                    style={{ whiteSpace: 'nowrap' }}
                                                >
                                                    {accepting === tender.id ? 'Accepting...' : 'Accept Tender'}
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
