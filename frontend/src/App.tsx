import React from 'react';
import { MantineProvider, AppShell, createTheme } from '@mantine/core';
import AppNavbar from './components/Navbar';
import HomePage from './components/HomePage';
import './App.css';

const theme = createTheme({
  primaryColor: 'blue',
  fontFamily: 'Arial, sans-serif',
});

function App() {
  return (
    <HomePage></HomePage>
  );
}

export default App;