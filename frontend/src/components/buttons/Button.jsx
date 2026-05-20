import 'bootstrap/dist/css/bootstrap.min.css';

// Button component for different button types
export const Button = ({ variant, text, type = "button", onClick = () => {}, ...rest}) => {
    return (
        <button 
            type={type} 
            className={`btn btn-${variant}`} 
            onClick={() => onClick()}
            aria-label={text}
            {...rest}
        >
            {text}
        </button>
    );
}