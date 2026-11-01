import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FaPaperclip, FaFileAlt } from 'react-icons/fa';

const Chat = ({ conversationId }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const fetchMessages = async () => {
    try {
      const res = await api.get(`/api/chat/messages/${conversationId}`);
      setMessages(res.data || []);
      scrollToBottom();
    } catch (err) {
      console.error('Error fetching messages:', err);
      if (err.response?.status === 403) {
        toast.error('You do not have permission to view this conversation');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    try {
      await api.post('/api/chat/messages', {
        conversation_id: conversationId,
        content: newMessage
      });
      setNewMessage('');
      fetchMessages();
      inputRef.current?.focus();
    } catch (err) {
      toast.error('Failed to send message');
    }
  };

  const sendFile = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      await api.post(`/api/chat/upload/${conversationId}`, formData);
      setFile(null);
      fetchMessages();
      toast.success('File sent');
    } catch (err) {
      toast.error('Failed to send file');
    }
  };

  if (loading) return <div className="p-4 text-center text-gray-500">Loading chat...</div>;
  if (!messages) return <div className="p-4 text-center text-gray-500">No messages</div>;

  return (
    <div className="flex flex-col h-96 border rounded-lg bg-white shadow-sm">
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 py-8">No messages yet. Say hello!</div>
        )}
        {messages.map((msg) => {
          // Determine if the current user sent this message
          const isSender = msg.sender_id === user?.id;
          // Or compare with conversation client/officer IDs
          return (
            <div key={msg.id} className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs rounded-lg px-4 py-2 ${isSender ? 'bg-brand-red text-white' : 'bg-gray-100'}`}>
                <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                {msg.attachments && msg.attachments.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {msg.attachments.map(att => {
                      const url = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/${att.file_path}`;
                      return (
                        <a key={att.id} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm underline">
                          <FaFileAlt /> {att.file_name}
                        </a>
                      );
                    })}
                  </div>
                )}
                <span className="text-xs opacity-75 block mt-1">{new Date(msg.created_at).toLocaleTimeString()}</span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="border-t p-2 flex gap-2 items-center">
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          className="hidden"
          id="chat-file-upload"
        />
        <label htmlFor="chat-file-upload" className="cursor-pointer bg-gray-200 p-2 rounded hover:bg-gray-300">
          <FaPaperclip />
        </label>
        {file && (
          <span className="text-sm text-gray-600 truncate max-w-24">{file.name}</span>
        )}
        <input
          ref={inputRef}
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 border rounded px-2 py-1"
          placeholder="Type a message..."
        />
        <button type="submit" className="btn-primary py-1 px-3 text-sm">Send</button>
        {file && (
          <button type="button" onClick={sendFile} className="btn-outline py-1 px-3 text-sm">Upload</button>
        )}
      </form>
    </div>
  );
};

export default Chat;