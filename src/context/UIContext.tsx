import React, { createContext, useContext, useState } from 'react';

interface UIContextType {
  isVoiceAssistantOpen: boolean;
  openVoiceAssistant: () => void;
  closeVoiceAssistant: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isVoiceAssistantOpen, setIsVoiceAssistantOpen] = useState(false);

  const openVoiceAssistant = () => setIsVoiceAssistantOpen(true);
  const closeVoiceAssistant = () => setIsVoiceAssistantOpen(false);

  return (
    <UIContext.Provider value={{ isVoiceAssistantOpen, openVoiceAssistant, closeVoiceAssistant }}>
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) throw new Error('useUI must be used within UIProvider');
  return context;
};
