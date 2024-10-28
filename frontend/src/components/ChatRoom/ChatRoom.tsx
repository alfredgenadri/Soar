import { useState, useRef, useEffect } from 'react';
import { TextInput, Button, Paper, Text, Container, Title, Flex, Loader, ActionIcon, Image, ScrollArea, Stack, Grid } from '@mantine/core';
import { IconMicrophone, IconSend, IconPlus } from '@tabler/icons-react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { ConversationList } from './ConversationList';

interface Message {
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
  image?: string;
}

// Helper function to convert backend message format to frontend format
const convertBackendMessage = (message: any): Message => {
  return {
    sender: message.is_user ? 'user' : 'bot',
    text: message.content || message.text || '',  // Handle both formats
    timestamp: new Date(message.timestamp),
    image: message.image
  };
};

interface Conversation {
  id: string;
  messages: Message[];
  title: string;
  lastMessage: string;
  timestamp: Date;
}

const ChatRoom = () => {
  const { user } = useAuth();
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userMessage, setUserMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [streamingMessage, setStreamingMessage] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/chat/conversations/');
        setConversations(response.data);
        if (response.data.length > 0) {
          setActiveConversationId(response.data[0].id);
        }
      } catch (error) {
        console.error('Error fetching conversations:', error);
      }
    };

    if (user?.email) {
      fetchConversations();
    } else {
      // Reset states for guest users
      setConversations([]);
      setActiveConversationId(null);
      setCurrentConversation(null);
      setMessages([]);
    }
  }, [user]);

  useEffect(() => {
    const fetchConversationMessages = async () => {
      if (!activeConversationId) return;
      
      try {
        const selectedConversation = conversations.find(conv => conv.id === activeConversationId);
        if (selectedConversation) {
          setCurrentConversation(selectedConversation);
          // Ensure messages exist and convert them
          const messages = selectedConversation.messages || [];
          const convertedMessages = messages.map(msg => convertBackendMessage(msg));
          setMessages(convertedMessages);
        }
      } catch (error) {
        console.error('Error fetching conversation messages:', error);
      }
    };

    fetchConversationMessages();
  }, [activeConversationId, conversations]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
      setIsRecording(true); // Set recording state
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = async () => {
    if (!mediaRecorderRef.current || !isRecording) return;

    setIsRecording(false); // Stop recording
    setIsProcessing(true); // Start processing and disable button

    mediaRecorderRef.current.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
      const stream = mediaRecorderRef.current!.stream;
      stream.getTracks().forEach((track) => track.stop());

      try {
        await sendAudioToBackend(audioBlob);
      } finally {
        setIsProcessing(false); // Enable button after transcription
      }
    };

    mediaRecorderRef.current.stop();
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
        setUserMessage(response.data.text); // Display transcription in input field
      }
    } catch (error) {
      console.error('Error converting speech to text:', error);
    }
  };

  const handleNewConversation = async () => {
    try {
      const response = await axios.post('http://localhost:8000/api/chat/conversation/', {
        userId: user?.email
      });
      setConversations(prev => [response.data, ...prev]);
      setActiveConversationId(response.data.id);
    } catch (error) {
      console.error('Error creating new conversation:', error);
    }
  };

  const streamResponse = (fullText: string) => {
    setIsStreaming(true);
    let currentIndex = 0;
    
    const stream = () => {
      if (currentIndex < fullText.length) {
        setStreamingMessage(prev => prev + fullText[currentIndex]);
        currentIndex++;
        setTimeout(stream, 30); // Adjust speed as needed
      } else {
        setIsStreaming(false);
        setStreamingMessage('');
      }
    };
    
    stream();
  };

  const sendMessage = async () => {
    const trimmedMessage = userMessage.trim();
    if (trimmedMessage === '' || !currentConversation) return;

    const userMsg: Message = { 
      sender: 'user',
      text: trimmedMessage,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setUserMessage('');

    try {
      const response = await axios.post('http://localhost:8000/api/chat/message/', {
        conversationId: currentConversation.id,
        message: trimmedMessage,
        userId: user?.email,
        is_audio: false
      });

      setConversations(prev => prev.map(conv => 
        conv.id === currentConversation.id 
          ? {
              ...conv,
              lastMessage: trimmedMessage,
              timestamp: new Date(),
              messages: [...(conv.messages || []), userMsg]
            }
          : conv
      ));

      const botResponses = response.data;
      for (let i = 0; i < botResponses.length; i++) {
        const botMessage = {
          sender: 'bot' as const,
          text: botResponses[i].text || botResponses[i].content || '',
          timestamp: new Date(),
          image: botResponses[i].image
        };

        // Stream each bot message
        await new Promise<void>(resolve => {
          streamResponse(botMessage.text);
          
          const checkStreaming = setInterval(() => {
            if (!isStreaming) {
              clearInterval(checkStreaming);
              setMessages(prev => [...prev, botMessage]);
              setConversations(prev => prev.map(conv =>
                conv.id === currentConversation.id
                  ? {
                      ...conv,
                      lastMessage: botMessage.text,
                      timestamp: botMessage.timestamp,
                      messages: [...(conv.messages || []), botMessage]
                    }
                  : conv
              ));
              resolve();
            }
          }, 100);
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault(); // Prevent newline in input
      sendMessage();
    }
  };

  return (
    <Container fluid>
      <Grid>
        {user?.email && (
          <Grid.Col span={3}>
            <Paper shadow="xs" p="md" h="calc(100vh - 60px)">
              <ConversationList
                conversations={conversations}
                activeConversationId={activeConversationId}
                onConversationSelect={setActiveConversationId}
                onNewConversation={handleNewConversation}
              />
            </Paper>
          </Grid.Col>
        )}
        <Grid.Col span={user?.email ? 9 : 12}>
          <Paper shadow="md" radius="lg" p="xl">
            <Title order={2} mb="lg">
              Chat with Assistant
            </Title>

            {!currentConversation && (
              <Flex direction="column" align="center" justify="center" style={{ minHeight: '60vh' }}>
                <Text size="xl" mb="md">Start a new conversation</Text>
                <Button onClick={handleNewConversation} leftSection={<IconPlus size={20} />}>
                  New Chat
                </Button>
              </Flex>
            )}

            {currentConversation && (
              <>
                <ScrollArea style={{ height: 'calc(100vh - 250px)', marginBottom: '1rem' }}>
                  <Stack gap="md" p="md">
                    {messages.map((message, index) => (
                      <Flex
                        key={index}
                        align="flex-start"
                        justify={message.sender === 'user' ? 'flex-end' : 'flex-start'}
                        style={{ width: '100%' }}
                      >
                        <Paper
                          shadow="sm"
                          p="md"
                          style={{
                            maxWidth: '70%',
                            alignSelf: message.sender === 'user' ? 'flex-end' : 'flex-start',
                            backgroundColor: message.sender === 'user' ? '#e3f2fd' : '#f1f8e9',
                            borderRadius: message.sender === 'user' ? '20px 20px 5px 20px' : '20px 20px 20px 5px',
                          }}
                        >
                          <Stack gap="xs">
                            <Text 
                              size="sm" 
                              c={message.sender === 'user' ? 'blue.7' : 'green.7'}
                              style={{ whiteSpace: 'pre-wrap' }}
                            >
                              {message.text}
                            </Text>
                            {message.image && (
                              <Image
                                src={message.image}
                                alt="Bot response"
                                width={200}
                                height="auto"
                                fit="contain"
                              />
                            )}
                            <Text size="xs" c="dimmed" ta={message.sender === 'user' ? 'right' : 'left'}>
                              {formatTime(message.timestamp)}
                            </Text>
                          </Stack>
                        </Paper>
                      </Flex>
                    ))}
                    <div ref={messagesEndRef} />
                  </Stack>
                </ScrollArea>

                <Flex align="center" gap="sm">
                  <TextInput
                    value={userMessage}
                    onChange={(e) => setUserMessage(e.currentTarget.value)}
                    placeholder="Type your message..."
                    onKeyDown={handleKeyDown}
                    style={{ flex: 1 }}
                  />
                  <ActionIcon
                    variant="outline"
                    onMouseDown={startRecording}
                    onMouseUp={stopRecording}
                    size="lg"
                    disabled={isProcessing}
                  >
                    {isProcessing ? <Loader size="sm" /> : <IconMicrophone size={20} />}
                  </ActionIcon>
                  <Button onClick={sendMessage} leftSection={<IconSend size={18} />}>
                    Send
                  </Button>
                </Flex>
              </>
            )}
          </Paper>
        </Grid.Col>
      </Grid>
    </Container>
  );
};

export default ChatRoom;
