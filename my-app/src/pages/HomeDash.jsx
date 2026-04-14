import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase.js";
import { doc, getDoc } from "firebase/firestore";
import LoadingScreen from "../components/LoadingScreen.jsx";

import {SupplierComponents} from "../components/SupplierComponents.jsx";
import {ClientComponents} from "../components/ClientComponents.jsx";

export default function HomeDash() {
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getUserRole = async () => {
            let user = auth.currentUser;
            if (!user) {
                await new Promise(resolve => setTimeout(resolve, 500));
                user = auth.currentUser;
            }
            if (user) {
                const userDocSnap = doc(db, "users", user.uid);
                const userDoc = await getDoc(userDocSnap);

                if (userDoc.exists()) {
                    setRole(userDoc.data().role);
                }
            }
            setLoading(false);
        };
        getUserRole();
    }, []);

    return (
        <>
            {loading && <LoadingScreen/>}
            {!loading && role === "supplier" && <SupplierComponents/>}
            {!loading && role === "client" && <ClientComponents/>}
        </>
    );
}