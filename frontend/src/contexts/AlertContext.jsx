// AlertContext.jsx 
// - context provider for AlertBox.jsx inserted into DOM inside App.jsx
// - export alert context 

import { createContext, useState, useEffect } from "react";
import { AlertBox } from "../components/AlertBox";
import { useLocation } from "react-router-dom";

export const AlertContext = createContext();

// Provider that wraps all children components of App inside Alert provider
export const AlertProvider = ({ children }) => {
    const [alertMessage, setAlertMessage] = useState("");
    const [alertType, setAlertType] = useState("");

    const location = useLocation();
    useEffect(() => {
        const pathname = location.pathname;
    
        // regex match - prevent alert rtemove from /game/:id || /game/:id/question/:qid
        const isGameRoute = /^\/game\/[^/]+(\/question\/[^/]+)?$/.test(pathname);
        if (!isGameRoute) {
            setAlertMessage("");
            setAlertType("");
        }
    }, [location.pathname]);

    return (
        <AlertContext.Provider value={{ alertMessage, setAlertMessage, alertType, setAlertType }}>
            {children}
            <AlertBox
                message={alertMessage}
                setMessage={setAlertMessage}
                type={alertType}
                setType={setAlertType}
            />
        </AlertContext.Provider>
    );
};