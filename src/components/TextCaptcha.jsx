import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { RefreshCw } from 'lucide-react';

const TextCaptcha = ({ onCaptchaChange }) => {
  const [captchaText, setCaptchaText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [styleValues, setStyleValues] = useState([]);

  const generateCaptcha = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    
    // Use crypto.getRandomValues for cryptographically secure random generation
    const array = new Uint32Array(18); // 6 chars * 3 values (char, rotation, color)
    crypto.getRandomValues(array);
    
    const newStyleValues = [];
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(array[i * 3] % chars.length);
      newStyleValues.push({
        rotation: (array[i * 3 + 1] % 20) - 10, // -10 to 9 degrees
        hue: array[i * 3 + 2] % 360 // 0 to 359 degrees
      });
    }
    
    setCaptchaText(result);
    setStyleValues(newStyleValues);
    setUserInput('');
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  useEffect(() => {
    onCaptchaChange(userInput.toUpperCase() === captchaText);
  }, [userInput, captchaText, onCaptchaChange]);

  const handleInputChange = (e) => {
    setUserInput(e.target.value);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between bg-gray-800 p-4 rounded-lg">
        <div 
          className="font-mono text-2xl text-white tracking-widest select-none"
          style={{
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
            transform: 'skew(-5deg)',
            letterSpacing: '8px'
          }}
        >
          {captchaText.split('').map((char, index) => (
            <span 
              key={`${captchaText}-${index}`}
              style={{
                display: 'inline-block',
                transform: `rotate(${styleValues[index]?.rotation || 0}deg)`,
                color: `hsl(${styleValues[index]?.hue || 0}, 70%, 80%)`
              }}
            >
              {char}
            </span>
          ))}
        </div>
        <button
          type="button"
          onClick={generateCaptcha}
          className="text-white hover:text-gray-300 ml-4"
        >
          <RefreshCw size={20} />
        </button>
      </div>
      
      <input
        type="text"
        placeholder="Enter the text above"
        value={userInput}
        onChange={handleInputChange}
        className="w-full px-3 py-2 border rounded-lg outline-none text-sm uppercase tracking-wider"
        maxLength={6}
      />
    </div>
  );
};

TextCaptcha.propTypes = {
  onCaptchaChange: PropTypes.func.isRequired,
};

export default TextCaptcha;