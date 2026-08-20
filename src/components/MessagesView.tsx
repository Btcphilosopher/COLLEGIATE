import React, { useState, useEffect, useRef } from 'react';
import { Conversation, Message, User, UserSummary } from '../types';
import { Send, MessageSquare, Cpu, CheckCheck, Clock, User as UserIcon } from 'lucide-react';
import { cRuntime } from '../c-runtime/c_bridge';

interface MessagesViewProps {
  currentUser: User | null;
  activePeerUser?: UserSummary | null;
  onNavigate: (view: string, targetId?: string) => void;
}

export const MessagesView: React.FC<MessagesViewProps> = ({ currentUser, activePeerUser, onNavigate }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [compressionMetrics, setCompressionMetrics] = useState<{ raw: number; comp: number; ratio: number } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/conversations');
      if (res.ok) {
        const data: Conversation[] = await res.json();
        setConversations(data);
        if (!activeConvId && data.length > 0) {
          setActiveConvId(data[0].id);
        }
      }
    } catch (err) {
      console.error('Conversations load failed', err);
    }
  };

  const fetchMessages = async (convId: string) => {
    try {
      const res = await fetch(`/api/conversations/${convId}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error('Messages load failed', err);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [currentUser]);

  useEffect(() => {
    if (activeConvId) {
      fetchMessages(activeConvId);
    }
  }, [activeConvId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeConvId || isSending) return;

    setIsSending(true);
    const text = messageInput.trim();

    // Demonstrate C-runtime compression on text payload
    const comp = cRuntime.compressPayload(text);
    setCompressionMetrics({
      raw: comp.rawSize,
      comp: comp.compressedSize,
      ratio: comp.ratio,
    });

    try {
      const res = await fetch(`/api/conversations/${activeConvId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text }),
      });
      if (res.ok) {
        const newMsg = await res.json();
        setMessages((prev) => [...prev, newMsg]);
        setMessageInput('');
        fetchConversations();
      }
    } catch (err) {
      console.error('Send message failed', err);
    } finally {
      setIsSending(false);
    }
  };

  const activeConv = conversations.find((c) => c.id === activeConvId);

  return (
    <div className="bg-white border border-slate-300 rounded shadow-xs overflow-hidden h-[600px] flex flex-col md:flex-row text-xs" id="collegiate-messages-view">
      
      {/* Left Column: Conversations List (1/3) */}
      <div className="w-full md:w-64 border-r border-slate-200 flex flex-col bg-slate-50/50 shrink-0">
        <div className="p-3 border-b border-slate-200 bg-white">
          <h2 className="font-serif font-bold text-slate-900 text-sm flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-blue-900" />
            Direct Messages
          </h2>
          <span className="text-[10px] text-slate-400 font-mono">C-Compressed Real-time Socket</span>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-slate-400">No active conversations yet.</div>
          ) : (
            conversations.map((conv) => {
              const isActive = conv.id === activeConvId;
              return (
                <button
                  key={conv.id}
                  onClick={() => setActiveConvId(conv.id)}
                  className={`w-full p-2.5 flex items-start gap-2.5 text-left transition-colors cursor-pointer ${
                    isActive ? 'bg-blue-50/90 border-l-3 border-blue-900' : 'hover:bg-slate-100/70'
                  }`}
                >
                  <img
                    src={conv.peer.profile_photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50'}
                    alt=""
                    className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                  />
                  <div className="truncate flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 truncate">{conv.peer.display_name}</span>
                      {conv.last_message && (
                        <span className="text-[10px] text-slate-400">
                          {new Date(conv.last_message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">
                      {conv.peer.university_name.split(' ')[0]} · '{String(conv.peer.graduation_year).slice(-2)}
                    </div>
                    {conv.last_message && (
                      <div className="text-[11px] text-slate-600 truncate mt-0.5">
                        {conv.last_message.content}
                      </div>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Right Column: Chat Stream & Message Input (2/3) */}
      <div className="flex-1 flex flex-col bg-white">
        
        {/* Chat Header */}
        {activeConv ? (
          <div className="p-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2.5">
              <img
                src={activeConv.peer.profile_photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50'}
                alt=""
                className="w-8 h-8 rounded-full object-cover border border-slate-200"
              />
              <div>
                <button
                  onClick={() => onNavigate('profile', activeConv.peer.id)}
                  className="font-bold text-blue-900 hover:underline text-left block"
                >
                  {activeConv.peer.display_name}
                </button>
                <div className="text-[10px] text-slate-500">
                  {activeConv.peer.university_name} · Class of '{String(activeConv.peer.graduation_year).slice(-2)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[10px] font-mono text-blue-950 bg-blue-100/60 px-2 py-0.5 rounded border border-blue-200">
              <Cpu className="w-3 h-3 text-blue-700" />
              <span>C WASM Socket Stream</span>
            </div>
          </div>
        ) : (
          <div className="p-3 border-b border-slate-200 text-slate-400">Select a conversation</div>
        )}

        {/* Message Bubbles Thread */}
        <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-[#f8fafc]">
          {messages.map((msg) => {
            const isMe = msg.sender_id === currentUser?.id;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[75%] rounded p-2.5 shadow-2xs ${
                    isMe
                      ? 'bg-[#1d3c6a] text-white rounded-br-none'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                  }`}
                >
                  <div className="text-xs leading-relaxed font-sans">{msg.content}</div>
                  <div
                    className={`text-[9px] mt-1 flex items-center justify-end gap-1 ${
                      isMe ? 'text-blue-200' : 'text-slate-400'
                    }`}
                  >
                    <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {isMe && <CheckCheck className="w-3 h-3" />}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Compression Banner if message sent */}
        {compressionMetrics && (
          <div className="px-3 py-1 bg-slate-100 text-[10px] font-mono text-slate-500 border-t border-slate-200 flex items-center justify-between">
            <span>C Client LZ Compression:</span>
            <span>{compressionMetrics.raw}B → {compressionMetrics.comp}B ({compressionMetrics.ratio}% reduction)</span>
          </div>
        )}

        {/* Message Input Form */}
        <form onSubmit={handleSendMessage} className="p-2.5 border-t border-slate-200 bg-white flex gap-2">
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Type a message to send over collegiate socket..."
            className="flex-1 border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={!messageInput.trim() || isSending}
            className="bg-[#1d3c6a] hover:bg-[#152c4e] disabled:opacity-50 text-white font-bold px-4 py-1.5 rounded flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
          >
            <Send className="w-3 h-3" />
            <span>Send</span>
          </button>
        </form>

      </div>

    </div>
  );
};
