import React, { useState, useRef, useEffect } from 'react';
import ChatHeader from './ChatHeader.js';
import './Styles/kahramaa.css';
import { v4 as uuidv4 } from 'uuid';
import styleOptions from './Styles/ChatStyles.js'

const ChatWindow = ({ onClose }) => {
    const webChatContainerRef = useRef(null);
    const [locale] = useState('en');
    const tokenEndpointURL = 'https://directline.botframework.com/v3/directline/tokens/generate'; // move to consts
    const dl_secret = "f7WqBQsIg_0.RkD3v_5cT4mmoHsPfHKElq0HHWyp3q5wVKu5oj0Pjto";
    
    useEffect(() => {
        async function fetchTokenAndRenderChat() { // move to action
            try {
                let token = getCookie('chatToken');
                let userId = getCookie('userId');
                console.log(token);
                if (!token) {
                    // Token does not exist in cookies or has expired, fetch a new one
                    userId = `dl_${uuidv4()}`; // Generate userId in the format "dl_[uuid]"
                    console.log("We are here");
                    const tokenResponse = await fetch(tokenEndpointURL, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${dl_secret}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            User: {
                                id: userId,
                                name: "User"
                            }
                        })
                    }).then(response => response.json());
                    
                    console.log(tokenResponse);
                    token = tokenResponse.token;
                    
                    let expirationTime = Date.now() + (tokenResponse.expires_in * 1000); // Convert expires_in to milliseconds
                    setCookie('chatToken', token, expirationTime);
                    setCookie('userId', userId); // Store userId in the cookie
                }

                const directLine = window.WebChat.createDirectLine({
                    token: token
                });

                window.WebChat.renderWebChat({
                    directLine,
                    styleOptions,
                    locale,
                }, webChatContainerRef.current);

                directLine.postActivity({
                    from: { id: userId, name: 'User' },
                    name: 'startConversation',
                    type: 'event',
                    value: ''
                }).subscribe(
                    id => console.log(`Posted activity, assigned ID ${id}`),
                    error => console.log(`Error posting activity: ${error}`)
                );
            } catch (error) {
                console.error('Failed to fetch token and render chat', error);
            }
        }
        
        fetchTokenAndRenderChat();
    }, [locale]);

    function setCookie(name, value, expirationTime) {
        document.cookie = `${name}=${value}; expires=${new Date(expirationTime).toUTCString()}; path=/; Secure; SameSite=Strict`;
    }

    function getCookie(name) {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const [cookieName, cookieValue] = cookie.trim().split('=');
            if (cookieName === name) {
                return cookieValue;
            }
        }
        return null;
    }

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