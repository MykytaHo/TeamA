import {useNavigate} from 'react-router-dom';
import PreviewJob from '../components/PreviewJob.jsx'
import {useState, useEffect} from 'react';
import {db} from '../services/firebase';
import {collection, getDocs, addDoc, serverTimestamp} from "firebase/firestore";

export default function PostJob() {
    const navigate = useNavigate();
    const [jobCategory, setJobCategory] = useState("");
    const [jobDescription, setJobDescription] = useState("");
    const [jobPrice, setJobPrice] = useState("");
    const [isDisplayed, setIsDisplayed] = useState(false);
    const [categories, setCategories] = useState([]);
    const selectedCategoryName = categories.find(c => c.id === jobCategory)?.category || "None";


    useEffect(() => {
        getJobCategories();
    }, []);

    const getJobCategories = async () => {
        try {
            const jobCategorySnapshot = await getDocs(collection(db, "jobCategories"))
            const categoryData = jobCategorySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setCategories(categoryData)
        } catch (error) {
            console.log("Database error ", error)
        }
    }

    const closePreview = () => {
        setIsDisplayed(false)
    };

    const handlePreviewJob = () => {

        setIsDisplayed(true);
    }
    const handleCancelPost = () => {
        navigate('/')
    }

    const handlePostJobClick = async () => {

        if (jobCategory === "") {
            alert("Please select a category for your job")
            return;
        }
        if (jobDescription === "") {
            alert("Please enter a short description of your job");
            return;
        }

        if (jobPrice <= 0) {
            alert("Please enter a budget for your job");
        }
        try {
            const jobsList = collection(db, "jobList");
            const newJob = {
                status: "posted",
                budget: Number(jobPrice),
                categoryID: jobCategory,
                description: jobDescription,
                clientID: "Fake Client",
                createdAt: serverTimestamp(),
                tenderCount: 0
            };
            await addDoc(jobsList, newJob);

            alert("Your job is now live!  Press OK to return to home page")
            navigate('/');
        } catch (error) {
            console.error("Error posting job: ", error);
            alert("Failed to post job. Check console for details.");
        }


    }

    return (
        <div className="page">
            <h1>Post New Job</h1>
            <form>
                <p>Please enter your job details</p>
                <p>Select a category, provide a description of the job, and your budget</p>
                <p>To post your ad, tap 'Preview', and if you are happy, tap 'Confirm & Post'</p>


                <select value={jobCategory} onChange={(event) => setJobCategory(event.target.value)}>
                    <option value={""}>What kind of service do you require?</option>
                    {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                            {cat.category}
                        </option>
                    ))}


                </select>
                <h4>Job Description</h4>
                <textarea rows="4" id={"inputjobdesc"}
                          placeholder={"e.g. leaking tap"} onChange={(event) => setJobDescription(event.target.value)}/>
                <h4>Budget (€)</h4>
                <input type="number" min="1" id={"inputjobprice"}
                       onChange={(event) => setJobPrice(event.target.value)}/>
                <button type="button" onClick={handlePreviewJob}>Preview</button>
                <button type="button" onClick={handleCancelPost}>Cancel</button>
                {isDisplayed && <PreviewJob onClickSubmit={handlePostJobClick}
                                            onClickEdit={closePreview}
                                            jobPreviewCategory={selectedCategoryName}
                                            jobPreviewDescription={jobDescription}
                                            jobPreviewPrice={jobPrice}/>}
            </form>
        </div>
    );
}
