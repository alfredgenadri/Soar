import React from 'react';
import { MantineProvider, AppShell, createTheme, Container} from '@mantine/core';
import HomePage from './components/HomePage/HomePage';
import ChatRoom from './components/ChatRoom/ChatRoom';
import Navbar from './components/Navbar/Navbar';

import './App.css';
import './components/ChatRoom/ChatRoom.css'
import './components/HomePage/HomePage.css'
import './components/Navbar/Navbar.css'

const theme = createTheme({
  primaryColor: 'blue',
  fontFamily: 'Arial, sans-serif',
});

function App() {
  return (
    <MantineProvider>
      <Navbar></Navbar>
    <HomePage></HomePage>
    </MantineProvider>
  );
}

export default App;