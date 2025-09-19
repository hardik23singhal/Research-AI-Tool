import React, { useEffect, useRef } from 'react';
import type { Conversation, Message, UploadedFile } from '../types';
import { ChatInput } from './ChatInput';
import { Icons } from './Icons';

interface ChatViewProps {
  conversation: Conversation | null;
  isLoading: boolean;
  onSendMessage: (prompt: string, files: UploadedFile[]) => void;
}

const ChatMessage: React.FC<{ message: Message }> = ({ message }) => {
  const isModel = message.role === 'model';
  return (
    <div className={`flex items-start gap-4 ${isModel ? 'bg-gray-800/50' : ''} p-4 rounded-lg`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isModel ? 'bg-blue-600' : 'bg-gray-600'}`}>
        {isModel ? <Icons.logo className="w-5 h-5 text-white" /> : <Icons.user className="w-5 h-5 text-white" />}
      </div>
      <div className="flex-1 pt-0.5 prose prose-invert prose-p:my-1 prose-pre:bg-gray-900/70 prose-pre:p-3 prose-pre:rounded-md max-w-full">
        <pre className="whitespace-pre-wrap font-sans text-gray-200 text-base leading-relaxed">{message.content}</pre>
      </div>
    </div>
  );
};

export const ChatView: React.FC<ChatViewProps> = ({ conversation, isLoading, onSendMessage }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation?.messages]);

  const isInteractionDisabled = !conversation || conversation.messages.length === 0;

  return (
    <div className="flex-1 flex flex-col bg-gray-800">
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {conversation && conversation.messages.length > 0 ? (
          conversation.messages.map((msg, index) => <ChatMessage key={index} message={msg} />)
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Icons.logo className="w-24 h-24 text-gray-700"/>
            <h2 className="text-2xl font-semibold mt-4">AI Research Assistant</h2>
            <p className="mt-2 text-center max-w-md">
              Start a new conversation or select one from the sidebar. You can upload documents to ask questions about them.
            </p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-700/50 bg-gray-800">
         <div className="max-w-4xl mx-auto">
            <ChatInput 
                onSendMessage={onSendMessage} 
                isLoading={isLoading} 
                isInteractionDisabled={isInteractionDisabled}
            />
         </div>
      </div>
    </div>
  );
};
