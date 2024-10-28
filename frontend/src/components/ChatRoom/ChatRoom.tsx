import { useState, useRef, useEffect } from 'react';
import { TextInput, Button, Paper, Text, Container, Title, Flex, Loader, ActionIcon, Image, ScrollArea, Stack } from '@mantine/core';
import { IconMicrophone, IconSend } from '@tabler/icons-react';
import axios from 'axios';

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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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

  const sendMessage = async () => {
    if (userMessage.trim() === '') return;

    const timestamp = new Date();
    setMessages((prev) => [...prev, { sender: 'user', text: userMessage, timestamp }]);

    try {
      const response = await axios.post('http://localhost:8000/api/chat/message/', { message: userMessage });
      const botResponses = response.data;
      for (let i = 0; i < botResponses.length; i++) {
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            { sender: 'bot', text: botResponses[i].content, image: botResponses[i].image, timestamp: new Date() },
          ]);
        }, i * 500);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }

    setUserMessage('');
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault(); // Prevent newline in input
      sendMessage();
    }
  };

  return (
    <Container size="lg">
      <Paper shadow="md" radius="lg" p="xl">
        <Title order={2} mb="lg">
          Chat with Assistant
        </Title>

        <ScrollArea style={{ height: 400, marginBottom: '1rem' }}>
          <Stack gap="xs">
            {messages.map((message, index) => (
              <Flex
                key={index}
                align="flex-start"
                justify={message.sender === 'user' ? 'flex-end' : 'flex-start'}
                direction="row"
                style={{
                  padding: '10px',
                  backgroundColor: message.sender === 'user' ? '#e3f2fd' : '#f1f8e9',
                  borderRadius: 10,
                }}
              >
                <Text size="sm" style={{ fontWeight: 500 }}>
                  {message.text}
                </Text>
                {message.image && (
                  <Image
                    src={message.image}
                    alt="Bot response"
                    width={100}
                    height="auto"
                    fit="contain"
                    style={{ marginLeft: '1rem' }}
                  />
                )}
                <Text size="xs" style={{ alignSelf: 'flex-end', marginLeft: '1rem', color: '#757575' }}>
                  {formatTime(message.timestamp)}
                </Text>
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
            onKeyDown={handleKeyDown} // Handle Enter key
            style={{ flex: 1 }}
          />
          <ActionIcon
            variant="outline"
            onMouseDown={startRecording} // Start recording on press
            onMouseUp={stopRecording} // Stop and transcribe on release
            size="lg"
            disabled={isProcessing} // Disable during recording and processing
          >
            {isProcessing ? <Loader size="sm" /> : <IconMicrophone size={20} />}
          </ActionIcon>
          <Button onClick={sendMessage} leftSection={<IconSend size={18} />}>
            Send
          </Button>
        </Flex>
      </Paper>
    </Container>
  );
};

export default ChatRoom;
