import 'bootstrap/dist/css/bootstrap.min.css';
import "bootstrap-icons/font/bootstrap-icons.css";

import { useEffect } from 'react';

// type can be either "ERROR", "INFO", or "SUCCESS"
export const AlertBox = ({ message, setMessage, type, setType }) => {

    type = type.toLowerCase()

    useEffect(() => {
        if (type === "success" && message !== "") {
            const timer = setTimeout(() => setMessage(""), 3000);
            return () => clearTimeout(timer);
        }
    }, [message, type]);

    // Function to handle the alert close button
    const handleAlertClose = () => {
        setMessage("")
        setType("")
    }

    if (message === "") {
        return null;
    }

    let color = ""
    let iconClass = ""
    // Set the color and icon class based on the type
    if (type === "error") {
        color = "bg-danger"
        iconClass = "bi-exclamation-triangle-fill"
    } else if (type === "info") {
        color = "bg-primary"
        iconClass = "bi-info-circle-fill"
    } else if (type === "success") {
        color = "bg-success"
        iconClass = "bi-check-circle-fill"
    } else {
        return null;
    }

    // Set the alert box to be fixed at the bottom right corner of the screen
    return (
        <div className="modal show d-block w-auto m-4" aria-hidden="false">
            <div className={`modal-content ${color} position-fixed bottom-0 end-0 m-4 w-auto`}>
                <div className="modal-header border-0 py-3">
                    <div className="modal-body text-white m-0 p-0" id="alertModalLabel">
                        <i className={`bi ${iconClass} flex-shrink-0 me-2`}></i>
                        {message}
                    </div>
                    <button
                        type="button"
                        className="btn-close btn-close-white ms-2 p-0 m-auto"
                        onClick={handleAlertClose}
                    ></button>
                </div>
            </div>
        </div>
    );
};