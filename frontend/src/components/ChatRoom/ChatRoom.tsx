import { useState, useRef, useEffect } from 'react';
import { TextInput, Button, Paper, Text, Container, Title, Flex, Loader, ActionIcon, Image, ScrollArea, Stack, Grid, Box } from '@mantine/core';
import { IconMicrophone, IconSend, IconPlus } from '@tabler/icons-react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { ConversationList } from './ConversationList';
import { notifications } from '@mantine/notifications';
import { useLanguage } from '../../contexts/LanguageContext';


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

interface ConversationResponse {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string;
  messages: Array<{
    content?: string;
    text?: string;
    user_email?: string;
    timestamp: string;
  }>;
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
  const { t } = useLanguage();


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
          
          // If there's an active conversation, update its messages
          if (activeConversationId) {
            const activeConv = conversationsWithParsedDates.find((conv: Conversation) => conv.id === activeConversationId);
            if (activeConv) {
              setCurrentConversation(activeConv);
              setMessages(activeConv.messages);
            }
          } else {
            // Set the first conversation as active if none is selected
            setActiveConversationId(conversationsWithParsedDates[0].id);
            setCurrentConversation(conversationsWithParsedDates[0]);
            setMessages(conversationsWithParsedDates[0].messages);
          }
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
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setIsProcessing(true);
        
        const formData = new FormData();
        formData.append('audio', audioBlob);

        try {
          const response = await axios.post('http://localhost:8000/api/chat/speech-to-text/', formData);
          if (response.data.text) {
            setUserMessage(response.data.text);
          }
        } catch (error) {
          notifications.show({
            title: 'Error',
            message: 'Failed to convert speech to text',
            color: 'red',
          });
        } finally {
          setIsProcessing(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to access microphone',
        color: 'red',
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
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

  const refreshConversations = async () => {
    try {
      const response = await axios.get<ConversationResponse[]>(
        `http://localhost:8000/api/chat/conversations/?email=${user?.email}`
      );
      
      if (response.data.length > 0) {
        const conversationsWithParsedDates: Conversation[] = response.data.map((conv: ConversationResponse) => ({
          ...conv,
          timestamp: new Date(conv.timestamp),
          messages: conv.messages.map((msg): Message => ({
            ...msg,
            sender: msg.user_email ? ('user' as const) : ('bot' as const),
            text: msg.content || msg.text || '',
            timestamp: new Date(msg.timestamp),
            user_email: msg.user_email
          }))
        }));
        
        setConversations(conversationsWithParsedDates);
        
        // Update current conversation if it's active
        if (activeConversationId) {
          const activeConv = conversationsWithParsedDates.find((conv: Conversation) => conv.id === activeConversationId);
          if (activeConv) {
            setCurrentConversation(activeConv);
            setMessages(activeConv.messages);
          }
        }
      }
    } catch (error) {
      console.error('Error refreshing conversations:', error);
    }
  };

  const sendMessage = async () => {
    const trimmedMessage = userMessage.trim();
    if (trimmedMessage === '' || !currentConversation || isProcessing) return;

    try {
        setIsProcessing(true);
        setUserMessage('');
        setStreamingMessage('');
        setIsStreaming(true);

        const userMsg = {
            sender: 'user' as const,
            text: trimmedMessage,
            timestamp: new Date(),
            user_email: user?.email || 'guest'
        };

        setMessages(prev => [...prev, userMsg]);

        const response = await fetch('http://localhost:8000/api/chat/message/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                conversationId: currentConversation.id,
                message: trimmedMessage,
                user_email: user?.email || 'guest'
            })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const reader = response.body?.getReader();
        let fullResponse = '';

        if (reader) {
            try {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = new TextDecoder().decode(value);
                    const lines = chunk.split('\n');
                    
                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const data = JSON.parse(line.slice(5));
                            if (data.error) {
                                throw new Error(data.error);
                            }
                            
                            // Add each character with a delay
                            const chars = data.chunk.split('');
                            for (const char of chars) {
                                await new Promise(resolve => setTimeout(resolve, 15));
                                fullResponse += char;
                                setStreamingMessage(fullResponse);
                            }
                        }
                    }
                }
            } finally {
                reader.releaseLock();
            }
        }

        if (fullResponse) {
            const botMessage: Message = {
              sender: 'bot',
              text: fullResponse.trim(),
              timestamp: new Date()
            };
            setMessages(prev => [...prev, botMessage]);
            
            // Add this line to refresh conversations after message is sent
            await refreshConversations();
        }

    } catch (error) {
        console.error('Error sending message:', error);
        notifications.show({
            title: 'Error',
            message: 'Failed to get response from the chatbot. Please try again.',
            color: 'red'
        });
    } finally {
        setIsProcessing(false);
        setIsStreaming(false);
        setStreamingMessage('');
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
              {t('chat.title')}
            </Title>

            {!currentConversation && (
              <Flex direction="column" align="center" justify="center" style={{ minHeight: '60vh' }}>
                <Text size="xl" mb="md">{t('chat.startConversation')}</Text>
                <Button onClick={handleNewConversation} leftSection={<IconPlus size={20} />}>
                  {t('chat.newChat')}
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
                    placeholder={t('chat.typeMessage')}
                    onKeyDown={handleKeyDown}
                    style={{ flex: 1 }}
                    aria-label={t('chat.typeMessage')}
                    rightSection={
                      <ActionIcon 
                        onClick={isRecording ? stopRecording : startRecording}
                        variant="subtle"
                        loading={isProcessing}
                        aria-label={isRecording ? 'Stop recording' : 'Start recording'}
                      >
                        {isProcessing ? <Loader size="sm" /> : <IconMicrophone color={isRecording ? 'red' : undefined} />}
                      </ActionIcon>
                    }
                  />
                  <Button onClick={sendMessage} leftSection={<IconSend size={18} />}>
                    {t('chat.sendMessage')}
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
