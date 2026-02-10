import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import './UI.css';

export const Input = ({ label, icon: Icon, type = 'text', placeholder, value, onChange }) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';

    return (
        <div className="input-group">
            {label && <label>{label}</label>}
            <div className="input-wrapper">
                {Icon && <Icon className="input-icon" size={20} />}
                <input
                    type={isPassword ? (showPassword ? 'text' : 'password') : type}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                />
                {isPassword && (
                    <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                )}
            </div>
        </div>
    );
};
