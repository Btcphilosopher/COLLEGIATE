import React, { useState, useEffect, useRef } from 'react';
import { UserSummary, User, Message } from '../types';
import { Send, X, Minimize2, Cpu, CheckCheck } from 'lucide-react';
import { cRuntime } from '../c-runtime/c_bridge';

interface QuickChatModalProps {
  peerUser: UserSummary | null;
  currentUser: User | null;
  onClose: () => void;
}

export const QuickChatModal: React.FC<QuickChatModalProps> = ({ peerUser, currentUser, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (peerUser) {
      setMessages([
        {
          id: 'm1',
          conversation_id: 'c1',
          sender_id: peerUser.id,
          sender_name: peerUser.display_name,
          content: `Hi ${currentUser?.display_name?.split(' ')[0] || 'there'}! Are you attending the economics colloquium this afternoon?`,
          is_read: true,
          created_at: new Date(Date.now() - 3600000).toISOString(),
        },
      ]);
    }
  }, [peerUser, currentUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!peerUser) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg: Message = {
      id: String(Date.now()),
      conversation_id: 'quick_chat',
      sender_id: currentUser?.id || 'me',
      sender_name: currentUser?.display_name || 'Me',
      content: inputText.trim(),
      is_read: true,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');

    // Simulate instant academic peer reply
    setTimeout(() => {
      const replies = [
        "Sounds great! Let's reserve a study carrel in Sterling Library.",
        "Got it! I've sent the problem set notes to your collegiate inbox.",
        "See you at the yard colloquium at 4:00 PM!",
      ];
      const peerMsg: Message = {
        id: String(Date.now() + 1),
        conversation_id: 'quick_chat',
        sender_id: peerUser.id,
        sender_name: peerUser.display_name,
        content: replies[Math.floor(Math.random() * replies.length)],
        is_read: true,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, peerMsg]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 w-72 sm:w-80 bg-white border border-slate-300 rounded-t-lg shadow-2xl overflow-hidden font-sans text-xs" id="collegiate-quick-chat">
      
      {/* Header */}
      <div className="bg-[#1d3c6a] text-white p-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2 truncate">
          <div className="relative">
            <img src={peerUser.profile_photo || ''} alt="" className="w-6 h-6 rounded-full object-cover border border-white/60" />
            <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-400 rounded-full border border-slate-900" />
          </div>
          <div className="truncate">
            <div className="font-bold truncate">{peerUser.display_name}</div>
            <div className="text-[10px] text-blue-200 truncate">{peerUser.university_name.split(' ')[0]}</div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-blue-900 rounded text-blue-200 hover:text-white"
          >
            <Minimize2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-blue-900 rounded text-blue-200 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Chat Messages */}
          <div className="h-64 p-3 overflow-y-auto space-y-2.5 bg-[#f8fafc]">
            {messages.map((msg) => {
              const isMe = msg.sender_id === currentUser?.id;
              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[80%] p-2 rounded text-xs leading-relaxed ${
                      isMe
                        ? 'bg-[#1d3c6a] text-white rounded-br-none'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-2xs'
                    }`}
                  >
                    {msg.content}
                    <div className={`text-[9px] mt-0.5 flex justify-end ${isMe ? 'text-blue-200' : 'text-slate-400'}`}>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Composer */}
          <form onSubmit={handleSend} className="p-2 border-t border-slate-200 bg-white flex gap-1.5">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type message..."
              className="flex-1 border border-slate-300 rounded px-2.5 py-1 text-xs focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="bg-[#1d3c6a] hover:bg-[#152c4e] disabled:opacity-50 text-white font-bold px-3 py-1 rounded flex items-center justify-center cursor-pointer"
            >
              <Send className="w-3 h-3" />
            </button>
          </form>
        </>
      )}
    </div>
  );
};
