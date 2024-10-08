import React, { useState } from 'react';
import { Group, Button, TextInput, PasswordInput, Text, Stack, Paper, Title } from '@mantine/core';
import axios from 'axios';

const AppNavbar = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (isLogin) {
        const response = await axios.post('http://localhost:8000/api/users/login/', { username, password });
        localStorage.setItem('token', response.data.access);
        // Handle successful login (e.g., redirect or update state)
      } else {
        await axios.post('http://localhost:8000/api/users/register/', { username, email, password });
        setIsLogin(true);
        // Handle successful registration (e.g., show success message)
      }
    } catch (error) {
      setError('Authentication failed. Please check your credentials.');
    }
  };

  return (
    <Paper shadow="xs" p="md">
      <Title order={2} mb="md">Soar</Title>
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <TextInput
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          {!isLogin && (
            <TextInput
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          )}
          <PasswordInput
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <Text color="red">{error}</Text>}
          <Group grow mt="md">
            <Button type="submit" color="blue">{isLogin ? 'Login' : 'Sign Up'}</Button>
            <Button variant="light" onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? 'Need an account?' : 'Already have an account?'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Paper>
  );
};

export default AppNavbar;