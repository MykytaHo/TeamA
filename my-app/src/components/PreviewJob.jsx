export default function PreviewJob(props) {

    const handleConfirmJobPost = () => {
    }

    return (
        <div>
            <h2>Job Preview</h2>
            <h3>Title</h3>
            <p>{props.jobPreviewTitle}</p>
            <h3>Description</h3>
            <p>{props.jobPreviewDescription}</p>
            <h3>Price €</h3>
            <p>{props.jobPreviewPrice}</p>

            <button style={{margin: '10px 80px'}} id={"confirmJobPost"} onClick={handleConfirmJobPost}>Confirm</button>
            <button style={{margin: '10px 40px'}} id={"editJobPost"} onClick={props.onClickEdit}>Edit</button>

        </div>
    )
}