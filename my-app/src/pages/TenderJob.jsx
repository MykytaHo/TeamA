import {useEffect, useState} from "react";
import {db} from "../firebase";
import PreviewImage from "../components/PreviewImage.jsx";
import PreviewTender from "../components/PreviewTender.jsx";
import {useNavigate, useSearchParams} from 'react-router-dom';
import {auth} from "../firebase.js";
import {addDoc, increment, updateDoc, doc, collection, getDocs, serverTimestamp} from "firebase/firestore";


export default function TenderJob() {
    const [categories, setCategories] = useState([]);
    const [jobName, setJobName] = useState("");
    const [jobNameList, setJobNameList] = useState([]);
    const [jobCategory, setJobCategory] = useState("");
    const [isDisplayed, setIsDisplayed] = useState(false);
    const [previewIsDisplayed, setPreviewIsDisplayed] = useState(false);
    const [tender, setTender] = useState(0);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Pre-fill job and category when navigated from "Apply Now"
    useEffect(() => {
        if (categories.length === 0 || jobNameList.length === 0) return;
        const jobId = searchParams.get('jobId');
        if (!jobId) return;

        const job = jobNameList.find(j => j.id === jobId);
        if (!job) return;

        setJobName(job.jobName);

        const cat = categories.find(c => c.id === job.categoryID);
        if (cat) setJobCategory(cat.category);
    }, [categories, jobNameList, searchParams]);


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

    useEffect(() => {
        getJobName();
    }, []);

    const getJobName = async () => {
        try {
            const jobNameSnapShot = await getDocs(collection(db, 'jobList'))
            const jobNameData = jobNameSnapShot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setJobNameList(jobNameData)

        } catch (error) {
            console.log("Database error ", error)
        }
    }

    const selectedJobDetails = jobNameList.find(job => job.jobName === jobName);

    const handleImagePreview = () => {
        setIsDisplayed(true);
    }
    const exitImagePreview = () => {
        setIsDisplayed(false);
    }
    const handleCancelTender = () => {
        navigate('/')
    }

    const handlePreviewTender = () => {
        if (jobCategory === "" || jobName === "" || tender <= 0) {
            alert("Please complete all fields");
            return;
        } else if (tender > selectedJobDetails.budget) {
            alert("Your tender is above budget. Please revise your quote.");
            return;
        }
        setPreviewIsDisplayed(true)
    }

    const handleClickEdit = () => {
        setPreviewIsDisplayed(false);
    }

    const handleSubmitTender = async () => {
        try {
            const tenderList = collection(db, "tenderList");
            const newTender = {
                jobID: selectedJobDetails.id,
                clientID: selectedJobDetails.clientID,
                tenderAmount: Number(tender),
                clientBudget: selectedJobDetails.budget,
                supplierID: auth.currentUser.uid,
                createdAt: serverTimestamp()
            };
            await addDoc(tenderList, newTender);

            const updateJob = doc(db, "jobList", selectedJobDetails.id);
            await updateDoc(updateJob, {
                status: "tendered",
                tenderCount: increment(1),

            });

            alert("Tender submitted! Press OK to return to home page");
            navigate("/");

        } catch (e) {
            console.log("Problem writing to db: " + e);
        }

    }

    return (
        <div className="page">

            <form>
                <h1>Tender Job</h1>
                <select value={jobCategory} onChange={(event) => setJobCategory(event.target.value)}>
                    <option value={""}>Select a category...</option>
                    {categories.map((cat) => (
                        <option key={cat.id} value={cat.category}>
                            {cat.category}
                        </option>
                    ))}
                </select>
                <select value={jobName} onChange={(event) => setJobName(event.target.value)}>
                    <option value={""}>Select a job</option>
                    {jobNameList.map((job) => (
                        <option key={job.id} value={job.jobName}>
                            {job.jobName}
                        </option>
                    ))}
                </select>
                <p>
                    {selectedJobDetails && (
                        <>
                            <strong>Description:</strong> {selectedJobDetails.description} <br/>
                            <strong>Budget:</strong> €{selectedJobDetails.budget}
                        </>
                    )}
                </p>

                {selectedJobDetails?.jobImage && (
                    <>

                        <button type="button" onClick={handleImagePreview}
                        >View Photo
                        </button>
                    </>
                )}

                <input type="number" min="1"
                       placeholder="Enter your quote here"
                       onChange={(e) => setTender(e.target.value)}>
                </input>
                <button type="button" onClick={handlePreviewTender}>Preview</button>
                <button type="button" onClick={handleCancelTender}>Cancel</button>
            </form>

            {isDisplayed && <PreviewImage
                tenderPreviewImage={selectedJobDetails.jobImage}
                exitImagePreview={exitImagePreview}/>
            }
            {previewIsDisplayed && <PreviewTender
                onClickEdit={handleClickEdit}
                onClickSubmit={handleSubmitTender}
                jobCategory={jobCategory}
                jobName={jobName}
                jobBudget={selectedJobDetails.budget}
                yourOffer={tender}/>
            }


        </div>
    )
}
