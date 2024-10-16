import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainMenuPage from './pages/MainMenuPage';
import AuthPage from './pages/AuthPage';
import ChatbotPage from './pages/ChatbotPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainMenuPage />} /> {/* Main menu page as default */}
        <Route path="/login" element={<AuthPage />} /> {/* Login/Register page */}
        <Route path="/chatbot" element={<ChatbotPage />} /> {/* Chatbot page */}
      </Routes>
    </Router>
  );
}

export default App;
