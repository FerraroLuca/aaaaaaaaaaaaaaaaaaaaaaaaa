import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";

// --- CONFIGURAZIONE AI ---
// Usiamo la chiave dalle variabili d'ambiente di Vite/Netlify
const API_KEY = import.meta.env.VITE_GEMINI_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

// Inizializzazione pulita del modello (senza istruzioni di sistema per evitare l'errore 400)
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash"
}, { apiVersion: 'v1' });

// --- COMPONENTI INTERNI ---
const Menu = ({ onStart }) => (
  <div className="flex flex-col items-center justify-center h-screen space-y-8 text-center p-6">
    <h1 className="text-6xl font-bold text-amber-500 fantasy-font drop-shadow-lg">
      AI Dungeon Master
    </h1>
    <button 
      onClick={onStart} 
      className="px-8 py-4 bg-amber-700 hover:bg-amber-600 text-white font-bold rounded-full transition-transform hover:scale-105 shadow-xl"
    >
      INIZIA L'AVVENTURA
    </button>
  </div>
);

const GameScreen = ({ messages, onAction, loading }) => {
  const [input, setInput] = useState("");
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4">
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-4 bg-slate-900/40 rounded-xl border border-slate-800">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`p-4 rounded-2xl max-w-[85%] ${
              m.role === 'user' 
                ? 'bg-amber-700/30 text-amber-100 border border-amber-600/30' 
                : 'bg-slate-800 text-slate-200 border border-slate-700'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="text-amber-500 animate-pulse fantasy-font p-2">
            Il Dungeon Master sta scrivendo...
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form 
        onSubmit={(e) => { 
          e.preventDefault(); 
          if(input.trim() && !loading){ 
            onAction(input); 
            setInput(""); 
          } 
        }} 
        className="flex gap-2"
      >
        <input 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          placeholder="Cosa fai?" 
          className="flex-1 bg-slate-900 border border-slate-700 p-4 rounded-xl focus:outline-none focus:border-amber-500" 
        />
        <button 
          disabled={loading} 
          className="bg-amber-700 px-6 py-4 rounded-xl font-bold hover:bg-amber-600 disabled:opacity-50 transition-colors"
        >
          Invia
        </button>
      </form>
    </div>
  );
};

// --- LOGICA PRINCIPALE ---
export default function App() {
  const [status, setStatus] = useState('MENU');
  const [messages, setMessages] = useState([]);
  const [chat, setChat] = useState(null);
  const [loading, setLoading] = useState(false);

  const startGame = async () => {
    setLoading(true);
    setStatus('PLAYING');
    
    try {
      // Inizializziamo la chat con un "prompt di sistema" simulato nella cronologia
      const newChat = model.startChat({
        history: [
          {
            role: "user",
            parts: [{ text: "Agisci come un Dungeon Master esperto di GDR fantasy. Rispondi in italiano. Sii epico, descrittivo ma conciso. Monitora implicitamente la mia salute." }],
          },
          {
            role: "model",
            parts: [{ text: "Certamente. Sono pronto a guidare la tua avventura." }],
          }
        ],
      });
      
      setChat(newChat);

      // Inizio effettivo della storia
      const result = await newChat.sendMessage("Inizia l'avventura: mi trovo in una taverna fumosa. Chi sono e cosa vedo?");
      setMessages([{ role: "model", text: result.response.text() }]);
    } catch (error) {
      console.error("Errore AI:", error);
      setMessages([{ role: "model", text: "Errore nella creazione del mondo. Verifica la tua API Key su Netlify." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (text) => {
    setLoading(true);
    // Aggiungiamo subito il messaggio dell'utente alla lista
    setMessages(prev => [...prev, { role: "user", text }]);
    
    try {
      const result = await chat.sendMessage(text);
      const responseText = result.response.text();
      setMessages(prev => [...prev, { role: "model", text: responseText }]);
    } catch (e) {
      console.error("Errore durante l'azione:", e);
      setMessages(prev => [...prev, { role: "model", text: "(Il DM sembra confuso... riprova l'azione.)" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-amber-500/30">
      {status === 'MENU' ? (
        <Menu onStart={startGame} />
      ) : (
        <GameScreen messages={messages} onAction={handleAction} loading={loading} />
      )}
    </div>
  );
}