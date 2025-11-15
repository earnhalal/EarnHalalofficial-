// components/AIAgentChatbot.tsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";

const agentNames = ['Ayesha', 'Mahnoor', 'Hira', 'Anum', 'Zoya', 'Maryam'];

type Message = {
    id: number;
    text: string;
    sender: 'bot' | 'user';
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


const AIAgentChatbot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatSession = useRef<Chat | null>(null);

    const agentName = useMemo(() => agentNames[Math.floor(Math.random() * agentNames.length)], []);

    const initializeChat = () => {
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const systemInstruction = `You are a friendly and respectful customer support agent for a web app called 'Earn Halal'. Your name is ${agentName}.

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
                text: `Assalam o Alaikum 😊 Main ${agentName} hoon, Earn Halal Support se. Kis cheez mein madad chahiye?`,
                sender: 'bot'
            }]);
             setSuggestions(['Tasks kese karun?', 'Pese kese nikalun?', 'Referral ka system?']);
        }
    }, [isOpen]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);
    
    const handleToggle = () => {
        setIsOpen(prev => !prev);
    };
    
    const generateSuggestions = async (lastMessage: string) => {
        if (!chatSession.current) return;
        try {
             const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
             const suggestionPrompt = `Based on the user's last message: "${lastMessage}", provide exactly 3 very short, relevant follow-up questions they might ask in Roman Urdu. Respond with ONLY a valid JSON array of strings. Example: ["Withdrawal limit kia hai?", "Task ke rules?", "Jobs feature kia hai?"]`;
             
             const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: suggestionPrompt,
                config: { responseMimeType: 'application/json' }
             });

             const suggestionsArray = JSON.parse(response.text);
             if (Array.isArray(suggestionsArray) && suggestionsArray.every(s => typeof s === 'string')) {
                setSuggestions(suggestionsArray.slice(0, 3));
             }
        } catch (e) {
            console.error("Failed to generate suggestions:", e);
            setSuggestions(['Earning methods?', 'Withdrawal limit?', 'Aur batayen.']);
        }
    }

    const handleSendMessage = async (messageText: string) => {
        if (!messageText.trim() || isLoading) return;
        
        const userMessage: Message = { id: Date.now(), text: messageText, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setSuggestions([]);
        setIsLoading(true);

        if (!chatSession.current) {
            initializeChat();
        }

        await new Promise(resolve => setTimeout(resolve, 1200)); // Typing delay

        try {
            if (chatSession.current) {
                const stream = await chatSession.current.sendMessageStream({ message: messageText });
                
                let botResponse = '';
                const botMessageId = Date.now() + 1;
                let firstChunk = true;

                for await (const chunk of stream) {
                    botResponse += chunk.text;
                    if (firstChunk) {
                        setMessages(prev => [...prev, { id: botMessageId, text: botResponse, sender: 'bot' }]);
                        firstChunk = false;
                    } else {
                        setMessages(prev => prev.map(msg => msg.id === botMessageId ? { ...msg, text: botResponse } : msg));
                    }
                }
                
                await generateSuggestions(messageText);

            } else {
                 throw new Error("Chat session not available.");
            }
        } catch (error) {
            console.error("Gemini API Error:", error);
            setMessages(prev => [...prev, {id: Date.now(), text: "Sorry, I'm having trouble connecting. Please try again later.", sender: 'bot'}]);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <>
            <style>{`
                .chatbot-widget {
                    transform-origin: bottom right;
                    transition: transform 0.3s ease-out, opacity 0.3s ease-out;
                }
                .chatbot-icon {
                    transition: transform 0.3s ease-out, opacity 0.3s ease-out;
                }
                .message-bubble {
                    animation: slide-up 0.4s ease-out forwards;
                }
                @keyframes slide-up {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                 @keyframes pulse-glow {
                    0%, 100% {
                        box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.7);
                    }
                    70% {
                        box-shadow: 0 0 0 10px rgba(245, 158, 11, 0);
                    }
                }
                .animate-pulse-glow {
                    animation: pulse-glow 2s infinite;
                }
            `}</style>

            <div className={`chatbot-widget fixed bottom-24 right-4 sm:right-6 w-[calc(100%-2rem)] max-w-sm h-[70%] max-h-[500px] bg-gray-800 rounded-2xl shadow-2xl flex flex-col z-50 ${isOpen ? 'transform scale-100 opacity-100' : 'transform scale-90 opacity-0 pointer-events-none'}`}>
                <div className="flex-shrink-0 p-4 bg-gradient-to-r from-accent-600 to-yellow-500 text-white rounded-t-2xl flex items-center justify-between shadow-md">
                    <div>
                        <h3 className="font-bold text-lg">{agentName}</h3>
                        <div className="flex items-center gap-2">
                             <div className="w-2 h-2 bg-green-300 rounded-full"></div>
                             <p className="text-xs text-yellow-200">Online</p>
                        </div>
                    </div>
                    <button onClick={handleToggle} className="text-white hover:bg-white/20 rounded-full p-1 transition-colors">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                    </button>
                </div>
                
                <div className="flex-grow p-4 overflow-y-auto bg-gray-900/50 space-y-4">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`message-bubble max-w-xs md:max-w-md px-4 py-2 rounded-2xl shadow-sm ${msg.sender === 'user' ? 'bg-accent-500 text-white rounded-br-lg' : 'bg-gray-700 text-gray-200 rounded-bl-lg'}`}>
                                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && <TypingIndicator />}
                     <div ref={messagesEndRef} />
                </div>
                
                <div className="flex-shrink-0 p-4 border-t border-gray-700 space-y-3">
                    {suggestions.length > 0 && !isLoading && (
                        <div className="flex flex-wrap gap-2 justify-center">
                            {suggestions.map(option => (
                               <button key={option} onClick={() => handleSendMessage(option)} className="px-3 py-1.5 bg-gray-700 text-accent-300 rounded-full text-sm hover:bg-gray-600 transition-colors">
                                   {option}
                               </button>
                            ))}
                        </div>
                    )}
                    <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputValue); }} className="flex items-center gap-2">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Aap ka sawal..."
                            className="flex-1 w-full p-3 border-2 border-gray-600 rounded-full shadow-sm focus:ring-2 focus:ring-accent-500/80 focus:border-accent-500 bg-gray-700 text-gray-100 placeholder:text-gray-400"
                        />
                         <button type="submit" className="w-11 h-11 flex items-center justify-center bg-accent-500 text-white rounded-full hover:bg-accent-600 transition-colors shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                        </button>
                    </form>
                </div>
            </div>

            <button
                onClick={handleToggle}
                className={`chatbot-icon fixed bottom-4 right-4 sm:right-6 w-16 h-16 bg-gradient-to-br from-accent-500 to-yellow-500 text-white rounded-full shadow-2xl flex items-center justify-center z-50 animate-pulse-glow ${!isOpen ? 'transform scale-100 opacity-100' : 'transform scale-90 opacity-0 pointer-events-none'}`}
                aria-label="Open support chat"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            </button>
        </>
    );
};

export default AIAgentChatbot;