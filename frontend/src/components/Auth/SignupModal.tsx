import { Modal, TextInput, Button, Group } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useAuth } from '../../contexts/AuthContext';
import { notifications } from '@mantine/notifications';

interface SignupModalProps {
  opened: boolean;
  onClose: () => void;
}

export const SignupModal: React.FC<SignupModalProps> = ({ opened, onClose }) => {
  const { signup } = useAuth();
  const form = useForm({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validate: {
      name: (value) => (value.length < 2 ? 'Name must be at least 2 characters' : null),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      password: (value) => (value.length < 6 ? 'Password must be at least 6 characters' : null),
      confirmPassword: (value, values) =>
        value !== values.password ? 'Passwords did not match' : null,
    },
  });

  const handleSubmit = async (values: { name: string; email: string; password: string }) => {
    try {
      await signup(values.name, values.email, values.password);
      notifications.show({
        title: 'Success',
        message: 'Account created successfully',
        color: 'green'
      });
      onClose();
      form.reset();
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.message || 'Failed to create account',
        color: 'red'
      });
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Sign Up">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <TextInput
          required
          label="Name"
          placeholder="Your name"
          {...form.getInputProps('name')}
        />
        <TextInput
          required
          label="Email"
          placeholder="your@email.com"
          mt="md"
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
        <TextInput
          required
          type="password"
          label="Confirm Password"
          placeholder="Confirm your password"
          mt="md"
          {...form.getInputProps('confirmPassword')}
        />
        <Group align="right" mt="md">
          <Button type="submit">Sign Up</Button>
        </Group>
      </form>
    </Modal>
  );
};
