export default function PreviewTender(props) {

    return (


        <div id="form-opaque-background">
            <div id="modal-box-preview">
                <form>
                    <h3>Job category</h3>
                    <p>{props.jobCategory}</p>
                    <h3>Job name</h3>
                    <p>{props.jobName}</p>
                    <h3>Client budget</h3>
                    <p>{"€" + props.jobBudget}</p>
                    <h3>Your offer</h3>
                    <p>{"€" + props.yourOffer}</p>
                    <button type="button"
                            onClick={props.onClickEdit}>Edit
                    </button>
                    <button type="button"
                            onClick={props.onClickSubmit}>Submit
                    </button>
                </form>

            </div>
        </div>
    )
}