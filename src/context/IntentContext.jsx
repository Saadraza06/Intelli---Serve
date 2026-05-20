import React, { createContext, useState, useContext } from 'react';

const IntentContext = createContext();

export const useIntent = () => useContext(IntentContext);

export const IntentProvider = ({ children }) => {
  const [intentData, setIntentData] = useState(null);
  const [logs, setLogs] = useState([]);
  const [bookingState, setBookingState] = useState(null);
  const [stressTest, setStressTest] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState(null);

  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const addLog = (log) => setLogs((prev) => [...prev, { ...log, timestamp: Date.now() }]);

  const value = {
    intentData,
    setIntentData,
    logs,
    addLog,
    bookingState,
    setBookingState,
    stressTest,
    setStressTest,
    darkMode,
    setDarkMode,
    selectedProvider,
    setSelectedProvider,
  };

  return <IntentContext.Provider value={value}>{children}</IntentContext.Provider>;
};
