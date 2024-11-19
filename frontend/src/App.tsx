import React from 'react';
import '@mantine/core/styles.css';
import '@mantine/carousel/styles.css';
import { MantineProvider } from '@mantine/core';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import HomePage from './components/HomePage/HomePage';
import ChatRoom from './components/ChatRoom/ChatRoom';
import { Header } from './components/Header/Header';
import { Resources } from './components/Resources/Resources';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <AuthProvider>
          <ThemeProvider>
            <MantineProvider>
              <Header />
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/chat" element={<ChatRoom />} />
                <Route path="/resources" element={<Resources />} />
              </Routes>
            </MantineProvider>
          </ThemeProvider>
        </AuthProvider>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;
