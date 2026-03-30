import PostJob from "../pages/PostJob.jsx";
import SupplierComponents from "../components/SupplierComponents.jsx";
import LoadingScreen from "../components/LoadingScreen.jsx";
import {useRole} from "../services/RoleContext.jsx";

export default function HomeDash() {

    const {role, loading} = useRole();
    if (loading) return <LoadingScreen/>

    return (
            <>

                {role === "supplier" ? <SupplierComponents/> : <PostJob/>}

            </>
    )
}