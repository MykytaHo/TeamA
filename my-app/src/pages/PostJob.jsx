import {useNavigate} from 'react-router-dom';
import PreviewJob from '../components/PreviewJob.jsx'
import {useState} from "react"


export default function PostJob() {
    const navigate = useNavigate();
    const [jobCategory, setJobCategory] = useState("");
    const [jobDescription, setJobDescription] = useState("");
    const [jobPrice, setJobPrice] = useState("");
    const [isDisplayed, setIsDisplayed] = useState(false);

    const closePreview = () => {
        setIsDisplayed(false)
    };

    const handlePreviewJob = () => {
        setIsDisplayed(true);
    }
    const handleCancelPost = () => {
        navigate('/')
    }

    return (
        <div className="page">
            <h1>Post New Job [client]</h1>
            <form>
                <p>Please enter the details of the job you would like to post</p>
                <p>You will need to provide a description of the job, and your offered price</p>
                <p>Once posted, suppliers can follow up with you directly</p>
                <h4>Job Category</h4>

                <select onChange={(event) => setJobCategory(event.target.value)}>
                    <option>What kind of service do you require?</option>
                    <option>Plumbing</option>
                    <option>Electrics</option>
                    <option>Windows & Doors</option>
                    <option>Transport</option>
                    <option>Other</option>


                </select>
                <h4>Job Description</h4>
                <input type="text" id={"inputjobdesc"}
                       placeholder={"e.g. leaking tap"} onChange={(event) => setJobDescription(event.target.value)}/>
                <h4>Fee (€)</h4>
                <input type="number" min="1" id={"inputjobprice"}
                       onChange={(event) => setJobPrice(event.target.value)}/>
                <button type="button" onClick={handlePreviewJob}>Preview</button>
                <button type="button" onClick={handleCancelPost}>Cancel</button>
                {isDisplayed && <PreviewJob onClickEdit={closePreview}
                                            jobPreviewCategory={jobCategory}
                                            jobPreviewDescription={jobDescription}
                                            jobPreviewPrice={jobPrice}/>}
            </form>
        </div>
    );
}
