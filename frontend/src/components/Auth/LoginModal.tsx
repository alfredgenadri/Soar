import { Modal, TextInput, Button, Group, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useAuth } from '../../contexts/AuthContext';
import { notifications } from '@mantine/notifications';
import { useLanguage } from '../../contexts/LanguageContext';

interface LoginModalProps {
  opened: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ opened, onClose }) => {
  const { login } = useAuth();
  const { t } = useLanguage();

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : t('auth.signup.validation.invalidEmail')),
      password: (value) => (value.length < 6 ? t('auth.signup.validation.passwordLength') : null),
    },
  });

  const handleSubmit = async (values: { email: string; password: string }) => {
    try {
      await login(values.email, values.password);
      notifications.show({
        title: t('auth.login.success'),
        message: t('auth.login.success'),
        color: 'green'
      });
      onClose();
      form.reset();
    } catch (error: any) {
      notifications.show({
        title: t('auth.login.error'),
        message: error.response?.data?.error || t('auth.login.error'),
        color: 'red'
      });
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title={t('auth.login.title')}>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <TextInput
          required
          label={t('auth.login.email')}
          placeholder={t('auth.login.emailPlaceholder')}
          aria-invalid={form.errors.email ? 'true' : 'false'}
          aria-describedby={form.errors.email ? 'email-error' : undefined}
          {...form.getInputProps('email')}
        />
        {form.errors.email && (
          <Text color="red" size="sm" id="email-error" role="alert">
            {form.errors.email}
          </Text>
        )}
        <TextInput
          required
          type="password"
          label={t('auth.login.password')}
          placeholder={t('auth.login.passwordPlaceholder')}
          mt="md"
          {...form.getInputProps('password')}
        />
        <Group align="right" mt="md">
          <Button type="submit">{t('auth.login.submit')}</Button>
        </Group>
      </form>
    </Modal>
  );
};
