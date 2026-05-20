import brainImg from '../assets/brain.png'
import { LogoutButton } from './buttons/LogoutButton';
import '../styles/Navigation.css';

export const NavBar = ({ children }) => {
    return (
        <div>
            <nav className="navbar bg-body-tertiary p-3">
                <div className="container">
                    <a className="navbar-brand" href="/">
                        <div className="d-flex align-items-center">
                            <img
                                src={brainImg}
                                alt="small-brain-logo"
                                width="40"
                                height="40"
                                className="d-inline-block"
                            />
                            <h3 className="mb-0 ms-2">SMALLBRAIN GAMES</h3>
                        </div>
                    </a>

                    <div className="d-flex flex-end" >
                        <LogoutButton/>
                    </div>
                </div>
            </nav>

            {children}
        </div>
    );
}