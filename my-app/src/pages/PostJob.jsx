import {useNavigate} from 'react-router-dom';
import PreviewJob from '../components/PreviewJob.jsx'
import {useState} from "react"


export default function PostJob() {
    const navigate = useNavigate();
    const [jobTitle, setJobTitle] = useState("");
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
                <p>Please enter the details of the job you would like to post</p>
                <p>You will need to provide a description of the job, and your offered price</p>
                <p>Once posted, suppliers can follow up with you directly</p>
                <h4>Job Name</h4>
                <input type="text" id={"inputjobtitle"} placeholder={"e.g." +
                    "Leaking Tap URGENT"} onChange={(event) => setJobTitle(event.target.value)}/>
                <h4>Job Description</h4>
                <textarea id={"inputjobdesc"}
                          placeholder={"e.g. The hot" +
                              " water tap in my bathroom is constantly dripping"}
                          onChange={(event) => setJobDescription(event.target.value)}></textarea>
                <h4>Fee (€)</h4>
                <input type="number" min="1" id={"inputjobprice"} placeholder={"format" +
                    " 123"} onChange={(event) => setJobPrice(event.target.value)}/>
                <br/>
                <button type="button" onClick={handlePreviewJob}>Preview</button>

                <button type="button" onClick={handleCancelPost}>Cancel</button>

                {isDisplayed && <PreviewJob onClickEdit={closePreview}
                                            jobPreviewTitle={jobTitle}
                                            jobPreviewDescription={jobDescription}
                                            jobPreviewPrice={jobPrice}/>}</form>
        </div>
    );
}
