import React, { useState } from 'react';
import { register } from '../services/api'; // Import API call for registration
import './LoginForm.css'; // Assuming you have shared CSS for styling

const RegisterForm = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // Show/Hide Password state
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState(''); // State for success message

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    try {
      await register(username, email, password); // API call for registration

      // If registration is successful, clear all fields and display success message
      setUsername('');
      setEmail('');
      setPassword('');
      setSuccessMessage('User successfully created!');
    } catch (error) {
      setError('Registration failed. Please try again.');
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

      {/* Email Input */}
      <div className="form-group mb-3">
        <input
          type="email"
          className="form-control rounded"
          style={{
            backgroundColor: '#2f2f2f',
            color: '#ffffff',
            border: 'none',
            borderRadius: '10px',
          }}
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      {/* Password Input */}
      <div className="form-group mb-3 position-relative">
        <input
          type={showPassword ? 'text' : 'password'} // Toggle between password and text
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
            right: '-0.5%',
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

      {/* Display error message if registration fails */}
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Display success message if registration is successful */}
      {successMessage && <div className="alert alert-success">{successMessage}</div>}

      {/* Register Button */}
      <button type="submit" className="btn btn-light w-100 mt-3">
        Register
      </button>
    </form>
  );
};

export default RegisterForm;
