export default function PreviewJob(props) {

    const handleConfirmJobPost = () => {
    }

    return (

        <div>
            <div id="form-opaque-background">
                <div id="modal-box-preview">
                    <form>
                        <h3>Category</h3>
                        <p>{props.jobPreviewCategory}</p>
                        <h3>Description</h3>
                        <p>{props.jobPreviewDescription}</p>
                        <h3>Budget</h3>
                        <p>{"€" + props.jobPreviewPrice}</p>

                        <button type="button" id={"confirmJobPost"}
                                onClick={handleConfirmJobPost}>Confirm & Post
                        </button>
                        <button type="button" id={"editJobPost"}
                                onClick={props.onClickEdit}>Exit Preview
                        </button>
                    </form>

                </div>
            </div>
        </div>
    )
}