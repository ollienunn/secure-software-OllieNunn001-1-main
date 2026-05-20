import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap/dist/css/bootstrap.min.css';

import Input from './Input';
import { fileToDataUrl } from '../../utils/helpers';

const ObjectInput = ({ label, type, objKey, currState, setState, placeholder, inputRef }) => {
    // Check if the type is valid
    const handleChange = async (e) => {
        let currField;
        if (type === "file") {
            currField = await fileToDataUrl(e.target.files[0]);
        } else {
            currField = e.target.value;
        }

        setState({ ...currState, [objKey]: currField });
    };

    let value = "";
    if (type !== 'file') {
        const currentValue = currState[objKey];
        
        // if img url base64 encoding - make value empty and use placeholder
        const isUploadedImage = typeof currentValue === 'string' && currentValue.startsWith('data:image');
        if (isUploadedImage) {
            value = "";
        } else {
            if (currentValue !== undefined && currentValue !== null) {
                value = currentValue;
            } else {
                value = "";
            }        
        }
    }

    return (
        <Input
            label={label}
            type={type}
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            inputRef={inputRef}
        />
    );
};

export default ObjectInput;