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
            <h1>Post New Job</h1>
            <form>
                <p>Please enter your job details</p>
                <p>Select a category, provide a description of the job, and your budget</p>
                <p>To post your ad, tap 'Preview', and if you are happy, tap 'Confirm & Post'</p>


                <select onChange={(event) => setJobCategory(event.target.value)}>
                    <option>Select a category</option>
                    <option>Plumbing</option>
                    <option>Electrics</option>
                    <option>Windows & Doors</option>
                    <option>Transport</option>
                    <option>Other</option>


                </select>
                <h4>Job Description</h4>
                <textarea rows="4" id={"inputjobdesc"}
                          placeholder={"e.g. leaking tap"} onChange={(event) => setJobDescription(event.target.value)}/>
                <h4>Budget (€)</h4>
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
