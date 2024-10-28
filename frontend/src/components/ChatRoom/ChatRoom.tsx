import { useState, useRef, useEffect } from 'react';
import { TextInput, Button, Paper, Text, Container, Title, Flex, Loader, ActionIcon, Image, ScrollArea, Stack, Grid, Box } from '@mantine/core';
import { IconMicrophone, IconSend, IconPlus } from '@tabler/icons-react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { ConversationList } from './ConversationList';


interface Message {
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
  image?: string;
  user_email?: string;
}

// Helper function to convert backend message format to frontend format
const convertBackendMessage = (message: any): Message => {
  return {
    sender: message.user_email ? 'user' : 'bot',
    text: message.content || message.text || '',
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


  console.log(messages);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/chat/conversations/?email=${user?.email}`);
        
        if (response.data.length > 0) {
          const conversationsWithParsedDates = response.data.map((conv: any) => ({
            ...conv,
            timestamp: new Date(conv.timestamp),
            messages: conv.messages.map((msg: any) => ({
              ...msg,
              sender: msg.user_email ? 'user' : 'bot',
              text: msg.content || msg.text || '',
              timestamp: new Date(msg.timestamp),
              user_email: msg.user_email
            }))
          }));
          
          setConversations(conversationsWithParsedDates);
          setActiveConversationId(conversationsWithParsedDates[0].id);
          setCurrentConversation(conversationsWithParsedDates[0]);
          setMessages(conversationsWithParsedDates[0].messages);
        }
      } catch (error) {
        console.error('Error fetching conversations:', error);
      }
    };

    if (user?.email) {
      fetchConversations();
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

  const streamResponse = async (fullText: string): Promise<void> => {
    return new Promise((resolve) => {
      setIsStreaming(true);
      let currentIndex = 0;
      const streamInterval = setInterval(() => {
        if (currentIndex < fullText.length) {
          setStreamingMessage(prev => prev + fullText[currentIndex]);
          currentIndex++;
        } else {
          clearInterval(streamInterval);
          setIsStreaming(false);
          setStreamingMessage('');
          resolve();
        }
      }, 30);
    });
  };

  const sendMessage = async () => {
    const trimmedMessage = userMessage.trim();
    if (trimmedMessage === '' || !currentConversation) return;

    const userMsg: Message = {
      sender: 'user',
      text: trimmedMessage,
      timestamp: new Date(),
      user_email: user?.email || 'guest'
    };

    setMessages(prev => [...prev, userMsg]);
    setUserMessage('');

    try {
      const response = await axios.post('http://localhost:8000/api/chat/message/', {
        conversationId: currentConversation.id,
        message: trimmedMessage,
        userId: user?.email || 'guest',
        is_audio: false,
        is_user: true,
        user_email: user?.email || 'guest'
      });

      // Update conversations with user message
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
      for (const botResponse of botResponses) {
        const botMessage = {
          sender: 'bot' as const,
          text: botResponse.text || botResponse.content || '',
          timestamp: new Date(),
          image: botResponse.image
        };

        // Wait for streaming to complete before adding message
        await streamResponse(botMessage.text);
        
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
                        direction="row"
                        justify={message.sender === 'user' ? 'flex-end' : 'flex-start'}
                        w="100%"
                      >
                        <Box
                          style={{
                            maxWidth: '70%',
                            width: 'auto',
                            marginLeft: message.sender === 'user' ? 'auto' : '0',
                            marginRight: message.sender === 'user' ? '0' : 'auto'
                          }}
                        >
                          <Paper
                            shadow="sm"
                            p="md"
                            style={{
                              backgroundColor: message.sender === 'user' ? '#e3f2fd' : '#f1f8e9',
                              borderRadius: message.sender === 'user' ? '20px 20px 5px 20px' : '20px 20px 20px 5px',
                            }}
                          >
                            <Stack gap="xs">
                              <Text 
                                size="sm" 
                                c={message.sender === 'user' ? 'blue.7' : 'green.7'}
                                style={{
                                  textAlign: 'left'
                                }}
                              >
                                {message.text}
                              </Text>
                              {message.image && (
                                <Box style={{ width: '100%', marginTop: '8px' }}>
                                  <Image
                                    src={message.image}
                                    alt="Bot response"
                                    style={{ 
                                      maxWidth: '100%',
                                      height: 'auto',
                                      borderRadius: '8px'
                                    }}
                                  />
                                </Box>
                              )}
                              <Text 
                                size="xs" 
                                c="dimmed" 
                                style={{
                                  textAlign: message.sender === 'user' ? 'right' : 'left'
                                }}
                              >
                                {formatTime(message.timestamp)}
                              </Text>
                            </Stack>
                          </Paper>
                        </Box>
                      </Flex>
                    ))}
                    {isStreaming && (
                      <Flex
                        direction="row"
                        justify="flex-start"
                        w="100%"
                      >
                        <Box
                          style={{
                            maxWidth: '70%',
                            width: 'auto',
                            marginRight: 'auto'
                          }}
                        >
                          <Paper
                            shadow="sm"
                            p="md"
                            style={{
                              backgroundColor: '#f1f8e9',
                              borderRadius: '20px 20px 20px 5px'
                            }}
                          >
                            <Text size="sm" c="green.7">
                              {streamingMessage}
                            </Text>
                          </Paper>
                        </Box>
                      </Flex>
                    )}
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
