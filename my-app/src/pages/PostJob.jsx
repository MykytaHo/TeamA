import {useNavigate} from 'react-router-dom';
import PreviewJob from '../components/PreviewJob.jsx'
import {useEffect, useState} from 'react';
import {db} from '../services/firebase';
import {addDoc, collection, getDocs, serverTimestamp, doc, getDoc} from "firebase/firestore";
import {storage} from '../services/firebase';
import {ref, uploadBytes, getDownloadURL} from "firebase/storage";
import {auth} from "../firebase.js";

export default function PostJob() {
    const navigate = useNavigate();
    const [jobCategory, setJobCategory] = useState("");
    const [jobDescription, setJobDescription] = useState("");
    const [jobName, setJobName] = useState("");
    const [jobPrice, setJobPrice] = useState(0);
    const [isDisplayed, setIsDisplayed] = useState(false);
    const [categories, setCategories] = useState([]);
    const [imageFile, setImageFile] = useState(null);
    const user = auth.currentUser;
    const [jobCounty, setJobCounty] = useState("");
    const [jobTown, setJobTown] = useState("");

    const locationData = {
        "Dublin": ["Dublin City", "Dun Laoghaire", "Malahide", "Swords"],
        "Cork": ["Cork City", "Bandon", "Kinsale", "Youghal"],
        "Galway": ["Galway City", "Athenry", "Ballinasloe", "Clarinbridge"],
        "Limerick": ["Limerick City", "Newcastle West", "Adare"],
        "Waterford": ["Waterford City", "Dunmore East", "Lismore"],
        "Tipperary": ["Tipperary", "Clonmel", "Nenagh"],
        "Kilkenny": ["Kilkenny City", "Thomastown", "Graiguenamanagh"],
        "Carlow": ["Carlow", "Bagenalstown"],
        "Wexford": ["Wexford Town", "Enniscorthy", "Gorey"],
        "Wicklow": ["Wicklow Town", "Greystones", "Arklow"],
        "Kildare": ["Kildare", "Maynooth", "Naas", "Athy"],
        "Laois": ["Portlaoise", "Portarlington", "Rathdowney", "Mountmellick"],
        "Offaly": ["Tullamore", "Birr", "Edenderry"],
        "Westmeath": ["Athlone", "Mullingar", "Moate"],
        "Longford": ["Longford", "Edgeworthstown", "Granard"],  
        "Roscommon": ["Roscommon", "Castlerea", "Boyle"],
        "Sligo": ["Sligo Town", "Enniscrone", "Tubbercurry"],
        "Leitrim": ["Carrick-on-Shannon", "Ballinamore", "Dromahair"],
        "Monaghan": ["Monaghan Town", "Clones", "Castleblayney"],
        "Cavan": ["Cavan Town", "Bailieborough", "Cootehill"],
        "Donegal": ["Donegal Town", "Letterkenny", "Bundoran"],
        "Mayo": ["Castlebar", "Westport", "Ballina"],
        "Clare": ["Ennis", "Shannon", "Kilrush"],
        "Kerry": ["Tralee", "Killarney", "Dingle"],
        "Louth": ["Drogheda", "Dundalk", "Ardee"],
        "Meath": ["Navan", "Trim", "Kells"],
       
    };

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
        if (jobCategory === "" || jobName === "" || jobDescription === "" || jobPrice <= 0) {
            alert("Please complete all fields");
            return;
        }

        setIsDisplayed(true);
    }
    const handleCancelPost = () => {
        navigate('/')
    }

    const handleReset = () => {
        let result = confirm("Are you sure you want to reset the form?");
        if (result) {
            setJobCategory("");
            setJobCounty("");
            setJobTown("");
            setJobName("");
            setJobPrice(0);
            setJobDescription("");
            setImageFile(null);

        }

    }

    const handlePostJobClick = async () => {

        // if (jobCategory === "") {
        //     alert("Please select a category for your job")
        //     closePreview();
        //     return;
        // }
        // if (jobName === "") {
        //     alert("Please enter a short title for your job");
        //     closePreview();
        //     return;
        // }
        //
        // if (jobDescription === "") {
        //     alert("Please enter a short description of your job");
        //     closePreview();
        //     return;
        // }
        //
        // if (jobPrice <= 0) {
        //     alert("Please enter a budget for your job");
        //     closePreview();
        //     return;
        // }
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
                title: jobName,
                budget: Number(jobPrice),
                category: jobCategory,
                location: `${jobTown}, ${jobCounty}`,
                description: jobDescription,
                clientID: user.uid,
                createdAt: serverTimestamp(),
                tenderCount: 0,
                jobImage: imageLink,
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
            <form>
                <h1>Post A Job</h1>

                <select value={jobCategory} onChange={(event) => setJobCategory(event.target.value)}>
                    <option value={""}>I need.....</option>
                    {categories.map((cat) => (
                        <option key={cat.id} value={cat.category}>
                            {cat.category}
                        </option>
                    ))}


                </select>
                <h4>Enter a short job name</h4>
                <textarea rows="1" maxLength="40" id={"inputjobname"}
                    placeholder={"e.g. Leaking tap"} onChange={(event) => setJobName(event.target.value)}/>
                <h4>Where is the job located?</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                        <label><strong>County:</strong></label>
                        <select 
                            value={jobCounty} 
                            onChange={(e) => {
                                setJobCounty(e.target.value);
                                setJobTown(""); // Reset town when county changes
                            }}
                            style={{ width: '100%', padding: '8px' }}
                        >
                            <option value="">Select County...</option>
                            {Object.keys(locationData).map(county => (
                                <option key={county} value={county}>{county}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label><strong>Town:</strong></label>
                        <select 
                            value={jobTown}
                            onChange={(e) => setJobTown(e.target.value)}
                            disabled={!jobCounty}
                            style={{ width: '100%', padding: '8px' }}
                        >
                            <option value="">Select Town...</option>
                            {jobCounty && locationData[jobCounty].map(town => (
                                <option key={town} value={town}>{town}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <h4>And a slightly longer job description</h4>
                <textarea rows="2" id={"inputjobdesc"}
                    placeholder={"e.g. hot waster tap in bathroom etc...."}
                    onChange={(event) => setJobDescription(event.target.value)}/>
                <h4>What is your budget (€)</h4>
                <input type="number" min="1" id={"inputjobprice"}
                    onChange={(event) => setJobPrice(event.target.value)}/>
                <h4>Upload an optional image</h4>

                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                        const file = e.target.files[0];
                        if (file && file.size > 2097152) {
                            alert("File is too big! Please select an image under 2MB.");
                            e.target.value = null;
                            setImageFile(null);
                        } else {
                            setImageFile(file);
                        }
                    }}
                />
                <button type="button" onClick={handlePreviewJob}>Preview</button>
                <button type="reset" onClick={handleReset}>Reset</button>
                <button type="button" onClick={handleCancelPost}>Cancel</button>

                {isDisplayed && <PreviewJob onClickSubmit={handlePostJobClick}
                                            onClickEdit={closePreview}
                                            jobPreviewCategory={jobCategory}
                                            jobPreviewDescription={jobDescription}
                                            jobPreviewPrice={jobPrice}
                                            jobPreviewName={jobName}
                                            imagePreview={imageFile ? URL.createObjectURL(imageFile) : null}/>}
            </form>
        </div>
    );

}