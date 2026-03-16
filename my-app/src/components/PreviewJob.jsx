export default function PreviewJob(props) {

    return (


        <div id="form-opaque-background">
            <div id="modal-box-preview">
                <form>
                    <h3>Category</h3>
                    <p>{props.jobPreviewCategory}</p>
                    <h3>Job name</h3>
                    <p>{props.jobPreviewName}</p>
                    <h3>Description</h3>
                    <p>{props.jobPreviewDescription}</p>
                    <h3>Budget</h3>
                    <p>{"€" + props.jobPreviewPrice}</p>
                    <button type="button" id={"editJobPost"}
                            onClick={props.onClickEdit}>Edit
                    </button>
                    <button type="button" id={"confirmJobPost"}
                            onClick={props.onClickSubmit}>Submit
                    </button>
                </form>
                <form>
                    <div id="imagePreviewContainer">
                        {props.imagePreview ? (
                            <>
                                <img
                                    id="imagePostingPreview"
                                    src={props.imagePreview}
                                    alt="job preview"
                                />
                            </>
                        ) : (
                            <p style={{color: '#999'}}>No image selected</p>
                        )}
                    </div>
                </form>

            </div>
        </div>
    )
}

