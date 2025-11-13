// components/games/LotteryGame.tsx
import React, { useState, useEffect } from 'react';

interface LotteryGameProps {
    balance: number;
    onWin: (amount: number, gameName: string) => void;
    onLoss: (amount: number, gameName: string) => void;
}

const TICKET_PRICE = 20;
const TOTAL_NUMBERS = 30;
const NUMBERS_TO_PICK = 5;

const LotteryGame: React.FC<LotteryGameProps> = ({ balance, onWin, onLoss }) => {
    const [selectedNumbers, setSelectedNumbers] = useState<Set<number>>(new Set());
    const [userTickets, setUserTickets] = useState<number[][]>([]);
    const [winningNumbers, setWinningNumbers] = useState<number[]>([]);
    const [lastResult, setLastResult] = useState<string | null>(null);
    const [timeLeft, setTimeLeft] = useState(3600); // 1 hour draw cycle

    const getInitialState = () => {
        const savedState = localStorage.getItem('lotteryGameState');
        if (savedState) {
            const { tickets, drawnNumbers, result, expiry } = JSON.parse(savedState);
            if (new Date().getTime() < expiry) {
                setUserTickets(tickets || []);
                setWinningNumbers(drawnNumbers || []);
                setLastResult(result || null);
                return;
            }
        }
        // If expired or no state, start fresh
        handleDraw(true); // Initial draw without checking winnings
    };

    const saveState = (tickets: number[][], drawnNumbers: number[], result: string | null) => {
        // FIX: Replaced `new Date().getTime()` with `Date.now()` and fixed arithmetic operation for clarity and to address potential type issues.
        const expiry = Date.now() + 3600 * 1000;
        localStorage.setItem('lotteryGameState', JSON.stringify({ tickets, drawnNumbers, result, expiry }));
    };

    useEffect(() => {
        getInitialState();
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    handleDraw(false);
                    return 3600;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const handleNumberSelect = (num: number) => {
        const newSelection = new Set(selectedNumbers);
        if (newSelection.has(num)) {
            newSelection.delete(num);
        } else if (newSelection.size < NUMBERS_TO_PICK) {
            newSelection.add(num);
        }
        setSelectedNumbers(newSelection);
    };

    const handleBuyTicket = () => {
        if (selectedNumbers.size !== NUMBERS_TO_PICK) {
            alert(`Please select exactly ${NUMBERS_TO_PICK} numbers.`);
            return;
        }
        if (balance < TICKET_PRICE) {
            alert("Insufficient balance to buy a ticket.");
            return;
        }
        onLoss(TICKET_PRICE, "Daily Lottery");
        // FIX: Added explicit types to sort callback parameters to resolve potential type inference errors.
        const newTickets = [...userTickets, Array.from(selectedNumbers).sort((a: number, b: number) => a - b)];
        setUserTickets(newTickets);
        setSelectedNumbers(new Set());
        saveState(newTickets, winningNumbers, lastResult);
    };

    const handleDraw = (isInitial = false) => {
        const drawnNumbers: Set<number> = new Set();
        while (drawnNumbers.size < NUMBERS_TO_PICK) {
            drawnNumbers.add(Math.floor(Math.random() * TOTAL_NUMBERS) + 1);
        }
        // FIX: Added explicit types to sort callback parameters to resolve potential type inference errors.
        const winningNumbersArray = Array.from(drawnNumbers).sort((a: number, b: number) => a - b);
        setWinningNumbers(winningNumbersArray);

        let totalWinnings = 0;
        let finalMessage = "No winning tickets this round. Better luck next time!";
        
        if (!isInitial) {
             userTickets.forEach(ticket => {
                const matches = ticket.filter(num => drawnNumbers.has(num)).length;
                let prize = 0;
                switch (matches) {
                    case 3: prize = 50; break;
                    case 4: prize = 500; break;
                    case 5: prize = 10000; break;
                }
                totalWinnings += prize;
            });

            if (totalWinnings > 0) {
                onWin(totalWinnings, "Daily Lottery");
                finalMessage = `Congratulations! You won a total of ${totalWinnings.toFixed(2)} Rs!`;
            }
        } else {
             finalMessage = "Welcome! Previous round numbers are shown. Buy tickets for the next draw.";
        }
       
        setLastResult(finalMessage);
        setUserTickets([]);
        saveState([], winningNumbersArray, finalMessage);
    };

    const formatTime = (seconds: number) => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="bg-slate-900/50 backdrop-blur-md border border-purple-500/20 p-6 rounded-2xl shadow-2xl text-center">
                <h2 className="text-3xl md:text-4xl font-extrabold text-slate-100 mb-2">Daily Lottery Jackpot</h2>
                <p className="text-slate-300 mb-4">Pick 5 numbers. Match them all to win <span className="font-bold text-amber-400">10,000 Rs!</span></p>
                <div className="bg-slate-800/50 p-3 rounded-xl inline-flex flex-col items-center">
                    <span className="text-sm font-semibold text-slate-400">Next Draw In</span>
                    <span className="text-3xl font-bold text-amber-400">{formatTime(timeLeft)}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-800 p-6 rounded-xl shadow-lg">
                    <h3 className="font-bold text-xl mb-4 text-slate-100">1. Pick Your Numbers</h3>
                    <div className="grid grid-cols-6 gap-2">
                        {Array.from({ length: TOTAL_NUMBERS }, (_, i) => i + 1).map(num => (
                            <button
                                key={num}
                                onClick={() => handleNumberSelect(num)}
                                className={`w-12 h-12 rounded-full font-bold text-lg transition-all flex items-center justify-center ${
                                    selectedNumbers.has(num) 
                                    ? 'bg-amber-500 text-white ring-2 ring-white' 
                                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                }`}
                            >
                                {num}
                            </button>
                        ))}
                    </div>
                    <div className="mt-6">
                        <div className="bg-slate-900/50 p-3 rounded-lg min-h-[56px] flex items-center justify-center gap-2">
                            <span className="text-slate-400 mr-2">Your picks:</span>
                            {/* FIX: Added explicit types to sort callback parameters to resolve potential type inference errors. */}
                            {Array.from(selectedNumbers).sort((a: number, b: number) => a - b).map(num => (
                                <span key={num} className="w-8 h-8 flex items-center justify-center bg-amber-500 text-white rounded-full font-bold">{num}</span>
                            ))}
                        </div>
                         <button 
                            onClick={handleBuyTicket} 
                            disabled={selectedNumbers.size !== NUMBERS_TO_PICK}
                            className="w-full mt-4 p-4 bg-purple-600 text-white rounded-lg text-xl font-bold hover:bg-purple-700 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed"
                        >
                            Buy Ticket ({TICKET_PRICE} Rs)
                        </button>
                    </div>
                </div>

                 <div className="bg-slate-800 p-6 rounded-xl shadow-lg space-y-4">
                    <div>
                        <h3 className="font-bold text-xl mb-2 text-slate-100">Last Winning Numbers</h3>
                        <div className="flex justify-center gap-2">
                            {winningNumbers.map(num => (
                                <div key={num} className="w-12 h-12 flex items-center justify-center bg-green-500 text-white rounded-full font-bold text-lg shadow-md">{num}</div>
                            ))}
                        </div>
                        {lastResult && <p className="text-center mt-3 text-amber-300 font-semibold">{lastResult}</p>}
                    </div>
                     <div className="border-t border-slate-700 pt-4">
                        <h3 className="font-bold text-xl mb-2 text-slate-100">Your Tickets for Next Draw</h3>
                        {userTickets.length > 0 ? (
                            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                                {userTickets.map((ticket, i) => (
                                     <div key={i} className="bg-slate-700/50 p-2 rounded-md flex justify-center gap-2">
                                         {ticket.map(num => <span key={num} className="w-8 h-8 flex items-center justify-center bg-purple-500 text-white rounded-full font-semibold">{num}</span>)}
                                     </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-400 text-center py-4">You have no tickets for the next draw.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LotteryGame;
