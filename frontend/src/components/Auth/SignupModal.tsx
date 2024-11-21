import { Modal, TextInput, Button, Group } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useAuth } from '../../contexts/AuthContext';
import { notifications } from '@mantine/notifications';
import { useLanguage } from '../../contexts/LanguageContext';

interface SignupModalProps {
  opened: boolean;
  onClose: () => void;
}

export const SignupModal: React.FC<SignupModalProps> = ({ opened, onClose }) => {
  const { signup } = useAuth();
  const { t } = useLanguage();

  const form = useForm({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validate: {
      name: (value) => (value.length < 2 ? t('auth.signup.validation.nameLength') : null),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : t('auth.signup.validation.invalidEmail')),
      password: (value) => (value.length < 6 ? t('auth.signup.validation.passwordLength') : null),
      confirmPassword: (value, values) =>
        value !== values.password ? t('auth.signup.validation.passwordMatch') : null,
    },
  });

  const handleSubmit = async (values: { name: string; email: string; password: string }) => {
    try {
      await signup(values.name, values.email, values.password);
      notifications.show({
        title: t('auth.signup.success'),
        message: t('auth.signup.success'),
        color: 'green',
        position: 'top-center',
        autoClose: 5000,
      });
      
      form.reset();
      onClose();

    } catch (error: any) {
      notifications.show({
        title: t('auth.signup.error'),
        message: error.response?.data?.message || t('auth.signup.error'),
        color: 'red',
        position: 'top-center',
        autoClose: 5000,
      });
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title={t('auth.signup.title')}>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <TextInput
          required
          label={t('auth.signup.name')}
          placeholder={t('auth.signup.namePlaceholder')}
          {...form.getInputProps('name')}
        />
        <TextInput
          required
          label={t('auth.signup.email')}
          placeholder={t('auth.signup.emailPlaceholder')}
          mt="md"
          {...form.getInputProps('email')}
        />
        <TextInput
          required
          type="password"
          label={t('auth.signup.password')}
          placeholder={t('auth.signup.passwordPlaceholder')}
          mt="md"
          {...form.getInputProps('password')}
        />
        <TextInput
          required
          type="password"
          label={t('auth.signup.confirmPassword')}
          placeholder={t('auth.signup.confirmPasswordPlaceholder')}
          mt="md"
          {...form.getInputProps('confirmPassword')}
        />
        <Group align="right" mt="md">
          <Button type="submit">{t('auth.signup.submit')}</Button>
        </Group>
      </form>
    </Modal>
  );
};
