// components/Header.tsx
import React, { useState, useEffect } from 'react';
import type { View } from '../types';
import { MenuIcon, GiftIcon } from './icons';

// --- Data for Dynamic Notifications ---
const names = [
    'Ahmed', 'Fatima', 'Ali', 'Ayesha', 'Zainab', 'Bilal', 'Hassan', 'Sana', 'Usman', 'Maryam', 'Abdullah', 'Khadija',
    'Omer', 'Hira', 'Saad', 'Zoya', 'Hamza', 'Rabia', 'Haris', 'Mahnoor', 'Imran', 'Amna', 'Faisal', 'Nida', 'Kamran',
    'Saba', 'Junaid', 'Iqra', 'Asif', 'Hina', 'Salman', 'Sidra', 'Tariq', 'Farah', 'Nadeem', 'Kinza', 'Waqar', 'Aiman',
    'Yasir', 'Saima', 'Shahid', 'Beenish', 'Adnan', 'Madiha', 'Rizwan', 'Sobia', 'Zeeshan', 'Alina', 'Arif', 'Samina',
    'Danish', 'Nazia', 'Irfan', 'Fozia', 'Majid', 'Rukhsar', 'Nasir', 'Sonia', 'Raheel', 'Arooj', 'Kashif', 'Shazia',
    'Tahir', 'Mehreen', 'Waseem', 'Laiba', 'Zahid', 'Anum', 'Babar', 'Hafsa', 'Ehsan', 'Iram', 'Gohar', 'Javeria',
    'Shakeel', 'Sadia', 'Atif', 'Ambreen', 'Farhan', 'Mishal', 'Javed', 'Noreen', 'Mubashir', 'Rabia', 'Qaiser', 'Saira',
    'Saleem', 'Tayyaba', 'Umar', 'Uzma', 'Wasif', 'Zain', 'Abid', 'Fariha', 'Ejaz', 'Gul', 'Fahad', 'Huma', 'Jamal', 'Lubna',
    'Mohsin', 'Nadia', 'Owais', 'Qurat', 'Rehan', 'Sanam', 'Taimoor', 'Wajiha', 'Zubair', 'Aqsa', 'Basit', 'Erum',
    'Furqan', 'Hania', 'Ismail', 'Komal', 'Mansoor', 'Naheed', 'Parvez', 'Rida', 'Shehzad', 'Tooba', 'Waheed', 'Zara',
    'Abrar', 'Benish', 'Dilawar', 'Faiza', 'Ghaffar', 'Hira', 'Jibran', 'Laila', 'Mustafa', 'Naila', 'Qasim', 'Ramsha',
    'Sohail', 'Tehmina', 'Usama', 'Warda', 'Yousuf', 'Aalia', 'Bisma', 'Dawod', 'Fakhra', 'Ghulam', 'Humaira', 'Ilyas',
    'Kiran', 'Mehwish', 'Noman', 'Qandeel', 'Rauf', 'Shabnam', 'Talha', 'Vaneeza', 'Yahya', 'Afshan', 'Buraq', 'Durdana',
    'Fiza', 'Hammad', 'Inam', 'Jahanzaib', 'Kanza', 'Moin', 'Neelam', 'Qamar', 'Rizwana', 'Sultan', 'Tanzil', 'Wania',
    'Zohaib', 'Anila', 'Bilqees', 'Ehtisham', 'Farkhanda', 'Habib', 'Iffat', 'Jalil', 'Marium', 'Nighat', 'Raheela',
    'Sarfaraz', 'Tanzeela', 'Yaqoob', 'Azhar', 'Bushra', 'Farooq', 'Hameed', 'Israr', 'Khawar', 'Musarrat', 'Naveed',
    'Rehana', 'Sikandar', 'Yasmin'
];
const amounts = [100, 250, 500, 750, 1000, 1250, 2000, 50, 150, 300, 600, 900, 1500, 2500];
const eventTemplates = [
  { action: 'earned', source: 'from Spin & Win!' },
  { action: 'earned', source: 'by completing a Task!' },
  { action: 'received a deposit of', source: '' },
  { action: 'processed a withdrawal of', source: '' },
  { action: 'earned', source: 'from a Referral Bonus!' }
];

interface HeaderProps {
  username: string;
  setIsSidebarOpen: (isOpen: boolean) => void;
  setActiveView: (view: View) => void;
}

const Header: React.FC<HeaderProps> = ({ username, setIsSidebarOpen, setActiveView }) => {
  const [isBannerVisible, setIsBannerVisible] = useState(true);
  const [notificationMessage, setNotificationMessage] = useState('🔔 Welcome to TaskMint! See what others are earning.');
  const [isNotificationAnimating, setIsNotificationAnimating] = useState(true);

  useEffect(() => {
    const notificationInterval = setInterval(() => {
      // Trigger fade-out animation
      setIsNotificationAnimating(false);

      // After the fade-out completes, update the content and trigger fade-in
      setTimeout(() => {
        const randomName = names[Math.floor(Math.random() * names.length)];
        const randomAmount = amounts[Math.floor(Math.random() * amounts.length)];
        const randomEvent = eventTemplates[Math.floor(Math.random() * eventTemplates.length)];
        
        const message = `🔔 ${randomName} just ${randomEvent.action} <strong>Rs ${randomAmount}</strong> ${randomEvent.source}`;
        
        setNotificationMessage(message);
        setIsNotificationAnimating(true); // Trigger fade-in animation
      }, 500); // This duration must match the CSS transition duration
    }, 4000); // Change notification every 4 seconds

    return () => clearInterval(notificationInterval);
  }, []); // Empty dependency array ensures this effect runs only once

  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-20 shadow-sm">
      {isBannerVisible && (
        <div className="bg-emerald-500 text-white text-sm font-medium p-2 text-center relative">
          <span 
            className={`transition-opacity duration-500 ${isNotificationAnimating ? 'opacity-100' : 'opacity-0'}`}
            dangerouslySetInnerHTML={{ __html: notificationMessage }}
          />
          <button onClick={() => setIsBannerVisible(false)} className="absolute top-1/2 right-3 -translate-y-1/2 text-white/70 hover:text-white">&times;</button>
        </div>
      )}
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-2">
           <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-gray-600">
                <MenuIcon className="w-6 h-6" />
            </button>
            <svg width="36" height="36" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="40" height="40" rx="8" fill="url(#paint0_linear_header)"/>
                <path d="M12 10H20C22.2091 10 24 11.7909 24 14V16C24 18.2091 22.2091 20 20 20H12V10Z" fill="white" fillOpacity="0.5"/>
                <path d="M12 22H28V30H12V22Z" fill="white"/>
                <defs>
                    <linearGradient id="paint0_linear_header" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#10b981"/>
                        <stop offset="1" stopColor="#059669"/>
                    </linearGradient>
                </defs>
            </svg>
            <span className="font-bold text-lg text-emerald-700">TaskMint</span>
        </div>
        <div className="flex items-center gap-3">
            <button onClick={() => setActiveView('SPIN_WHEEL')} className="text-gray-600 p-2 rounded-full hover:bg-gray-200">
                <GiftIcon className="w-6 h-6" />
            </button>
            <button onClick={() => setActiveView('PROFILE_SETTINGS')}>
                <img src={`https://api.dicebear.com/8.x/initials/svg?seed=${username}`} alt="User Profile" className="w-9 h-9 rounded-full border-2 border-emerald-500" />
            </button>
        </div>
      </div>
    </header>
  );
};

export default Header;