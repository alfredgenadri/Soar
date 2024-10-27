import { useState, useRef, useEffect } from 'react';
import { TextInput, Button, Paper, Text, Container, Title } from '@mantine/core';
import axios from 'axios';
import './ChatRoom.css';

interface Message {
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
  image?: string;
}

const ChatRoom = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userMessage, setUserMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const sendMessage = async () => {
    if (userMessage.trim() === '') return;

    const timestamp = new Date();
    setMessages(prev => [...prev, { sender: 'user', text: userMessage, timestamp }]);

    try {
      const response = await axios.post('http://localhost:5005/webhooks/rest/webhook', {
        sender: 'user',
        message: userMessage,
      });

      // Add bot's responses with slight delays for better readability
      const botResponses = response.data;
      for (let i = 0; i < botResponses.length; i++) {
        setTimeout(() => {
          setMessages(prev => [...prev, {
            sender: 'bot',
            text: botResponses[i].text,
            image: botResponses[i].image, // Add image support
            timestamp: new Date()
          }]);
        }, i * 500);
      }
    } catch (error) {
      console.error('Error communicating with Rasa:', error);
    }

    setUserMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  const isConsecutiveBot = (index: number) => {
    return index > 0 && 
           messages[index].sender === 'bot' && 
           messages[index - 1].sender === 'bot';
  };

  return (
    <Container size="lg" className="chat-container">
      <Paper shadow="md" radius="lg" className="chat-paper">
        <Title order={2} className="chat-title">Chat with Soar Assistant</Title>
        
        <div className="messages-container">
          {messages.map((message, index) => (
            <div 
              key={index} 
              className={`message-wrapper ${message.sender}-message-wrapper`}
            >
              <div className={`message ${message.sender}-message ${
                isConsecutiveBot(index) ? 'bot-message-consecutive' : ''
              }`}>
                <Text>{message.text}</Text>
                {message.image && (
                  <img 
                    src={message.image} 
                    alt="Bot response" 
                    className="message-image"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                )}
                <div className="timestamp">{formatTime(message.timestamp)}</div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="input-container">
          <TextInput
            value={userMessage}
            onChange={(e) => setUserMessage(e.currentTarget.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="message-input"
          />
          <Button 
            onClick={sendMessage}
            className="send-button"
          >
            Send
          </Button>
        </div>
      </Paper>
    </Container>
  );
};

export default ChatRoom;
