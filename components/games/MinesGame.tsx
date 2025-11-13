// components/games/MinesGame.tsx
import React, { useState, useMemo } from 'react';
import { BombIcon } from '../icons';

interface MinesGameProps {
    balance: number;
    onWin: (amount: number, gameName: string) => void;
    onLoss: (amount: number, gameName: string) => void;
}

type GameState = 'betting' | 'playing' | 'busted' | 'cashed_out';
type Tile = { isMine: boolean; isRevealed: boolean };

const GRID_SIZE = 25;

const MinesGame: React.FC<MinesGameProps> = ({ balance, onWin, onLoss }) => {
    const [gameState, setGameState] = useState<GameState>('betting');
    const [betAmount, setBetAmount] = useState(10);
    const [mineCount, setMineCount] = useState(3);
    const [grid, setGrid] = useState<Tile[]>([]);
    const [revealedCount, setRevealedCount] = useState(0);

    const multiplier = useMemo(() => {
        if (revealedCount === 0) return 1;
        // A simple multiplier formula
        const safeTiles = GRID_SIZE - mineCount;
        let mult = 1;
        for (let i = 0; i < revealedCount; i++) {
            mult *= (GRID_SIZE - i) / (safeTiles - i);
        }
        return Math.max(1, mult * 0.95); // 95% payout to house
    }, [revealedCount, mineCount]);

    const handleStartGame = () => {
        if (betAmount > balance) {
            alert("Insufficient balance.");
            return;
        }
        onLoss(betAmount, "Mines");
        setRevealedCount(0);

        const newGrid = Array(GRID_SIZE).fill(0).map(() => ({ isMine: false, isRevealed: false }));
        let minesPlaced = 0;
        while (minesPlaced < mineCount) {
            const index = Math.floor(Math.random() * GRID_SIZE);
            if (!newGrid[index].isMine) {
                newGrid[index].isMine = true;
                minesPlaced++;
            }
        }
        setGrid(newGrid);
        setGameState('playing');
    };
    
    const handleTileClick = (index: number) => {
        if (gameState !== 'playing' || grid[index].isRevealed) return;

        const newGrid = [...grid];
        newGrid[index].isRevealed = true;
        
        if (newGrid[index].isMine) {
            setGameState('busted');
            // Reveal all mines
            setGrid(newGrid.map(tile => ({ ...tile, isRevealed: tile.isMine ? true : tile.isRevealed })));
        } else {
            setRevealedCount(prev => prev + 1);
            setGrid(newGrid);
        }
    };

    const handleCashOut = () => {
        if (gameState !== 'playing' || revealedCount === 0) return;
        const winnings = betAmount * multiplier;
        onWin(winnings, "Mines");
        setGameState('cashed_out');
         // Reveal all mines
        setGrid(grid.map(tile => ({ ...tile, isRevealed: tile.isMine ? true : tile.isRevealed })));
    };
    
    const handlePlayAgain = () => {
        setGameState('betting');
        setGrid([]);
    };

    const isGameOver = gameState === 'busted' || gameState === 'cashed_out';

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="lg:col-span-1 bg-slate-800 p-4 rounded-xl shadow-lg flex flex-col gap-4">
                <h2 className="text-xl font-bold text-center">Game Controls</h2>
                <div>
                    <label className="block text-sm font-semibold text-slate-400 mb-1">Bet Amount (Rs)</label>
                    <input type="number" value={betAmount} onChange={e => setBetAmount(Math.max(1, parseInt(e.target.value) || 1))} disabled={gameState !== 'betting'} className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md"/>
                </div>
                 <div>
                    <label className="block text-sm font-semibold text-slate-400 mb-1">Mines</label>
                    <div className="grid grid-cols-4 gap-2">
                        {[3, 5, 7, 10].map(count => (
                            <button key={count} onClick={() => setMineCount(count)} disabled={gameState !== 'betting'} className={`p-2 rounded-md font-bold ${mineCount === count ? 'bg-red-500 text-white' : 'bg-slate-700'}`}>{count}</button>
                        ))}
                    </div>
                </div>
                {gameState === 'betting' && (
                    <button onClick={handleStartGame} className="w-full p-3 bg-green-600 font-bold rounded-lg">Start Game</button>
                )}
                {gameState === 'playing' && (
                     <button onClick={handleCashOut} disabled={revealedCount === 0} className="w-full p-3 bg-amber-500 font-bold rounded-lg disabled:bg-slate-600">Cash Out</button>
                )}
                {isGameOver && (
                     <button onClick={handlePlayAgain} className="w-full p-3 bg-blue-600 font-bold rounded-lg">Play Again</button>
                )}

                 <div className="bg-slate-900/50 p-3 rounded-lg text-center mt-auto">
                    <p className="text-sm text-slate-400">Current Multiplier</p>
                    <p className="text-3xl font-bold text-green-400">{multiplier.toFixed(2)}x</p>
                     <p className="text-sm text-slate-400 mt-2">Potential Win</p>
                    <p className="text-lg font-bold text-amber-400">{(betAmount * multiplier).toFixed(2)} Rs</p>
                </div>
            </div>

            <div className="lg:col-span-2 bg-slate-800 p-4 rounded-xl shadow-lg relative">
                <div className="grid grid-cols-5 gap-2">
                    {(gameState === 'betting' ? Array(GRID_SIZE).fill(0) : grid).map((tile, i) => (
                        <button 
                            key={i} 
                            onClick={() => handleTileClick(i)}
                            disabled={gameState !== 'playing' || tile.isRevealed}
                            className="aspect-square rounded-md bg-slate-700 hover:bg-slate-600 transition-colors disabled:opacity-100 disabled:cursor-default"
                        >
                            {tile.isRevealed && (
                                tile.isMine ? <BombIcon className="w-8 h-8 mx-auto text-red-500" /> : <span className="text-2xl">💎</span>
                            )}
                        </button>
                    ))}
                </div>
                {isGameOver && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded-xl">
                        <div className="text-center">
                             <h3 className={`text-5xl font-extrabold ${gameState === 'cashed_out' ? 'text-green-400' : 'text-red-500'}`}>
                                {gameState === 'cashed_out' ? `You Won!` : 'Game Over!'}
                             </h3>
                             {gameState === 'cashed_out' && <p className="text-2xl font-bold text-white mt-2">{(betAmount*multiplier).toFixed(2)} Rs</p>}
                             <button onClick={handlePlayAgain} className="mt-6 px-6 py-2 bg-blue-600 font-bold rounded-lg">Play Again</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MinesGame;