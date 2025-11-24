
// components/LeaderboardView.tsx
import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { TrophyIcon, StarIcon, MedalIcon, CrownIcon, DiamondIcon } from './icons';

interface LeaderboardUser {
    id: string;
    username: string;
    level: number;
    balance: number;
    tasksCompletedCount: number;
}

const LeaderboardView: React.FC = () => {
    const [users, setUsers] = useState<LeaderboardUser[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                // Fetch top 30 users based on balance (common metric for earning apps)
                const q = query(
                    collection(db, "users"),
                    orderBy("balance", "desc"),
                    limit(30)
                );
                
                const snapshot = await getDocs(q);
                const fetchedUsers: LeaderboardUser[] = [];
                
                snapshot.forEach(doc => {
                    const data = doc.data();
                    // Fallback level calculation if field is missing in old users
                    let level = data.level || 1;
                    if (!data.level && data.tasksCompletedCount) {
                        level = data.tasksCompletedCount <= 10 ? 1 : Math.ceil((data.tasksCompletedCount - 10) / 10) + 1;
                        if (level > 15) level = 15;
                    }

                    fetchedUsers.push({
                        id: doc.id,
                        username: data.username || 'Anonymous',
                        level: level,
                        balance: data.balance || 0,
                        tasksCompletedCount: data.tasksCompletedCount || 0
                    });
                });
                
                setUsers(fetchedUsers);
            } catch (error) {
                console.error("Error fetching leaderboard:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    const getLevelIcon = (lvl: number) => {
        if (lvl >= 10) return <CrownIcon className="w-3 h-3 mr-1 text-amber-500" />;
        if (lvl >= 7) return <DiamondIcon className="w-3 h-3 mr-1 text-cyan-500" />;
        if (lvl >= 3) return <MedalIcon className="w-3 h-3 mr-1 text-orange-500" />;
        return <StarIcon className="w-3 h-3 mr-1 text-gray-400" />;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mint-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4 animate-fade-in pb-20">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-extrabold text-gray-900 flex items-center justify-center gap-3">
                    <TrophyIcon className="w-8 h-8 text-primary-500" />
                    Top 30 Earners
                </h2>
                <p className="text-gray-500">The highest performing users on TaskMint.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Rank</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Level</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Balance</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {users.map((user, index) => (
                                <tr key={user.id} className="hover:bg-mint-500/5 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold ${
                                            index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                            index === 1 ? 'bg-gray-100 text-gray-700' :
                                            index === 2 ? 'bg-orange-100 text-orange-800' :
                                            'text-gray-500'
                                        }`}>
                                            {index + 1}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-mint-500 to-mint-900 flex items-center justify-center text-white font-bold text-xs mr-3">
                                                {user.username.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="font-semibold text-gray-900">{user.username}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-mint-500/10 text-mint-900 border border-mint-500/20">
                                            {getLevelIcon(user.level)}
                                            Lvl {user.level}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-gray-900">
                                        {user.balance.toFixed(2)} Rs
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

export default LeaderboardView;
