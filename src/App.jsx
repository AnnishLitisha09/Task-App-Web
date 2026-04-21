import React, { useState, useEffect } from 'react'
import { GoogleOAuthProvider } from '@react-oauth/google'
import LoginPage from './screens/LoginPage/LoginPage'
import AdminLayout from './screens/Admin/layouts/AdminLayout'
import Dashboard from './screens/Admin/Dashboard/Dashboard' // <--- Import here
import api from './utils/api'
import './index.css'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function App() {
  const [user, setUser] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      if (isLoggedIn) {
        const email   = localStorage.getItem('userEmail');
        const role    = localStorage.getItem('userRole');
        const title   = localStorage.getItem('userTitle');
        const scope   = localStorage.getItem('userScope');
        const userId  = localStorage.getItem('userId');

        // Restore user immediately so refresh never shows the login page
        setUser({ email, role, title, scope, userId });

        try {
          // Verify session with backend in the background
          const context = await api('auth/context');
          const backendRole = context.role?.toUpperCase();

          // Only log out if the backend explicitly says this is NOT an admin
          if (role?.toUpperCase() !== 'ADMIN' && backendRole !== 'ADMIN') {
            console.error('Access Denied: Not an admin');
            handleLogout();
          }
        } catch (err) {
          // Network errors, 500s, etc. — keep the user logged in.
          // api.js already handles 401 by clearing localStorage + redirecting.
          console.warn('Session check failed (network/server error) — keeping session alive:', err.message);
        }
      }
      setIsInitialized(true);
    };

    initAuth();
  }, []);

  const handleLoginSuccess = (userData) => {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userEmail', userData.email);
    localStorage.setItem('userRole', userData.role);
    localStorage.setItem('userTitle', userData.title);
    localStorage.setItem('userScope', userData.scope);
    if (userData.token) {
      localStorage.setItem('token', userData.token);
    }
    if (userData.user_id) {
      localStorage.setItem('userId', userData.user_id);
    }
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
  };

  if (!isInitialized) return null;

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="app-main">
        {!user ? (
          <LoginPage onLoginSuccess={handleLoginSuccess} />
        ) : (
          <AdminLayout user={user} onLogout={handleLogout}>
            <Dashboard user={user} />
          </AdminLayout>
        )}
      </div>
    </GoogleOAuthProvider>
  )
}

export default App