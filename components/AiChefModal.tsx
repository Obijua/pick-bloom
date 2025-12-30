
import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Sparkles, ChefHat, Loader2, AlertCircle } from 'lucide-react';
import { useAi } from '../context/AiContext';
import { GoogleGenAI } from "@google/genai";

interface Message {
  role: 'user' | 'model';
  text: string;
}

// Safe environment variable access for browser
const getApiKey = () => {
  if (typeof process !== 'undefined' && process.env) {
    return process.env.API_KEY;
  }
  return undefined;
};

const AiChefModal: React.FC = () => {
  const { isAiOpen, closeAiChef, initialQuery } = useAi();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAiOpen) {
      if (initialQuery) {
        setMessages([{ role: 'user', text: initialQuery }]);
        generateResponse(initialQuery);
      } else if (messages.length === 0) {
        setMessages([{ 
            role: 'model', 
            text: "Hello! I'm your Farmers Market Sous Chef. 👨‍🍳\n\nI can help you with:\n• Recipes for seasonal produce\n• Storage tips for your veggies\n• Meal planning ideas\n\nWhat are we cooking today?" 
        }]);
      }
    }
  }, [isAiOpen, initialQuery]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const generateResponse = async (prompt: string) => {
    setIsLoading(true);
    try {
        const apiKey = getApiKey();

        // --- DEMO MODE FALLBACK ---
        if (!apiKey) {
            await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network latency
            
            let mockResponse = "I am running in **Demo Mode** (No API Key provided).\n\n";
            const lowerPrompt = prompt.toLowerCase();

            if (lowerPrompt.includes('recipe') || lowerPrompt.includes('cook')) {
                mockResponse += "Here is a fresh idea for you:\n\n**Farm Fresh Stir-Fry**\n* Mixed seasonal vegetables\n* Garlic & Ginger\n* Soy Sauce\n* Olive Oil\n\n1. Chop all veggies.\n2. Sauté garlic in oil.\n3. Toss in veggies and stir-fry for 5 mins.\n4. Season and serve hot!";
            } else if (lowerPrompt.includes('storage') || lowerPrompt.includes('keep')) {
                mockResponse += "**Storage Tip:**\nKeep your leafy greens wrapped in a damp paper towel inside a container in the fridge. This keeps them crisp for up to a week!";
            } else {
                mockResponse += "I can help you find delicious recipes for your farm produce. Try asking: 'How do I cook kale?' or 'Recipe for tomatoes'.";
            }
            
            setMessages(prev => [...prev, { role: 'model', text: mockResponse }]);
            return;
        }
        // --------------------------

        const ai = new GoogleGenAI({ apiKey });
        
        const systemInstruction = `You are a warm, knowledgeable, and practical 'Sous Chef' for a local Farmers Market application. 
        Your goal is to help customers cook fresh, seasonal ingredients.
        - If asked for a recipe, provide a concise title, list of ingredients, and simple numbered steps.
        - Suggest pairings with other common farm ingredients (like eggs, dairy, herbs).
        - Keep responses encouraging and formatted nicely.
        - Do not mention non-food topics.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
            }
        });

        const text = response.text;
        
        setMessages(prev => [...prev, { role: 'model', text: text || "I couldn't find a recipe for that, but I'd love to help with something else!" }]);
    } catch (error) {
        console.error("AI Error", error);
        setMessages(prev => [...prev, { role: 'model', text: "Oops! My recipe book is stuck. Please check your internet connection or try again." }]);
    } finally {
        setIsLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    await generateResponse(userMsg);
  };

  if (!isAiOpen) return null;

  const formatText = (text: string) => {
    return text.split('\n').map((line, i) => {
        if (line.trim().startsWith('##') || line.trim().startsWith('**')) {
            return <p key={i} className="font-bold text-primary-800 mt-2 mb-1">{line.replace(/#/g, '').replace(/\*\*/g, '')}</p>;
        }
        if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
            return <li key={i} className="ml-4 list-disc text-gray-700">{line.replace(/^[\*\-] /, '')}</li>;
        }
        return <p key={i} className="mb-1 text-gray-700 leading-relaxed min-h-[1rem]">{line}</p>;
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={closeAiChef}
      />
      
      <div className="relative bg-white w-full max-w-lg h-[600px] max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-scale-in ring-1 ring-white/20">
        {/* Header */}
        <div className="bg-[#143f17] p-4 flex items-center justify-between text-white shrink-0">
            <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-full">
                    <ChefHat className="h-6 w-6" />
                </div>
                <div>
                    <h2 className="font-serif font-bold text-lg">Chef Gemini</h2>
                    <p className="text-xs text-primary-100 flex items-center gap-1">
                        <Sparkles className="h-3 w-3" /> Powered by AI
                    </p>
                </div>
            </div>
            <button 
                onClick={closeAiChef}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
                <X className="h-5 w-5" />
            </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {!getApiKey() && messages.length === 1 && (
                <div className="p-3 bg-yellow-50 text-yellow-800 text-xs rounded-lg flex items-start gap-2 border border-yellow-100">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <p>API Key missing. Running in simulated demo mode.</p>
                </div>
            )}
            {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div 
                        className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${
                            msg.role === 'user' 
                            ? 'bg-[#143f17] text-white rounded-br-none' 
                            : 'bg-white border border-gray-100 rounded-bl-none'
                        }`}
                    >
                        {msg.role === 'user' ? (
                            <p>{msg.text}</p>
                        ) : (
                            <div className="text-sm">
                                {formatText(msg.text)}
                            </div>
                        )}
                    </div>
                </div>
            ))}
            {isLoading && (
                <div className="flex justify-start">
                    <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-none p-4 shadow-sm flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-primary-600" />
                        <span className="text-sm text-gray-500">Chef is thinking...</span>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-100 shrink-0">
            <form onSubmit={handleSend} className="relative flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about recipes, ingredients..."
                    className="flex-1 pl-4 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
                    disabled={isLoading}
                />
                <button 
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="bg-[#f49f17] text-white p-3 rounded-xl hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                    <Send className="h-5 w-5" />
                </button>
            </form>
        </div>
      </div>
    </div>
  );
};

export default AiChefModal;
