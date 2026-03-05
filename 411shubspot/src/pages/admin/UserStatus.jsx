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
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh'
    }}>
      <div style={{
        border: '4px solid rgba(0, 0, 0, 0.1)',
        borderRadius: '50%',
        borderTop: '4px solid #007bff',
        width: '40px',
        height: '40px',
        animation: 'spin 1s linear infinite',
        marginBottom: '15px'
      }}></div>
      <p>Loading users...</p>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );

  if (error) return (
    <div style={{
      padding: '15px',
      background: '#f8d7da',
      color: '#721c24',
      border: '1px solid #f5c6cb',
      borderRadius: '4px',
      margin: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      {error}
      <button 
        onClick={fetchUsers}
        style={{
          background: '#dc3545',
          color: 'white',
          border: 'none',
          padding: '5px 10px',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Retry
      </button>
    </div>
  );

  return (
    <div style={{
      padding: '20px',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <h1 style={{ marginBottom: '20px' }}>User Management</h1>
      
      <div style={{
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'flex-end'
      }}>
        <button 
          onClick={fetchUsers}
          style={{
            background: '#007bff',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}
        >
          ⟳ Refresh Users
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          marginTop: '15px'
        }}>
          <thead>
            <tr>
              <th style={{
                padding: '12px 15px',
                textAlign: 'left',
                backgroundColor: '#f8f9fa',
                fontWeight: '600'
              }}>ID</th>
              <th style={{
                padding: '12px 15px',
                textAlign: 'left',
                backgroundColor: '#f8f9fa',
                fontWeight: '600'
              }}>Email</th>
              <th style={{
                padding: '12px 15px',
                textAlign: 'left',
                backgroundColor: '#f8f9fa',
                fontWeight: '600'
              }}>Role</th>
              <th style={{
                padding: '12px 15px',
                textAlign: 'left',
                backgroundColor: '#f8f9fa',
                fontWeight: '600'
              }}>Status</th>
              <th style={{
                padding: '12px 15px',
                textAlign: 'left',
                backgroundColor: '#f8f9fa',
                fontWeight: '600'
              }}>Created At</th>
              <th style={{
                padding: '12px 15px',
                textAlign: 'left',
                backgroundColor: '#f8f9fa',
                fontWeight: '600'
              }}>Updated At</th>
              <th style={{
                padding: '12px 15px',
                textAlign: 'left',
                backgroundColor: '#f8f9fa',
                fontWeight: '600'
              }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} style={{ '&:hover': { backgroundColor: '#f5f5f5' } }}>
                <td style={{
                  padding: '12px 15px',
                  textAlign: 'left',
                  borderBottom: '1px solid #ddd'
                }}>{user.id}</td>
                <td style={{
                  padding: '12px 15px',
                  textAlign: 'left',
                  borderBottom: '1px solid #ddd'
                }}>{user.email}</td>
                <td style={{
                  padding: '12px 15px',
                  textAlign: 'left',
                  borderBottom: '1px solid #ddd'
                }}>{user.role}</td>
                <td style={{
                  padding: '12px 15px',
                  textAlign: 'left',
                  borderBottom: '1px solid #ddd'
                }}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '0.8rem',
                    fontWeight: '500',
                    textTransform: 'capitalize',
                    backgroundColor: (user.status || 'Active') === 'Active' ? '#d4edda' : '#f8d7da',
                    color: (user.status || 'Active') === 'Active' ? '#155724' : '#721c24'
                  }}>
                    {user.status || 'Active'}
                  </span>
                </td>
                <td style={{
                  padding: '12px 15px',
                  textAlign: 'left',
                  borderBottom: '1px solid #ddd'
                }}>{new Date(user.created_at).toLocaleString()}</td>
                <td style={{
                  padding: '12px 15px',
                  textAlign: 'left',
                  borderBottom: '1px solid #ddd'
                }}>{new Date(user.updated_at).toLocaleString()}</td>
                <td style={{
                  padding: '12px 15px',
                  textAlign: 'left',
                  borderBottom: '1px solid #ddd'
                }}>
                  <button 
                    onClick={() => handleEditClick(user)}
                    style={{
                      background: '#ffc107',
                      color: '#212529',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      '&:hover': {
                        background: '#e0a800'
                      }
                    }}
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
        <div style={{
          position: 'fixed',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: '1000'
        }}>
          <div style={{
            background: 'white',
            padding: '25px',
            borderRadius: '8px',
            width: '100%',
            maxWidth: '500px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
          }}>
            <h2 style={{ marginTop: '0', marginBottom: '20px' }}>Edit User</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Email:</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #ced4da',
                    borderRadius: '4px',
                    fontSize: '16px'
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Role:</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #ced4da',
                    borderRadius: '4px',
                    fontSize: '16px'
                  }}
                >
                  <option value="agent">Agent</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Status:</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #ced4da',
                    borderRadius: '4px',
                    fontSize: '16px'
                  }}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px',
                marginTop: '20px'
              }}>
                <button 
                  type="button" 
                  onClick={() => setEditingUser(null)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    background: '#f8f9fa',
                    border: '1px solid #ddd'
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  style={{
                    background: '#28a745',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    '&:hover': {
                      background: '#218838'
                    }
                  }}
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