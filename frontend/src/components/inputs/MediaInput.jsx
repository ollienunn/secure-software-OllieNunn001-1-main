import ObjectInput from './ObjectInput';

const MediaInput = ({ mediaInputMode, currState, setState, inputRef }) => {
    // Check if the mediaInputMode is valid
    if (mediaInputMode === 'upload') {
        return (
            <ObjectInput
                label="Upload Image"
                type="file"
                objKey="visual"
                currState={currState}
                setState={setState}
                inputRef={inputRef}
            />
        );
    }
    
    // If the mediaInputMode is 'url', render the URL input
    return (
        <ObjectInput
            label="Video URL"
            type="text"
            objKey="visual"
            currState={currState}
            setState={setState}
            placeholder="Enter a URL to YouTube video"
        />
    );
};

export default MediaInput;
