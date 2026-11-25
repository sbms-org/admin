import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import { ActivityLogsPage, AdminQueue, OverviewPage, ReportsPage, UsersPage } from './pages/AdminConsole';
import Settings from './pages/Settings';

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<OverviewPage />} />
              <Route path="/providers" element={<AdminQueue type="providers" />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/work-posts" element={<AdminQueue type="moderation" />} />
              <Route path="/issues" element={<AdminQueue type="issues" />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/activity-logs" element={<ActivityLogsPage />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
