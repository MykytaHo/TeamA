import {useNavigate} from 'react-router-dom';
import {useRole} from "../services/RoleContext.jsx";


export default function Jobs() {
    const {role, loading} = useRole();

    const navigate = useNavigate();
    const handleNewJob = () => {
        navigate('/postjob')
    }

    const handleTender = () => {
        navigate('/tenderjob')
    }

    const handleSearch = () => {
        navigate('/search-traders');
    }

    return (
        <>
            <div className="page">
                <form>
                    <h1>Jobs</h1>
                    <button type="button" onClick={handleNewJob}>Post a new Job</button>

                    <button type="button">Search Jobs</button>

                    <button type="button" onClick={handleTender}>Submit Tender</button>

                    <button type="button">Accept Tender</button>
                </form>

            </div>

        </>)
    //         <div className="search-page">
    //             <h2>Find Local Technicians</h2>
    //
    //             <div className="search-container">
    //                 <input
    //                     type="text"
    //                     placeholder="Service (e.g. Plumber)"
    //                     value={searchTerm}
    //                     onChange={(e) => setSearchTerm(e.target.value)}
    //                 />
    //
    //                 <div className="location-input-wrapper">
    //                     <span className="pin-icon">📍</span>
    //                     <input
    //                         type="text"
    //                         placeholder="Location (e.g. Dublin 6)"
    //                         value={query}
    //                         onChange={(e) => setQuery(e.target.value)}
    //                     />
    //                 </div>
    //             </div>
    //
    //             <div className="results-list">
    //                 {filteredTraders.length > 0 ? (
    //                     filteredTraders.map(trader => (
    //                         <div key={trader.id} className="trader-card">
    //                             <h3>{trader.name}</h3>
    //                             <p>Service: {trader.category}</p>
    //                             <p className="location-tag">📍 {trader.location}</p>
    //                             {trader.rating && <p className="rating">⭐ {trader.rating}</p>}
    //                         </div>
    //                     ))
    //                 ) : (
    //                     <p className="no-results">No technicians found in this area.</p>
    //                 )}
    //             </div>
    //         </div>
    //     </>
    // );

}