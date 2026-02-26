export default function PreviewJob(props) {

    const handleConfirmJobPost = () => {
    }

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <form>
                    <h3>Category</h3>
                    <p>{props.jobPreviewCategory}</p>
                    <h3>Description</h3>
                    <p>{props.jobPreviewDescription}</p>
                    <h3>Price €</h3>
                    <p>{props.jobPreviewPrice}</p>

                    <button type="button" id={"confirmJobPost"}
                            onClick={handleConfirmJobPost}>Confirm
                    </button>
                    <button type="button" id={"editJobPost"}
                            onClick={props.onClickEdit}>Edit
                    </button>
                </form>
            </div>
        </div>
    )
}