import { useState, useEffect } from 'react';
import api from '../services/api';
import Chat from '../components/Chat';
import { FaComments } from 'react-icons/fa';
import toast from 'react-hot-toast';

const StaffChats = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/chat/conversations')
      .then(res => {
        // Fetch client names for each conversation
        const convs = res.data;
        Promise.all(convs.map(async (conv) => {
          try {
            const clientRes = await api.get(`/api/users/${conv.client_id}`);
            return { ...conv, clientName: clientRes.data.full_name };
          } catch {
            return { ...conv, clientName: conv.client_id.slice(0,8) };
          }
        })).then(convsWithNames => {
          setConversations(convsWithNames);
        });
      })
      .catch(err => toast.error('Failed to load conversations'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-black mb-6 flex items-center gap-2"><FaComments /> Customer Chats</h1>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="glass-card p-4">
          <h2 className="font-bold mb-3">All Conversations</h2>
          {loading ? <p>Loading...</p> : conversations.length === 0 && <p>No conversations yet.</p>}
          {conversations.map(conv => (
            <div
              key={conv.id}
              className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${selectedConv === conv.id ? 'bg-red-50' : ''}`}
              onClick={() => setSelectedConv(conv.id)}
            >
              <p className="font-semibold">Client: {conv.clientName}</p>
              <p className="text-sm text-gray-500">Updated: {new Date(conv.updated_at).toLocaleString()}</p>
            </div>
          ))}
        </div>
        <div className="md:col-span-2">
          {selectedConv ? <Chat conversationId={selectedConv} /> : <p className="text-center py-12">Select a conversation to chat</p>}
        </div>
      </div>
    </div>
  );
};

export default StaffChats;