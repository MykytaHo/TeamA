import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import {RoleProvider} from "./services/RoleContext.jsx";
import './index.css'
import App from './App.jsx'


createRoot(document.getElementById('root')).render(
    <StrictMode>
        <RoleProvider>
            <App/>
        </RoleProvider>
    </StrictMode>,
)
// comment
