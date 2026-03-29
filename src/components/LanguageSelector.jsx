import React from 'react';
import './LanguageSelector.css';

const LanguageSelector = ({ language, setLanguage }) => {
  return (
    <div className="language-selector">
      <button 
        className={`lang-btn ${language === 'english' ? 'active' : ''}`}
        onClick={() => setLanguage('english')}
      >
        English
      </button>
      <button 
        className={`lang-btn ${language === 'kannada' ? 'active' : ''}`}
        onClick={() => setLanguage('kannada')}
      >
        ಕನ್ನಡ
      </button>
    </div>
  );
};

export default LanguageSelector;