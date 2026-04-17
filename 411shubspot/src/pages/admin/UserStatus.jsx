import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const UserStatus = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    role: 'agent',
    status: 'Active'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/all-users`);
      setUsers(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (user) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      role: user.role,
      status: user.status || 'Active'
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `${API_URL}/api/all-users/${editingUser.id}`,
        formData
      );
      
      setUsers(users.map(user => 
        user.id === editingUser.id ? response.data : user
      ));
      
      setEditingUser(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update user');
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mb-4"></div>
      <p className="text-gray-600">Loading users...</p>
    </div>
  );

  if (error) return (
    <div className="bg-red-100 text-red-700 border border-red-200 rounded-lg p-4 m-5 flex items-center justify-between">
      <span>{error}</span>
      <button 
        onClick={fetchUsers}
        className="bg-red-600 text-white px-3 py-1.5 rounded-md hover:bg-red-700 transition-colors"
      >
        Retry
      </button>
    </div>
  );

  return (
    <div className="p-5 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-5 text-gray-800">User Management</h1>
      
      <div className="mb-5 flex justify-end">
        <button 
          onClick={fetchUsers}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <span>⟳</span>
          Refresh Users
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full mt-4">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Role</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Created At</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Updated At</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-sm text-gray-900 border-b border-gray-200">{user.id}</td>
                <td className="px-4 py-3 text-sm text-gray-600 border-b border-gray-200">{user.name}</td>
                <td className="px-4 py-3 text-sm text-gray-600 border-b border-gray-200">{user.email}</td>
                <td className="px-4 py-3 text-sm text-gray-600 border-b border-gray-200">
                  <span className={`inline-flex px-2 py-1 rounded-md text-xs font-medium ${
                    user.role === 'admin' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm border-b border-gray-200">
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                    (user.status || 'Active') === 'Active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user.status || 'Active'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500 border-b border-gray-200">
                  {new Date(user.created_at).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500 border-b border-gray-200">
                  {new Date(user.updated_at).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-sm border-b border-gray-200">
                  <button 
                    onClick={() => handleEditClick(user)}
                    className="bg-yellow-500 text-gray-900 px-3 py-1.5 rounded-md hover:bg-yellow-600 transition-colors text-sm"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mt-0 mb-4 text-gray-800">Edit User</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block mb-2 font-medium text-gray-700">Email:</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="mb-4">
                <label className="block mb-2 font-medium text-gray-700">Role:</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="agent">Agent</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block mb-2 font-medium text-gray-700">Status:</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              
              <div className="flex justify-end gap-3 mt-5">
                <button 
                  type="button" 
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-md cursor-pointer bg-gray-100 border border-gray-300 hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 rounded-md cursor-pointer bg-green-600 text-white hover:bg-green-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserStatus;