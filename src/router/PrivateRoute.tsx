// src/components/PrivateRoute.tsx

import React from 'react';
import { Route, Navigate, RouteProps } from 'react-router-dom';
import { useUserContext } from '../context/UserContext'; // Adjust the path if necessary

interface PrivateRouteProps extends RouteProps {
    element: React.ReactElement;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ element, ...rest }) => {
    const { isAuthenticated } = useUserContext();

    return (
        <Route
            {...rest}
            element={isAuthenticated ? element : <Navigate to="/login" />}
        />
    );
};

export default PrivateRoute;
