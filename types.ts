export interface Message {
  role: 'user' | 'model';
  content: string;
}

export interface UploadedFile {
  name: string;
  type: string; // The original MIME type
  base64: string; // Used for images, PDFs
  extractedText?: string; // Used for .docx, .pptx, etc.
}

export interface Conversation {
  id: string;
  title: string;
  files: UploadedFile[];
  messages: Message[];
  createdAt: string;
}