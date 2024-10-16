import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';
import './AuthPage.css'; // Import the CSS for transitions

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true); // Toggle between login and register forms
  const navigate = useNavigate();

  useEffect(() => {
    // Check if the user is already logged in by looking for the JWT token in localStorage
    const token = localStorage.getItem('token');
    if (token) {
      // If the token exists, redirect to the chatbot page
      navigate('/chatbot', { replace: true });
    }
  }, [navigate]);

  const toggleForm = () => {
    setIsLogin(!isLogin); // Toggle between login and register
  };

  return (
    <div
      className="auth-page"
      style={{
        minHeight: '100vh', // Full height background
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#2f2f2f', // Dark grey background
      }}
    >
      <div
        className="card"
        style={{
          width: '400px',
          padding: '20px',
          backgroundColor: '#3f3f3f', // Slightly lighter grey card
          color: '#ffffff', // White text
          borderRadius: '10px', // Rounded corners for the card
        }}
      >
        <h3 className="text-center mb-4">
          {isLogin ? 'Login to Soar' : 'Register for Soar'}
        </h3>

        {/* Form container with transition */}
        <div className={`auth-form ${isLogin ? 'active' : ''}`}>
          {isLogin ? <LoginForm /> : null}
        </div>
        <div className={`auth-form ${!isLogin ? 'active' : ''}`}>
          {!isLogin ? <RegisterForm /> : null}
        </div>

        <button
          className="btn btn-outline-light mt-3 w-100"
          onClick={toggleForm}
        >
          {isLogin ? 'Need an account? Register' : 'Already have an account? Login'}
        </button>
      </div>
    </div>
  );
};

export default AuthPage;
