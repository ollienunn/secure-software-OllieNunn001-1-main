import { useNavigate } from 'react-router-dom';
import useAlert from '../../hooks/useAlert';
import { Button } from './Button';
import { adminAuthLogout } from '../../services/auth';

export const LogoutButton = () => {
    const navigate = useNavigate();
    const { setAlertMessage, setAlertType } = useAlert();

    // Function to handle the logout process
    const handleUserLogout = async () => {
        try {
            await adminAuthLogout();
            navigate("/login")
        } catch (error) {
            setAlertMessage(error.message);
            setAlertType("ERROR")
        }
    }

    // Render the logout button
    return (
        <button 
            className="modern-btn modern-btn-danger"
            type="submit" 
            onClick={() => handleUserLogout()}
        >
            <i className="bi bi-box-arrow-right"></i>
            Logout
        </button>
    );
}