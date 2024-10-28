import { Modal, TextInput, Button, Group } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useAuth } from '../../contexts/AuthContext';
import { notifications } from '@mantine/notifications';

interface LoginModalProps {
  opened: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ opened, onClose }) => {
  const { login } = useAuth();
  const form = useForm({
    initialValues: {
      email: '',
      password: '',
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      password: (value) => (value.length < 6 ? 'Password must be at least 6 characters' : null),
    },
  });

  const handleSubmit = async (values: { email: string; password: string }) => {
    try {
      await login(values.email, values.password);
      notifications.show({
        title: 'Success',
        message: 'Logged in successfully',
        color: 'green'
      });
      onClose();
      form.reset();
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.error || 'Failed to login',
        color: 'red'
      });
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Login">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <TextInput
          required
          label="Email"
          placeholder="your@email.com"
          {...form.getInputProps('email')}
        />
        <TextInput
          required
          type="password"
          label="Password"
          placeholder="Your password"
          mt="md"
          {...form.getInputProps('password')}
        />
        <Group align="right" mt="md">
          <Button type="submit">Login</Button>
        </Group>
      </form>
    </Modal>
  );
};
