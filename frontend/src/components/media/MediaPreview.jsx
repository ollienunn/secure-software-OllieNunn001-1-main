import ReactPlayer from 'react-player';

export const MediaPreview = ({ currState }) => {
    const visual = currState.visual
    if (!visual) {
        return null;
    }
    
    const isImage = visual.startsWith('data:image');

    // Check if the visual is a valid image URL
    return (
        <div className="mb-3">
            {isImage ? (
                <img
                    src={visual}
                    alt="Question Visual"
                    className="w-50 img-fluid rounded shadow"
                />
            ) : (
                <div className="ratio ratio-16x9 w-50">
                    <ReactPlayer
                        url={visual}
                        width="100%"
                        height="100%"
                        controls
                        playing={false}
                        config={{
                            youtube: {
                                embedOptions: { showinfo: 1 }
                            }
                        }}
                    />
                </div>
            )}
        </div>
    );
};
