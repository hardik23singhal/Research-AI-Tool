import React, { useState, useEffect } from 'react';
import type { Conversation, Message, UploadedFile } from './types';
import { Sidebar } from './components/Sidebar';
import { ChatView } from './components/ChatView';
import { callGeminiStream } from './services/geminiService';

const App: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load conversations from local storage on initial render
  useEffect(() => {
    try {
      const savedConversations = localStorage.getItem('conversations');
      if (savedConversations) {
        setConversations(JSON.parse(savedConversations));
      }
      const savedActiveId = localStorage.getItem('activeConversationId');
      if(savedActiveId) {
        setActiveConversationId(JSON.parse(savedActiveId));
      }
    } catch (error) {
      console.error("Failed to load from local storage", error);
    }
  }, []);

  // Save conversations to local storage whenever they change
  useEffect(() => {
    try {
        localStorage.setItem('conversations', JSON.stringify(conversations));
        if(activeConversationId) {
           localStorage.setItem('activeConversationId', JSON.stringify(activeConversationId));
        } else {
           localStorage.removeItem('activeConversationId');
        }
    } catch (error) {
       console.error("Failed to save to local storage", error);
    }
  }, [conversations, activeConversationId]);
  
  const handleNewConversation = () => {
    const newConversation: Conversation = {
      id: `convo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: 'New Research',
      files: [],
      messages: [],
      createdAt: new Date().toISOString(),
    };
    setConversations(prev => [newConversation, ...prev]);
    setActiveConversationId(newConversation.id);
  };

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
  };
  
  const handleDeleteConversation = (id: string) => {
    const updatedConversations = conversations.filter(c => c.id !== id);
    setConversations(updatedConversations);
    if (activeConversationId === id) {
      setActiveConversationId(updatedConversations.length > 0 ? updatedConversations[0].id : null);
    }
  };
  
  const handleSendMessage = async (prompt: string, files: UploadedFile[]) => {
    let currentConversationId = activeConversationId;
    // If there's no active conversation, create a new one
    if (!currentConversationId) {
      const newConversation: Conversation = {
        id: `convo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: prompt.substring(0, 40) + (prompt.length > 40 ? '...' : ''),
        files: [],
        messages: [],
        createdAt: new Date().toISOString(),
      };
      setConversations(prev => [newConversation, ...prev]);
      setActiveConversationId(newConversation.id);
      currentConversationId = newConversation.id;
    }
    
    if (!currentConversationId) return;

    const userMessage: Message = { role: 'user', content: prompt };

    // Update state to show user message immediately
    setConversations(prev =>
      prev.map(c =>
        c.id === currentConversationId
          ? {
              ...c,
              files: [...c.files, ...files],
              messages: [...c.messages, userMessage],
              title: c.messages.length === 0 ? prompt.substring(0, 40) + (prompt.length > 40 ? '...' : '') : c.title,
            }
          : c
      )
    );

    setIsLoading(true);

    try {
      const activeConvo = conversations.find(c => c.id === currentConversationId) || { files: [] };
      const allFiles = [...activeConvo.files, ...files];

      const responseStream = await callGeminiStream(prompt, allFiles);

      const modelMessage: Message = { role: 'model', content: '' };
      
      // Add empty model message
      setConversations(prev =>
        prev.map(c =>
          c.id === currentConversationId
            ? { ...c, messages: [...c.messages, modelMessage] }
            : c
        )
      );

      // Stream in the response
      for await (const chunk of responseStream) {
        const chunkText = chunk.text;
        if (chunkText) {
          modelMessage.content += chunkText;
          setConversations(prev =>
            prev.map(c => {
              if (c.id === currentConversationId) {
                const newMessages = [...c.messages];
                newMessages[newMessages.length - 1] = { ...modelMessage };
                return { ...c, messages: newMessages };
              }
              return c;
            })
          );
        }
      }
    } catch (error) {
      console.error("Failed to get response from Gemini", error);
      const errorMessageContent = error instanceof Error ? error.message : "Sorry, I encountered an error. Please try again.";
      const errorMessage: Message = { role: 'model', content: errorMessageContent };
       setConversations(prev =>
        prev.map(c =>
          c.id === currentConversationId
            ? { ...c, messages: c.messages.map(m => m.role === 'model' && m.content === '' ? errorMessage : m) }
            : c
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const activeConversation = conversations.find(c => c.id === activeConversationId) || null;

  return (
    <div className="h-screen w-screen flex bg-gray-800 text-white font-sans">
      <Sidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onNewConversation={handleNewConversation}
        onSelectConversation={handleSelectConversation}
        onDeleteConversation={handleDeleteConversation}
      />
      <main className="flex-1 flex flex-col">
        <ChatView
          conversation={activeConversation}
          isLoading={isLoading}
          onSendMessage={handleSendMessage}
        />
      </main>
    </div>
  );
};

export default App;
