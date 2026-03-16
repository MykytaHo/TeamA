import loadingLogo from "../assets/loading-logo.png";


export default function LoadingScreen() {
    return (
        <img id="loadingimage" src={loadingLogo} alt="TC loading screen" width="300" height='auto'/>
    )
}