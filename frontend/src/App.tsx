import React from 'react';
import { MantineProvider, AppShell, createTheme, Container} from '@mantine/core';
import HomePage from './components/HomePage/HomePage';
import ChatRoom from './components/ChatRoom/ChatRoom';

import './App.css';
import './components/ChatRoom/ChatRoom.css'

const theme = createTheme({
  primaryColor: 'blue',
  fontFamily: 'Arial, sans-serif',
});

function App() {
  return (
    <MantineProvider>
    <ChatRoom></ChatRoom>
    </MantineProvider>
  );
}

export default App;