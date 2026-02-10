import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Recupero chiave in modo sicuro
const API_KEY = import.meta.env.VITE_GEMINI_KEY || "";

export default function App() {
  const [status, setStatus] = useState('MENU');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chat, setChat] = useState(null);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startGame = async () => {
    if (!API_KEY) {
      alert("Manca la API KEY su Netlify!");
      return;
    }

    setLoading(true);
    setStatus('PLAYING');

    try {
      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const newChat = model.startChat({ history: [] });
      setChat(newChat);

      const result = await newChat.sendMessage("Sei un Dungeon Master. Inizia l'avventura in una taverna.");
      const text = await result.response.text();
      setMessages([{ role: "model", text }]);
    } catch (e) {
      console.error(e);
      setMessages([{ role: "model", text: "Errore di connessione. Controlla la chiave API." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (input) => {
    if (!input.trim() || loading) return;
    setLoading(true);
    setMessages(prev => [...prev, { role: "user", text: input }]);

    try {
      const result = await chat.sendMessage(input);
      const text = await result.response.text();
      setMessages(prev => [...prev, { role: "model", text }]);
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { role: "model", text: "Errore nel ricevere risposta." }]);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'MENU') {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-950 text-amber-500">
        <h1 className="text-5xl font-bold mb-8">AI Dungeon Master</h1>
        <button onClick={startGame} className="bg-amber-700 text-white px-8 py-4 rounded-full font-bold hover:bg-amber-600">
          INIZIA
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-200 p-4">
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`p-4 rounded-lg ${m.role === 'user' ? 'bg-amber-900/20 ml-auto' : 'bg-slate-800 mr-auto'} max-w-[80%]`}>
            {m.text}
          </div>
        ))}
        {loading && <div className="text-amber-500 animate-pulse">Il DM pensa...</div>}
        <div ref={endRef} />
      </div>
      <form onSubmit={(e) => { e.preventDefault(); handleAction(e.target.elements.msg.value); e.target.reset(); }} className="flex gap-2">
        <input name="msg" className="flex-1 bg-slate-900 border border-slate-700 p-3 rounded-lg outline-none" placeholder="Cosa fai?" />
        <button className="bg-amber-700 px-6 py-3 rounded-lg font-bold">Invia</button>
      </form>
    </div>
  );
}