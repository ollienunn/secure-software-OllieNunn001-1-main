import { useState } from "react"
import { Button } from "../components/buttons/Button"
import { adminAuthRegister } from "../services/auth";
import useAlert from "../hooks/useAlert";
import { AuthInfo } from "../components/AuthInfo";
import { Link, useNavigate } from "react-router-dom";

export const Register = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const { setAlertMessage, setAlertType } = useAlert();
    const navigate = useNavigate();

    const handleRegisterUser = async (event) => {
        event.preventDefault();
        if (password !== confirmPassword) {
            setAlertMessage("Passwords do not match!");
            setAlertType("ERROR")
            return;
        }

        try {
            await adminAuthRegister(email, password, name);
            navigate("/");
        } catch (error) {
            setAlertMessage(error.message);
            setAlertType("ERROR")
        }
    }

    return (
        <div className="container-fluid min-vh-100 d-flex flex-column justify-content-start py-4">
            <div className="col-12 col-md-6 mx-auto">
                <form className="p-4 shadow rounded bg-white" onSubmit={handleRegisterUser}>
                    <AuthInfo></AuthInfo>
                    <h3 className="text-center">Account Registration</h3>
                    <div className="mb-3">
                        <label htmlFor="name-input" className="form-label">Name</label>
                        <input
                            type="text"
                            className="form-control"
                            id="name-input"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="email-input" className="form-label">Email address</label>
                        <input
                            type="email"
                            className="form-control"
                            id="email-input"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="password-input" className="form-label">Password</label>
                        <input
                            type="password"
                            id="password-input"
                            className="form-control"
                            aria-describedby="passwordHelpBlock"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <div id="passwordHelpBlock" className="form-text">
                            Your password needs to be re-entered below to ensure you entered them correctly.
                        </div>
                    </div>

                    <div className="mb-3">
                        <label htmlFor="confirm-password-input" className="form-label">Confirm Password</label>
                        <input
                            type="password"
                            id="confirm-password-input"
                            className="form-control"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>
                    <Button variant="success" text="Create Account" type="submit" />

                    <div className="alert alert-info mt-2" role="alert">
                        Already have an account? {" "}
                        <Link to="/login" className="alert-link">
                            Login here!
                        </Link>
                    </div>
                </form>

            </div>
        </div>
    )
}
