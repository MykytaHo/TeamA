import React, {createContext, useState, useEffect, useContext} from 'react';
import {auth, db} from '../firebase.js';
import {doc, getDoc} from 'firebase/firestore';
import {onAuthStateChanged} from 'firebase/auth';

const RoleContext = createContext();

export const RoleProvider = ({children}) => {
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    const userDocRef = doc(db, "users", user.uid);
                    const userDoc = await getDoc(userDocRef);

                    if (userDoc.exists()) {
                        setRole(userDoc.data().role);
                    } else {
                        setRole(null);
                    }
                } catch (error) {
                    console.error("Error fetching role:", error);
                    setRole(null);
                }
            } else {
                setRole(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <RoleContext.Provider value={{role, loading}}>
            {children}
        </RoleContext.Provider>
    );
};

export const useRole = () => {
    const context = useContext(RoleContext);
    if (context === undefined) {
        throw new Error('useRole must be used within a RoleProvider');
    }
    return context;
};
