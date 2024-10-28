import React from 'react';
import '@mantine/core/styles.css';
import { MantineProvider, createTheme } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import HomePage from './components/HomePage/HomePage';
import ChatRoom from './components/ChatRoom/ChatRoom';
import { Navbar } from './components/Navbar/Navbar';
import { Header } from './components/Header/Header';


function App() {
  return (
    <MantineProvider>
      <Header></Header>
      <ChatRoom></ChatRoom>
    </MantineProvider>
  );
}

export default App;
