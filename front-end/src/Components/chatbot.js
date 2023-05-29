import React, { useState, useEffect } from 'react';
import '../Styles/Chatbot.css';

const Chatbot = () => {

  const loadedmessages = localStorage.getItem("chatbotMessages")
  ? JSON.parse(localStorage.getItem("chatbotMessages"))
  : [];

  const [messages, setMessages] = useState(loadedmessages);
  const [inputValue, setInputValue] = useState('');

  // Save conversation to local storage whenever messages change
  useEffect(() => {
    localStorage.setItem('chatbotMessages', JSON.stringify(messages));
  }, [messages]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // Create a new message object for the user's input
    const userMessage = {
      text: inputValue,
      sender: 'user',
    };
    
    // Add the user's message to the messages array
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    // Generate a bot reply
    const botReply = await generateBotReply(inputValue);

    // Create a new message object for the bot's reply
    const botMessage = {
      text: botReply,
      sender: 'bot',
    };

    // Add the bot's reply to the messages array after a short delay
    setTimeout(() => {
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    }, 500);

    // Clear the input field
    setInputValue('');
  };

  const handleClearConversation = () => {
    // Clear the conversation by resetting the messages state
    setMessages([]);
    // Clear the local storage as well
    localStorage.removeItem('chatbotMessages');
  };

  const generateBotReply = async (userInput) => {
    try {
      const response = await fetch('http://localhost:5000/generateBotReply', {
        method: 'POST',
        body: JSON.stringify({ user_input: userInput }),
        mode: 'cors',
        headers: {'Content-Type': 'application/json' }
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch bot response');
      }
  
      const data = await response.json();
      const botReply = data.answer; 
      console.log(botReply)// Modify this based on the response structure of your model
  
      return botReply.toString(); // Convert the response to a string value
    } catch (error) {
      console.error('Error generating bot reply:', error);
      return 'Im sorry, an error occurred while processing your request.';
    }
  };
  
  const renderMessages = () => {
    return messages.map((message, index) => {
      if (message.sender === 'user') {
        return (
          <div key={index} className="message user">
            {message.text}
          </div>
        );
      } else if (message.sender === 'bot') {
        return (
          <div key={index} className="message bot">
            {message.text}
          </div>
        );
      }
      return null; // Exclude any other message senders, if applicable
    });
  };

  return (
    <div className="chatbot">
      <div className="chatbot-header">
        <button className="clear-button" onClick={handleClearConversation}>
          Clear
        </button>
      </div>
      <div className="chatbot-messages">{renderMessages()}</div>
      <form className="chatbot-form" onSubmit={handleFormSubmit}>
        <input
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Type your message..."
          className="chatbot-input"
        />
        <button type="submit" className="chatbot-button">
          Send
        </button>
      </form>
    </div>
  );
};

export default Chatbot;
