import React, { useState } from 'react';
import ChatWindow from './components/ChatWindow';
import ChatAssistantLogo from './components/ChatAssistantLogo';
import './App.css';

const App = () => {
  // Initialize showChat to true so the ChatWindow is visible by default
  const [showChat, setShowChat] = useState(true); // This state controls the visibility of the ChatWindow

  // This function toggles the visibility of the chat window
  const toggleChat = () => {
    setShowChat(!showChat);
  };

  return (
    <div className="app-container">
      <ChatAssistantLogo onToggleChat={toggleChat} /> {/* Logo is always visible */}
      {showChat && <ChatWindow onClose={toggleChat} />} {/* ChatWindow visibility is now true by default */}
    </div>
  );
};

export default App;
