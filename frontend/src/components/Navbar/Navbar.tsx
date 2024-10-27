import React from 'react';
import { IconUserCircle } from '@tabler/icons-react';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-left">
          <div className="nav-link">Resources</div>
          <div className="nav-link">Assistant</div>
        </div>
        <div className="brand">
          <div className="logo">
            <span className="logo-text">Soar</span>
          </div>
        </div>
        <div className="nav-right">
          <button className="nav-button login">Login</button>
          <button className="nav-button signup">Sign Up</button>
          <div className="profile-icon">
            <IconUserCircle size={24} stroke={1.5} />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;