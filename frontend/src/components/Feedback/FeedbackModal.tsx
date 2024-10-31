import { Modal, Textarea, Button, Group, Radio, Stack, Text, ActionIcon, Loader, Rating } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconMicrophone } from '@tabler/icons-react';
import axios from 'axios';
import { useState, useRef } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

interface FeedbackModalProps {
  opened: boolean;
  onClose: () => void;
}

export function FeedbackModal({ opened, onClose }: FeedbackModalProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const { t } = useLanguage();

  const form = useForm({
    initialValues: {
      feedbackType: 'general',
      rating: 5,
      message: '',
    },
    validate: {
      message: (value) => (value.length < 10 ? 'Message must be at least 10 characters' : null),
      rating: (value) => (value < 1 ? 'Please provide a rating' : null),
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
    <Modal opened={opened} onClose={onClose} title={t('feedback.title')} size="lg">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            {t('feedback.description')}
          </Text>

          <Radio.Group
            label={t('feedback.feedbackType')}
            {...form.getInputProps('feedbackType')}
          >
            <Group mt="xs">
              <Radio value="general" label={t('feedback.types.general')} />
              <Radio value="bug" label={t('feedback.types.bug')} />
              <Radio value="feature" label={t('feedback.types.feature')} />
              <Radio value="other" label={t('feedback.types.other')} />
            </Group>
          </Radio.Group>

          <Stack gap="xs">
            <Text size="sm" fw={500}>{t('feedback.rating')}</Text>
            <Rating 
              size="lg"
              value={form.values.rating} 
              onChange={(value) => form.setFieldValue('rating', value)}
              count={10}
            />
          </Stack>

          <Textarea
            required
            label={t('feedback.message')}
            placeholder={t('feedback.messagePlaceholder')}
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
            <Button variant="light" onClick={onClose}>{t('feedback.cancel')}</Button>
            <Button type="submit">{t('feedback.submit')}</Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
