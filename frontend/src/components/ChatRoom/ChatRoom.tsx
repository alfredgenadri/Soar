import { useState, useRef, useEffect, useCallback } from 'react';
import { TextInput, Button, Paper, Text, Container, Title, ActionIcon, Loader } from '@mantine/core';
import { IconMicrophone, IconSend } from '@tabler/icons-react';
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
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
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

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      
      audioChunksRef.current = [];
      recorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = async () => {
    if (!mediaRecorderRef.current || !isRecording) return;

    return new Promise<void>((resolve) => {
      mediaRecorderRef.current!.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const stream = mediaRecorderRef.current!.stream;
        stream.getTracks().forEach(track => track.stop());
        
        setIsProcessing(true);
        try {
          await sendAudioToBackend(audioBlob);
        } finally {
          setIsProcessing(false);
        }
        
        resolve();
      };

      mediaRecorderRef.current!.stop();
      setIsRecording(false);
    });
  };

  const sendAudioToBackend = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob);

      const response = await axios.post('http://localhost:8000/api/chat/speech-to-text/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.text) {
        setUserMessage(response.data.text);
      }
    } catch (error) {
      console.error('Error converting speech to text:', error);
    }
  };

  const handleMouseDown = async () => {
    await startRecording();
  };

  const handleMouseUp = async () => {
    await stopRecording();
  };

  const handleTouchStart = async (e: React.TouchEvent) => {
    e.preventDefault();
    await startRecording();
  };

  const handleTouchEnd = async (e: React.TouchEvent) => {
    e.preventDefault();
    await stopRecording();
  };

  const sendMessage = async () => {
    if (userMessage.trim() === '') return;

    const timestamp = new Date();
    setMessages(prev => [...prev, { sender: 'user', text: userMessage, timestamp }]);

    try {
      // Send message to your backend instead of Rasa directly
      const response = await axios.post('http://localhost:8000/api/chat/message/', {
        message: userMessage,
      });

      // Handle bot responses
      const botResponses = response.data;
      for (let i = 0; i < botResponses.length; i++) {
        setTimeout(() => {
          setMessages(prev => [...prev, {
            sender: 'bot',
            text: botResponses[i].content,
            image: botResponses[i].image,
            timestamp: new Date()
          }]);
        }, i * 500);
      }
    } catch (error) {
      console.error('Error sending message:', error);
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
          <div className="input-wrapper">
            <TextInput
              value={userMessage}
              onChange={(e) => setUserMessage(e.currentTarget.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="message-input"
            />
            <ActionIcon
              className={`mic-button ${isRecording ? 'recording' : ''}`}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              size="lg"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader size="sm" color="#270062" />
              ) : (
                <IconMicrophone 
                  size={24} 
                  style={{ 
                    transform: isRecording ? 'scale(1.1)' : 'scale(1)',
                    transition: 'transform 0.2s ease'
                  }} 
                />
              )}
            </ActionIcon>
          </div>
          <Button 
            onClick={sendMessage}
            className="send-button"
            leftSection={<IconSend size={20} />}
          >
            Send
          </Button>
        </div>
      </Paper>
    </Container>
  );
};

export default ChatRoom;
