// CallOut.jsx

// Custom alert component for displaying messages
const CallOut = ({ children, type }) => {
    return (
        <div className={`alert ${type} text-start`} role="alert">
            {children}
        </div>
    );
};

export default CallOut;
