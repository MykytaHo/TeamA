import ClientComponents from "../components/ClientComponents.jsx";
import SupplierComponents from "../components/SupplierComponents.jsx";
import LoadingScreen from "../components/LoadingScreen.jsx";
import {useRole} from "../services/RoleContext.jsx";

export default function HomeDash() {

    const {role, loading} = useRole();

    return (
        <>
            {loading && <LoadingScreen/>}
            {role === "supplier" ? <SupplierComponents/> : <ClientComponents/>}

        </>
    )
}