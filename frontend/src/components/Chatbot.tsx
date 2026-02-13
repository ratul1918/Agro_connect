import React, { useState } from 'react';
import { chatWithAI } from '../api/endpoints';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

const Chatbot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ role: string, content: string }[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        if (!input.trim()) return;
        const userMsg = input;
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setInput('');
        setLoading(true);

        try {
            // Auto-detect language or default to Bangla for farmer
            const res = await chatWithAI({ query: userMsg, lang: 'bn' });
            setMessages(prev => [...prev, { role: 'ai', content: res.data.response }]);
        } catch (err) {
            setMessages(prev => [...prev, { role: 'ai', content: 'Connection Error' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-5 right-5 z-50">
            {!isOpen && (
                <Button onClick={() => setIsOpen(true)} className="rounded-full h-16 w-16 text-xl">💬</Button>
            )}
            {isOpen && (
                <div className="bg-white w-80 h-96 shadow-xl rounded-lg flex flex-col overflow-hidden">
                    <div className="bg-green-600 text-white p-3 flex justify-between items-center">
                        <span className="font-bold">Agro AI</span>
                        <button onClick={() => setIsOpen(false)}>X</button>
                    </div>
                    <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-gray-50">
                        {messages.map((m, i) => (
                            <div key={i} className={`p-2 rounded max-w-[80%] ${m.role === 'user' ? 'bg-green-500 text-white self-end ml-auto' : 'bg-gray-200 text-black'}`}>
                                {m.content}
                            </div>
                        ))}
                        {loading && <div className="text-gray-400 text-sm">Thinking...</div>}
                    </div>
                    <div className="p-3 border-t flex gap-2">
                        <Input value={input} onChange={e => setInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSend()} placeholder="Ask in Bangla..." />
                        <Button onClick={handleSend} disabled={loading}>→</Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chatbot;
