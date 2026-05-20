import { useId } from 'react';

// general purpose input component
const Input = ({ label, type, value, onChange, placeholder, inputRef, min, max }) => {
    const id = useId();

    const inputProps = {
        id,
        type,
        className: "form-control",
        onChange,
        placeholder,
        ref: inputRef,
    };

    // value only applies to non-file inputs
    if (type !== "file") {
        inputProps.value = value;
    }
    
    // Add min/max for number inputs
    if (type === "number") {
        if (min !== undefined) inputProps.min = min;
        if (max !== undefined) inputProps.max = max;
    }

    return (
        <div className="mb-3">
            <label className="form-label" htmlFor={id}>
                <b>{label}</b>
            </label>
            <input {...inputProps} />
        </div>
    );
};
export default Input;