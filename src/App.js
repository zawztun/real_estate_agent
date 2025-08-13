import React, { useState, useRef, useEffect, useCallback } from 'react';

// Avatar image - you can replace avatar.svg in the public folder with your own photo
// Supported formats: .jpg, .png, .svg, .gif
const AVATAR_URL = "/tds-pic.jpg";

const App = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentBotResponse, setCurrentBotResponse] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isInitialTyping, setIsInitialTyping] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('isDarkMode');
    if (savedTheme !== null) {
      return savedTheme === 'true';
    }
    // If no saved preference, check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return true; // Default to dark mode if system prefers dark
    }
    return true; // Default to dark mode (Myanmar) if no system preference
  });
  const messagesEndRef = useRef(null);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('isDarkMode', newTheme.toString());
    // Clear introduction flag so new language message shows
    localStorage.removeItem('hasSeenIntroduction');
  };

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      // Only update if user hasn't manually set a preference
      const savedTheme = localStorage.getItem('isDarkMode');
      if (savedTheme === null) {
        setIsDarkMode(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Handle language change when theme mode changes
  useEffect(() => {
    if (messages.length > 0) {
      // Clear messages and show new introduction in correct language
      setMessages([]);
      setIsInitialTyping(true);
    }
  }, [isDarkMode]); // eslint-disable-line react-hooks/exhaustive-deps

  // This function simulates the typing effect by adding characters one at a time to the currentBotResponse state
  const speakMessage = useCallback((text) => {
    return new Promise((resolve) => {
      let typedText = '';
      let charIndex = 0;

      const interval = setInterval(() => {
        if (charIndex < text.length) {
          typedText += text[charIndex];
          setCurrentBotResponse(typedText);
          charIndex++;
        } else {
          clearInterval(interval);
          resolve();
        }
      }, 50); // Adjust the delay between characters here (in milliseconds)
    });
  }, []);

  // Initial message with typing effect - always show on app start
  useEffect(() => {
    console.log('Showing introduction message');
    const initialMessage = isDarkMode 
      ? 'မင်္ဂလာပါ! ကျွန်မ က Realtor သန္တာစိုး အတွက် အလုပ်လုပ်ပေးနေတဲ့ အိမ်ခြံမြေ အကူအညီပေးသူ AI Agent Bot ပါ။ ဘယ်လို ကူညီပေးရမလဲ?'
      : 'Hello! I am an AI Agent Bot working for Realtor Thandar Soe, assisting with real estate. How can I help you?';
    
    const typeInitialMessage = async () => {
      console.log('Starting to type initial message');
      setIsInitialTyping(true);
      await speakMessage(initialMessage);
      // Add the complete message to messages array
      setMessages([{ role: 'bot', text: initialMessage }]);
      // Clear the current response and stop initial typing
      setCurrentBotResponse('');
      setIsInitialTyping(false);
    };
    
    typeInitialMessage();
  }, [isDarkMode, speakMessage]);

  // Function to reset introduction (for testing)
  const resetIntroduction = () => {
    localStorage.removeItem('thandarSoeIntroSeen');
    console.log('Introduction reset - will show on next page load');
  };

  // Add this to window for testing purposes
  useEffect(() => {
    window.resetIntroduction = resetIntroduction;
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // This effect now triggers a scroll whenever a new message is added or the speaking message updates.
    scrollToBottom();
  }, [messages, currentBotResponse]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading || isSpeaking || isInitialTyping) return; // Prevent sending new messages while loading, speaking, or initial typing

    const userMessage = input;
    setMessages((prevMessages) => [...prevMessages, { role: 'user', text: userMessage }]);
    setInput('');
    setLoading(true);

    try {
      // Language preference based on theme mode
      const preferredLanguage = isDarkMode ? 'Myanmar' : 'English';
      const prompt = `You are Thandar Soe, a helpful and friendly female real estate agent specializing in the USA real estate market. CRITICAL INSTRUCTION: Respond ONLY in ${preferredLanguage} language regardless of the user's input language. If the preferred language is Myanmar, respond ONLY in Myanmar language (မြန်မာ). If the preferred language is English, respond ONLY in English. Do not mix languages or provide translations. You provide expert advice based on USA real estate laws, regulations, market conditions, and practices. Assist users with their real estate questions about buying, selling, or renting properties in the United States. Your knowledge covers US mortgage processes, property taxes, HOA regulations, state-specific real estate laws, and current US market trends. Your tone should be professional yet approachable. Do NOT introduce yourself in every response - users already know who you are. Always end your response by asking how you can further assist the user in the SAME ${preferredLanguage} language. User: ${userMessage}`
      const chatHistory = [{ role: "user", parts: [{ text: prompt }] }];

      const payload = {
        contents: chatHistory,
      };

      const apiKey = process.env.REACT_APP_API_KEY;
      const apiUrl = `${process.env.REACT_APP_API_URL}?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const result = await response.json();
      const fullBotResponse = result.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't process that request. Please try again.";
      
      // Stop the loading indicator and start the speaking effect
      setLoading(false);
      setIsSpeaking(true);
      await speakMessage(fullBotResponse);
      setIsSpeaking(false);

      // Once the full response is "spoken", add it to the messages array
      setMessages(prev => [...prev, { role: 'bot', text: fullBotResponse }]);
      setCurrentBotResponse('');


    } catch (error) {
      console.error("Error calling Gemini API:", error);
      let errorMessage = 'Oops! Something went wrong. Please try again later.';
      
      // More specific error messages for debugging
      if (error.message.includes('API error: 400')) {
        errorMessage = 'Invalid request. Please check your message and try again.';
      } else if (error.message.includes('API error: 401')) {
        errorMessage = 'Authentication failed. API key may be invalid.';
      } else if (error.message.includes('API error: 403')) {
        errorMessage = 'API access forbidden. Please check API key permissions.';
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Network error. Please check your connection.';
      } else if (!process.env.REACT_APP_API_KEY) {
        errorMessage = 'API configuration error. Please contact support.';
      }
      
      setMessages((prevMessages) => [...prevMessages, { role: 'bot', text: errorMessage }]);
      setLoading(false);
      setIsSpeaking(false);
    }
  };

  const Message = ({ role, text, showAvatar = false, isDarkMode }) => {
    const isUser = role === 'user';
    return (
      <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3 sm:mb-4 items-start`}>
        {!isUser && showAvatar && (
          <img
            src={AVATAR_URL}
            alt="Thandar Soe"
            className="w-8 h-8 sm:w-12 sm:h-12 rounded-full mr-2 sm:mr-4 shadow-lg object-cover flex-shrink-0"
          />
        )}
        <div
          className={`p-3 sm:p-4 rounded-2xl sm:rounded-3xl max-w-[85%] sm:max-w-xl transition-all duration-300
          ${isUser 
            ? (isDarkMode ? 'glass-user-message-dark rounded-br-none' : 'glass-user-message-light rounded-br-none')
            : (isDarkMode ? 'glass-bot-message-dark rounded-bl-none' : 'glass-bot-message-light rounded-bl-none')
          } 
          ${!isUser && !showAvatar ? 'ml-10 sm:ml-16' : ''} whitespace-pre-wrap text-base sm:text-lg`}
        >
          <p className={isDarkMode ? 'text-white' : ''}>{text}</p>
        </div>
      </div>
    );
  };

  return (
    <div 
      className={`min-h-screen flex items-center justify-center font-sans p-2 sm:p-4 transition-all duration-300 ${
        isDarkMode ? 'glass-bg-dark' : 'glass-bg-light'
      }`}
      style={{
        background: isDarkMode
          ? 'linear-gradient(9deg, rgba(3, 3, 46, 1) 0%, rgba(9, 9, 121, 1) 35%, rgba(0, 212, 255, 1) 100%)'
          : 'linear-gradient(135deg, rgba(255, 182, 193, 0.8) 0%, rgba(173, 216, 230, 0.8) 25%, rgba(221, 160, 221, 0.8) 50%, rgba(135, 206, 235, 0.8) 75%, rgba(255, 192, 203, 0.8) 100%)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        minHeight: '100vh'
      }}
    >
      {/* Root Level Toggle Button */}
      <button
        onClick={toggleTheme}
        disabled={isInitialTyping}
        className={`fixed top-3 sm:top-4 right-3 sm:right-4 z-50 w-20 sm:w-24 h-8 sm:h-10 rounded-full transition-all duration-300 shadow-lg ${
          isInitialTyping ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
        } ${
          isDarkMode ? 'toggle-switch-dark' : 'toggle-switch-light'
        }`}
        title={isInitialTyping ? 'Please wait...' : (isDarkMode ? 'Switch to English Mode' : 'Switch to Myanmar Mode')}
      >
        <div className={`w-8 sm:w-10 h-6 sm:h-8 rounded-full shadow-md transform transition-transform duration-300 flex items-center justify-center ${
          isDarkMode ? 'translate-x-10 sm:translate-x-12' : 'translate-x-1'
        }`}
        style={{
          background: isDarkMode 
            ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(0, 212, 255, 0.3) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(173, 216, 230, 0.4) 100%)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)'
        }}>
          <span className={`text-xs font-bold ${
            isDarkMode ? 'text-gray-800' : 'text-gray-700'
          }`}>
             {isDarkMode ? 'MYA' : 'ENG'}
           </span>
        </div>
      </button>
      
      <div className={`flex flex-col w-full max-w-3xl h-[90vh] sm:h-[80vh] shadow-xl rounded-2xl sm:rounded-3xl overflow-hidden transition-all duration-300 ${
        isDarkMode ? 'glass-container-dark' : 'glass-container-light'
      }`}>
        <header 
          className={`p-4 sm:p-6 shadow-md flex items-center transition-all duration-300 ${
            isDarkMode ? 'glass-header-dark' : 'glass-header-light'
          }`}
          style={{
            background: isDarkMode 
              ? 'linear-gradient(135deg, rgba(3, 3, 46, 0.95) 0%, rgba(9, 9, 121, 0.9) 50%, rgba(0, 212, 255, 0.85) 100%)' 
              : 'linear-gradient(135deg, rgba(255, 182, 193, 0.9) 0%, rgba(173, 216, 230, 0.85) 35%, rgba(221, 160, 221, 0.8) 100%)',
            backdropFilter: 'blur(15px)',
            WebkitBackdropFilter: 'blur(15px)',
            borderBottom: isDarkMode 
              ? '1px solid rgba(0, 212, 255, 0.4)' 
              : '1px solid rgba(59, 130, 246, 0.4)',
            color: '#ffffff'
          }}
        >
          <div className="flex items-center">
            <img
              src={AVATAR_URL}
              alt="Thandar Soe"
              className="w-12 h-12 sm:w-16 sm:h-16 rounded-full mr-3 sm:mr-4 shadow-lg border-2 border-white object-cover flex-shrink-0"
            />
            <div className="min-w-0 flex-1">
              <h1 className={`text-xl sm:text-2xl lg:text-3xl font-bold leading-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Thandar Soe (Licensed Real Estate Realtor)</h1>
                <p className={`text-base sm:text-lg mt-1 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>📞 518-707-8089</p>
            </div>
          </div>
        </header>

        <main className={`flex-1 overflow-y-auto p-3 sm:p-6 space-y-3 sm:space-y-4 transition-all duration-300 ${
          isDarkMode ? 'glass-main-dark' : 'glass-main-light'
        }`}>
          {messages.map((msg, index) => (
            <Message key={index} role={msg.role} text={msg.text} showAvatar={msg.role === 'bot'} isDarkMode={isDarkMode}/>
          ))}
          {/* Display the in-progress message */}
          {(isSpeaking || isInitialTyping) && (
            <Message role='bot' text={currentBotResponse} showAvatar={true} isDarkMode={isDarkMode}/>
          )}
          {loading && (
            <div className="flex justify-start mb-4 items-start">
              <img
                src={AVATAR_URL}
                alt="Thandar Soe"
                className="w-8 h-8 sm:w-12 sm:h-12 rounded-full mr-2 sm:mr-4 shadow-lg object-cover flex-shrink-0"
              />
              <div className={`p-3 sm:p-4 rounded-2xl sm:rounded-3xl max-w-[85%] sm:max-w-xl rounded-bl-none transition-all duration-300 ${
                isDarkMode ? 'glass-message-dark' : 'glass-message-light'
              }`}>
                <div className="flex space-x-1">
                  <div className={`w-2 h-2 rounded-full animate-bounce ${
                    isDarkMode ? 'bg-white' : 'bg-gray-500'
                  }`}></div>
                  <div className={`w-2 h-2 rounded-full animate-bounce ${
                    isDarkMode ? 'bg-white' : 'bg-gray-500'
                  }`} style={{animationDelay: '0.1s'}}></div>
                  <div className={`w-2 h-2 rounded-full animate-bounce ${
                    isDarkMode ? 'bg-white' : 'bg-gray-500'
                  }`} style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </main>

        <footer className={`p-3 sm:p-6 border-t transition-all duration-300 ${
          isDarkMode ? 'glass-footer-dark border-gray-600' : 'glass-footer-light border-gray-200'
        }`}>
          <form onSubmit={handleSendMessage} className="flex space-x-2 sm:space-x-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message here..."
              className={`flex-1 p-3 sm:p-4 text-base sm:text-lg border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
                isDarkMode 
                  ? 'glass-input-dark border-gray-600 text-black placeholder-gray-300' 
                  : 'glass-input-light border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
              disabled={loading || isSpeaking || isInitialTyping}
            />
            <button
              type="submit"
              disabled={loading || isSpeaking || isInitialTyping || !input.trim()}
              className={`px-4 sm:px-8 py-3 sm:py-4 text-base sm:text-lg rounded-full focus:outline-none whitespace-nowrap ${
                isDarkMode 
                  ? 'glass-button-dark' 
                  : 'glass-button-light'
              }`}
              style={{
                background: 'transparent',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: isDarkMode ? '1px solid rgba(212, 175, 55, 0.4)' : '1px solid rgba(59, 130, 246, 0.3)',
                color: isDarkMode ? '#ffffff' : '#000000',
                fontWeight: '600',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              onMouseEnter={(e) => {
                 e.target.style.border = isDarkMode ? '2px solid rgba(212, 175, 55, 0.8)' : '2px solid rgba(59, 130, 246, 0.8)';
                 e.target.style.transform = 'translateY(-3px) scale(1.02)';
               }}
               onMouseLeave={(e) => {
                 e.target.style.border = isDarkMode ? '1px solid rgba(212, 175, 55, 0.4)' : '1px solid rgba(59, 130, 246, 0.3)';
                 e.target.style.transform = 'translateY(0) scale(1)';
               }}
            >
              {loading ? 'Sending...' : 'Send'}
            </button>
          </form>
        </footer>
      </div>
    </div>
  );
};

export default App;
