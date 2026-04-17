import {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {auth, db} from '../firebase';
import {collection, onSnapshot, doc, getDoc} from 'firebase/firestore';

export default function SearchJobs() {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [filteredJobs, setFilteredJobs] = useState([]);
    const [currentUserId, setCurrentUserId] = useState('');
    const [loading, setLoading] = useState(true);
    const [searchCategory, setSearchCategory] = useState('');
    const [searchBudget, setSearchBudget] = useState('');
    const [searchCounty, setSearchCounty] = useState('');
const [searchTown, setSearchTown] = useState('');

const locationData = {
    "Dublin": ["Dublin City", "Dun Laoghaire", "Malahide", "Swords"],
    "Cork": ["Cork City", "Bandon", "Kinsale", "Youghal"],
    "Galway": ["Galway City", "Athenry", "Ballinasloe", "Clarinbridge"],
    "Limerick": ["Limerick City", "Newcastle West", "Adare"],
    "Waterford": ["Waterford City", "Dunmore East", "Lismore"],
    "Tipperary": ["Tipperary", "Clonmel", "Nenagh"],
    "Kilkenny": ["Kilkenny City", "Thomastown", "Graiguenamanagh"],
    "Carlow": ["Carlow", "Bagenalstown"],
    "Wexford": ["Wexford Town", "Enniscorthy", "Gorey"],
    "Wicklow": ["Wicklow Town", "Greystones", "Arklow"],
    "Kildare": ["Kildare", "Maynooth", "Naas", "Athy"],
    "Laois": ["Portlaoise", "Portarlington", "Rathdowney", "Mountmellick"],
    "Offaly": ["Tullamore", "Birr", "Edenderry"],
    "Westmeath": ["Athlone", "Mullingar", "Moate"],
    "Longford": ["Longford", "Edgeworthstown", "Granard"],  
    "Roscommon": ["Roscommon", "Castlerea", "Boyle"],
    "Sligo": ["Sligo Town", "Enniscrone", "Tubbercurry"],
    "Leitrim": ["Carrick-on-Shannon", "Ballinamore", "Dromahair"],
    "Monaghan": ["Monaghan Town", "Clones", "Castleblayney"],
    "Cavan": ["Cavan Town", "Bailieborough", "Cootehill"],
    "Donegal": ["Donegal Town", "Letterkenny", "Bundoran"],
    "Mayo": ["Castlebar", "Westport", "Ballina"],
    "Clare": ["Ennis", "Shannon", "Kilrush"],
    "Kerry": ["Tralee", "Killarney", "Dingle"],
    "Louth": ["Drogheda", "Dundalk", "Ardee"],
    "Meath": ["Navan", "Trim", "Kells"]
};

    useEffect(() => {
        const loadData = async () => {
            try {
                const user = auth.currentUser;
                if (!user) return;
                setCurrentUserId(user.uid);
                setLoading(false);
            } catch (err) {
                console.error('Error loading user:', err);
                setLoading(false);
            }
        };

        loadData();

        // Real-time listener for all jobs
        const jobsUnsub = onSnapshot(collection(db, 'jobList'), (snapshot) => {
            setJobs(snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })));
        });

        return () => jobsUnsub();
    }, []);

    // Filter jobs based on search criteria
    useEffect(() => {
        let filtered = jobs.filter(job => job.status !== 'contracted'); // Exclude contracted jobs

        if (searchCategory) {
            filtered = filtered.filter(job => 
                job.category?.toLowerCase().includes(searchCategory.toLowerCase())
            );
        }

        if (searchBudget) {
            filtered = filtered.filter(job => 
                job.budget >= parseInt(searchBudget)
            );
        }

        if (searchCounty || searchTown) {
            filtered = filtered.filter(job => {
                const jobLocation = job.location || '';
                if (searchTown) {
                    return jobLocation.includes(searchTown);
                }
                if (searchCounty) {
                    return jobLocation.includes(searchCounty);
                }
                return true;
            });
        }

        setFilteredJobs(filtered);
    }, [jobs, searchCategory, searchBudget, searchCounty, searchTown]);

    const handleBidOnJob = (job) => {
        navigate('/tenderjob', { state: { job } });
    };

    if (loading) {
        return <div className="page"><p>Loading jobs...</p></div>;
    }

    return (
        <div className="page">
            <h1>Search Jobs</h1>
            {/* Search Filters */}
            <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
                <h2>Filter Jobs</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div>
                        <label><strong>Category:</strong></label>
                        <input 
                            type="text" 
                            placeholder="e.g., Plumbing, Electrician..."
                            value={searchCategory}
                            onChange={(e) => setSearchCategory(e.target.value)}
                            style={{ 
                                width: '100%', 
                                padding: '10px', 
                                border: '1px solid #ddd', 
                                borderRadius: '5px',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>
                    <div>
                        <label><strong>Minimum Budget (€):</strong></label>
                        <input 
                            type="number" 
                            placeholder="e.g., 500"
                            value={searchBudget}
                            onChange={(e) => setSearchBudget(e.target.value)}
                            style={{ 
                                width: '100%', 
                                padding: '10px', 
                                border: '1px solid #ddd', 
                                borderRadius: '5px',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>
                    <div>
    <label><strong>County:</strong></label>
    <select 
        value={searchCounty} 
        onChange={(e) => {
            setSearchCounty(e.target.value);
            setSearchTown("");
        }}
        style={{ 
            width: '100%', 
            padding: '10px', 
            border: '1px solid #ddd', 
            borderRadius: '5px',
            boxSizing: 'border-box'
        }}
    >
        <option value="">Any County</option>
        {Object.keys(locationData).map(county => (
            <option key={county} value={county}>{county}</option>
        ))}
        </select>
    </div>
    <div>
        <label><strong>Town:</strong></label>
        <select 
            value={searchTown}
            onChange={(e) => setSearchTown(e.target.value)}
            disabled={!searchCounty}
            style={{ 
                width: '100%', 
                padding: '10px', 
                border: '1px solid #ddd', 
                borderRadius: '5px',
                boxSizing: 'border-box'
            }}
        >
            <option value="">Any Town</option>
            {searchCounty && locationData[searchCounty].map(town => (
                <option key={town} value={town}>{town}</option>
            ))}
        </select>
    </div>
                </div>
                <button 
                    onClick={() => {
                        setSearchCategory('');
                        setSearchBudget('');
                        setSearchCounty('');
                        setSearchTown('');
                    }}
                    style={{ 
                        marginTop: '10px',
                        backgroundColor: '#6c757d',
                        color: '#fff',
                        padding: '10px 20px',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}
                >
                    Clear Filters
                </button>
            </div>

            {/* Available Jobs */}
            <h2>Available Jobs ({filteredJobs.length})</h2>
            {filteredJobs.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '15px' }}>
                    {filteredJobs.map(job => (
                        <div 
                            key={job.id}
                            style={{
                                border: '1px solid #ddd',
                                borderRadius: '8px',
                                padding: '15px',
                                backgroundColor: '#f9f9f9'
                            }}
                        >
                            <h3>{job.title}</h3>
                            <p><strong>Category:</strong> {job.category || 'N/A'}</p>
                            <p><strong>Location:</strong> {job.location || 'N/A'}</p>
                            <p><strong>Budget:</strong> €{job.budget || 'Negotiable'}</p>
                            <p><strong>Status:</strong> {job.status || 'Active'}</p>
                            <p style={{ fontSize: '14px', color: '#666', minHeight: '40px' }}>
                                {job.description?.substring(0, 100)}...
                            </p>
                            <p style={{ fontSize: '12px', color: '#999' }}>
                                Posted: {job.createdAt ? new Date(job.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                            </p>
                            <button 
                                type="button"
                                onClick={() => handleBidOnJob(job)}
                                style={{ 
                                    width: '100%',
                                    backgroundColor: '#17a2b8',
                                    color: '#fff',
                                    padding: '10px 15px',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: 'bold'
                                }}
                            >
                                📋 Submit Tender
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <p style={{ fontSize: '16px', color: '#666' }}>No jobs found matching your criteria.</p>
            )}
        </div>
    );
}