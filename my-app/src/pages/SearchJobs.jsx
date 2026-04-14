import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';

export default function SearchJobs() {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [jobsSnap, catsSnap] = await Promise.all([
                    getDocs(query(collection(db, 'jobList'), orderBy('createdAt', 'desc'))),
                    getDocs(collection(db, 'jobCategories'))
                ]);
                setJobs(jobsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                setCategories(catsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            } catch (err) {
                console.error('Error fetching jobs:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

    const filtered = jobs.filter(job => {
        const matchesText = !searchText ||
            job.jobName?.toLowerCase().includes(searchText.toLowerCase()) ||
            job.description?.toLowerCase().includes(searchText.toLowerCase());
        const matchesCategory = !selectedCategory || job.categoryID === selectedCategory;
        const matchesStatus = !selectedStatus || job.status === selectedStatus;
        return matchesText && matchesCategory && matchesStatus;
    });

    if (loading) return <div className="page"><p>Loading jobs...</p></div>;

    return (
        <div className="page">
            <h1>Search Jobs</h1>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '28px' }}>
                <input
                    type="text"
                    placeholder="Search by job name or description..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{ flex: '2', minWidth: '200px' }}
                />
                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    style={{ flex: '1', minWidth: '160px' }}
                >
                    <option value="">All Categories</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.category}</option>
                    ))}
                </select>
                <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    style={{ flex: '1', minWidth: '140px' }}
                >
                    <option value="">All Statuses</option>
                    <option value="posted">Posted</option>
                    <option value="tendered">Tendered</option>
                    <option value="accepted">Accepted</option>
                    <option value="completed">Completed</option>
                </select>
            </div>

            {filtered.length === 0 ? (
                <p style={{ textAlign: 'center' }}>No jobs match your search.</p>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '16px'
                }}>
                    {filtered.map(job => (
                        <div key={job.id} style={{
                            background: '#fff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '10px',
                            padding: '20px',
                            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px'
                        }}>
                            <h3 style={{ color: '#0f172a', marginBottom: '4px' }}>{job.jobName}</h3>
                            <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                                {job.description?.substring(0, 120)}{job.description?.length > 120 ? '...' : ''}
                            </p>
                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '4px' }}>
                                <span style={{ fontSize: '13px', color: '#475569' }}>
                                    <strong>Budget:</strong> €{job.budget}
                                </span>
                                <span style={{
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    padding: '2px 10px',
                                    borderRadius: '20px',
                                    backgroundColor: job.status === 'posted' ? '#dbeafe' : '#f1f5f9',
                                    color: job.status === 'posted' ? '#1d4ed8' : '#475569'
                                }}>
                                    {capitalize(job.status) || 'Posted'}
                                </span>
                            </div>
                            <button
                                onClick={() => navigate(`/tenderjob?jobId=${job.id}`)}
                                style={{ marginTop: '8px', alignSelf: 'flex-start' }}
                            >
                                Apply for This Job
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
