import React, { useState } from 'react';
import { login } from '../services/api'; // API call for login
import { useNavigate } from 'react-router-dom'; // useNavigate for redirection
import './LoginForm.css'; // Import your CSS styles

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate(); // useNavigate for redirection

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await login(username, password); // Call login API
      localStorage.setItem('token', response.data.access); // Store JWT access token
      localStorage.setItem('username', username); // Store the username in localStorage
      navigate('/chatbot'); // Redirect to chatbot page on success
    } catch (error) {
      setError('Invalid login credentials.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Username Input */}
      <div className="form-group mb-3">
        <input
          type="text"
          className="form-control rounded"
          style={{
            backgroundColor: '#2f2f2f',
            color: '#ffffff',
            border: 'none',
            borderRadius: '10px',
          }}
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>

      {/* Password Input */}
      <div className="form-group mb-3 position-relative">
        <input
          type={showPassword ? 'text' : 'password'}
          className="form-control rounded"
          style={{
            backgroundColor: '#2f2f2f',
            color: '#ffffff',
            border: 'none',
            borderRadius: '10px',
          }}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {/* Show/Hide Password Button */}
        <button
          type="button"
          className="btn btn-outline-light btn-sm position-absolute"
          style={{
            top: '-5%',
            right: '0.5%',
            transform: 'translateY(-50%)',
            height: 'calc(100% - 4px)', // Matches the height of the input field minus a bit of padding
            padding: '0 10px',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: '1', // Ensure button text is centered vertically
          }}
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? 'Hide' : 'Show'}
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Login Button */}
      <button type="submit" className="btn btn-light w-100 mt-3">
        Login
      </button>
    </form>
  );
};

export default LoginForm;
