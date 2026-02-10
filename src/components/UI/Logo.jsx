import React from 'react';
import { Bolt } from 'lucide-react';
import './UI.css';

export const Logo = ({ size = 42 }) => {
    return (
        <div className="logo-box">
            <Bolt size={size} className="logo-icon" />
        </div>
    );
};
