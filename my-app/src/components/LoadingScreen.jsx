// import loadingLogo from "../assets/loading-logo.png";
//
//
// export default function LoadingScreen() {
//     return (
//         <img id="loadingimage" src={loadingLogo} alt="TC loading screen" width="300" height='auto'/>
//     )
// }

import './LoadingScreen.css';

const LoadingScreen = () => {
    return (
        <div className="loading-container">
            <div className="spinner"></div>
            <p className="loading-text">Loading...</p>
        </div>
    );
};

export default LoadingScreen;