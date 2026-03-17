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
        try {
          // Verify session with backend
          const context = await api('auth/context');
          
          const role = localStorage.getItem('userRole')?.toUpperCase();
          const backendRole = context.role?.toUpperCase();

          // Strict Role Check: Only ADMINs allowed on web
          if (role !== 'ADMIN' && backendRole !== 'ADMIN') {
            console.error("Access Denied: Not an admin");
            handleLogout();
          } else {
            const email = localStorage.getItem('userEmail');
            const title = localStorage.getItem('userTitle');
            const scope = localStorage.getItem('userScope');
            const userId = localStorage.getItem('userId');
            setUser({ email, role, title, scope, userId });
          }
        } catch (err) {
          // If 401 occurs, api.js utility already handles redirect
          console.error("Session verification failed", err);
          handleLogout();
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