import React from 'react';
import { Navigate } from 'react-router-dom';

interface RestrictedWrapperProps {
  fallbackPath: string;
  children: React.ReactNode;
}

const RestrictedWrapper: React.FC<RestrictedWrapperProps> = ({ fallbackPath, children }) => {
  const isAuthenticated = Boolean(localStorage.getItem('bearer'));
  if (isAuthenticated) {
    return <>{children}</>;
  }
  return <Navigate to={fallbackPath} replace />;
};

export default RestrictedWrapper;