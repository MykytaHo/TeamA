export default function TenderJob() {

    const submitTender = () => {
    }
    const cancelTender = () => {
    }

    return (
        <div className="page">
            <h1>Tender for Job</h1>
            <button onClick={submitTender}>Submit Tender</button>
            <button onClick={cancelTender}>Cancel</button>


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