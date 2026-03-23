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
    const [googleLoading, setGoogleLoading] = useState(false);

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
                    setGoogleLoading(false);
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
                setGoogleLoading(false);
            }
        } catch (err) {
            console.error('Google Auth Error:', err);
            showErrorMessage('Connection to auth server failed');
            setGoogleLoading(false);
        }
    };

    const handleGoogleError = () => {
        setGoogleLoading(false);
        showErrorMessage('Google Login Failed');
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

            {/* ── Google Auth Loading Overlay ── */}
            <AnimatePresence>
                {googleLoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="fixed inset-0 z-50 flex flex-col items-center justify-center"
                        style={{ backdropFilter: 'blur(12px)', background: 'rgba(255,255,255,0.75)' }}
                    >
                        {/* Spinner ring */}
                        <div style={{ position: 'relative', width: '72px', height: '72px', marginBottom: '24px' }}>
                            {/* Outer ring */}
                            <motion.div
                                style={{
                                    position: 'absolute', inset: 0,
                                    borderRadius: '50%',
                                    border: '3px solid rgba(45,98,237,0.15)',
                                }}
                            />
                            {/* Spinning arc */}
                            <motion.div
                                style={{
                                    position: 'absolute', inset: 0,
                                    borderRadius: '50%',
                                    border: '3px solid transparent',
                                    borderTopColor: '#2d62ed',
                                    borderRightColor: '#2d62ed',
                                }}
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}
                            />
                            {/* Google G icon in centre */}
                            <div
                                style={{
                                    position: 'absolute', inset: 0,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}
                            >
                                <svg width="28" height="28" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                </svg>
                            </div>
                        </div>

                        <motion.p
                            style={{
                                fontSize: '16px',
                                fontWeight: 700,
                                color: '#1a1c1e',
                                marginBottom: '6px',
                                letterSpacing: '-0.2px'
                            }}
                            animate={{ opacity: [1, 0.5, 1] }}
                            transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
                        >
                            Authenticating with Google…
                        </motion.p>
                        <p style={{ fontSize: '13px', color: '#42474e', opacity: 0.6 }}>
                            Please wait while we verify your account
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

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

                {/* Google auth — wrapped to detect click */}
                <motion.div variants={itemVariants} className="flex justify-center">
                    {/* Invisible click-capture overlay triggers loading state */}
                    <div
                        className="relative w-full flex justify-center"
                        onClick={() => setGoogleLoading(true)}
                        style={{ cursor: 'pointer' }}
                    >
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={handleGoogleError}
                            useOneTap
                            theme="outline"
                            width="100%"
                        />
                    </div>
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
