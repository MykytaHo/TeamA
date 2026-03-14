export default function PreviewImage(props) {

    return (


        <div id="form-opaque-background">
            <div id="modal-box-preview">
                <form>
                    <img
                        src={props.tenderPreviewImage}
                        alt="Job"/>
                    <button onClick={props.exitImagePreview}>Exit</button>
                </form>

            </div>
        </div>
    )
}

