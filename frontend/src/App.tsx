import React from 'react';
import { MantineProvider, AppShell, createTheme } from '@mantine/core';
import AppNavbar from './components/Navbar';

const theme = createTheme({
  primaryColor: 'blue',
  fontFamily: 'Arial, sans-serif',
});

function App() {
  return (
    <MantineProvider theme={theme}>
      <AppShell
        padding="md"
        navbar={{ width: 300, breakpoint: 'sm' }}
        styles={(theme) => ({
          main: {
            backgroundColor: theme.primaryColor === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0],
          },
        })}
      >
        <AppShell.Navbar p="md">
          <AppNavbar />
        </AppShell.Navbar>
        <AppShell.Main>
          <h1>Welcome to Soar</h1>
          <p>Your AI-driven mental health support platform.</p>
        </AppShell.Main>
      </AppShell>
    </MantineProvider>
  );
}

export default App;