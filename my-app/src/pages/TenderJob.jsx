import {useEffect, useState} from "react";
import {collection, getDocs} from "firebase/firestore";
import {db} from "../services/firebase.js";

export default function TenderJob() {
    const [categories, setCategories] = useState([]);
    const [jobName, setJobName] = useState("");
    const [jobNameList, setJobNameList] = useState([]);
    const [jobCategory, setJobCategory] = useState("");
    const [isDisplayed, setIsDisplayed] = useState(false);

    const submitTender = () => {
    }
    const cancelTender = () => {
    }
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

    return (
        <div className="page">
            <h1>Tender Job</h1>
            <form>
                <select value={jobCategory} onChange={(event) => setJobCategory(event.target.value)}>
                    <option value={""}>Service type</option>
                    {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
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
                    // <img src={selectedJobDetails.jobImage} alt="Job"/>
                    <button onClick={handleImagePreview}>View Photo</button>
                )}
                <input type="number" min="1" placeholder="Enter your quote here"></input>
                <button onClick={submitTender}>Submit Tender</button>
                <button onClick={cancelTender}>Cancel</button>

            </form>
        </div>
    )

}

/* Here will add functionality for a supplier to select a job, offer a price
and submit a tender.  Need to know API info to:

- DB pull job data
- DB write job data
- Customer can now see tender offer
- job status change from posted to tendering

 */