export const MediaTypeToggle = ({ modeState, setModeState }) => {
    // Function to determine the label of the dropdown button based on the current mode
    const getLabel = () => {
        if (!modeState) {
            return "Toggle Media Type"
        }
        return modeState === "upload" ? "Upload Img" : "Video URL";
    };

    return (
        // Dropdown for selecting media type
        <div className="dropdown mb-2">
            <button
                className="btn btn-outline-secondary dropdown-toggle"
                type="button"
                id="mediaInputDropdown"
                data-bs-toggle="dropdown"
                aria-expanded="false"
            >
                {getLabel()}
            </button>

            {/* Dropdown menu for selecting media type */}
            <ul className="dropdown-menu" aria-labelledby="mediaInputDropdown">
                <li>
                    <button className="dropdown-item" type="button" onClick={() => setModeState('upload')}>
                        Upload Image
                    </button>
                </li>
                <li>
                    <button className="dropdown-item" type="button" onClick={() => setModeState('url')}>
                        Enter Media URL
                    </button>
                </li>
            </ul>
        </div>
    );
};
