import { Authorisation } from "../components/auth/Authorisation";
import { Outlet } from 'react-router-dom';
import { NavBar } from "../components/NavBar";
import { BreadCrumb } from "../components/BreadCrumb";

// Wrapper JSX around secured routes va Authorisation Component
export const SecuredRoutes = () => {
    return (
        <Authorisation>
            <NavBar>
                <BreadCrumb>
                    <Outlet /> 
                </BreadCrumb>
            </NavBar>
        </Authorisation>
    );
};