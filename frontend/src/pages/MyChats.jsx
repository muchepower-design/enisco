import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Chat from '../components/Chat';
import { FaComments, FaPlus } from 'react-icons/fa';
import toast from 'react-hot-toast';

const MyChats = () => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchConversations = async () => {
    try {
      const res = await api.get('/api/chat/conversations');
      setConversations(res.data);
    } catch (err) {
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  const startNewConversation = async () => {
    try {
      const res = await api.post('/api/chat/conversations');
      toast.success('New conversation started!');
      setSelectedConv(res.data.id);
      fetchConversations();
    } catch (err) {
      toast.error('Failed to start conversation');
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-black flex items-center gap-2"><FaComments /> My Conversations</h1>
        <button onClick={startNewConversation} className="btn-primary">
          <FaPlus /> New Conversation
        </button>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="glass-card p-4">
          <h2 className="font-bold mb-3">Conversations</h2>
          {loading ? <p>Loading...</p> : conversations.length === 0 && <p className="text-gray-500">No conversations yet.</p>}
          {conversations.map(conv => (
            <div
              key={conv.id}
              className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${selectedConv === conv.id ? 'bg-red-50' : ''}`}
              onClick={() => setSelectedConv(conv.id)}
            >
              <p className="font-semibold">Chat with {conv.client_id === 'you' ? 'Staff' : 'Client'}</p>
              <p className="text-sm text-gray-500">Updated: {new Date(conv.updated_at).toLocaleString()}</p>
            </div>
          ))}
        </div>
        <div className="md:col-span-2">
          {selectedConv ? <Chat conversationId={selectedConv} /> : <p className="text-center py-12">Select or start a conversation</p>}
        </div>
      </div>
    </div>
  );
};

export default MyChats;