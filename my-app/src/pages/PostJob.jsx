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
            <p>Please enter the details of the job you would like to post</p>
            <p>You will need to provide a description of the job, and your offered price</p>
            <p>Once posted, suppliers can follow up with you directly</p>
            <h4>Job Name</h4>
            <textarea style={{margin: '10px 0px'}} id={"inputjobtitle"} rows="2" cols="60" placeholder={"e.g." +
                "Leaking Tap URGENT"} onChange={(event) => setJobTitle(event.target.value)}/>
            <h4>Job Description</h4>
            <textarea style={{margin: '10px 0px'}} id={"inputjobdesc"} rows="3" cols="60" placeholder={"e.g. The hot" +
                " water tap in my bathroom is constantly dripping.  My husband tried to fix it but he's made it" +
                " worse."} onChange={(event) => setJobDescription(event.target.value)}/>
            <h4>Fee (€)</h4>
            <textarea style={{margin: '10px 0px'}} id={"inputjobprice"} rows="2" cols="60" placeholder={"format" +
                " 123.45"} onChange={(event) => setJobPrice(event.target.value)}/>
            <br/>
            <button style={{margin: '10px 80px'}} onClick={handlePreviewJob}>Preview</button>

            <button style={{margin: '10px 40px'}} onClick={handleCancelPost}>Cancel</button>

            {isDisplayed && <PreviewJob onClickEdit={closePreview}
                                        jobPreviewTitle={jobTitle}
                                        jobPreviewDescription={jobDescription}
                                        jobPreviewPrice={jobPrice}/>}
        </div>
    );
}
