import React from 'react';
import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import HomePage from './components/HomePage/HomePage';
import ChatRoom from './components/ChatRoom/ChatRoom';
import { Header } from './components/Header/Header';
import { Resources } from './components/Resources/Resources';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <MantineProvider>
          <Header />
          <Routes>
            <Route path="/chat" element={<ChatRoom />} />
            <Route path="/resources" element={<Resources />} />
          </Routes>
        </MantineProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
