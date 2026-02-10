import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css' // Se hai stili globali aggiuntivi

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)