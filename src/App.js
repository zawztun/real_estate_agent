import React, { useState, useRef, useEffect } from 'react';

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
  const messagesEndRef = useRef(null);

  // Initial message with typing effect
  useEffect(() => {
    const initialMessage = 'မင်္ဂလာပါ! ကျွန်မ နာမည်က သန္တာစိုးပါ။ ကျွန်မက အိမ်ခြံမြေ အကူအညီပေးသူပါ။ မြန်မာဘာသာနဲ့ မေးရင် မြန်မာနဲ့ပဲ ပြန်ဖြေပါမယ်။ English နဲ့ မေးရင် English နဲ့ပဲ ပြန်ဖြေပါမယ်။ \n\nHello! My name is Thandar Soe, and I am your real estate assistant. I will respond in the same language you use - Myanmar for Myanmar, English for English. How can I help you today?';
    
    const typeInitialMessage = async () => {
      await speakMessage(initialMessage);
      setMessages([{ role: 'bot', text: initialMessage }]);
      setCurrentBotResponse('');
      setIsInitialTyping(false);
    };
    
    typeInitialMessage();
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
      // The prompt is updated to include language detection and matching response language.
      const prompt = `Your name is Thandar Soe. You are a helpful and friendly female real estate agent. CRITICAL INSTRUCTION: Detect the language of the user's input and respond ONLY in that same language. If user writes in Myanmar language (မြန်မာ), respond ONLY in Myanmar. If user writes in English, respond ONLY in English. Do not mix languages or provide translations. Your goal is to assist users with their real estate questions, provide information about properties, and guide them through the process. Your tone should be professional yet approachable. You can answer questions about buying, selling, or renting properties. Always end your response by asking how you can further assist the user in the SAME language they used. User: ${userMessage}`
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

  // This function simulates the typing effect by adding characters one at a time to the currentBotResponse state
  const speakMessage = (text) => {
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
  };

  const Message = ({ role, text, showAvatar = false }) => {
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
          className={`p-3 sm:p-4 rounded-2xl sm:rounded-3xl max-w-[85%] sm:max-w-xl 
          ${isUser ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-bl-none'} 
          ${!isUser && !showAvatar ? 'ml-10 sm:ml-16' : ''} whitespace-pre-wrap text-sm sm:text-base`}
        >
          <p>{text}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans p-2 sm:p-4">
      <div className="flex flex-col w-full max-w-3xl h-[90vh] sm:h-[80vh] bg-white shadow-xl rounded-2xl sm:rounded-3xl overflow-hidden">
        <header className="bg-blue-600 text-white p-4 sm:p-6 shadow-md flex items-center">
          <img
            src={AVATAR_URL}
            alt="Thandar Soe"
            className="w-12 h-12 sm:w-16 sm:h-16 rounded-full mr-3 sm:mr-4 shadow-lg border-2 border-white object-cover flex-shrink-0"
          />
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold leading-tight">Thandar Soe (Licensed Real Estate Realtor)</h1>
            <p className="text-sm sm:text-lg mt-1">📞 518-707-8089</p>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-3 sm:space-y-4 bg-gray-50">
          {messages.map((msg, index) => (
            <Message key={index} role={msg.role} text={msg.text} showAvatar={msg.role === 'bot'}/>
          ))}
          {/* Display the in-progress message */}
          {(isSpeaking || isInitialTyping) && (
            <Message role='bot' text={currentBotResponse} showAvatar={true}/>
          )}
          {loading && (
            <div className="flex justify-start mb-4 items-start">
              <img
                src={AVATAR_URL}
                alt="Thandar Soe"
                className="w-8 h-8 sm:w-12 sm:h-12 rounded-full mr-2 sm:mr-4 shadow-lg object-cover flex-shrink-0"
              />
              <div className="p-3 sm:p-4 rounded-2xl sm:rounded-3xl max-w-[85%] sm:max-w-xl bg-gray-200 text-gray-800 rounded-bl-none">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </main>

        <footer className="p-3 sm:p-6 bg-white border-t border-gray-200">
          <form onSubmit={handleSendMessage} className="flex space-x-2 sm:space-x-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message here..."
              className="flex-1 p-3 sm:p-4 text-sm sm:text-base border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading || isSpeaking || isInitialTyping}
            />
            <button
              type="submit"
              disabled={loading || isSpeaking || isInitialTyping || !input.trim()}
              className="px-4 sm:px-8 py-3 sm:py-4 text-sm sm:text-base bg-blue-600 text-white rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
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
