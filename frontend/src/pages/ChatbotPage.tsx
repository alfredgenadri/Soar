import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ChatbotPage = () => {
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if JWT token exists, if not redirect to login
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/'); // Redirect to login if token is missing
    } else {
      // Get the username from localStorage
      const storedUsername = localStorage.getItem('username');
      if (storedUsername) {
        setUsername(storedUsername);
      }
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token'); // Remove JWT token from localStorage
    localStorage.removeItem('username'); // Remove the username
    navigate('/', { replace: true }); // Redirect to login page and replace history
  };

  return (
    <div>
      <h1>Welcome to the MisAmigos Support Chatbot</h1>
      {username && <h1>Currently logged in as: <strong>{username}</strong></h1>}
      {/* Chatbot interface can be added here */}
      
      {/* Logout Button */}
      <button onClick={handleLogout} className="btn btn-danger">
        Logout
      </button>
    </div>
  );
};

export default ChatbotPage;
