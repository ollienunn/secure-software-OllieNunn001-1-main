
import { useState } from "react";
import { AuthInfo } from "../components/AuthInfo"
import { Button } from "../components/buttons/Button";
import { Link, useNavigate } from "react-router-dom";
import useAlert from "../hooks/useAlert";
import { adminAuthLogin } from "../services/auth";

export const Login = () => {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const { setAlertMessage, setAlertType } = useAlert();
    const navigate = useNavigate();

    // Function to handle the login process
    const handleUserLogin = async (event) => {
        event.preventDefault();
        try {
            await adminAuthLogin(email, password);
            navigate("/");
        } catch (error) {
            console.log(error);
            setAlertMessage(error.message);
            setAlertType("ERROR")
        }
    }
    return (
        // return general purpose card body for login
        <div className="container-fluid min-vh-100 d-flex flex-column justify-content-start py-4">
            <div className="col-12 col-md-6 mx-auto">
                <form className="p-4 shadow rounded bg-white" onSubmit={handleUserLogin}>

                    <AuthInfo/>
                    <h3 className="text-center">Account Login</h3>

                    {/* Login Forms */}
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

                    <Button variant="primary" text="Login Account" type="Login" />

                    {/* Register Link */}
                    <div className="alert alert-info mt-2" role="alert">
                        Dont have an account? {" "}
                        <Link to="/register" className="alert-link">
                            Register here!
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    )
}