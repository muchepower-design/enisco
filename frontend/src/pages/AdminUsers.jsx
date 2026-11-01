import { useState, useEffect } from 'react';
import api from '../services/api';
import { FaSpinner, FaUserEdit, FaTrash, FaPlus, FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    role: 'client',
    user_type: 'client',
    is_active: true
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/users/');
      setUsers(res.data);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const resetForm = () => {
    setFormData({
      full_name: '',
      email: '',
      phone: '',
      password: '',
      role: 'client',
      user_type: 'client',
      is_active: true
    });
    setEditingUser(null);
  };

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        full_name: user.full_name,
        email: user.email,
        phone: user.phone || '',
        password: '',
        role: user.role,
        user_type: user.user_type,
        is_active: user.is_active
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        // Update user
        const payload = {
          full_name: formData.full_name,
          phone: formData.phone,
          role: formData.role,
          user_type: formData.user_type,
          is_active: formData.is_active,
          password: formData.password || undefined
        };
        await api.put(`/api/users/${editingUser.id}`, payload);
        toast.success('User updated successfully');
      } else {
        // Create user
        await api.post('/api/users', {
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          role: formData.role,
          user_type: formData.user_type
        });
        toast.success('User created successfully');
      }
      fetchUsers();
      handleCloseModal();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Operation failed');
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Are you sure you want to delete user "${user.full_name}"?`)) return;
    try {
      await api.delete(`/api/users/${user.id}`);
      toast.success('User deleted');
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Delete failed');
    }
  };

  if (loading) return <div className="flex justify-center py-12"><FaSpinner className="animate-spin text-brand-red text-4xl" /></div>;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-black">User Management</h1>
        <button onClick={() => handleOpenModal()} className="btn-primary">
          <FaPlus className="mr-2" /> Add User
        </button>
      </div>
      <div className="glass-card overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Phone</th>
              <th className="p-3 text-left">Role</th>
              <th className="p-3 text-left">Type</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="border-b hover:bg-gray-50">
                <td className="p-3">{user.full_name}</td>
                <td className="p-3">{user.email}</td>
                <td className="p-3">{user.phone || 'N/A'}</td>
                <td className="p-3 capitalize">{user.role}</td>
                <td className="p-3 capitalize">{user.user_type}</td>
                <td className="p-3">{user.is_active ? 'Active' : 'Inactive'}</td>
                <td className="p-3 flex gap-2">
                  <button onClick={() => handleOpenModal(user)} className="text-blue-600 hover:text-blue-800">
                    <FaUserEdit />
                  </button>
                  <button onClick={() => handleDelete(user)} className="text-red-600 hover:text-red-800">
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">{editingUser ? 'Edit User' : 'Add User'}</h2>
              <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700">
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-bold mb-1">Full Name *</label>
                <input type="text" required className="w-full p-2 border rounded" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} />
              </div>
              {!editingUser && (
                <div>
                  <label className="block font-bold mb-1">Email *</label>
                  <input type="email" required className="w-full p-2 border rounded" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
              )}
              <div>
                <label className="block font-bold mb-1">Phone</label>
                <input type="tel" className="w-full p-2 border rounded" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div>
                <label className="block font-bold mb-1">Password {editingUser && '(leave blank to keep current)'}</label>
                <input type="password" className="w-full p-2 border rounded" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder={editingUser ? 'New password' : 'Password *'} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-1">Role</label>
                  <select className="w-full p-2 border rounded" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                    <option value="client">Client</option>
                    <option value="sales_officer">Sales Officer</option>
                    <option value="finance_officer">Finance Officer</option>
                    <option value="operations_manager">Operations Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">User Type</label>
                  <select className="w-full p-2 border rounded" value={formData.user_type} onChange={e => setFormData({...formData, user_type: e.target.value})}>
                    <option value="client">Client</option>
                    <option value="staff">Staff</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-bold mb-1">Status</label>
                <select className="w-full p-2 border rounded" value={formData.is_active ? 'active' : 'inactive'} onChange={e => setFormData({...formData, is_active: e.target.value === 'active'})}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={handleCloseModal} className="btn-outline py-2 px-4">Cancel</button>
                <button type="submit" className="btn-primary py-2 px-4">{editingUser ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;