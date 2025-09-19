import React, { useState, useRef, useLayoutEffect } from 'react';
import type { UploadedFile } from '../types';
import { processFiles } from '../utils/fileUtils';
import { Icons } from './Icons';

interface ChatInputProps {
  onSendMessage: (prompt: string, files: UploadedFile[]) => void;
  isLoading: boolean;
  isInteractionDisabled: boolean;
}

const FileChip: React.FC<{ file: UploadedFile; onRemove: () => void }> = ({ file, onRemove }) => (
    <div className="flex items-center gap-2 bg-gray-600 text-sm rounded-full pl-3 pr-2 py-1">
        <Icons.file className="w-4 h-4 text-gray-300 flex-shrink-0" />
        <span className="truncate max-w-[200px]">{file.name}</span>
        <button onClick={onRemove} className="text-gray-400 hover:text-white flex-shrink-0">
            <Icons.close className="w-4 h-4"/>
        </button>
    </div>
);


export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading, isInteractionDisabled }) => {
  const [prompt, setPrompt] = useState('');
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // FIX: The input is only truly disabled if the conversation is fresh AND no files have been staged locally.
  const isInputDisabled = isInteractionDisabled && files.length === 0;
  
  // FIX: The send button should be enabled if there's anything to send, regardless of initial conversation state.
  const canSend = !isLoading && (prompt.trim().length > 0 || files.length > 0);

  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [prompt]);


  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = await processFiles(event.target.files);
      setFiles(prev => [...prev, ...newFiles]);
       if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSend = () => {
    if (!canSend) return;
    onSendMessage(prompt.trim(), files);
    setPrompt('');
    setFiles([]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const placeholder = isInputDisabled 
    ? "Upload a document to begin..."
    : "Ask a question about your documents...";

  return (
    <div className={`bg-gray-700 rounded-lg transition-opacity ${isInputDisabled ? 'opacity-60' : ''}`}>
        {files.length > 0 && (
            <div className="flex flex-wrap gap-2 p-2 border-b border-gray-600">
                {files.map((file, index) => (
                    <FileChip key={index} file={file} onRemove={() => removeFile(index)} />
                ))}
            </div>
        )}
      <div className="flex items-start gap-2 p-2">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2 mt-1 text-gray-400 hover:text-white hover:bg-gray-600 rounded-full transition-colors flex-shrink-0"
          disabled={isLoading}
          aria-label="Attach file"
        >
          <Icons.paperclip className="w-5 h-5"/>
        </button>
        <input
          type="file"
          multiple
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*,application/pdf,text/plain,.md,.docx,.pptx,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation"
        />
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder={placeholder}
          className="flex-1 bg-transparent resize-none outline-none placeholder-gray-500 text-gray-200 py-2 max-h-48 disabled:cursor-not-allowed"
          rows={1}
          disabled={isLoading || isInputDisabled}
        />
        <button
          onClick={handleSend}
          disabled={!canSend}
          className="p-2 mt-1 bg-brand-blue text-white rounded-full transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-blue-500 flex-shrink-0"
           aria-label="Send message"
        >
          {isLoading ? <Icons.loader className="w-5 h-5"/> : <Icons.send className="w-5 h-5"/>}
        </button>
      </div>
    </div>
  );
};