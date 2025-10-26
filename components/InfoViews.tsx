import React from 'react';
import { CheckCircleIcon } from './icons';

const InfoCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-md mb-8 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-6 border-b pb-4 border-slate-200 dark:border-slate-700">{title}</h2>
        <div className="space-y-4 text-slate-600 dark:text-slate-300 prose prose-lg dark:prose-invert max-w-none">
            {children}
        </div>
    </div>
);

const InfoListItem: React.FC<{ title: string; children: React.ReactNode; }> = ({ title, children }) => (
     <li className="flex items-start gap-4">
        <CheckCircleIcon className="w-6 h-6 text-primary-500 mt-1 shrink-0" />
        <div>
            <h4 className="font-bold text-lg text-slate-800 dark:text-slate-100">{title}</h4>
            <p className="text-slate-600 dark:text-slate-300 mt-1">{children}</p>
        </div>
    </li>
)

export const HowItWorksView = () => (
    <InfoCard title="How It Works">
       <ul className="space-y-6 list-none p-0">
            <InfoListItem title="1. Sign Up & Verify">
                Create your account and complete the simple, one-time verification process to join our trusted community.
            </InfoListItem>
             <InfoListItem title="2. Complete Simple Tasks">
                Browse available tasks in the 'Earn' section. Follow easy instructions like visiting a website or liking a social media page.
            </InfoListItem>
             <InfoListItem title="3. Earn Rewards Instantly">
                Once you complete a task and submit proof, the reward amount is instantly added to your wallet balance. No waiting!
            </InfoListItem>
             <InfoListItem title="4. Create Your Own Tasks">
                Need more engagement for your brand? Use your earnings or deposit funds to create tasks for other users to complete.
            </InfoListItem>
             <InfoListItem title="5. Withdraw Your Earnings">
                Request a withdrawal of your earnings once you reach the minimum threshold. Payments are processed quickly to your preferred method.
            </InfoListItem>
       </ul>
    </InfoCard>
);

export const AboutUsView = () => (
    <InfoCard title="About Us">
        <p>Earn Halal is a platform dedicated to providing legitimate and ethical online earning opportunities. We believe in transparency, fairness, and upholding Halal principles in all our operations.</p>
        <p>Our mission is to connect individuals looking for simple online work with businesses and creators who need to boost their online presence. We ensure that all tasks on our platform are vetted and that payments are processed securely and on time.</p>
        <p>Join our community today and become a part of a trusted and growing network committed to integrity and mutual success.</p>
    </InfoCard>
);

export const ContactUsView = () => (
    <InfoCard title="Contact Us">
        <p>If you have any questions, concerns, or feedback, please don't hesitate to reach out to our support team.</p>
        <p><strong>Email:</strong> <a href="mailto:support@earnhalal.com" className="text-primary-500 hover:underline">support@earnhalal.com</a></p>
        <p>Our support team is available 24/7 to assist you with any issues you may encounter. We strive to respond to all inquiries within 24 hours.</p>
    </InfoCard>
);

export const PrivacyPolicyView = () => (
    <InfoCard title="Privacy Policy">
        <p>Your privacy is important to us. It is Earn Halal's policy to respect your privacy regarding any information we may collect from you across our website.</p>
        <p>We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent. We also let you know why we’re collecting it and how it will be used.</p>
        <p>We only retain collected information for as long as necessary to provide you with your requested service. What data we store, we’ll protect within commercially acceptable means to prevent loss and theft, as well as unauthorized access, disclosure, copying, use or modification.</p>
        <p>We don’t share any personally identifying information publicly or with third-parties, except when required to by law.</p>
    </InfoCard>
);

export const TermsAndConditionsView = () => (
    <InfoCard title="Terms & Conditions">
        <p>By accessing this website, you are agreeing to be bound by these website Terms and Conditions of Use, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.</p>
        <p>The materials contained in this website are protected by applicable copyright and trademark law.</p>
        <p>Permission is granted to temporarily download one copy of the materials on Earn Halal's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.</p>
        <p>This license shall automatically terminate if you violate any of these restrictions and may be terminated by Earn Halal at any time.</p>
    </InfoCard>
);