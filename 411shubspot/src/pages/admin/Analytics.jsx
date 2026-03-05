import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { 
  FaFilter, FaDownload, FaSync, FaChartBar, FaChartPie, FaChartLine, 
  FaUsers, FaPhone, FaCheckCircle, FaTimesCircle, FaUser, FaCalendarAlt,
  FaPlus, FaEdit, FaTrash, FaSearch, FaFileExport, FaStar, FaTrophy, FaBullseye,
  FaInfoCircle, FaCalendarDay, FaCalendarWeek, FaCalendar
} from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL;

const Analytics = () => {
  const [transferData, setTransferData] = useState([]);
  const [nonTransferData, setNonTransferData] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(false);
  const [agents, setAgents] = useState([]);
  const [qaNames, setQaNames] = useState([]);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [error, setError] = useState(null);
  
  // Forms state
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [showNonTransferForm, setShowNonTransferForm] = useState(false);
  const [editingCall, setEditingCall] = useState(null);
  const [editingType, setEditingType] = useState(null);
  
  // Form data - TRANSFER with date field
  const [transferFormData, setTransferFormData] = useState({
    call_date: new Date().toISOString().split('T')[0],
    Agent: '',
    phone_number: '',
    energy_good: 'No',
    followed_script: 'No',
    asked_2_questions: 'No',
    engaged_with_author: 'No',
    handled_objection: 'No',
    author_aware_transfer: 'No',
    score: '',
    notes: '',
    qa_name: ''
  });
  
  // Form data - NON-TRANSFER (simplified without question fields)
  const [nonTransferFormData, setNonTransferFormData] = useState({
    call_date: new Date().toISOString().split('T')[0],
    Agent: '',
    phone_number: '',
    followed_script: 'No',
    notes: '',
    qa_name: ''
  });
  
  // Filters
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    agent: '',
    qa: '',
    minScore: 0,
    maxScore: 6,
    dateRange: 'custom' // 'today', 'week', 'month', 'custom'
  });

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

  // Calculate date ranges
  const getDateRange = (range) => {
    const today = new Date();
    const start = new Date();
    
    switch(range) {
      case 'today':
        start.setHours(0, 0, 0, 0);
        return {
          startDate: start.toISOString().split('T')[0],
          endDate: today.toISOString().split('T')[0]
        };
      case 'week':
        start.setDate(today.getDate() - 7);
        return {
          startDate: start.toISOString().split('T')[0],
          endDate: today.toISOString().split('T')[0]
        };
      case 'month':
        start.setMonth(today.getMonth() - 1);
        return {
          startDate: start.toISOString().split('T')[0],
          endDate: today.toISOString().split('T')[0]
        };
      default:
        return {
          startDate: '',
          endDate: ''
        };
    }
  };

  // Handle date range filter change
  const handleDateRangeChange = (range) => {
    if (range === 'custom') {
      setFilters(prev => ({
        ...prev,
        dateRange: range,
        startDate: '',
        endDate: ''
      }));
    } else {
      const dates = getDateRange(range);
      setFilters(prev => ({
        ...prev,
        dateRange: range,
        startDate: dates.startDate,
        endDate: dates.endDate
      }));
    }
  };

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch agents and QA names
      const agentsRes = await fetch(`${API_URL}/api/qa/agents`);
      if (!agentsRes.ok) throw new Error('Failed to fetch agents');
      const agentsData = await agentsRes.json();
      setAgents(agentsData);
      
      const qasRes = await fetch(`${API_URL}/api/qa/qas`);
      if (!qasRes.ok) throw new Error('Failed to fetch QA names');
      const qasData = await qasRes.json();
      setQaNames(qasData);
      
      // Build query strings
      const queryParams = new URLSearchParams();
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      if (filters.agent) queryParams.append('agent', filters.agent);
      if (filters.qa) queryParams.append('qa', filters.qa);
      if (filters.minScore) queryParams.append('minScore', filters.minScore);
      if (filters.maxScore) queryParams.append('maxScore', filters.maxScore);
      
      // Fetch transfer and non-transfer data
      const transferRes = await fetch(`${API_URL}/api/qa/transfer?${queryParams}`);
      if (!transferRes.ok) throw new Error('Failed to fetch transfer data');
      const transferData = await transferRes.json();
      setTransferData(transferData);
      
      const nonTransferRes = await fetch(`${API_URL}/api/qa/non-transfer?${queryParams}`);
      if (!nonTransferRes.ok) throw new Error('Failed to fetch non-transfer data');
      const nonTransferData = await nonTransferRes.json();
      setNonTransferData(nonTransferData);
      
      // Fetch analytics with enhanced metrics
      const analyticsRes = await fetch(`${API_URL}/api/qa/analytics`);
      if (!analyticsRes.ok) throw new Error('Failed to fetch analytics');
      const analyticsData = await analyticsRes.json();
      
      // Process analytics data to identify best openers and performance metrics
      const processedAnalytics = processAgentPerformance(analyticsData);
      
      setAnalyticsData(processedAnalytics);
      setHasData(transferData.length > 0 || nonTransferData.length > 0);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.message);
      
      // Set default analytics data if API fails
      setAnalyticsData({
        transferCount: 0,
        nonTransferCount: 0,
        totalCalls: 0,
        transferAvgScore: 0,
        nonTransferAvgScore: 0,
        agentPerformance: [],
        complianceData: [],
        bestOpeners: [],
        topPerformers: []
      });
    } finally {
      setLoading(false);
    }
  };

  // Process agent performance data
  const processAgentPerformance = (analyticsData) => {
    if (!analyticsData || !analyticsData.agentPerformance) return analyticsData;
    
    // Calculate transfer rate for each agent
    const agentsWithMetrics = analyticsData.agentPerformance.map(agent => {
      const totalCalls = agent.total_calls || 0;
      const transferCount = agent.transfer_count || 0;
      const transferRate = totalCalls > 0 ? (transferCount / totalCalls) * 100 : 0;
      
      // Calculate score percentage (0-6 to 0-100)
      const scorePercentage = (agent.avg_score || 0) / 6 * 100;
      
      return {
        ...agent,
        transfer_rate: transferRate,
        score_percentage: scorePercentage,
        performance_score: calculatePerformanceScore(agent.avg_score || 0, transferRate)
      };
    });
  
    // Get best openers (highest transfer rate)
    const bestOpeners = [...agentsWithMetrics]
      .filter(agent => agent.total_calls >= 1) // Minimum 1 call
      .sort((a, b) => b.transfer_rate - a.transfer_rate)
      .slice(0, 5);
  
    // Get top performers (highest performance score)
    const topPerformers = [...agentsWithMetrics]
      .filter(agent => agent.total_calls >= 1)
      .sort((a, b) => b.performance_score - a.performance_score)
      .slice(0, 5);
  
    return {
      ...analyticsData,
      agentPerformance: agentsWithMetrics,
      bestOpeners,
      topPerformers
    };
  };

  // Calculate a composite performance score (50% score, 50% transfer rate)
  const calculatePerformanceScore = (avgScore, transferRate) => {
    // Convert 0-6 score to 0-100 scale for the calculation
    const normalizedScore = ((avgScore || 0) / 6) * 100 * 0.5; // Score contributes 50%
    const normalizedTransferRate = transferRate * 0.5; // Transfer rate contributes 50%
    return normalizedScore + normalizedTransferRate;
  };

  // Calculate score percentage (0-6 to 0-100)
  const calculateScorePercentage = (score) => {
    if (!score && score !== 0) return 0;
    return (score / 6) * 100;
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      agent: '',
      qa: '',
      minScore: 0,
      maxScore: 6,
      dateRange: 'custom'
    });
  };

  // Form handlers
  const handleTransferFormChange = (e) => {
    const { name, value } = e.target;
    setTransferFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNonTransferFormChange = (e) => {
    const { name, value } = e.target;
    setNonTransferFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Submit transfer call (handles both create and update)
  const submitTransferCall = async (e) => {
    e.preventDefault();
    try {
      const url = editingCall 
        ? `${API_URL}/api/qa/transfer/${editingCall.id}` 
        : `${API_URL}/api/qa/transfer`;
      
      const method = editingCall ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transferFormData)
      });
      
      if (response.ok) {
        setShowTransferForm(false);
        setEditingCall(null);
        setTransferFormData({
          call_date: new Date().toISOString().split('T')[0],
          Agent: '',
          phone_number: '',
          energy_good: 'No',
          followed_script: 'No',
          asked_2_questions: 'No',
          engaged_with_author: 'No',
          handled_objection: 'No',
          author_aware_transfer: 'No',
          score: '',
          notes: '',
          qa_name: ''
        });
        fetchData();
        alert(editingCall ? 'Transfer call updated successfully!' : 'Transfer call added successfully!');
      }
    } catch (error) {
      console.error('Error saving transfer call:', error);
      alert('Error saving transfer call');
    }
  };

  // Submit non-transfer call (handles both create and update)
  const submitNonTransferCall = async (e) => {
    e.preventDefault();
    try {
      const url = editingCall 
        ? `${API_URL}/api/qa/non-transfer/${editingCall.id}` 
        : `${API_URL}/api/qa/non-transfer`;
      
      const method = editingCall ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nonTransferFormData)
      });
      
      if (response.ok) {
        setShowNonTransferForm(false);
        setEditingCall(null);
        setNonTransferFormData({
          call_date: new Date().toISOString().split('T')[0],
          Agent: '',
          phone_number: '',
          followed_script: 'No',
          notes: '',
          qa_name: ''
        });
        fetchData();
        alert(editingCall ? 'Non-transfer call updated successfully!' : 'Non-transfer call added successfully!');
      }
    } catch (error) {
      console.error('Error saving non-transfer call:', error);
      alert('Error saving non-transfer call');
    }
  };

  // Edit call
  const handleEditCall = (call, type) => {
    setEditingCall(call);
    setEditingType(type);
    if (type === 'transfer') {
      setTransferFormData({
        call_date: call.call_date || new Date().toISOString().split('T')[0],
        Agent: call.Agent || '',
        phone_number: call.phone_number || '',
        energy_good: call.energy_good || 'No',
        followed_script: call.followed_script || 'No',
        asked_2_questions: call.asked_2_questions || 'No',
        engaged_with_author: call.engaged_with_author || 'No',
        handled_objection: call.handled_objection || 'No',
        author_aware_transfer: call.author_aware_transfer || 'No',
        score: call.score || '',
        notes: call.notes || '',
        qa_name: call.qa_name || ''
      });
      setShowTransferForm(true);
    } else {
      setNonTransferFormData({
        call_date: call.call_date || new Date().toISOString().split('T')[0],
        Agent: call.Agent || '',
        phone_number: call.phone_number || '',
        followed_script: call.followed_script || 'No',
        notes: call.notes || '',
        qa_name: call.qa_name || ''
      });
      setShowNonTransferForm(true);
    }
  };

  // Delete call
  const handleDeleteCall = async (id, type) => {
    if (!window.confirm('Are you sure you want to delete this call?')) return;
    
    try {
      const response = await fetch(`${API_URL}/api/qa/${type}/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        fetchData();
        alert('Call deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting call:', error);
      alert('Error deleting call');
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    const allData = [
      ...transferData.map(item => ({ ...item, Type: 'Transfer' })),
      ...nonTransferData.map(item => ({ ...item, Type: 'Non-Transfer' }))
    ];
    
    const headers = ['Type', 'Date', 'Agent', 'Phone', 'Score', 'Script Followed', 
                     'Questions Asked', 'Engaged', 'Objection Handled', 
                     'Author Aware', 'QA', 'Notes'];
    
    const csvContent = [
      headers.join(','),
      ...allData.map(row => headers.map(header => {
        const key = header.toLowerCase().replace(/ /g, '_');
        const value = row[key] || row[header] || '';
        return `"${String(value).replace(/"/g, '""')}"`;
      }).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qa-analytics-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  // Safe number formatting
  const safeNumber = (num, decimals = 1) => {
    if (num === null || num === undefined || isNaN(num)) return '0.0';
    return Number(num).toFixed(decimals);
  };

  // Safe percentage calculation
  const safePercentage = (value, total) => {
    if (!total || total === 0) return 0;
    return (value / total) * 100;
  };

  // Get best opener (with fallback)
  const getBestOpener = () => {
    if (!analyticsData) return { agent: 'N/A', transferRate: 0 };
    
    if (analyticsData.bestOpeners && analyticsData.bestOpeners.length > 0) {
      return {
        agent: analyticsData.bestOpeners[0].Agent,
        transferRate: analyticsData.bestOpeners[0].transfer_rate || 0
      };
    }
    
    if (analyticsData.agentPerformance && analyticsData.agentPerformance.length > 0) {
      const bestAgent = analyticsData.agentPerformance.reduce((best, current) => {
        const currentRate = current.transfer_rate || 0;
        const bestRate = best.transfer_rate || 0;
        return currentRate > bestRate ? current : best;
      }, analyticsData.agentPerformance[0]);
      
      return {
        agent: bestAgent.Agent,
        transferRate: bestAgent.transfer_rate || 0
      };
    }
    
    return { agent: 'N/A', transferRate: 0 };
  };

  // Render chart
  const renderChart = (chartContent, height = 400) => (
    <div style={{ width: '100%', height, minHeight: '300px' }}>
      <ResponsiveContainer width="100%" height="100%">
        {chartContent}
      </ResponsiveContainer>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <FaTimesCircle className="w-16 h-16 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchData}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-xl shadow-md">
                <FaChartBar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">QA Analytics Dashboard</h1>
                <p className="text-sm text-gray-500 mt-1">Monitor and analyze call quality metrics</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={() => {
                  setEditingCall(null);
                  setShowTransferForm(true);
                }}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-xl transition-colors duration-200 font-medium shadow-sm"
              >
                <FaPlus className="w-4 h-4" />
                Add Transfer Call
              </button>
              <button 
                onClick={() => {
                  setEditingCall(null);
                  setShowNonTransferForm(true);
                }}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl transition-colors duration-200 font-medium shadow-sm"
              >
                <FaPlus className="w-4 h-4" />
                Add Non-Transfer Call
              </button>
              <button 
                onClick={exportToCSV}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-xl transition-colors duration-200 font-medium shadow-sm"
              >
                <FaFileExport className="w-4 h-4" />
                Export Data
              </button>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <FaFilter className="text-blue-500" />
            <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
          </div>
          
          {/* Quick Date Filters */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Quick Date Filters</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleDateRangeChange('today')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${filters.dateRange === 'today'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FaCalendarDay className="w-4 h-4" />
                Today
              </button>
              <button
                onClick={() => handleDateRangeChange('week')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${filters.dateRange === 'week'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FaCalendarWeek className="w-4 h-4" />
                Last 7 Days
              </button>
              <button
                onClick={() => handleDateRangeChange('month')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${filters.dateRange === 'month'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FaCalendar className="w-4 h-4" />
                Last 30 Days
              </button>
              <button
                onClick={() => handleDateRangeChange('custom')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${filters.dateRange === 'custom'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FaCalendarAlt className="w-4 h-4" />
                Custom Range
              </button>
            </div>
          </div>
          
          {/* Date Range Inputs (show when custom is selected) */}
          {filters.dateRange === 'custom' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                  className="w-full p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                  className="w-full p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}
          
          {/* Other Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Agent</label>
              <select
                name="agent"
                value={filters.agent}
                onChange={handleFilterChange}
                className="w-full p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Agents</option>
                {agents.map(agent => (
                  <option key={agent} value={agent}>{agent}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">QA</label>
              <select
                name="qa"
                value={filters.qa}
                onChange={handleFilterChange}
                className="w-full p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All QAs</option>
                {qaNames.map(qa => (
                  <option key={qa} value={qa}>{qa}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Score (0-6)</label>
              <input
                type="number"
                name="minScore"
                value={filters.minScore}
                onChange={handleFilterChange}
                min="0"
                max="6"
                step="0.5"
                className="w-full p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Score (0-6)</label>
              <input
                type="number"
                name="maxScore"
                value={filters.maxScore}
                onChange={handleFilterChange}
                min="0"
                max="6"
                step="0.5"
                className="w-full p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-600">
              Showing {transferData.length + nonTransferData.length} calls
              {filters.dateRange !== 'custom' && (
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                  {filters.dateRange === 'today' ? 'Today' : 
                   filters.dateRange === 'week' ? 'Last 7 Days' : 
                   filters.dateRange === 'month' ? 'Last 30 Days' : ''}
                </span>
              )}
            </div>
            <div className="flex gap-3">
              <button 
                onClick={resetFilters}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 font-medium"
              >
                Clear Filters
              </button>
              <button 
                onClick={fetchData}
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                <FaSync className="w-3 h-3" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { id: 'overview', label: 'Overview', icon: FaChartBar },
            { id: 'agent-performance', label: 'Agent Performance', icon: FaUsers },
            { id: 'compliance', label: 'Compliance', icon: FaCheckCircle },
            { id: 'transfer-details', label: 'Transfer Calls', icon: FaPhone },
            { id: 'nontransfer-details', label: 'Non-Transfer Calls', icon: FaPhone }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-colors ${activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-100 shadow-sm'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Main Content */}
        {activeTab === 'overview' && analyticsData && (
          <div className="space-y-6">
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Calls</p>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{analyticsData.totalCalls || 0}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <FaPhone className="text-blue-600 w-6 h-6" />
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  <span className="text-green-600 font-medium">{analyticsData.transferCount || 0} transfer</span>
                  <span className="mx-2">•</span>
                  <span className="text-orange-600 font-medium">{analyticsData.nonTransferCount || 0} non-transfer</span>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Overall Transfer Rate</p>
                    <p className="text-3xl font-bold text-gray-800 mt-2">
                      {safeNumber(safePercentage(analyticsData.transferCount, analyticsData.totalCalls))}%
                    </p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-lg">
                    <FaBullseye className="text-green-600 w-6 h-6" />
                  </div>
                </div>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${Math.min(safePercentage(analyticsData.transferCount, analyticsData.totalCalls), 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Transfer Avg Score</p>
                    <p className="text-3xl font-bold text-gray-800 mt-2">
                      {safeNumber(analyticsData.transferAvgScore)}/6
                    </p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-lg">
                    <FaChartBar className="text-green-600 w-6 h-6" />
                  </div>
                </div>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${Math.min(calculateScorePercentage(analyticsData.transferAvgScore || 0), 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Best Opener</p>
                    <p className="text-xl font-bold text-gray-800 mt-2 truncate">
                      {getBestOpener().agent}
                    </p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <FaTrophy className="text-purple-600 w-6 h-6" />
                  </div>
                </div>
                <div className="mt-4 text-sm">
                  <span className="text-green-600 font-medium">
                    {safeNumber(getBestOpener().transferRate)}%
                  </span>
                  <span className="text-gray-600 ml-2">transfer rate</span>
                </div>
              </div>
            </div>

            {/* Best Openers Section */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <FaTrophy className="text-yellow-500" />
                <h3 className="text-lg font-semibold text-gray-800">Best Openers (Highest Transfer Rate)</h3>
              </div>
              
              {(analyticsData.bestOpeners && analyticsData.bestOpeners.length > 0) ||
               (analyticsData.agentPerformance && analyticsData.agentPerformance.length > 0) ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="p-3 text-left text-sm font-medium text-gray-700">Rank</th>
                        <th className="p-3 text-left text-sm font-medium text-gray-700">Agent</th>
                        <th className="p-3 text-left text-sm font-medium text-gray-700">Total Calls</th>
                        <th className="p-3 text-left text-sm font-medium text-gray-700">Transfers</th>
                        <th className="p-3 text-left text-sm font-medium text-gray-700">Transfer Rate</th>
                        <th className="p-3 text-left text-sm font-medium text-gray-700">Avg Score (/6)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {(analyticsData.bestOpeners && analyticsData.bestOpeners.length > 0 
                        ? analyticsData.bestOpeners 
                        : analyticsData.agentPerformance || []
                      ).slice(0, 5).map((agent, index) => (
                        <tr key={agent.Agent} className="hover:bg-gray-50">
                          <td className="p-3">
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                              index === 0 ? 'bg-yellow-100 text-yellow-800' :
                              index === 1 ? 'bg-gray-100 text-gray-800' :
                              index === 2 ? 'bg-orange-100 text-orange-800' :
                              'bg-blue-50 text-blue-800'
                            }`}>
                              <span className="font-bold">#{index + 1}</span>
                            </div>
                          </td>
                          <td className="p-3 text-sm font-medium text-gray-900">
                            <div className="flex items-center gap-2">
                              <FaUser className="text-gray-400 w-4 h-4" />
                              {agent.Agent}
                            </div>
                          </td>
                          <td className="p-3 text-sm text-gray-600">{agent.total_calls || 0}</td>
                          <td className="p-3 text-sm">
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                              {agent.transfer_count || 0}
                            </span>
                          </td>
                          <td className="p-3 text-sm font-bold">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              (agent.transfer_rate || 0) >= 50 ? 'bg-green-100 text-green-800' :
                              (agent.transfer_rate || 0) >= 30 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {safeNumber(agent.transfer_rate || 0)}%
                            </span>
                          </td>
                          <td className="p-3 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              calculateScorePercentage(agent.avg_score || 0) >= 80 ? 'bg-green-100 text-green-800' :
                              calculateScorePercentage(agent.avg_score || 0) >= 60 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {safeNumber(agent.avg_score || 0)}/6
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {(!analyticsData.bestOpeners || analyticsData.bestOpeners.length === 0) && (
                    <div className="mt-4 p-3 bg-blue-50 text-blue-700 rounded-lg text-sm">
                      <FaInfoCircle className="inline mr-2" />
                      Showing all agents (need more data for accurate rankings)
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <FaTrophy className="w-12 h-12 mx-auto mb-4" />
                  <p>No agents have been evaluated yet. Add some calls to see rankings.</p>
                </div>
              )}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Transfer vs Non-Transfer Distribution</h3>
                {analyticsData.transferCount > 0 || analyticsData.nonTransferCount > 0 ? (
                  renderChart(
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Transfer', value: analyticsData.transferCount || 0 },
                          { name: 'Non-Transfer', value: analyticsData.nonTransferCount || 0 }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        <Cell fill="#0088FE" />
                        <Cell fill="#00C49F" />
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  )
                ) : (
                  <div className="h-80 flex items-center justify-center text-gray-400">
                    No data available for pie chart
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Agent Transfer Rates</h3>
                {analyticsData.agentPerformance && analyticsData.agentPerformance.length > 0 ? (
                  renderChart(
                    <BarChart 
                      data={analyticsData.agentPerformance.slice(0, 8)}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="Agent" angle={-45} textAnchor="end" height={60} />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip 
                        formatter={(value, name) => {
                          if (name === 'transfer_rate') return [`${safeNumber(value)}%`, 'Transfer Rate'];
                          if (name === 'avg_score') return [`${safeNumber(value)}/6`, 'Avg Score'];
                          return [value, name];
                        }}
                      />
                      <Legend />
                      <Bar yAxisId="left" dataKey="transfer_rate" name="Transfer Rate" fill="#0088FE" />
                      <Bar yAxisId="right" dataKey="avg_score" name="Avg Score (/6)" fill="#00C49F" />
                    </BarChart>
                  )
                ) : (
                  <div className="h-80 flex items-center justify-center text-gray-400">
                    No agent performance data available
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'agent-performance' && analyticsData && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <FaUsers className="text-blue-500" />
              <h2 className="text-xl font-semibold text-gray-800">Agent Performance Dashboard</h2>
            </div>
            
            {/* Performance Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Total Agents</p>
                    <p className="text-3xl font-bold mt-2">{analyticsData.agentPerformance?.length || 0}</p>
                  </div>
                  <FaUsers className="w-10 h-10 opacity-80" />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Avg Transfer Rate</p>
                    <p className="text-3xl font-bold mt-2">
                      {analyticsData.agentPerformance && analyticsData.agentPerformance.length > 0
                        ? safeNumber(
                            analyticsData.agentPerformance.reduce((sum, agent) => sum + (agent.transfer_rate || 0), 0) / 
                            analyticsData.agentPerformance.length
                          )
                        : '0.0'}%
                    </p>
                  </div>
                  <FaBullseye className="w-10 h-10 opacity-80" />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Avg Score (/6)</p>
                    <p className="text-3xl font-bold mt-2">
                      {analyticsData.agentPerformance && analyticsData.agentPerformance.length > 0
                        ? safeNumber(
                            analyticsData.agentPerformance.reduce((sum, agent) => sum + (agent.avg_score || 0), 0) / 
                            analyticsData.agentPerformance.length
                          )
                        : '0.0'}
                    </p>
                  </div>
                  <FaStar className="w-10 h-10 opacity-80" />
                </div>
              </div>
            </div>
            
            {/* Performance Chart */}
            {analyticsData.agentPerformance && analyticsData.agentPerformance.length > 0 ? (
              <>
                {renderChart(
                  <BarChart
                    data={analyticsData.agentPerformance}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis type="category" dataKey="Agent" width={120} />
                    <Tooltip 
                      formatter={(value, name) => {
                        if (name === 'avg_score') return [`${safeNumber(value)}/6`, 'Average Score'];
                        if (name === 'transfer_rate') return [`${safeNumber(value)}%`, 'Transfer Rate'];
                        if (name === 'transfer_count') return [`${value} calls`, 'Transfer Calls'];
                        return [value, name === 'nontransfer_count' ? 'Non-Transfer Calls' : name];
                      }}
                    />
                    <Legend />
                    <Bar dataKey="transfer_rate" name="Transfer Rate" fill="#00C49F" />
                    <Bar dataKey="avg_score" name="Avg Score (/6)" fill="#0088FE" />
                    <Bar dataKey="transfer_count" name="Transfers" fill="#FF8042" />
                  </BarChart>,
                  500
                )}

                {/* Agent Details Table */}
                <div className="mt-8 overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="p-3 text-left text-sm font-medium text-gray-700">Agent</th>
                        <th className="p-3 text-left text-sm font-medium text-gray-700">Total Calls</th>
                        <th className="p-3 text-left text-sm font-medium text-gray-700">Transfers</th>
                        <th className="p-3 text-left text-sm font-medium text-gray-700">Transfer Rate</th>
                        <th className="p-3 text-left text-sm font-medium text-gray-700">Avg Score (/6)</th>
                        <th className="p-3 text-left text-sm font-medium text-gray-700">Performance</th>
                        <th className="p-3 text-left text-sm font-medium text-gray-700">Rank</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {analyticsData.agentPerformance.map((agent, index) => (
                        <tr key={agent.Agent} className="hover:bg-gray-50">
                          <td className="p-3 text-sm font-medium text-gray-900">
                            <div className="flex items-center gap-2">
                              <FaUser className="text-gray-400 w-4 h-4" />
                              {agent.Agent}
                            </div>
                          </td>
                          <td className="p-3 text-sm text-gray-600">{agent.total_calls || 0}</td>
                          <td className="p-3 text-sm">
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                              {agent.transfer_count || 0}
                            </span>
                          </td>
                          <td className="p-3 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              (agent.transfer_rate || 0) >= 50 ? 'bg-green-100 text-green-800' :
                              (agent.transfer_rate || 0) >= 30 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {safeNumber(agent.transfer_rate)}%
                            </span>
                          </td>
                          <td className="p-3 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              calculateScorePercentage(agent.avg_score || 0) >= 80 ? 'bg-green-100 text-green-800' :
                              calculateScorePercentage(agent.avg_score || 0) >= 60 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {safeNumber(agent.avg_score || 0)}/6
                            </span>
                          </td>
                          <td className="p-3 text-sm">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  (agent.performance_score || 0) >= 70 ? 'bg-green-600' :
                                  (agent.performance_score || 0) >= 50 ? 'bg-yellow-500' :
                                  'bg-red-500'
                                }`} 
                                style={{ width: `${Math.min(agent.performance_score || 0, 100)}%` }}
                              ></div>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                              index === 0 ? 'bg-yellow-100 text-yellow-800' :
                              index === 1 ? 'bg-gray-100 text-gray-800' :
                              index === 2 ? 'bg-orange-100 text-orange-800' :
                              'bg-blue-50 text-blue-800'
                            }`}>
                              <span className="font-bold">#{index + 1}</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="h-80 flex items-center justify-center text-gray-400">
                No agent performance data available
              </div>
            )}
          </div>
        )}

        {/* Transfer Details Tab */}
        {activeTab === 'transfer-details' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">
                Transfer Calls ({transferData.length})
              </h3>
              <button 
                onClick={() => {
                  setEditingCall(null);
                  setShowTransferForm(true);
                }}
                className="flex items-center gap-2 bg-white text-green-600 hover:bg-green-50 px-4 py-2 rounded-lg font-medium"
              >
                <FaPlus className="w-4 h-4" />
                Add Transfer Call
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3 text-left text-sm font-medium text-gray-700">Date</th>
                    <th className="p-3 text-left text-sm font-medium text-gray-700">Agent</th>
                    <th className="p-3 text-left text-sm font-medium text-gray-700">Phone</th>
                    <th className="p-3 text-left text-sm font-medium text-gray-700">Score (/6)</th>
                    <th className="p-3 text-left text-sm font-medium text-gray-700">Energy</th>
                    <th className="p-3 text-left text-sm font-medium text-gray-700">Script</th>
                    <th className="p-3 text-left text-sm font-medium text-gray-700">Questions</th>
                    <th className="p-3 text-left text-sm font-medium text-gray-700">QA</th>
                    <th className="p-3 text-left text-sm font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {transferData.map((item, index) => (
                    <tr key={item.id || index} className="hover:bg-green-50">
                      <td className="p-3 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <FaCalendarAlt className="w-3 h-3" />
                          {formatDate(item.call_date || item.created_at)}
                        </div>
                      </td>
                      <td className="p-3 text-sm font-medium text-gray-900">{item.Agent}</td>
                      <td className="p-3 text-sm text-gray-600">{item.phone_number}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          calculateScorePercentage(item.score || 0) >= 80 ? 'bg-green-100 text-green-800' :
                          calculateScorePercentage(item.score || 0) >= 60 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {item.score || 0}/6
                        </span>
                      </td>
                      <td className="p-3">
                        {item.energy_good === 'Yes' ? (
                          <span className="inline-flex items-center text-green-600">
                            <FaCheckCircle className="w-4 h-4" />
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-red-600">
                            <FaTimesCircle className="w-4 h-4" />
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        {item.followed_script === 'Yes' ? (
                          <span className="inline-flex items-center text-green-600">
                            <FaCheckCircle className="w-4 h-4" />
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-red-600">
                            <FaTimesCircle className="w-4 h-4" />
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        {item.asked_2_questions === 'Yes' ? (
                          <span className="inline-flex items-center text-green-600">
                            <FaCheckCircle className="w-4 h-4" />
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-red-600">
                            <FaTimesCircle className="w-4 h-4" />
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-sm text-gray-600">{item.qa_name}</td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleEditCall(item, 'transfer')}
                            className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded"
                            title="Edit"
                          >
                            <FaEdit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteCall(item.id, 'transfer')}
                            className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded"
                            title="Delete"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Non-Transfer Details Tab */}
        {activeTab === 'nontransfer-details' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-orange-500 to-orange-600 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">
                Non-Transfer Calls ({nonTransferData.length})
              </h3>
              <button 
                onClick={() => {
                  setEditingCall(null);
                  setShowNonTransferForm(true);
                }}
                className="flex items-center gap-2 bg-white text-orange-600 hover:bg-orange-50 px-4 py-2 rounded-lg font-medium"
              >
                <FaPlus className="w-4 h-4" />
                Add Non-Transfer Call
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3 text-left text-sm font-medium text-gray-700">Date</th>
                    <th className="p-3 text-left text-sm font-medium text-gray-700">Agent</th>
                    <th className="p-3 text-left text-sm font-medium text-gray-700">Phone</th>
                    <th className="p-3 text-left text-sm font-medium text-gray-700">Script</th>
                    <th className="p-3 text-left text-sm font-medium text-gray-700">QA</th>
                    <th className="p-3 text-left text-sm font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {nonTransferData.map((item, index) => (
                    <tr key={item.id || index} className="hover:bg-orange-50">
                      <td className="p-3 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <FaCalendarAlt className="w-3 h-3" />
                          {formatDate(item.call_date || item.created_at)}
                        </div>
                      </td>
                      <td className="p-3 text-sm font-medium text-gray-900">{item.Agent}</td>
                      <td className="p-3 text-sm text-gray-600">{item.phone_number}</td>
                      <td className="p-3">
                        {item.followed_script === 'Yes' ? (
                          <span className="inline-flex items-center text-green-600">
                            <FaCheckCircle className="w-4 h-4" />
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-red-600">
                            <FaTimesCircle className="w-4 h-4" />
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-sm text-gray-600">{item.qa_name}</td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleEditCall(item, 'nontransfer')}
                            className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded"
                            title="Edit"
                          >
                            <FaEdit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteCall(item.id, 'non-transfer')}
                            className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded"
                            title="Delete"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* No Data State */}
        {!hasData && !loading && activeTab !== 'overview' && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="text-gray-400 mb-4">
              <FaChartBar className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Data Available</h3>
            <p className="text-gray-500 mb-6">Add some calls or adjust your filters to see analytics data</p>
            <div className="flex gap-3 justify-center">
              <button 
                onClick={() => {
                  setEditingCall(null);
                  setShowTransferForm(true);
                }}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Add Transfer Call
              </button>
              <button 
                onClick={() => {
                  setEditingCall(null);
                  setShowNonTransferForm(true);
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Add Non-Transfer Call
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Transfer Call Modal */}
      {showTransferForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  {editingCall ? 'Edit Transfer Call' : 'Add New Transfer Call'}
                </h2>
                <button 
                  onClick={() => {
                    setShowTransferForm(false);
                    setEditingCall(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={submitTransferCall}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                    <input
                      type="date"
                      name="call_date"
                      value={transferFormData.call_date}
                      onChange={handleTransferFormChange}
                      className="w-full p-2 border rounded-lg"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Agent *</label>
                    <input
                      type="text"
                      name="Agent"
                      value={transferFormData.Agent}
                      onChange={handleTransferFormChange}
                      className="w-full p-2 border rounded-lg"
                      required
                      list="agents-list"
                    />
                    <datalist id="agents-list">
                      {agents.map(agent => (
                        <option key={agent} value={agent} />
                      ))}
                    </datalist>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="text"
                      name="phone_number"
                      value={transferFormData.phone_number}
                      onChange={handleTransferFormChange}
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Score (0-6) *</label>
                    <input
                      type="number"
                      name="score"
                      value={transferFormData.score}
                      onChange={handleTransferFormChange}
                      min="0"
                      max="6"
                      step="0.5"
                      className="w-full p-2 border rounded-lg"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">QA Name</label>
                    <input
                      type="text"
                      name="qa_name"
                      value={transferFormData.qa_name}
                      onChange={handleTransferFormChange}
                      className="w-full p-2 border rounded-lg"
                      list="qa-list"
                    />
                    <datalist id="qa-list">
                      {qaNames.map(qa => (
                        <option key={qa} value={qa} />
                      ))}
                    </datalist>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Energy Good?</label>
                    <select
                      name="energy_good"
                      value={transferFormData.energy_good}
                      onChange={handleTransferFormChange}
                      className="w-full p-2 border rounded-lg"
                    >
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Followed Script?</label>
                    <select
                      name="followed_script"
                      value={transferFormData.followed_script}
                      onChange={handleTransferFormChange}
                      className="w-full p-2 border rounded-lg"
                    >
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Asked 2+ Questions?</label>
                    <select
                      name="asked_2_questions"
                      value={transferFormData.asked_2_questions}
                      onChange={handleTransferFormChange}
                      className="w-full p-2 border rounded-lg"
                    >
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Engaged with Author?</label>
                    <select
                      name="engaged_with_author"
                      value={transferFormData.engaged_with_author}
                      onChange={handleTransferFormChange}
                      className="w-full p-2 border rounded-lg"
                    >
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Handled Objection?</label>
                    <select
                      name="handled_objection"
                      value={transferFormData.handled_objection}
                      onChange={handleTransferFormChange}
                      className="w-full p-2 border rounded-lg"
                    >
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Author Aware Transfer?</label>
                    <select
                      name="author_aware_transfer"
                      value={transferFormData.author_aware_transfer}
                      onChange={handleTransferFormChange}
                      className="w-full p-2 border rounded-lg"
                    >
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    name="notes"
                    value={transferFormData.notes}
                    onChange={handleTransferFormChange}
                    rows="3"
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowTransferForm(false);
                      setEditingCall(null);
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                  >
                    {editingCall ? 'Update' : 'Save'} Transfer Call
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Non-Transfer Call Modal */}
      {showNonTransferForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  {editingCall ? 'Edit Non-Transfer Call' : 'Add New Non-Transfer Call'}
                </h2>
                <button 
                  onClick={() => {
                    setShowNonTransferForm(false);
                    setEditingCall(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={submitNonTransferCall}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                    <input
                      type="date"
                      name="call_date"
                      value={nonTransferFormData.call_date}
                      onChange={handleNonTransferFormChange}
                      className="w-full p-2 border rounded-lg"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Agent *</label>
                    <input
                      type="text"
                      name="Agent"
                      value={nonTransferFormData.Agent}
                      onChange={handleNonTransferFormChange}
                      className="w-full p-2 border rounded-lg"
                      required
                      list="agents-list-non"
                    />
                    <datalist id="agents-list-non">
                      {agents.map(agent => (
                        <option key={agent} value={agent} />
                      ))}
                    </datalist>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="text"
                      name="phone_number"
                      value={nonTransferFormData.phone_number}
                      onChange={handleNonTransferFormChange}
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">QA Name</label>
                    <input
                      type="text"
                      name="qa_name"
                      value={nonTransferFormData.qa_name}
                      onChange={handleNonTransferFormChange}
                      className="w-full p-2 border rounded-lg"
                      list="qa-list-non"
                    />
                    <datalist id="qa-list-non">
                      {qaNames.map(qa => (
                        <option key={qa} value={qa} />
                      ))}
                    </datalist>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Followed Script?</label>
                    <select
                      name="followed_script"
                      value={nonTransferFormData.followed_script}
                      onChange={handleNonTransferFormChange}
                      className="w-full p-2 border rounded-lg"
                    >
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    name="notes"
                    value={nonTransferFormData.notes}
                    onChange={handleNonTransferFormChange}
                    rows="3"
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowNonTransferForm(false);
                      setEditingCall(null);
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                  >
                    {editingCall ? 'Update' : 'Save'} Non-Transfer Call
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;