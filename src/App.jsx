import React, { useState, useEffect } from 'react'
import { GoogleOAuthProvider } from '@react-oauth/google'
import LoginPage from './screens/LoginPage/LoginPage'
import AdminLayout from './screens/Admin/layouts/AdminLayout'
import Dashboard from './screens/Admin/Dashboard/Dashboard' // <--- Import here
import './index.css'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function App() {
  const [user, setUser] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (isLoggedIn) {
      const email = localStorage.getItem('userEmail');
      const role = localStorage.getItem('userRole');
      const title = localStorage.getItem('userTitle');
      const scope = localStorage.getItem('userScope');
      setUser({ email, role, title, scope });
    }
    setIsInitialized(true);
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
        ) : user.role === 'admin' ? (
          <AdminLayout user={user} onLogout={handleLogout}>
            {/* Call the Dashboard here */}
            <Dashboard user={user} />
          </AdminLayout>
        ) : (
          /* ... Access Denied Logic ... */
          <div className="access-denied">
            <h1>Access Denied</h1>
            <button onClick={handleLogout}>Go Back</button>
          </div>
        )}
      </div>
    </GoogleOAuthProvider>
  )
}

export default App