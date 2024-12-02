import React, { useState } from 'react';
import { Send, Image, Film, Mic } from 'lucide-react';

interface MessageComposerProps {
  onSendMessage: (content: string) => void;
  onSendMedia: (file: File, type: 'image' | 'video') => void;
  recipientName: string;
}

export function MessageComposer({
  onSendMessage,
  onSendMedia,
  recipientName
}: MessageComposerProps) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Message"
        className="flex-1 bg-[#1a1a1a] text-[#00ff9d] rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#00ff9d]"
      />
      <button
        onClick={handleSend}
        className="terminal-button p-2 min-w-[40px] flex items-center justify-center"
        aria-label="Send message"
      >
        <Send className="h-5 w-5" />
      </button>
    </div>
  );
}