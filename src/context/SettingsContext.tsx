
import React, { createContext, useContext, useState } from 'react';

interface SettingsContextType {
  currency: string;
  setCurrency: (value: string) => void;
  language: string;
  setLanguage: (value: string) => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

const defaultSettings: SettingsContextType = {
  currency: 'USD',
  setCurrency: () => {},
  language: 'en',
  setLanguage: () => {},
  darkMode: false,
  setDarkMode: () => {},
};

const SettingsContext = createContext<SettingsContextType>(defaultSettings);

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrency] = useState<string>('USD');
  const [language, setLanguage] = useState<string>('en');
  const [darkMode, setDarkMode] = useState<boolean>(false);

  return (
    <SettingsContext.Provider
      value={{
        currency,
        setCurrency,
        language,
        setLanguage,
        darkMode,
        setDarkMode,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export default SettingsContext;
