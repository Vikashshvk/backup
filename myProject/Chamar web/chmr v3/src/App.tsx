import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import { HomePage } from './pages/HomePage';
import { ContributePage } from './pages/ContributePage';
import { ContributionsPage } from './pages/ContributionsPage';
import { TransparencyPage } from './pages/TransparencyPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { ManageContributionsPage } from './pages/ManageContributionsPage';
import { ManageExpensesPage } from './pages/ManageExpensesPage';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans antialiased selection:bg-blue-600 selection:text-white">
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* Public Community Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/contribute" element={<ContributePage />} />
                <Route path="/contributions" element={<ContributionsPage />} />
                <Route path="/transparency" element={<TransparencyPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Authenticated Member Profile */}
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />

                {/* Protected Committee & Admin Management Routes */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'committee']}>
                      <AdminDashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/contributions"
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'committee']}>
                      <ManageContributionsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/expenses"
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'committee']}>
                      <ManageExpensesPage />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

