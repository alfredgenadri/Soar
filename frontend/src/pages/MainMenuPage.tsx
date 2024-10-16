import React from 'react';
import styles from './MainMenuPage.module.css'; // CSS module for styles
import { Link } from 'react-router-dom';

const MainMenuPage = () => {
  return (
    <div>
      {/* Navbar */}
      <div className={`navbar w-nav ${styles.navbar}`} role="banner">
        <div className={styles['nav-container']}>
          <div className={styles['nav-left']}>
            <div className={styles['nav-text']}>Resources</div>
            <div className={styles['nav-text']}>Assistant</div>
          </div>
          <a className={`brand w-nav-brand ${styles.brand}`} href="#">
            <div className={styles.logo}>Soar</div>
          </a>
          <nav className={`nav-menu w-nav-menu ${styles['nav-menu']}`} role="navigation"></nav>
          <div className={styles['w-nav-button']}>
            <div className={`w-icon-nav-menu ${styles['w-icon-nav-menu']}`}></div>
          </div>
          <div className={styles['nav-right']}>
            <Link to="/login" className={styles['nav-text']}>Login</Link>
            <Link to="/login" className={styles['nav-text']}>Sign Up</Link>
          </div>
        </div>
      </div>

      {/* Video Section */}
      <div className={`video-section ${styles['video-section']}`}>
        <video autoPlay loop muted playsInline style={{ width: '100%', height: '100vh', objectFit: 'cover' }}>
          <source
            src="https://cdn.prod.website-files.com/5f686813c8da016a8335801e/62953e277541e7ad8ad7168c_Northern-lights-video-transcode.mp4"
            type="video/mp4"
          />
          <source
            src="https://cdn.prod.website-files.com/5f686813c8da016a8335801e/62953e277541e7ad8ad7168c_Northern-lights-video-transcode.webm"
            type="video/webm"
          />
        </video>
        <div className={styles['container-2']}>
          <h1 className={styles['heading-2']} style={{ fontSize: '4rem', maxWidth: '80%', margin: '0 auto', textAlign: 'center' }}>
            Supporting <span className={styles.text}>You</span> Every Step of the Way
          </h1>
          <p style={{ fontSize: '1.5rem', maxWidth: '80%', margin: '0 auto', textAlign: 'center' }}>
            Our platform offers information about mental health, and a chatbot ready to assist you 24/7. We're here to
            connect you with the right resources for your mental health journey.
          </p>
          <Link to="/chatbot" className={`button-2 w-inline-block ${styles['button-2']}`}>
            <div className={styles['text-block']} style={{ fontSize: '1.2rem' }}>Talk to Us</div>
          </Link>
        </div>
      </div>

      {/* Additional sections */}
      <div className={styles.section}></div>
      <div className={styles.section}></div>
      <div className={styles.footer}></div>
    </div>
  );
};

export default MainMenuPage;
