import { v4 as uuidv4 } from 'uuid';
import styleOptions from '../components/Styles/ChatStyles.js'
import { tokenEndpointURL, dl_secret } from '../core/chatConsts.js';

export const fetchTokenAndRenderChat = 
    async (locale, webChatContainerRef) => { // move to action
        try {
            let token = getCookie('chatToken');
            let userId = getCookie('userId');
            console.log(token);
            if (!token) {
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

            const createSpeechRecognitionOnlyPonyfillFactory= () => {
                const speechServicesPonyfillFactory =  window.WebChat.createBrowserWebSpeechPonyfillFactory();
                
                return options => {
                  const speechServicesPonyfill = speechServicesPonyfillFactory(options);
                  return {
                    SpeechGrammarList: speechServicesPonyfill.SpeechGrammarList,
                    SpeechRecognition: speechServicesPonyfill.SpeechRecognition,
                    speechSynthesis: null,
                    SpeechSynthesisUtterance: null
                  };
                };
              }

            window.WebChat.renderWebChat({
                directLine,
                styleOptions,
                locale,
                webSpeechPonyfillFactory: createSpeechRecognitionOnlyPonyfillFactory(),
                sendTypingIndicator: true
            }, webChatContainerRef.current);

            directLine.activity$
            .filter(activity => activity.locale === 'en')
            .subscribe(message => {
            if (message) {
                console.log("Reply", message)
            }
            });

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
    };

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