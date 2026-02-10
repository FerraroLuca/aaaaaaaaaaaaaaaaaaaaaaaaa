import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_KEY;

console.log("DEBUG: VERSIONE CODICE 2.0 - ORA USO V1");

// Log di debug: apparirà nella console F12 del sito online
console.log("Versione API caricata. Chiave presente:", !!API_KEY);

const genAI = new GoogleGenerativeAI(API_KEY);

const model = genAI.getGenerativeModel({ 
  model: "gemini-1.5-flash" 
}, { apiVersion: 'v1' });

const Menu = ({ onStart }) => (
  <div className="flex flex-col items-center justify-center h-screen space-y-8 text-center p-6">
    <h1 className="text-6xl font-bold text-amber-500 fantasy-font drop-shadow-lg">AI Dungeon Master</h1>
    <button onClick={onStart} className="px-8 py-4 bg-amber-700 hover:bg-amber-600 text-white font-bold rounded-full transition-transform hover:scale-105 shadow-xl">
      INIZIA L'AVVENTURA
    </button>
  </div>
);

const GameScreen = ({ messages, onAction, loading }) => {
  const [input, setInput] = useState("");
  const endRef = useRef(null);
  useEffect(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), [messages]);

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4">
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-4 bg-slate-900/40 rounded-xl border border-slate-800">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`p-4 rounded-2xl max-w-[85%] ${m.role === 'user' ? 'bg-amber-700/30 text-amber-100 border border-amber-600/30' : 'bg-slate-800 text-slate-200 border border-slate-700'}`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && <div className="text-amber-500 animate-pulse p-2">Il DM sta scrivendo...</div>}
        <div ref={endRef} />
      </div>
      <form onSubmit={(e) => { e.preventDefault(); if(input.trim() && !loading){ onAction(input); setInput(""); } }} className="flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Cosa fai?" className="flex-1 bg-slate-900 border border-slate-700 p-4 rounded-xl text-white outline-none focus:border-amber-500" />
        <button disabled={loading} className="bg-amber-700 px-6 py-4 rounded-xl font-bold hover:bg-amber-600 disabled:opacity-50">Invia</button>
      </form>
    </div>
  );
};

export default function App() {
  const [status, setStatus] = useState('MENU');
  const [messages, setMessages] = useState([]);
  const [chat, setChat] = useState(null);
  const [loading, setLoading] = useState(false);

const startGame = async () => {
  setLoading(true);
  setStatus('PLAYING');
  try {
    const newChat = model.startChat({ history: [] });
    setChat(newChat);

    const result = await newChat.sendMessage("Ciao! Sei un Dungeon Master. Inizia l'avventura.");
    const response = await result.response;
    setMessages([{ role: "model", text: response.text() }]);
  } catch (e) {
    console.error("ERRORE:", e);
    // Invece di chiamare handleEmergencyStart, mostriamo un errore chiaro
    setMessages([{ 
      role: "model", 
      text: "Errore 404: Google non trova il modello. Per favore, genera una NUOVA chiave API su Google AI Studio e aggiornala su Netlify." 
    }]);
  } finally {
    setLoading(false);
  }
};

  const handleAction = async (text) => {
    setLoading(true);
    setMessages(prev => [...prev, { role: "user", text }]);
    try {
      const result = await chat.sendMessage(text);
      setMessages(prev => [...prev, { role: "model", text: result.response.text() }]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {status === 'MENU' ? <Menu onStart={startGame} /> : <GameScreen messages={messages} onAction={handleAction} loading={loading} />}
    </div>
  );
}