// OffCanvas.jsx

// General purpose class for any off-canvas
const OffCanvas = ({
    id = "offcanvas-default",
    title,
    subtitle,
    position = "end",
    children,
}) => {
    return (
        <div
            className={`offcanvas offcanvas-${position}`}
            tabIndex="-1"
            id={id}
            aria-labelledby={`${id}-label`}
        >
            <div className="d-flex justify-content-end px-3 pt-3">
                <button
                    type="button"
                    className="btn-close"
                    data-bs-dismiss="offcanvas"
                    aria-label="Close"
                ></button>
            </div>
            
            {/* Header with title and subtitle */}
            <div className="offcanvas-header d-flex flex-column">
                {title && <h4 className="offcanvas-title" id={`${id}-label`}>{title}</h4>}
                {subtitle && <h5>{subtitle}</h5>}
            </div>
            <div className="offcanvas-body">
                {children}
            </div>
        </div>
    );
};

export default OffCanvas;
