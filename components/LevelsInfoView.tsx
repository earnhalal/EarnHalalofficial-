
// components/LevelsInfoView.tsx
import React from 'react';
import { StarIcon, CheckCircleIcon, CrownIcon, DiamondIcon, MedalIcon } from './icons';

const LEVEL_NAMES = [
    { level: 1, name: "Starter", tasks: "0-10", color: "text-gray-600", icon: <StarIcon className="w-5 h-5 text-gray-500" /> },
    { level: 2, name: "Rookie", tasks: "11-20", color: "text-green-600", icon: <StarIcon className="w-5 h-5 text-green-500" /> },
    { level: 3, name: "Bronze", tasks: "21-30", color: "text-orange-700", icon: <MedalIcon className="w-5 h-5 text-orange-700" /> },
    { level: 4, name: "Silver", tasks: "31-40", color: "text-gray-400", icon: <MedalIcon className="w-5 h-5 text-gray-400" /> },
    { level: 5, name: "Gold", tasks: "41-50", color: "text-yellow-500", icon: <MedalIcon className="w-5 h-5 text-yellow-500" /> },
    { level: 6, name: "Platinum", tasks: "51-60", color: "text-teal-500", icon: <MedalIcon className="w-5 h-5 text-teal-500" /> },
    { level: 7, name: "Diamond", tasks: "61-70", color: "text-cyan-500", icon: <DiamondIcon className="w-5 h-5 text-cyan-500" /> },
    { level: 8, name: "Master", tasks: "71-80", color: "text-purple-600", icon: <DiamondIcon className="w-5 h-5 text-purple-600" /> },
    { level: 9, name: "Grandmaster", tasks: "81-90", color: "text-red-600", icon: <DiamondIcon className="w-5 h-5 text-red-600" /> },
    { level: 10, name: "Elite", tasks: "91-100", color: "text-indigo-600", icon: <CrownIcon className="w-5 h-5 text-indigo-600" /> },
    { level: 11, name: "Champion", tasks: "101-110", color: "text-amber-600", icon: <CrownIcon className="w-5 h-5 text-amber-600" /> },
    { level: 12, name: "Legend", tasks: "111-120", color: "text-rose-600", icon: <CrownIcon className="w-5 h-5 text-rose-600" /> },
    { level: 13, name: "Titan", tasks: "121-130", color: "text-blue-700", icon: <CrownIcon className="w-5 h-5 text-blue-700" /> },
    { level: 14, name: "Immortal", tasks: "131-140", color: "text-fuchsia-600", icon: <CrownIcon className="w-5 h-5 text-fuchsia-600" /> },
    { level: 15, name: "God Mode", tasks: "141+", color: "text-red-500 animate-pulse", icon: <CrownIcon className="w-5 h-5 text-red-500" /> },
];

const LevelsInfoView: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto space-y-8 p-4 animate-fade-in pb-24">
            <div className="bg-gradient-to-r from-mint-900 to-gray-900 rounded-3xl p-8 text-white shadow-lg text-center">
                <div className="w-16 h-16 bg-mint-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white shadow-[0_0_20px_rgba(78,242,195,0.4)]">
                    <CrownIcon className="w-8 h-8" />
                </div>
                <h1 className="text-3xl font-extrabold mb-2">Level System Ranks</h1>
                <p className="text-mint-500 font-medium">Climb the ranks from Starter to God Mode!</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-subtle border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-mint-500/10 flex items-center justify-center text-mint-900 text-sm font-bold">1</span>
                        Progression
                    </h2>
                    <ul className="space-y-4">
                        <li className="flex items-start gap-3">
                            <CheckCircleIcon className="w-5 h-5 text-mint-500 mt-0.5 shrink-0" />
                            <p className="text-gray-600 text-sm">Start as a <strong>Starter</strong> and unlock new titles every 10 tasks.</p>
                        </li>
                        <li className="flex items-start gap-3">
                            <CheckCircleIcon className="w-5 h-5 text-mint-500 mt-0.5 shrink-0" />
                            <p className="text-gray-600 text-sm">Your level is displayed on the Leaderboard for everyone to see.</p>
                        </li>
                    </ul>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-subtle border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-mint-500/10 flex items-center justify-center text-mint-900 text-sm font-bold">2</span>
                        Rewards
                    </h2>
                     <ul className="space-y-4">
                        <li className="flex items-start gap-3">
                            <CheckCircleIcon className="w-5 h-5 text-mint-500 mt-0.5 shrink-0" />
                            <p className="text-gray-600 text-sm"><strong>Prestige:</strong> Earn exclusive icons like Diamonds and Crowns.</p>
                        </li>
                        <li className="flex items-start gap-3">
                            <CheckCircleIcon className="w-5 h-5 text-mint-500 mt-0.5 shrink-0" />
                            <p className="text-gray-600 text-sm"><strong>God Mode:</strong> Reach level 15 to unlock the ultimate status symbol.</p>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-subtle border border-gray-100 overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                    <h3 className="font-bold text-gray-900">Rank Hierarchy</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                            <tr>
                                <th className="px-6 py-3">Rank Name</th>
                                <th className="px-6 py-3">Tasks Required</th>
                                <th className="px-6 py-3 text-center">Icon</th>
                            </tr>
                        </thead>
                        <tbody>
                            {LEVEL_NAMES.map((lvl, i) => (
                                <tr key={lvl.level} className="border-b hover:bg-gray-50 transition-colors">
                                    <td className={`px-6 py-4 font-bold ${lvl.color}`}>{lvl.name}</td>
                                    <td className="px-6 py-4 text-gray-600">{lvl.tasks} Tasks</td>
                                    <td className="px-6 py-4 flex justify-center">
                                        {lvl.icon}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default LevelsInfoView;
