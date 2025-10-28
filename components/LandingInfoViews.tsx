import React from 'react';
import { BankIcon, NayaPayIcon, SadaPayIcon, UPaisaIcon, JazzCashIcon, EasyPaisaIcon, WalletIcon } from './icons';
import { HowItWorksView, AboutUsView, ContactUsView, PrivacyPolicyView, TermsAndConditionsView } from './InfoViews';

// Reusable Modal Component
interface InfoModalProps {
    title: string;
    onClose: () => void;
    children: React.ReactNode;
}

export const InfoModal: React.FC<InfoModalProps> = ({ title, onClose, children }) => (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in">
        <div className="relative w-full max-w-2xl h-[80vh] bg-slate-800 border border-amber-400/20 rounded-2xl shadow-2xl flex flex-col text-white animate-fade-in-up">
            <header className="flex items-center justify-between p-4 border-b border-amber-400/10 flex-shrink-0">
                <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-400">{title}</h3>
                <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors text-2xl">&times;</button>
            </header>
            <div className="p-6 overflow-y-auto">
                 {/* The prose classes are removed here to allow custom styling of imported components */}
                <div className="text-slate-300 max-w-none">
                    {children}
                </div>
            </div>
        </div>
    </div>
);

// Specific Info Content Components
const InfoSection: React.FC<{ title: string; children: React.ReactNode; }> = ({ title, children }) => (
    <div className="mb-8">
        <h4 className="text-2xl font-bold text-amber-400 mb-4 pb-2 border-b border-amber-400/20">{title}</h4>
        <div className="space-y-4 prose prose-lg prose-invert text-slate-300 max-w-none">{children}</div>
    </div>
);

const PaymentMethod: React.FC<{ name: string; icon: React.ReactNode; }> = ({ name, icon }) => (
    <div className="flex items-center gap-4 p-3 bg-white/5 rounded-lg border border-white/10">
        <div className="w-10 h-10 text-amber-400 flex-shrink-0">{icon}</div>
        <span className="font-semibold text-lg">{name}</span>
    </div>
);

export const WithdrawalInfo = () => (
    <>
        <InfoSection title="Withdrawal Policy">
            <p>You can withdraw your earnings once you reach the minimum threshold. All withdrawals are processed within 24-48 business hours.</p>
        </InfoSection>
        <InfoSection title="Limits">
            <ul className="list-disc list-inside space-y-2">
                <li><strong>Minimum Withdrawal:</strong> 100 Rs</li>
                <li><strong>Maximum Withdrawal:</strong> 25,000 Rs per day</li>
            </ul>
        </InfoSection>
        <InfoSection title="Supported Methods">
            <p>We support a wide range of local payment methods for your convenience:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 not-prose">
                <PaymentMethod name="JazzCash" icon={<JazzCashIcon />} />
                <PaymentMethod name="EasyPaisa" icon={<EasyPaisaIcon />} />
                <PaymentMethod name="NayaPay" icon={<NayaPayIcon />} />
                <PaymentMethod name="SadaPay" icon={<SadaPayIcon />} />
                <PaymentMethod name="UPaisa" icon={<UPaisaIcon />} />
                <PaymentMethod name="Bank Transfer" icon={<BankIcon />} />
            </div>
        </InfoSection>
    </>
);

export const DepositInfo = () => (
    <>
        <InfoSection title="Deposit Process">
            <p>To create tasks for other users, you can either use your earnings or deposit funds directly into your Earn Halal wallet. Follow the simple steps in the 'Deposit' section of your dashboard.</p>
            <p>All deposits are manually verified for security, which can take up to 1-2 hours. Once verified, the funds will be available in your account.</p>
        </InfoSection>
    </>
);

export const RefundPolicyInfo = () => (
    <>
        <InfoSection title="One-Time Joining Fee">
            <p>The one-time joining fee is non-refundable. This policy is in place to maintain a community of genuine users and cover administrative costs for account verification.</p>
        </InfoSection>
        <InfoSection title="Deposited Funds">
            <p>Funds deposited for creating tasks are non-refundable once a task campaign has been launched and funds have been allocated. If you wish to cancel a campaign that has not yet started, please contact support to discuss a potential wallet credit.</p>
        </InfoSection>
    </>
);

export const DisclaimerInfo = () => (
    <>
        <InfoSection title="Earnings Disclaimer">
            <p>Earn Halal provides a platform for users to earn rewards, but we do not guarantee any specific level of income. Earnings are dependent on the number of tasks available, the user's activity, and the rewards set by task creators.</p>
            <p>The platform is intended for supplementary income and should not be considered a primary source of employment or a "get rich quick" scheme.</p>
        </InfoSection>
        <InfoSection title="Third-Party Links">
            <p>Tasks may involve visiting third-party websites, channels, or social media pages. Earn Halal is not responsible for the content on these external sites. Users should proceed with caution and at their own discretion.</p>
        </InfoSection>
    </>
);

// A helper function to render the correct modal content
export const renderModalContent = (modalKey: string) => {
    switch (modalKey) {
        case 'how-it-works': return <HowItWorksView />;
        case 'about': return <AboutUsView />;
        case 'support': return <ContactUsView />;
        case 'privacy': return <PrivacyPolicyView />;
        case 'terms': return <TermsAndConditionsView />;
        case 'withdrawal': return <WithdrawalInfo />;
        case 'deposit': return <DepositInfo />;
        case 'refund': return <RefundPolicyInfo />;
        case 'disclaimer': return <DisclaimerInfo />;
        default: return null;
    }
};