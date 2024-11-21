import React from 'react';
import '@mantine/core/styles.css';
import '@mantine/carousel/styles.css';
import '@mantine/notifications/styles.css';
import { MantineProvider, createTheme } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import HomePage from './components/HomePage/HomePage';
import ChatRoom from './components/ChatRoom/ChatRoom';
import { Header } from './components/Header/Header';
import { Resources } from './components/Resources/Resources';
import { LanguageProvider } from './contexts/LanguageContext';
import classes from './components/SkipLink/SkipLink.module.css';

const theme = createTheme({
  components: {
    Notification: {
      styles: {
        root: { zIndex: 10000 }
      }
    }
  }
});

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <AuthProvider>
          <MantineProvider theme={theme}>
            <Notifications position="top-center" zIndex={10000} />
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
