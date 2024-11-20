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
import classes from './components/SkipLink/SkipLink.module.css';

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <AuthProvider>
          <MantineProvider>
            <a href="#main-content" className={classes.skipLink}>
              Skip to main content
            </a>
            <Header />
            <main id="main-content">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/chat" element={<ChatRoom />} />
                <Route path="/resources" element={<Resources />} />
              </Routes>
            </main>
          </MantineProvider>
        </AuthProvider>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;
