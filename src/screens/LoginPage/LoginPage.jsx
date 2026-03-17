import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import { Mail, Lock, AlertCircle, Eye, EyeOff, Bolt } from 'lucide-react';

/* ─── colour tokens (matching index.css :root vars) ─── */
// --primary-color : #2d62ed
// --primary-glow  : rgba(45,98,237,0.25)
// --text-heading  : #1a1c1e
// --text-body     : #42474e
// --input-fill    : #f8fafc
// --input-border  : #e2e8f0
// --white         : #ffffff
// --error         : #ff5252

const LoginPage = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        const trimmedEmail = email.trim().toLowerCase();

        if (!password) {
            showErrorMessage('Please enter your password');
            return;
        }

        const sessions = {
            'admin@gmail.com': { role: 'admin', title: 'Administrator', scope: 'full' },
        };

        if (sessions[trimmedEmail]) {
            const user = sessions[trimmedEmail];
            // Explicitly verify admin role for web portal
            if (user.role !== 'admin' && user.role !== 'ADMIN') {
                showErrorMessage('Access Denied: Only administrators can access the web portal.');
                return;
            }
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userEmail', trimmedEmail);
            localStorage.setItem('userRole', user.role);
            localStorage.setItem('userTitle', user.title);
            localStorage.setItem('userScope', user.scope);
            localStorage.setItem('userId', '1'); // Mock Admin ID
            localStorage.setItem('token', 'mock_admin_token');
            onLoginSuccess({ ...user, email: trimmedEmail, user_id: '1' });
        } else {
            showErrorMessage('Invalid credentials. This portal is restricted to administrators.');
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/google`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: credentialResponse.credential })
            });

            if (response.ok) {
                const data = await response.json();
                
                // --- RESTRICT TO ADMIN ONLY ---
                if (data.role !== 'ADMIN' && data.role !== 'admin') {
                    showErrorMessage('Access Denied: Web access is strictly for Administrators.');
                    return;
                }

                onLoginSuccess({
                    email: data.email,
                    user_id: data.user_id,
                    role: data.role || 'admin',
                    title: data.name || data.title || 'Institutional Admin',
                    scope: data.scope || 'full',
                    token: data.token
                });
            } else {
                showErrorMessage('Backend authentication failed');
            }
        } catch (err) {
            console.error('Google Auth Error:', err);
            showErrorMessage('Connection to auth server failed');
        }
    };

    const showErrorMessage = (msg) => {
        setError(msg);
        setTimeout(() => setError(''), 4000);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } }
    };

    return (
        /* login-container */
        <div className="relative min-h-screen flex items-center justify-center px-5 overflow-hidden bg-white">

            {/* bg-glow  — absolute top-[-150px] left-[-150px] 400×400 circle, blur-[80px] */}
            <div
                className="absolute rounded-full pointer-events-none z-0"
                style={{
                    top: '-150px', left: '-150px',
                    width: '400px', height: '400px',
                    background: 'rgba(45,98,237,0.25)',
                    filter: 'blur(80px)'
                }}
            />

            {/* login-card  — max-w-[440px] p-10 z-10 flex-col gap-8 */}
            <motion.div
                className="relative w-full z-10 flex flex-col gap-8"
                style={{ maxWidth: '440px', padding: '40px' }}
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                {/* logo-section */}
                <motion.div className="flex justify-center" variants={itemVariants}>
                    {/* logo-box: 80×80, white bg, rounded-3xl, border, subtle shadow */}
                    <div
                        className="flex items-center justify-center bg-white rounded-3xl border"
                        style={{
                            width: '80px', height: '80px',
                            borderColor: '#e2e8f0',
                            boxShadow: '0 10px 20px rgba(0,0,0,0.05)'
                        }}
                    >
                        {/* logo-icon: primary colour */}
                        <Bolt size={42} style={{ color: '#2d62ed' }} />
                    </div>
                </motion.div>

                {/* header-section */}
                <motion.div className="text-center" variants={itemVariants}>
                    {/* admin-badge */}
                    <div
                        className="inline-block px-3 py-1 rounded-full text-[11px] font-bold tracking-[1.2px] uppercase mb-3"
                        style={{
                            background: 'rgba(45,98,237,0.08)',
                            color: '#2d62ed',
                            letterSpacing: '1.2px'
                        }}
                    >
                        ADMIN PORTAL
                    </div>
                    <h1
                        className="font-extrabold tracking-tight mb-2"
                        style={{ fontSize: '32px', color: '#1a1c1e' }}
                    >
                        Welcome Back
                    </h1>
                    <p style={{ color: '#42474e', fontSize: '16px' }}>
                        Enter your credentials to access the command center
                    </p>
                </motion.div>

                {/* error-toast */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            className="flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-medium"
                            style={{
                                background: '#fff5f5',
                                border: '1px solid #feb2b2',
                                color: '#ff5252'
                            }}
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <AlertCircle size={18} />
                            <span>{error}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* login-form */}
                <form onSubmit={handleLogin} className="flex flex-col gap-6">

                    {/* Email — input-group */}
                    <motion.div className="flex flex-col gap-2.5" variants={itemVariants}>
                        <label
                            className="font-black uppercase"
                            style={{ fontSize: '11px', letterSpacing: '1.2px', color: '#1a1c1e', opacity: 0.5 }}
                        >
                            EMAIL ADDRESS
                        </label>
                        {/* input-wrapper */}
                        <div
                            className="relative flex items-center"
                            style={{ boxShadow: '0 8px 15px rgba(0,0,0,0.03)' }}
                        >
                            {/* input-icon */}
                            <Mail
                                size={20}
                                className="absolute"
                                style={{ left: '20px', color: '#2d62ed', opacity: 0.7 }}
                            />
                            <input
                                type="email"
                                placeholder="student@gmail.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full rounded-2xl text-base font-semibold transition-all duration-200 outline-none focus:bg-white"
                                style={{
                                    padding: '20px 20px 20px 52px',
                                    background: '#f8fafc',
                                    border: '1px solid #e2e8f0',
                                    color: '#1a1c1e'
                                }}
                                onFocus={e => {
                                    e.target.style.borderColor = '#2d62ed';
                                    e.target.style.borderWidth = '1.5px';
                                    e.target.style.background = '#ffffff';
                                }}
                                onBlur={e => {
                                    e.target.style.borderColor = '#e2e8f0';
                                    e.target.style.borderWidth = '1px';
                                    e.target.style.background = '#f8fafc';
                                }}
                            />
                        </div>
                    </motion.div>

                    {/* Password — input-group */}
                    <motion.div className="flex flex-col gap-2.5" variants={itemVariants}>
                        <label
                            className="font-black uppercase"
                            style={{ fontSize: '11px', letterSpacing: '1.2px', color: '#1a1c1e', opacity: 0.5 }}
                        >
                            PASSWORD
                        </label>
                        {/* input-wrapper */}
                        <div
                            className="relative flex items-center"
                            style={{ boxShadow: '0 8px 15px rgba(0,0,0,0.03)' }}
                        >
                            {/* input-icon */}
                            <Lock
                                size={20}
                                className="absolute"
                                style={{ left: '20px', color: '#2d62ed', opacity: 0.7 }}
                            />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full rounded-2xl text-base font-semibold transition-all duration-200 outline-none"
                                style={{
                                    padding: '20px 52px 20px 52px',
                                    background: '#f8fafc',
                                    border: '1px solid #e2e8f0',
                                    color: '#1a1c1e'
                                }}
                                onFocus={e => {
                                    e.target.style.borderColor = '#2d62ed';
                                    e.target.style.borderWidth = '1.5px';
                                    e.target.style.background = '#ffffff';
                                }}
                                onBlur={e => {
                                    e.target.style.borderColor = '#e2e8f0';
                                    e.target.style.borderWidth = '1px';
                                    e.target.style.background = '#f8fafc';
                                }}
                            />
                            {/* password-toggle */}
                            <button
                                type="button"
                                className="absolute flex items-center justify-center p-1"
                                style={{ right: '16px', color: '#42474e', opacity: 0.6 }}
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </motion.div>

                    {/* Submit button — custom-button primary */}
                    <motion.button
                        type="submit"
                        variants={itemVariants}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full flex items-center justify-center gap-3 rounded-2xl text-base font-bold text-white transition-all duration-200"
                        style={{
                            height: '60px',
                            background: '#2d62ed',
                            boxShadow: '0 10px 20px rgba(45,98,237,0.25)'
                        }}
                    >
                        Sign In
                    </motion.button>
                </form>

                {/* divider */}
                <motion.div
                    className="flex items-center text-center"
                    style={{ color: '#42474e', opacity: 0.4, fontSize: '12px', fontWeight: 700 }}
                    variants={itemVariants}
                >
                    <div className="flex-1 border-b" style={{ borderColor: '#e2e8f0' }} />
                    <span className="px-2.5">OR</span>
                    <div className="flex-1 border-b" style={{ borderColor: '#e2e8f0' }} />
                </motion.div>

                {/* Google auth */}
                <motion.div variants={itemVariants} className="flex justify-center">
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => showErrorMessage('Google Login Failed')}
                        useOneTap
                        theme="outline"
                        width="100%"
                    />
                </motion.div>

                {/* footer-section */}
                <motion.div className="text-center" variants={itemVariants}>
                    <p style={{ color: '#42474e', fontSize: '14px' }}>
                        New here?{' '}
                        <button
                            className="font-bold px-1"
                            style={{ background: 'none', color: '#2d62ed', fontSize: '14px' }}
                        >
                            Create Account
                        </button>
                    </p>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default LoginPage;
