import React, { useState } from 'react';
import ChatWindow from './ChatWindow';

const ChatContainer = () => {
  const [isChatOpen, setChatOpen] = useState(false);

  // This function toggles the visibility of the chat window.
  const handleToggleChat = () => {
    setChatOpen(!isChatOpen); // Toggle the state to show or hide the chat window.
  };

  return (
    <></>
  );
};

export default ChatContainer;