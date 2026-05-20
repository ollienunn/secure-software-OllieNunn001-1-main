import { useEffect, useState } from "react";

const Spinner = ({ text }) => {
    const [dots, setDots] = useState("");

    // add dots to the text every 500ms
    useEffect(() => {
        const interval = setInterval(() => {
            setDots(prev => (prev.length < 3 ? prev + "." : ""));
        }, 500);
        return () => clearInterval(interval);
    }, []);
    
    return (
        <div className="d-flex flex-column justify-content-center align-items-center vh-100">
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
            <h6 className="mt-2">{text}{dots}</h6>
        </div>
    );
};

export default Spinner;