import {useNavigate} from 'react-router-dom';

export default function Jobs() {

    const navigate = useNavigate();
    const handleNewJob = () => {
        navigate('/postjob')
    }

    const handleTender = () => {
        navigate('/tenderjob')
    }

    return (
        <div className="page">
            <form>
                <h1>Jobs</h1>
                <button type="button" onClick={handleNewJob}>Post a new Job</button>

                <button type="button">Search Jobs</button>

                <button type="button" onClick={handleTender}>Submit Tender</button>
           
                <button type="button">Accept Tender</button>
            </form>

        </div>
    )

}