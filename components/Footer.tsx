import React from 'react';
import type { View } from '../types';

interface FooterProps {
    setActiveView: (view: View) => void;
}

const Footer: React.FC<FooterProps> = ({ setActiveView }) => {
    return (
        <footer className="bg-white p-6 mt-auto text-center text-sm text-gray-500 border-t border-gray-200">
            <div className="flex justify-center flex-wrap gap-x-6 gap-y-2">
                 <button onClick={() => setActiveView('HOW_IT_WORKS')} className="hover:text-primary-600 transition-colors font-semibold">How It Works</button>
                 <button onClick={() => setActiveView('ABOUT_US')} className="hover:text-primary-600 transition-colors font-semibold">About Us</button>
                 <button onClick={() => setActiveView('CONTACT_US')} className="hover:text-primary-600 transition-colors font-semibold">Contact</button>
                 <button onClick={() => setActiveView('TERMS_CONDITIONS')} className="hover:text-primary-600 transition-colors font-semibold">Terms</button>
                 <button onClick={() => setActiveView('PRIVACY_POLICY')} className="hover:text-primary-600 transition-colors font-semibold">Privacy</button>
            </div>
            <p className="mt-4">&copy; {new Date().getFullYear()} Earn Halal. All Rights Reserved.</p>
        </footer>
    );
};

export default Footer;