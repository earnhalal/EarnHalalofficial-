
// components/AIAgentChatbot.tsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import { ArrowUpCircleIcon, CloseIcon, SparklesIcon } from './icons';

const agentNames = ['Ayesha', 'Mahnoor', 'Hira', 'Anum', 'Zoya', 'Maryam'];

type Message = {
    id: number;
    text: string;
    sender: 'bot' | 'user';
}

interface AIAgentChatbotProps {
    isOpen: boolean;
    onClose: () => void;
}

const TypingIndicator: React.FC = () => (
    <div className="flex justify-start">
        <div className="px-4 py-2 rounded-2xl bg-gray-700 rounded-bl-lg">
            <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce-short"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce-short delay-150"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce-short delay-300"></div>
            </div>
        </div>
        <style>{`
            @keyframes bounce-short {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-5px); }
            }
            .animate-bounce-short { animation: bounce-short 1s infinite ease-in-out; }
            .delay-150 { animation-delay: 0.15s; }
            .delay-300 { animation-delay: 0.3s; }
        `}</style>
    </div>
);


const AIAgentChatbot: React.FC<AIAgentChatbotProps> = ({ isOpen, onClose }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatSession = useRef<Chat | null>(null);

    const agentName = useMemo(() => agentNames[Math.floor(Math.random() * agentNames.length)], []);

    const initializeChat = () => {
        try {
            const apiKey = process.env.API_KEY;
            if (!apiKey) {
                console.error("API_KEY is not set in environment variables.");
                setMessages(prev => [...prev, {id: Date.now(), text: "Sorry, the AI chat service is not configured.", sender: 'bot'}]);
                return;
            }
            const ai = new GoogleGenAI({ apiKey });
            const systemInstruction = `You are a friendly and respectful customer support agent for a web app called 'TaskMint'. Your name is ${agentName}.

**Core Instructions:**
1.  **Language:** You MUST ALWAYS respond in Roman Urdu, naturally mixing in simple English words (like 'task', 'withdraw', 'balance').
2.  **Tone:** Be helpful, polite, and encouraging. Start the first conversation with 'Assalam o Alaikum'. Keep answers concise and to the point.
3.  **Privacy is CRITICAL:** You must NEVER ask for or share any personal user information like username, email, phone number, password, or financial details. If a user asks for help with their specific account, you MUST direct them to the official support email: support@earnhalal.com. Do not try to solve personal account issues.

**App Knowledge Base:**
*   **Main Goal:** Users earn money by completing simple online tasks. It is a platform for supplementary income, not a get-rich-quick scheme.
*   **Earning Methods:**
    *   **Tasks:** Visit websites, subscribe to YouTube, like Facebook pages, follow on Instagram/TikTok. Found in the 'Earn' section.
    *   **Spin & Win:** Users get one free spin daily. They can also buy more spins for 5 Rs to win bigger prizes.
    *   **Referrals:** Two-level system. Level 1 (direct referral) earns the user 20 Rs. Level 2 (friend of a friend) earns the user 5 Rs.
*   **Creating Tasks:** Users can spend their earnings or deposit money to create their own tasks for others to complete. This is for promoting their own content.
*   **Wallet & Money:**
    *   **Joining Fee:** There is a one-time joining fee of 50 Rs to ensure serious users. This is non-refundable.
    *   **Deposits:** Users can deposit money. Verification can take 1-2 hours.
    *   **Withdrawals:** Minimum withdrawal is 100 Rs. Supported methods are JazzCash, EasyPaisa, NayaPay, SadaPay, UPaisa, and Bank Transfer. Processing takes 24-48 hours.
*   **Jobs Feature:**
    *   This is a separate, premium feature. Users must subscribe to a plan to apply for jobs.
    *   Plans: Starter (500 Rs, 5 applications/day), Growth (1000 Rs, 15 applications/day), Business & Enterprise (unlimited applications).
*   **Security:** Users can set a 4-digit PIN for their wallet to secure withdrawals.`;
            
            chatSession.current = ai.chats.create({
                model: 'gemini-2.5-flash',
                config: { systemInstruction },
            });
        } catch(e) {
            console.error("Failed to initialize AI Chat:", e);
            setMessages(prev => [...prev, {id: Date.now(), text: "Sorry, the chat service is currently unavailable.", sender: 'bot'}]);
        }
    };
    
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            initializeChat();
            setMessages([{
                id: 1,
                text: `Assalam o Alaikum 😊 Main ${agentName} hoon, TaskMint Support se. Kis cheez mein madad chahiye?`,
                sender: 'bot'
            }]);
             setSuggestions(['Tasks kese karun?', 'Pese kese nikalun?', 'Referral ka system?']);
        }
    }, [isOpen]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);
    
    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;
        const userMessage = inputValue.trim();
        setInputValue('');
        setSuggestions([]); // Clear suggestions on user input

        setMessages(prev => [...prev, { id: Date.now(), text: userMessage, sender: 'user' }]);
        setIsLoading(true);

        try {
            if (!chatSession.current) {
                // Try initializing if not ready (e.g. key issue resolved)
                initializeChat();
                if (!chatSession.current) throw new Error("Chat session not initialized");
            }

            const result = await chatSession.current.sendMessage({ message: userMessage });
            const botResponse = result.text; // Using standard property for Gemini SDK

            setMessages(prev => [...prev, { id: Date.now() + 1, text: botResponse || "Sorry, I didn't get that.", sender: 'bot' }]);
        } catch (error) {
            console.error("Chat Error:", error);
            setMessages(prev => [...prev, { id: Date.now() + 1, text: "Internet issue lag raha hai. Dobara try karen.", sender: 'bot' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSendMessage();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed bottom-20 right-4 z-50 w-80 sm:w-96 h-[500px] bg-slate-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-700 animate-fade-in-up">
            {/* Header */}
            <div className="bg-slate-800 p-4 flex items-center justify-between border-b border-slate-700">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                            <SparklesIcon className="w-6 h-6" />
                        </div>
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-800"></div>
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-sm">{agentName}</h3>
                        <p className="text-xs text-slate-400">Support Agent</p>
                    </div>
                </div>
                <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                    <CloseIcon className="w-6 h-6" />
                </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900 custom-scrollbar">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                            msg.sender === 'user' 
                            ? 'bg-amber-500 text-white rounded-br-none shadow-md' 
                            : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'
                        }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {isLoading && <TypingIndicator />}
                <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            {suggestions.length > 0 && !isLoading && (
                <div className="px-4 py-2 bg-slate-900 flex gap-2 overflow-x-auto no-scrollbar">
                    {suggestions.map((s, i) => (
                        <button 
                            key={i} 
                            onClick={() => { setInputValue(s); setTimeout(handleSendMessage, 0); }}
                            className="whitespace-nowrap px-3 py-1 bg-slate-800 text-amber-400 text-xs rounded-full border border-amber-500/30 hover:bg-slate-700 transition-colors"
                        >
                            {s}
                        </button>
                    ))}
                </div>
            )}

            {/* Input Area */}
            <div className="p-4 bg-slate-800 border-t border-slate-700 flex gap-2">
                <input 
                    type="text" 
                    value={inputValue} 
                    onChange={(e) => setInputValue(e.target.value)} 
                    onKeyDown={handleKeyDown}
                    placeholder="Type your question..." 
                    className="flex-1 bg-slate-900 text-white text-sm rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 border border-slate-700"
                />
                <button 
                    onClick={handleSendMessage} 
                    disabled={isLoading || !inputValue.trim()}
                    className="bg-amber-500 text-white p-2 rounded-xl hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <ArrowUpCircleIcon className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
};

export default AIAgentChatbot;
