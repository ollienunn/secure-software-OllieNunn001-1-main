import { forwardRef } from 'react';
import Input from './Input.jsx';

// This component is a wrapper around the Input component to handle file inputs.
const FileInput = forwardRef((props, ref) => {
    return (
        <Input 
            {...props} 
            inputRef={ref} 
        />
    );
});

FileInput.displayName = 'FileInput';

export default FileInput;
