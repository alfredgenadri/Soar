import { Modal, Textarea, Button, Group, Radio, Stack, Text, NumberInput, ActionIcon, Loader } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconMicrophone } from '@tabler/icons-react';
import axios from 'axios';
import { useState, useRef } from 'react';

interface FeedbackModalProps {
  opened: boolean;
  onClose: () => void;
}

export function FeedbackModal({ opened, onClose }: FeedbackModalProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);

  const form = useForm({
    initialValues: {
      feedbackType: 'general',
      rating: 5,
      message: '',
    },
    validate: {
      message: (value) => (value.length < 10 ? 'Message must be at least 10 characters' : null),
      rating: (value) => (value < 1 || value > 10 ? 'Rating must be between 1 and 10' : null),
    },
  });

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
          form.setFieldValue('message', response.data.text);
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

  const handleSubmit = async (values: typeof form.values) => {
    try {
      await axios.post('http://localhost:8000/api/feedback/', values);
      notifications.show({
        title: 'Success',
        message: 'Thank you for your feedback!',
        color: 'green',
      });
      form.reset();
      onClose();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to submit feedback',
        color: 'red',
      });
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Share Your Feedback" size="lg">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            We value your feedback! Please share your thoughts to help us improve our services.
          </Text>

          <Radio.Group
            label="Feedback Type"
            {...form.getInputProps('feedbackType')}
          >
            <Group mt="xs">
              <Radio value="general" label="General" />
              <Radio value="bug" label="Bug Report" />
              <Radio value="feature" label="Feature Request" />
              <Radio value="other" label="Other" />
            </Group>
          </Radio.Group>

          <NumberInput
            label="Rating"
            description="How would you rate your experience? (1-10)"
            min={1}
            max={10}
            {...form.getInputProps('rating')}
          />

          <Textarea
            required
            label="Message"
            placeholder="Please share your feedback here..."
            minRows={4}
            {...form.getInputProps('message')}
            rightSection={
              <ActionIcon 
                onClick={isRecording ? stopRecording : startRecording}
                variant="subtle"
                loading={isProcessing}
              >
                {isProcessing ? <Loader size="sm" /> : <IconMicrophone color={isRecording ? 'red' : undefined} />}
              </ActionIcon>
            }
          />

          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={onClose}>Cancel</Button>
            <Button type="submit">Submit Feedback</Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}