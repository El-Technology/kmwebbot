import React, { useState, useRef, useEffect } from 'react';
import ChatHeader from './ChatHeader.js';
import './Styles/kahramaa.css';
import { fetchTokenAndRenderChat } from '../store/actions.js';

const ChatWindow = ({ onClose }) => {
    const webChatContainerRef = useRef(null);
    const [locale] = useState('en');
    
    useEffect(() => {
        fetchTokenAndRenderChat(locale, webChatContainerRef); // Call the action function
      }, [locale]);

    function scrollToBottom() {
        const chatContainer = webChatContainerRef.current;
        if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    }

    useEffect(() => {
        const interval = setInterval(() => {
            scrollToBottom();
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="chat-window">
            <ChatHeader onMinimize={onClose} />
            <div ref={webChatContainerRef} className="webchat-container" style={{ height: '100%', width: '100%' }}></div>
        </div>
    );
};

export default ChatWindow;