import { Navigate } from 'react-router-dom';

const RequireRole = ({ allowedRoles, children }) => {
    const userRole = localStorage.getItem('role'); // 'user', 'admin', etc.

    if (!allowedRoles.includes(userRole)) {
        // console.log(allowedRoles);
        return <Navigate to="/403" replace />;
    }
    return children;
};

export default RequireRole;
