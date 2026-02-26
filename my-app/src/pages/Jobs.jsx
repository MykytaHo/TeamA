import {useNavigate} from 'react-router-dom';

export default function Jobs() {

    const navigate = useNavigate();
    const handleNewJob = () => {
        navigate('/postjob')
    }

    return (
        <div className="page">
            <h1>Jobs</h1>
            <button onClick={handleNewJob}>Post a new Job</button>

            <br/>
            <br/>
            <button>Search Jobs</button>
            <br/>
            <br/>
            <button>Submit Tender</button>
            <br/>
            <br/>
            <button>Accept Tender</button>


        </div>
    )

}