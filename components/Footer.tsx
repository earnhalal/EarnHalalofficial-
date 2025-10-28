import React from 'react';
import type { View } from '../types';

interface FooterProps {
    setActiveView: (view: View) => void;
}

const Footer: React.FC<FooterProps> = ({ setActiveView }) => {
    return (
        <footer className="bg-transparent p-6 mt-auto text-center text-sm text-slate-400 border-t border-amber-400/10">
            <p>&copy; {new Date().getFullYear()} Earn Halal. All Rights Reserved.</p>
            <div className="flex justify-center space-x-4 mt-2">
                <button onClick={() => setActiveView('TERMS_CONDITIONS')} className="hover:text-amber-400 transition-colors">Terms of Service</button>
                <span>&bull;</span>
                <button onClick={() => setActiveView('PRIVACY_POLICY')} className="hover:text-amber-400 transition-colors">Privacy Policy</button>
            </div>
        </footer>
    );
};

export default Footer;