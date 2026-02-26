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
            <h1>Jobs</h1>
            <button type="button" onClick={handleNewJob}>Post a new Job</button>
            <br/>
            <br/>
            <button type="button">Search Jobs</button>
            <br/>
            <br/>
            <button type="button" onClick={handleTender}>Submit Tender</button>
            <br/>
            <br/>
            <button type="button">Accept Tender</button>


        </div>
    )

}