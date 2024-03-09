import React, { useState, useRef, useEffect } from 'react';
import ChatHeader from './ChatHeader';
import './Styles/kahramaa.css';

const ChatWindow = ({ onClose }) => {
    const webChatContainerRef = useRef(null);
    const [locale] = useState('en');

    useEffect(() => {
        const styleOptions = {
            hideUploadButton: true,
            bubbleBackground: '#00000',
            bubbleTextColor: '#000',
            bubbleBorderColor: '#ffffff',
            bubbleBorderRadius: 20,
            bubbleMaxWidth: 650,    
            sendBoxBackground: '#fafafa',
            sendBoxTextColor: '#333',
            sendBoxButtonColor: '#9c0058',
            sendBoxHeight: 60,
            bubbleFromUserBackground: '#9c0058',
            bubbleFromUserTextColor: '#FFFFFF',
            bubbleFromUserBorderColor: '#ffffff',
            bubbleFromUserBorderRadius: 20,
            bubbleFromUserMaxWidth: 650, 
            fontSizeSmall: '80%',
            
            
            
        };
        
        
        const tokenEndpointURL = 'https://defaultb7c4ca7aa4ba454eaaf5c7edf7f73e.aa.environment.api.powerplatform.com/powervirtualagents/botsbyschema/cr1eb_kahramaaWeb/directline/token?api-version=2022-03-01-preview';
        const apiVersion = new URL(tokenEndpointURL).searchParams.get('api-version');

        async function fetchTokenAndRenderChat() {
            try {
                const [directLineURL, tokenResponse] = await Promise.all([
                    fetch(new URL(`/powervirtualagents/regionalchannelsettings?api-version=${apiVersion}`, tokenEndpointURL)).then(response => response.json()),
                    fetch(tokenEndpointURL).then(response => response.json()),
                ]);
                
                const directLine = window.WebChat.createDirectLine({
                    token: tokenResponse.token,
                    
                    domain: directLineURL && new URL('v3/directline', directLineURL.channelUrlsById.directline)
                });

                window.WebChat.renderWebChat({
                    directLine,
                    styleOptions,
                    locale,
                }, webChatContainerRef.current);

                
                directLine.postActivity({
                    from: { id: 'USER_ID', name: 'User' },
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
  
function scrollToBottom() {
    const chatContainer = webChatContainerRef.current;
    if (chatContainer) {
        // Scroll to the bottom of the container
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
