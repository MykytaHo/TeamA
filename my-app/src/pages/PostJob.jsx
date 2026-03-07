import {useNavigate} from 'react-router-dom';
import PreviewJob from '../components/PreviewJob.jsx'
import {useEffect, useState} from 'react';
import {db} from '../services/firebase';
import {addDoc, collection, getDocs, serverTimestamp} from "firebase/firestore";
import {storage} from '../services/firebase';
import {ref, uploadBytes, getDownloadURL} from "firebase/storage";

export default function PostJob() {
    const navigate = useNavigate();
    const [jobCategory, setJobCategory] = useState("");
    const [jobDescription, setJobDescription] = useState("");
    const [jobPrice, setJobPrice] = useState("");
    const [isDisplayed, setIsDisplayed] = useState(false);
    const [categories, setCategories] = useState([]);
    const selectedCategoryName = categories.find(c => c.id === jobCategory)?.category || "None";
    const [imageFile, setImageFile] = useState(null);

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
            closePreview();
            return;
        }
        if (jobDescription === "") {
            alert("Please enter a short description of your job");
            closePreview();
            return;
        }

        if (jobPrice <= 0) {
            alert("Please enter a budget for your job");
            closePreview();
            return;
        }
        try {
            let imageLink = "";
            if (imageFile) {
                const storageRef = ref(storage, `jobImages/${Date.now()}_{imageFile.name}`);
                const snapShot = await uploadBytes(storageRef, imageFile);
                imageLink = await getDownloadURL(snapShot.ref);
            }
            const jobsList = collection(db, "jobList");
            const newJob = {
                status: "posted",
                budget: Number(jobPrice),
                categoryID: jobCategory,
                description: jobDescription,
                clientID: "Fake Client",
                createdAt: serverTimestamp(),
                tenderCount: 0,
                jobImage: imageLink
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
                <p>Select a category, provide a description of the job, an optional image and your budget</p>

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
                <h4>Upload Image (max 2MB)</h4>

                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                        const file = e.target.files[0];
                        if (file && file.size > 2097152) { // 2MB Limit
                            alert("File is too big! Please select an image under 2MB.");
                            e.target.value = null;
                            setImageFile(null);
                        } else {
                            setImageFile(file);
                        }
                    }}
                />
                <button type="button" onClick={handlePreviewJob}>Preview</button>
                <button type="button" onClick={handleCancelPost}>Cancel</button>

                {isDisplayed && <PreviewJob onClickSubmit={handlePostJobClick}
                                            onClickEdit={closePreview}
                                            jobPreviewCategory={selectedCategoryName}
                                            jobPreviewDescription={jobDescription}
                                            jobPreviewPrice={jobPrice}
                                            imagePreview={imageFile ? URL.createObjectURL(imageFile) : null}/>}
            </form>
        </div>
    );
}
