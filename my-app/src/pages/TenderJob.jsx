export default function TenderJob() {

    const submitTender = () => {
    }
    const cancelTender = () => {
    }

    return (
        <div className="page">
            <h1>Tender Job</h1>
            <form>
                <select>
                    <option>Select Category</option>
                    <option>Plumbing</option>
                    <option>Electrics</option>
                    <option>Windows & Doors</option>
                    <option>Transport</option>
                    <option>Other</option>
                </select>
                <select>
                    <option>Select job reference from list</option>
                    //pull list of active jobs in category that are status 'posted'
                    <option>JOB 1</option>
                    <option>JOB 2</option>
                    <option>JOB 3</option>
                    <option>JOB 4</option>
                    <option>JOB 5</option>
                </select>
                <p>Show the job description and budget here</p>
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