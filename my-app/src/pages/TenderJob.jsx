export default function TenderJob() {

    const submitTender = () => {
    }
    const cancelTender = () => {
    }

    return (
        <div className="page">
            <h1>Tender Job [supplier]</h1>
            <form>
                <select>
                    <option>Select Job</option>
                </select>
                <input type="number" min="1"></input>
                <button onClick={submitTender}>Submit Tender</button>
                <button onClick={cancelTender}>Cancel</button>
            </form>
        </div>
    )
}