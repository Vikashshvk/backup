import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireCommittee?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireCommittee = false,
}) => {
  const { user, isLoading, isCommittee } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-sm font-medium text-slate-500">Verifying authorized access...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireCommittee && !isCommittee) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-2xl border border-rose-200 shadow-sm text-center">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Restricted Committee Area</h2>
        <p className="text-sm text-slate-600 mb-6">
          Your account does not have Committee or Administrator privileges. Only designated committee
          members can access this management portal.
        </p>
        <Navigate to="/profile" replace />
      </div>
    );
  }

  return <>{children}</>;
};
