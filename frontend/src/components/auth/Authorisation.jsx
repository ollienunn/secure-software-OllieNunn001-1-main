// auth.js

import { useState, useEffect } from "react";
import { validateUserToken } from "../../services/auth";
import { Navigate } from "react-router-dom";
import Spinner from "../Spinner";

export const Authorisation = ({ children }) => {
    const [validAuth, setValidAuth] = useState(null);

    // Check if the user is authenticated
    useEffect(() => {
        const checkValidToken = async () => {
            try {
                const isValidToken = await validateUserToken()
                setValidAuth(isValidToken);
            } catch {
                setValidAuth(false);
            }
        }
        checkValidToken();
    }, [])

    // default to spinner screen to ensure promise is resolved
    if (validAuth === null) {
        return <Spinner text="Awaiting Auth" />
    }

    // Redirect
    if (!validAuth) {
        console.log("Redirecting... to /login");
        return <Navigate to="/login" replace />;
    }

    return children;
}
