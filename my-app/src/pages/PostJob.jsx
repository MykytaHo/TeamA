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
            <h1>Post a New Job</h1>
            <p className="postjob-subtitle">
                Fill in the details below and preview before posting. Suppliers will be able to view and tender for your job.
            </p>

            <form className="postjob-form">

                <div className="postjob-field">
                    <label htmlFor="inputjobcategory">Job Category</label>
                    <select
                        id="inputjobcategory"
                        onChange={(event) => setJobCategory(event.target.value)}
                    >
                        <option>What kind of service do you require?</option>
                        <option>Plumbing</option>
                        <option>Electrics</option>
                        <option>Windows &amp; Doors</option>
                        <option>Transport</option>
                        <option>Other</option>
                    </select>
                </div>

                <div className="postjob-field">
                    <label htmlFor="inputjobdesc">Job Description</label>
                    <input
                        type="text"
                        id="inputjobdesc"
                        placeholder="e.g. leaking tap"
                        onChange={(event) => setJobDescription(event.target.value)}
                    />
                </div>

                <div className="postjob-field">
                    <label htmlFor="inputjobprice">Offered Fee (€)</label>
                    <input
                        type="number"
                        min="1"
                        id="inputjobprice"
                        placeholder="e.g. 150"
                        onChange={(event) => setJobPrice(event.target.value)}
                    />
                </div>

                <div className="postjob-buttons">
                    <button type="button" onClick={handlePreviewJob}>👁 Preview Job</button>
                    <button type="button" className="btn-cancel" onClick={handleCancelPost}>Cancel</button>
                </div>

                {isDisplayed && (
                    <PreviewJob
                        onClickEdit={closePreview}
                        jobPreviewCategory={jobCategory}
                        jobPreviewDescription={jobDescription}
                        jobPreviewPrice={jobPrice}
                    />
                )}

            </form>
        </div>
    );
}
