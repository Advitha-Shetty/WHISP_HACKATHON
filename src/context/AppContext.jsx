import React, { createContext, useState, useContext } from 'react';

const AppContext = createContext();

const translations = {
  en: {
    home: "Home",
    yourDistrict: "Your District",
    discussion: "Discussion",
    profile: "Profile",
    login: "Login",
    signup: "Sign Up",
    forgotPassword: "Forgot Password",
    // Add more translations as needed
  },
  kn: {
    home: "ಮುಖಪುಟ",
    yourDistrict: "ನಿಮ್ಮ ಜಿಲ್ಲೆ",
    discussion: "ಚರ್ಚೆ",
    profile: "ಪ್ರೊಫೈಲ್",
    login: "ಲಾಗಿನ್",
    signup: "ಸೈನ್ ಅಪ್",
    forgotPassword: "ಪಾಸ್ವರ್ಡ್ ಮರೆತಿರಾ",
  }
};

export const AppProvider = ({ children }) => {
  const [page, setPage] = useState('home');
  const [lang, setLang] = useState('en');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userDistrict, setUserDistrict] = useState('Bengaluru Urban');

  const t = (key) => {
    return translations[lang]?.[key] || key;
  };

  return (
    <AppContext.Provider value={{
      page,
      setPage,
      lang,
      setLang,
      t,
      isAuthenticated,
      setIsAuthenticated,
      userDistrict,
      setUserDistrict
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};