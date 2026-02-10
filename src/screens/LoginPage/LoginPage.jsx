import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import {
    Mail,
    Lock,
    AlertCircle
} from 'lucide-react';
import { Input } from '../../components/UI/Input';
import { Button } from '../../components/UI/Button';
import { Logo } from '../../components/UI/Logo';
import './LoginPage.css';

const LoginPage = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
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
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userEmail', trimmedEmail);
            localStorage.setItem('userRole', user.role);
            localStorage.setItem('userTitle', user.title);
            localStorage.setItem('userScope', user.scope);
            localStorage.setItem('token', 'mock_admin_token'); // Mock token for test account

            onLoginSuccess({ ...user, email: trimmedEmail });
        } else {
            showErrorMessage('Invalid credentials. Use student, faculty, hod, incharge, or principal emails.');
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/google`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token: credentialResponse.credential
                })
            });

            if (response.ok) {
                const data = await response.json();
                const userData = {
                    email: data.email,
                    role: data.role || 'admin',
                    title: data.name || data.title || 'Institutional Admin',
                    scope: data.scope || 'full',
                    token: data.token // Include the token from backend
                };

                onLoginSuccess(userData);
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
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.2 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: 'spring', stiffness: 300, damping: 24 }
        }
    };

    return (
        <div className="login-container">
            <div className="bg-glow"></div>

            <motion.div
                className="login-card"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                <motion.div className="logo-section" variants={itemVariants}>
                    <Logo />
                </motion.div>

                <motion.div className="header-section" variants={itemVariants}>
                    <div className="admin-badge">ADMIN PORTAL</div>
                    <h1>Welcome Back</h1>
                    <p>Enter your credentials to access the command center</p>
                </motion.div>

                <AnimatePresence>
                    {error && (
                        <motion.div
                            className="error-toast"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <AlertCircle size={18} />
                            <span>{error}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <form onSubmit={handleLogin} className="login-form">
                    <motion.div variants={itemVariants}>
                        <Input
                            label="EMAIL ADDRESS"
                            icon={Mail}
                            placeholder="student@gmail.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </motion.div>

                    <motion.div variants={itemVariants}>
                        <Input
                            label="PASSWORD"
                            icon={Lock}
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </motion.div>

                    <Button type="submit" variants={itemVariants}>
                        Sign In
                    </Button>
                </form>

                <motion.div className="divider" variants={itemVariants}>
                    <span>OR</span>
                </motion.div>

                <motion.div variants={itemVariants} className="google-auth-wrapper">
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => showErrorMessage('Google Login Failed')}
                        useOneTap
                        theme="outline"
                        width="100%"
                    />
                </motion.div>

                <motion.div className="footer-section" variants={itemVariants}>
                    <p>New here? <button className="link-button">Create Account</button></p>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default LoginPage;
