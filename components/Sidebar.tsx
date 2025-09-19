import React, { useState, useRef, useEffect } from 'react';
import type { Conversation } from '../types';
import { Icons } from './Icons';

interface SidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onRenameConversation,
}) => {
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [tempTitle, setTempTitle] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (renamingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [renamingId]);

  const handleStartRename = (convo: Conversation) => {
    setRenamingId(convo.id);
    setTempTitle(convo.title);
  };

  const handleCancelRename = () => {
    setRenamingId(null);
    setTempTitle('');
  };

  const handleSaveRename = () => {
    if (renamingId && tempTitle.trim()) {
      const originalTitle = conversations.find(c => c.id === renamingId)?.title;
      if (tempTitle.trim() !== originalTitle) {
        onRenameConversation(renamingId, tempTitle.trim());
      }
    }
    handleCancelRename();
  };


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
                tabIndex={renamingId === convo.id ? -1 : 0}
                aria-label={renamingId === convo.id ? `Renaming conversation: ${convo.title}` : `Select conversation: ${convo.title}`}
                className={`group flex items-center justify-between p-3 rounded-lg transition-all duration-200 border border-transparent ${
                  activeConversationId === convo.id && renamingId !== convo.id
                    ? 'bg-gray-700/80 border-gray-600 shadow-inner-lg'
                    : 'bg-gray-800/50'
                } ${renamingId !== convo.id ? 'hover:bg-gray-800 hover:border-gray-700 cursor-pointer' : ''}`}
                onClick={() => renamingId !== convo.id && onSelectConversation(convo.id)}
                onKeyDown={(e) => e.key === 'Enter' && renamingId !== convo.id && onSelectConversation(convo.id)}
              >
                <div className="flex items-center gap-3 truncate flex-1">
                  <Icons.chat className="w-4 h-4 text-gray-400 flex-shrink-0"/>
                  {renamingId === convo.id ? (
                     <input
                      ref={inputRef}
                      type="text"
                      value={tempTitle}
                      onChange={(e) => setTempTitle(e.target.value)}
                      onBlur={handleSaveRename}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') { e.preventDefault(); handleSaveRename(); }
                        if (e.key === 'Escape') { e.preventDefault(); handleCancelRename(); }
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="bg-gray-600 text-sm font-medium outline-none w-full p-1 rounded-md focus:ring-2 focus:ring-brand-blue"
                    />
                  ) : (
                    <span className="truncate text-sm font-medium">{convo.title}</span>
                  )}
                </div>
                
                {renamingId !== convo.id && (
                  <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex-shrink-0 space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartRename(convo);
                      }}
                      aria-label={`Rename conversation: ${convo.title}`}
                      className="text-gray-500 hover:text-brand-blue"
                    >
                        <Icons.pencil className="w-4 h-4"/>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteConversation(convo.id);
                      }}
                      aria-label={`Delete conversation: ${convo.title}`}
                      className="text-gray-500 hover:text-red-400"
                    >
                        <Icons.trash className="w-4 h-4"/>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
};