import React from 'react';
import type { Conversation } from '../types';
import { Icons } from './Icons';

interface SidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation
}) => {
  return (
    <div className="w-80 bg-gray-900 border-r border-gray-700/50 flex flex-col flex-shrink-0">
      <div className="p-4 border-b border-gray-700/50 flex justify-between items-center">
        <div className="flex items-center gap-3">
           <Icons.logo className="w-8 h-8 text-brand-blue" />
           <h1 className="text-xl font-bold">AI Research</h1>
        </div>
      </div>
       <div className="p-3">
        <button
          onClick={onNewConversation}
          className="w-full flex items-center justify-center gap-2 bg-brand-blue hover:bg-blue-500 text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <Icons.plus className="w-5 h-5"/>
          New Research
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        <nav className="p-2">
          <p className="px-2 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">History</p>
          <div className="space-y-2">
            {conversations.map(convo => (
              <div
                key={convo.id}
                role="button"
                tabIndex={0}
                aria-label={`Select conversation: ${convo.title}`}
                className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 border border-transparent ${
                  activeConversationId === convo.id
                    ? 'bg-gray-700/80 border-gray-600 shadow-inner-lg'
                    : 'bg-gray-800/50 hover:bg-gray-800 hover:border-gray-700'
                }`}
                onClick={() => onSelectConversation(convo.id)}
                onKeyDown={(e) => e.key === 'Enter' && onSelectConversation(convo.id)}
              >
                <div className="flex items-center gap-3 truncate">
                  <Icons.chat className="w-4 h-4 text-gray-400 flex-shrink-0"/>
                  <span className="truncate text-sm font-medium">{convo.title}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteConversation(convo.id);
                  }}
                  aria-label={`Delete conversation: ${convo.title}`}
                  className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-opacity ml-2 flex-shrink-0"
                >
                    <Icons.trash className="w-4 h-4"/>
                </button>
              </div>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
};