import React, { useState, useRef } from 'react';

const HomePage = () => {
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div>
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-left">
            <div className="nav-text">Resources</div>
            <div className="nav-text">Assistant</div>
          </div>
          <div className="brand">
            <div className="logo">Soar</div>
          </div>
          <div className="nav-right">
            <div className="nav-text">Login</div>
            <div className="nav-text">Sign Up</div>
          </div>
        </div>
      </nav>

      <div className="video-section w-background-video w-background-video-atom">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          poster="https://cdn.prod.website-files.com/5f686813c8da016a8335801e/62953e277541e7ad8ad7168c_Northern-lights-video-poster-00001.jpg"
          style={{backgroundImage: 'url("https://cdn.prod.website-files.com/5f686813c8da016a8335801e/62953e277541e7ad8ad7168c_Northern-lights-video-poster-00001.jpg")'}}
        >
          <source src="https://cdn.prod.website-files.com/5f686813c8da016a8335801e/62953e277541e7ad8ad7168c_Northern-lights-video-transcode.mp4" type="video/mp4" />
          <source src="https://cdn.prod.website-files.com/5f686813c8da016a8335801e/62953e277541e7ad8ad7168c_Northern-lights-video-transcode.webm" type="video/webm" />
        </video>
        <div className="container-2">
          <h1 className="heading-2">Supporting <span className="text">You</span> Every Step of the Way</h1>
          <p>Our platform offers information about mental health, and a chatbot ready to assist you 24/7. We're here to connect you with the right resources for your mental health journey.</p>
          <a className="button-2 w-inline-block" href="#">
            <div className="text-block">Talk to Us</div>
          </a>
        </div>
        <div aria-live="polite">
          <button
            aria-controls="video"
            className="w-backgroundvideo-backgroundvideoplaypausebutton play-pause-button-2 w-background-video--control"
            type="button"
            onClick={togglePlayPause}
          >
            <span>
              <img
                alt={isPlaying ? "Pause" : "Play"}
                className={isPlaying ? "pause" : "play"}
                src={isPlaying
                  ? "https://cdn.prod.website-files.com/5f686813c8da016a8335801e/628b870a2f5d6a30c51ad223_Pause.svg"
                  : "https://cdn.prod.website-files.com/5f686813c8da016a8335801e/628b86fd7a72225b55da906e_play.svg"
                }
                width="20"
              />
            </span>
          </button>
        </div>
      </div>

      <div className="section"></div>
      <div className="section"></div>
      <div className="footer"></div>
    </div>
  );
};

export default HomePage;