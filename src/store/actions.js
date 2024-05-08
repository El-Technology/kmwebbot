import { v4 as uuidv4 } from 'uuid';
import styleOptions from '../components/Styles/ChatStyles.js'
import { tokenEndpointURL, dl_secret } from '../core/chatConsts.js';

export const fetchTokenAndRenderChat = 
    async (locale, webChatContainerRef) => {
        try {
             const userId = `dl_${uuidv4()}`;
             
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
        

            const directLine = window.WebChat.createDirectLine({
                token: tokenResponse.token
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

            const store = window.WebChat.createStore({}, ({ dispatch }) => next => action => {
                if ( action.type === 'DIRECT_LINE/INCOMING_ACTIVITY' ) {
                    const { activity } = action.payload;
                
                    if ( activity.text && activity.channelData && activity.channelData.locale === 'ar' ) {
                      setTimeout(() => {
                        const textElements = document.querySelectorAll('.webchat__bubble__content .webchat__text-content');
                        const elementIndex = textElements.length - 1;
                        const bubbleFromUser = textElements[elementIndex].closest('.webchat__bubble');
                        bubbleFromUser.classList.add('webchat__bubble--rtl');
                        bubbleFromUser.setAttribute( 'dir', 'rtl' );
                      }, 150);
                    }
                  }
                 return next( action );
              });

            window.WebChat.renderWebChat({
                directLine,
                styleOptions,
                locale,
                webSpeechPonyfillFactory: createSpeechRecognitionOnlyPonyfillFactory(),
                sendTypingIndicator: true,
                store
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
    };