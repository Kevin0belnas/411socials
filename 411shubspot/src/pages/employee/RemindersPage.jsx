import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FaPlus,
  FaCheck,
  FaClock,
  FaCalendarAlt,
  FaExclamationTriangle,
  FaTag,
  FaUser,
  FaFilter,
  FaSearch,
  FaEdit,
  FaTrash,
  FaStickyNote,
  FaBell,
  FaTasks,
  FaChartBar,
  FaSort,
  FaEllipsisV,
  FaStar,
  FaRegStar,
  FaCalendarDay,
  FaCheckCircle,
  FaRegCircle,
  FaCircle
} from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL;

// Create axios instance with credentials
const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true, // This sends cookies with requests
  headers: {
    'Content-Type': 'application/json',
  }
});

const RemindersPage = () => {
  const [activeTab, setActiveTab] = useState('reminders');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [reminders, setReminders] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [authError, setAuthError] = useState(false);
  
  // Form states
  const [newReminder, setNewReminder] = useState({
    title: '',
    description: '',
    due_date: '',
    priority: 'medium',
    status: 'pending',
    category: '',
    assigned_to: '',
    tags: [],
    notes: ''
  });
  
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    category: '',
    is_pinned: false,
    color: '#ffffff'
  });
  
  // Filter states
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    category: '',
    search: ''
  });
  
  // Sample data for dropdowns
  const categories = ['Meeting', 'Task', 'Follow-up', 'Deadline', 'Personal', 'Work'];
  const priorities = [
    { value: 'low', label: 'Low', color: 'text-green-600', bg: 'bg-green-100' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-600', bg: 'bg-yellow-100' },
    { value: 'high', label: 'High', color: 'text-red-600', bg: 'bg-red-100' }
  ];
  const statuses = [
    { value: 'pending', label: 'Pending', color: 'text-yellow-600', bg: 'bg-yellow-100' },
    { value: 'in_progress', label: 'In Progress', color: 'text-blue-600', bg: 'bg-blue-100' },
    { value: 'completed', label: 'Completed', color: 'text-green-600', bg: 'bg-green-100' },
    { value: 'cancelled', label: 'Cancelled', color: 'text-gray-600', bg: 'bg-gray-100' }
  ];
  const tags = ['Urgent', 'Important', 'Review', 'Client', 'Internal', 'Quick'];

  // Fetch data on component mount
  useEffect(() => {
    fetchReminders();
    fetchNotes();
    fetchDashboardStats();
  }, [filters]);

  const fetchReminders = async () => {
    try {
      setLoading(true);
      setAuthError(false);
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.category) params.append('category', filters.category);
      if (filters.search) params.append('search', filters.search);
      
      const response = await axiosInstance.get(`/api/reminders?${params.toString()}`);
      setReminders(response.data);
    } catch (error) {
      console.error('Error fetching reminders:', error);
      if (error.response?.status === 401) {
        setAuthError(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchNotes = async () => {
    try {
      setAuthError(false);
      const response = await axiosInstance.get('/api/notes');
      setNotes(response.data);
    } catch (error) {
      console.error('Error fetching notes:', error);
      if (error.response?.status === 401) {
        setAuthError(true);
      }
    }
  };

  const fetchDashboardStats = async () => {
    try {
      setAuthError(false);
      const response = await axiosInstance.get('/api/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      if (error.response?.status === 401) {
        setAuthError(true);
      }
    }
  };

  const handleCreateReminder = async (e) => {
    e.preventDefault();
    try {
      setAuthError(false);
      await axiosInstance.post('/api/reminders', {
        ...newReminder,
      });
      setShowCreateModal(false);
      setNewReminder({
        title: '',
        description: '',
        due_date: '',
        priority: 'medium',
        status: 'pending',
        category: '',
        assigned_to: '',
        tags: [],
        notes: ''
      });
      fetchReminders();
      fetchDashboardStats();
    } catch (error) {
      console.error('Error creating reminder:', error);
      if (error.response?.status === 401) {
        setAuthError(true);
        alert('Please login to create reminders');
      }
    }
  };

  const handleCreateNote = async (e) => {
    e.preventDefault();
    try {
      setAuthError(false);
      await axiosInstance.post('/api/notes', {
        ...newNote,
      });
      setShowNoteModal(false);
      setNewNote({
        title: '',
        content: '',
        category: '',
        is_pinned: false,
        color: '#ffffff'
      });
      fetchNotes();
      fetchDashboardStats();
    } catch (error) {
      console.error('Error creating note:', error);
      if (error.response?.status === 401) {
        setAuthError(true);
        alert('Please login to create notes');
      }
    }
  };

  const handleUpdateReminderStatus = async (id, newStatus) => {
  try {
    setAuthError(false);
    // Create date without milliseconds and timezone for MySQL compatibility
    const now = new Date();
    const mysqlDateTime = now.toISOString().slice(0, 19).replace('T', ' ');
    
    await axiosInstance.put(`/api/reminders/${id}`, {
      status: newStatus,
      completed_at: newStatus === 'completed' ? mysqlDateTime : null
    });
    fetchReminders();
    fetchDashboardStats();
  } catch (error) {
    console.error('Error updating reminder:', error);
    if (error.response?.status === 401) {
      setAuthError(true);
    }
  }
};

  const handleDeleteReminder = async (id) => {
    if (window.confirm('Are you sure you want to delete this reminder?')) {
      try {
        setAuthError(false);
        await axiosInstance.delete(`/api/reminders/${id}`);
        fetchReminders();
        fetchDashboardStats();
      } catch (error) {
        console.error('Error deleting reminder:', error);
        if (error.response?.status === 401) {
          setAuthError(true);
        }
      }
    }
  };

  const handleTogglePinNote = async (id, currentPinned) => {
    try {
      setAuthError(false);
      await axiosInstance.put(`/api/notes/${id}`, {
        is_pinned: !currentPinned
      });
      fetchNotes();
    } catch (error) {
      console.error('Error toggling note pin:', error);
      if (error.response?.status === 401) {
        setAuthError(true);
      }
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Check if reminder is overdue
  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  // Handle login redirect
  const handleLoginRedirect = () => {
    window.location.href = '/login'; // Adjust to your login route
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Authentication Error Message */}
        {authError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FaExclamationTriangle className="text-red-500 mr-3" />
                <div>
                  <h3 className="font-medium text-red-800">Authentication Required</h3>
                  <p className="text-red-700 text-sm">Please login to access reminders and notes</p>
                </div>
              </div>
              <button
                onClick={handleLoginRedirect}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                Go to Login
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Reminders & Notes</h1>
              <p className="text-gray-600">Manage your tasks, reminders, and notes in one place</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowNoteModal(true)}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2"
                disabled={authError}
              >
                <FaStickyNote /> New Note
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                disabled={authError}
              >
                <FaPlus /> New Reminder
              </button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        {stats && !authError && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Reminders</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.reminder_stats?.total || 0}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <FaBell className="text-blue-500 text-xl" />
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {stats.reminder_stats?.pending || 0} pending • {stats.reminder_stats?.overdue || 0} overdue
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.reminder_stats?.completed || 0}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <FaCheckCircle className="text-green-500 text-xl" />
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {stats.reminder_stats?.in_progress || 0} in progress
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">High Priority</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.reminder_stats?.high_priority || 0}</p>
                </div>
                <div className="p-3 bg-red-50 rounded-lg">
                  <FaExclamationTriangle className="text-red-500 text-xl" />
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2">Requires immediate attention</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Notes</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.note_stats?.total_notes || 0}</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <FaStickyNote className="text-purple-500 text-xl" />
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {stats.note_stats?.pinned_notes || 0} pinned
              </p>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('reminders')}
              disabled={authError}
              className={`px-4 py-3 font-medium rounded-t-lg transition-colors flex items-center gap-2 ${activeTab === 'reminders' ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700' : 'text-gray-600 hover:text-gray-900'} ${authError ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <FaBell /> Reminders
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              disabled={authError}
              className={`px-4 py-3 font-medium rounded-t-lg transition-colors flex items-center gap-2 ${activeTab === 'notes' ? 'bg-purple-50 text-purple-700 border-b-2 border-purple-700' : 'text-gray-600 hover:text-gray-900'} ${authError ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <FaStickyNote /> Notes
            </button>
            <button
              onClick={() => setActiveTab('upcoming')}
              disabled={authError}
              className={`px-4 py-3 font-medium rounded-t-lg transition-colors flex items-center gap-2 ${activeTab === 'upcoming' ? 'bg-green-50 text-green-700 border-b-2 border-green-700' : 'text-gray-600 hover:text-gray-900'} ${authError ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <FaCalendarDay /> Upcoming
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              disabled={authError}
              className={`px-4 py-3 font-medium rounded-t-lg transition-colors flex items-center gap-2 ${activeTab === 'completed' ? 'bg-gray-50 text-gray-700 border-b-2 border-gray-700' : 'text-gray-600 hover:text-gray-900'} ${authError ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <FaCheck /> Completed
            </button>
          </div>
        </div>

        {/* Search and Filter Bar */}
        {!authError && (
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex-1 w-full">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search reminders or notes..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    disabled={authError}
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2 w-full md:w-auto">
                <select 
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  disabled={authError}
                >
                  <option value="">All Status</option>
                  {statuses.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
                <select 
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  value={filters.priority}
                  onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                  disabled={authError}
                >
                  <option value="">All Priority</option>
                  {priorities.map(priority => (
                    <option key={priority.value} value={priority.value}>{priority.label}</option>
                  ))}
                </select>
                <select 
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  disabled={authError}
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <button 
                  onClick={() => setFilters({ status: '', priority: '', category: '', search: '' })}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm flex items-center gap-2"
                  disabled={authError}
                >
                  <FaFilter /> Clear Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        {authError ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <FaExclamationTriangle className="text-red-500 text-4xl mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Authentication Required</h3>
            <p className="text-gray-600 mb-6">You need to be logged in to view and manage reminders and notes.</p>
            <button
              onClick={handleLoginRedirect}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Go to Login Page
            </button>
          </div>
        ) : (
          <>
            {activeTab === 'reminders' && (
              <div className="space-y-6">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading reminders...</p>
                  </div>
                ) : reminders.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                    <FaBell className="text-gray-300 text-4xl mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No reminders found</h3>
                    <p className="text-gray-600 mb-6">Create your first reminder to get started</p>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Create Reminder
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Pending Reminders */}
                    <div className="bg-white rounded-xl shadow-sm">
                      <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                          <FaClock className="text-yellow-500" /> Pending Reminders
                        </h2>
                      </div>
                      <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
                        {reminders
                          .filter(r => r.status === 'pending')
                          .map((reminder) => (
                            <div key={reminder.id} className="p-6 hover:bg-gray-50">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <button
                                      onClick={() => handleUpdateReminderStatus(reminder.id, 'completed')}
                                      className="w-5 h-5 border border-gray-300 rounded-full hover:border-blue-500 flex items-center justify-center"
                                    >
                                      {reminder.status === 'completed' && (
                                        <FaCheck className="text-blue-500 text-xs" />
                                      )}
                                    </button>
                                    <h3 className="font-medium text-gray-900">{reminder.title}</h3>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorities.find(p => p.value === reminder.priority)?.bg} ${priorities.find(p => p.value === reminder.priority)?.color}`}>
                                      {reminder.priority}
                                    </span>
                                  </div>
                                  {reminder.description && (
                                    <p className="text-gray-600 text-sm mb-3">{reminder.description}</p>
                                  )}
                                  <div className="flex flex-wrap gap-3 items-center text-sm text-gray-500">
                                    {reminder.due_date && (
                                      <div className="flex items-center gap-1">
                                        <FaCalendarAlt className="text-gray-400" />
                                        <span className={isOverdue(reminder.due_date) ? 'text-red-600 font-medium' : ''}>
                                          {formatDate(reminder.due_date)}
                                          {isOverdue(reminder.due_date) && ' (Overdue)'}
                                        </span>
                                      </div>
                                    )}
                                    {reminder.category && (
                                      <div className="flex items-center gap-1">
                                        <FaTag className="text-gray-400" />
                                        <span>{reminder.category}</span>
                                      </div>
                                    )}
                                    {reminder.assigned_to && (
                                      <div className="flex items-center gap-1">
                                        <FaUser className="text-gray-400" />
                                        <span>{reminder.assigned_to}</span>
                                      </div>
                                    )}
                                  </div>
                                  {reminder.tags && reminder.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-3">
                                      {reminder.tags.map((tag, index) => (
                                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                          {tag}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleUpdateReminderStatus(reminder.id, reminder.status === 'pending' ? 'in_progress' : 'pending')}
                                    className="p-2 text-gray-500 hover:text-blue-600"
                                  >
                                    <FaEdit />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteReminder(reminder.id)}
                                    className="p-2 text-gray-500 hover:text-red-600"
                                  >
                                    <FaTrash />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* In Progress Reminders */}
                    <div className="bg-white rounded-xl shadow-sm">
                      <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                          <FaTasks className="text-blue-500" /> In Progress
                        </h2>
                      </div>
                      <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
                        {reminders
                          .filter(r => r.status === 'in_progress')
                          .map((reminder) => (
                            <div key={reminder.id} className="p-6 hover:bg-gray-50">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <FaCircle className="text-blue-500 text-xs" />
                                    <h3 className="font-medium text-gray-900">{reminder.title}</h3>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorities.find(p => p.value === reminder.priority)?.bg} ${priorities.find(p => p.value === reminder.priority)?.color}`}>
                                      {reminder.priority}
                                    </span>
                                  </div>
                                  {reminder.description && (
                                    <p className="text-gray-600 text-sm mb-3">{reminder.description}</p>
                                  )}
                                  <div className="flex flex-wrap gap-3 items-center text-sm text-gray-500">
                                    {reminder.due_date && (
                                      <div className="flex items-center gap-1">
                                        <FaCalendarAlt className="text-gray-400" />
                                        <span>{formatDate(reminder.due_date)}</span>
                                      </div>
                                    )}
                                    {reminder.category && (
                                      <div className="flex items-center gap-1">
                                        <FaTag className="text-gray-400" />
                                        <span>{reminder.category}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleUpdateReminderStatus(reminder.id, 'completed')}
                                    className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200"
                                  >
                                    Mark Complete
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'notes' && (
              <div className="space-y-6">
                {/* Pinned Notes */}
                {notes.filter(n => n.is_pinned).length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm">
                    <div className="p-6 border-b border-gray-200">
                      <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <FaStar className="text-yellow-500" /> Pinned Notes
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                      {notes
                        .filter(note => note.is_pinned)
                        .map((note) => (
                          <div key={note.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                            <div className="h-3" style={{ backgroundColor: note.color || '#ffffff' }}></div>
                            <div className="p-5">
                              <div className="flex justify-between items-start mb-3">
                                <h3 className="font-bold text-gray-900">{note.title}</h3>
                                <button
                                  onClick={() => handleTogglePinNote(note.id, note.is_pinned)}
                                  className="text-yellow-500 hover:text-yellow-600"
                                >
                                  <FaStar />
                                </button>
                              </div>
                              <p className="text-gray-600 text-sm mb-4 line-clamp-3">{note.content}</p>
                              <div className="flex justify-between items-center text-sm text-gray-500">
                                <span>{note.category}</span>
                                <span>{formatDate(note.updated_at)}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* All Notes */}
                <div className="bg-white rounded-xl shadow-sm">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <FaStickyNote className="text-purple-500" /> All Notes
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                    {notes.length === 0 ? (
                      <div className="col-span-full text-center py-12">
                        <FaStickyNote className="text-gray-300 text-4xl mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No notes found</h3>
                        <p className="text-gray-600 mb-6">Create your first note to get started</p>
                        <button
                          onClick={() => setShowNoteModal(true)}
                          className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                        >
                          Create Note
                        </button>
                      </div>
                    ) : (
                      notes.map((note) => (
                        <div key={note.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                          <div className="h-3" style={{ backgroundColor: note.color || '#ffffff' }}></div>
                          <div className="p-5">
                            <div className="flex justify-between items-start mb-3">
                              <h3 className="font-bold text-gray-900">{note.title}</h3>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleTogglePinNote(note.id, note.is_pinned)}
                                  className="text-gray-400 hover:text-yellow-500"
                                >
                                  {note.is_pinned ? <FaStar /> : <FaRegStar />}
                                </button>
                              </div>
                            </div>
                            <p className="text-gray-600 text-sm mb-4 line-clamp-3">{note.content}</p>
                            <div className="flex justify-between items-center text-sm text-gray-500">
                              <span>{note.category}</span>
                              <span>{formatDate(note.updated_at)}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'upcoming' && stats?.upcoming_reminders && (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <FaCalendarDay className="text-green-500" /> Upcoming Reminders (Next 7 Days)
                  </h2>
                </div>
                <div className="divide-y divide-gray-200">
                  {stats.upcoming_reminders.length === 0 ? (
                    <div className="p-12 text-center">
                      <FaCalendarDay className="text-gray-300 text-4xl mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming reminders</h3>
                      <p className="text-gray-600">You're all caught up for the next week!</p>
                    </div>
                  ) : (
                    stats.upcoming_reminders.map((reminder) => (
                      <div key={reminder.id} className="p-6 hover:bg-gray-50">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                              <FaCalendarAlt className="text-green-600" />
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">{reminder.title}</h3>
                              <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                                <span>Due: {formatDate(reminder.due_date)}</span>
                                <span>•</span>
                                <span className={`px-2 py-1 rounded-full text-xs ${priorities.find(p => p.value === reminder.priority)?.bg} ${priorities.find(p => p.value === reminder.priority)?.color}`}>
                                  {reminder.priority}
                                </span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleUpdateReminderStatus(reminder.id, 'in_progress')}
                            className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
                          >
                            Start Task
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'completed' && (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <FaCheckCircle className="text-gray-500" /> Completed Reminders
                  </h2>
                </div>
                <div className="divide-y divide-gray-200">
                  {reminders.filter(r => r.status === 'completed').length === 0 ? (
                    <div className="p-12 text-center">
                      <FaCheckCircle className="text-gray-300 text-4xl mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No completed reminders</h3>
                      <p className="text-gray-600">Complete some tasks to see them here</p>
                    </div>
                  ) : (
                    reminders
                      .filter(r => r.status === 'completed')
                      .map((reminder) => (
                        <div key={reminder.id} className="p-6 hover:bg-gray-50">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-3 mb-2">
                                <FaCheckCircle className="text-green-500" />
                                <h3 className="font-medium text-gray-900 line-through">{reminder.title}</h3>
                              </div>
                              {reminder.description && (
                                <p className="text-gray-600 text-sm mb-2">{reminder.description}</p>
                              )}
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span>Completed on: {formatDate(reminder.completed_at)}</span>
                                {reminder.category && (
                                  <>
                                    <span>•</span>
                                    <span>{reminder.category}</span>
                                  </>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => handleUpdateReminderStatus(reminder.id, 'pending')}
                              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                            >
                              Reopen
                            </button>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Reminder Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Create New Reminder</h2>
            </div>
            <form onSubmit={handleCreateReminder} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={newReminder.title}
                    onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="3"
                    value={newReminder.description}
                    onChange={(e) => setNewReminder({ ...newReminder, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                    <input
                      type="datetime-local"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={newReminder.due_date}
                      onChange={(e) => setNewReminder({ ...newReminder, due_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                    <select
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={newReminder.priority}
                      onChange={(e) => setNewReminder({ ...newReminder, priority: e.target.value })}
                    >
                      {priorities.map(p => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={newReminder.category}
                      onChange={(e) => setNewReminder({ ...newReminder, category: e.target.value })}
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Assigned To</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Optional"
                      value={newReminder.assigned_to}
                      onChange={(e) => setNewReminder({ ...newReminder, assigned_to: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {tags.map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          const newTags = newReminder.tags.includes(tag)
                            ? newReminder.tags.filter(t => t !== tag)
                            : [...newReminder.tags, tag];
                          setNewReminder({ ...newReminder, tags: newTags });
                        }}
                        className={`px-3 py-1 rounded-full text-sm ${newReminder.tags.includes(tag) ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <textarea
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="3"
                    placeholder="Additional notes..."
                    value={newReminder.notes}
                    onChange={(e) => setNewReminder({ ...newReminder, notes: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Create Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Create New Note</h2>
            </div>
            <form onSubmit={handleCreateNote} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    value={newNote.title}
                    onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                  <textarea
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    rows="6"
                    value={newNote.content}
                    onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      value={newNote.category}
                      onChange={(e) => setNewNote({ ...newNote, category: e.target.value })}
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                    <input
                      type="color"
                      className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                      value={newNote.color}
                      onChange={(e) => setNewNote({ ...newNote, color: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_pinned"
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    checked={newNote.is_pinned}
                    onChange={(e) => setNewNote({ ...newNote, is_pinned: e.target.checked })}
                  />
                  <label htmlFor="is_pinned" className="ml-2 text-sm text-gray-700">
                    Pin this note to top
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setShowNoteModal(false)}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                >
                  Create Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RemindersPage;