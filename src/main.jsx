import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import $ from 'jquery';

// Gắn vào global scope để Luckysheet dùng được
window.$ = $;
window.jQuery = $;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
