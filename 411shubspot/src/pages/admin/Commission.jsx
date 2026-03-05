import React, { useState, useEffect } from 'react';

function Commission() {
  const API_URL = import.meta.env.VITE_API_URL;
  
  // Predefined agents with their commission rates
  const agents = [
    { id: 1, name: 'Mark Wilson Lapinig', rate: 19 },
    { id: 2, name: 'Lawr Carillas', rate: 19 },
    { id: 3, name: 'Carren Lim', rate: 8 },
    { id: 4, name: 'Terence Villanueva', rate: 19 },
    { id: 5, name: 'Marvin Bustillo', rate: 19 },
    { id: 6, name: 'Rhian Salimbot', rate: 17 },
    { id: 7, name: 'Rhea Jane Taghoy', rate: 19 },
    { id: 8, name: 'Jian Jose Jaralve', rate: 17 },
    { id: 9, name: 'John Kyle Toquero', rate: 17 },
    { id: 10, name: 'Gerardton Millares', rate: 25 }
  ];

  // Month names for display
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // State management
  const [formData, setFormData] = useState({
    agent_name: '',
    author_name: '',
    services: '',
    amount: '',
    commission_rate: '',
    payment_date: '',
    deduction: '',
    total_commission: '',
    created_at: formatDateForInput(new Date())
  });

  const [savedRecords, setSavedRecords] = useState([]);
  const [monthlySummaries, setMonthlySummaries] = useState([]);
  const [editingRecord, setEditingRecord] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [agentDeductions, setAgentDeductions] = useState({});
  const [savingDeductions, setSavingDeductions] = useState({});
  const [grandTotals, setGrandTotals] = useState({ totalAmount: 0, totalCommission: 0 });

  // Helper function to format date for input[type="date"]
  function formatDateForInput(dateString) {
    if (!dateString) return '';
    
    // If it's already in YYYY-MM-DD format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }
    
    // Parse the date and format it correctly for input
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }

  // Fetch records from backend on component mount
  useEffect(() => {
    fetchRecords();
    fetchDeductions();
  }, []);

  // Calculate monthly summaries when records change
  useEffect(() => {
    calculateMonthlySummaries();
    calculateGrandTotals();
  }, [savedRecords]);

  // Filter records by selected month and year
  useEffect(() => {
    calculateMonthlySummaries();
    calculateGrandTotals();
  }, [selectedMonth, selectedYear]);

  const fetchRecords = async () => {
    try {
      const response = await fetch(`${API_URL}/api/commissions`);
      if (response.ok) {
        const data = await response.json();
        setSavedRecords(data);
      } else {
        console.error('Failed to fetch records');
      }
    } catch (error) {
      console.error('Error fetching records:', error);
    }
  };

  const fetchDeductions = async () => {
    try {
      const response = await fetch(`${API_URL}/api/deductions`);
      if (response.ok) {
        const data = await response.json();
        
        // Convert deductions array to object keyed by agent name
        const deductionsObj = {};
        data.forEach(deduction => {
          deductionsObj[deduction.agent_name] = parseFloat(deduction.amount);
        });
        
        setAgentDeductions(deductionsObj);
      } else {
        console.error('Failed to fetch deductions');
      }
    } catch (error) {
      console.error('Error fetching deductions:', error);
    }
  };

  // Calculate grand totals for all records
  const calculateGrandTotals = () => {
    let totalAmount = 0;
    let totalCommission = 0;
    
    savedRecords.forEach(record => {
      const recordDate = new Date(record.created_at);
      const recordMonth = recordDate.getMonth() + 1;
      const recordYear = recordDate.getFullYear();
      
      // Apply month/year filter if selected
      if (selectedMonth && recordMonth !== parseInt(selectedMonth)) return;
      if (selectedYear && recordYear !== parseInt(selectedYear)) return;
      
      totalAmount += parseFloat(record.amount || 0);
      totalCommission += parseFloat(record.total_commission || 0);
    });
    
    setGrandTotals({
      totalAmount,
      totalCommission
    });
  };

  // Calculate monthly summaries for all agents
  const calculateMonthlySummaries = () => {
    const summaries = {};
    
    savedRecords.forEach(record => {
      const recordDate = new Date(record.created_at);
      const recordMonth = recordDate.getMonth() + 1;
      const recordYear = recordDate.getFullYear();
      
      // Apply month/year filter if selected
      if (selectedMonth && recordMonth !== parseInt(selectedMonth)) return;
      if (selectedYear && recordYear !== parseInt(selectedYear)) return;
      
      const monthYearKey = `${recordMonth}-${recordYear}`;
      const agentName = record.agent_name;
      
      if (!summaries[monthYearKey]) {
        summaries[monthYearKey] = {
          month: recordMonth,
          year: recordYear,
          agents: {}
        };
      }
      
      if (!summaries[monthYearKey].agents[agentName]) {
        summaries[monthYearKey].agents[agentName] = {
          totalAmount: 0,
          totalCommission: 0,
          records: []
        };
      }
      
      summaries[monthYearKey].agents[agentName].totalAmount += parseFloat(record.amount || 0);
      summaries[monthYearKey].agents[agentName].totalCommission += parseFloat(record.total_commission || 0);
      summaries[monthYearKey].agents[agentName].records.push(record);
    });
    
    // Convert to array and sort by year/month descending
    const summaryArray = Object.values(summaries).sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });
    
    setMonthlySummaries(summaryArray);
  };

  // Get unique years from records for filter dropdown
  const getUniqueYears = () => {
    const years = new Set();
    savedRecords.forEach(record => {
      const date = new Date(record.created_at);
      years.add(date.getFullYear());
    });
    
    // Add current year if no records exist yet
    if (years.size === 0) {
      years.add(new Date().getFullYear());
    }
    
    return Array.from(years).sort((a, b) => b - a);
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle deduction input changes
  const handleDeductionChange = (agentName, value) => {
    setAgentDeductions({
      ...agentDeductions,
      [agentName]: parseFloat(value) || 0
    });
  };

  // Handle agent selection
  const handleAgentSelect = (e) => {
    const selectedAgent = agents.find(agent => agent.name === e.target.value);
    if (selectedAgent) {
      setFormData({
        ...formData,
        agent_name: selectedAgent.name,
        commission_rate: selectedAgent.rate
      });
    }
  };

  // Calculate commission with the formula: (amount - deduction) × rate × 49
  const calculateCommission = () => {
    const rate = parseFloat(formData.commission_rate);
    const amount = parseFloat(formData.amount);
    const deduction = parseFloat(formData.deduction) || 0;
    
    if (!isNaN(rate) && !isNaN(amount)) {
      const commission = ((amount - deduction) * rate * 49) / 100;
      setFormData({
        ...formData,
        total_commission: commission.toFixed(2)
      });
    }
  };

  // Save record to backend
  const saveRecord = async () => {
    try {
      let response;
      
      // Calculate final commission with deduction
      const finalCommission = ((parseFloat(formData.amount) - (parseFloat(formData.deduction) || 0)) * 
                              parseFloat(formData.commission_rate) * 49) / 100;
      
      const recordData = {
        ...formData,
        total_commission: finalCommission.toFixed(2)
      };
      
      if (editingRecord) {
        // Update existing record
        response = await fetch(`${API_URL}/api/commissions/${editingRecord.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(recordData)
        });
      } else {
        // Add new record
        response = await fetch(`${API_URL}/api/commissions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(recordData)
        });
      }

      if (response.ok) {
        // Refresh records
        fetchRecords();
        // Reset form and close modal
        resetForm();
        setShowModal(false);
      } else {
        console.error('Failed to save record');
      }
    } catch (error) {
      console.error('Error saving record:', error);
    }
  };

  // Save deductions for an agent
  const saveDeductions = async (agentName) => {
    try {
      setSavingDeductions({...savingDeductions, [agentName]: true});
      
      const deductionData = {
        agent_name: agentName,
        amount: agentDeductions[agentName] || 0,
        month: selectedMonth,
        year: selectedYear
      };
      
      // Check if deduction already exists for this agent/month/year
      const checkResponse = await fetch(
        `${API_URL}/api/deductions?agent=${agentName}&month=${selectedMonth}&year=${selectedYear}`
      );
      
      let response;
      if (checkResponse.ok) {
        const existingDeductions = await checkResponse.json();
        
        if (existingDeductions.length > 0) {
          // Update existing deduction
          response = await fetch(`${API_URL}/api/deductions/${existingDeductions[0].id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(deductionData)
          });
        } else {
          // Create new deduction
          response = await fetch(`${API_URL}/api/deductions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(deductionData)
          });
        }
        
        if (response.ok) {
          // Refresh deductions
          fetchDeductions();
        } else {
          console.error('Failed to save deduction');
        }
      }
      
      setSavingDeductions({...savingDeductions, [agentName]: false});
    } catch (error) {
      console.error('Error saving deductions:', error);
      setSavingDeductions({...savingDeductions, [agentName]: false});
    }
  };

  // Edit a record
  const editRecord = (record) => {
    setFormData({
      agent_name: record.agent_name,
      author_name: record.author_name,
      services: record.services,
      amount: record.amount,
      commission_rate: record.commission_rate,
      payment_date: formatDateForInput(record.payment_date),
      deduction: record.deduction || '',
      total_commission: record.total_commission,
      created_at: record.created_at
    });

    setEditingRecord(record);
    setShowModal(true);
  };

  // Delete a record
  const deleteRecord = async (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        const response = await fetch(`${API_URL}/api/commissions/${id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          // Refresh records
          fetchRecords();
        } else {
          console.error('Failed to delete record');
        }
      } catch (error) {
        console.error('Error deleting record:', error);
      }
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      agent_name: '',
      author_name: '',
      services: '',
      amount: '',
      commission_rate: '',
      payment_date: '',
      deduction: '',
      total_commission: '',
      created_at: formatDateForInput(new Date())
    });
    setEditingRecord(null);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Open modal for new record
  const openNewRecordModal = () => {
    resetForm();
    setShowModal(true);
  };

  // Get agent color based on name
  const getAgentColor = (agentName) => {
  const agentColors = {
    'Mark Wilson Lapinig': 'bg-blue-100 border-blue-300 text-blue-800',
    'Lawr Carillas': 'bg-green-100 border-green-300 text-green-800',
    'Carren Lim': 'bg-purple-100 border-purple-300 text-purple-800',
    'Terence Villanueva': 'bg-amber-100 border-amber-300 text-amber-800',
    'Marvin Bustillo': 'bg-rose-100 border-rose-300 text-rose-800',
    'Rhian Salimbot': 'bg-indigo-100 border-indigo-300 text-indigo-800',
    'Rhea Jane Taghoy': 'bg-pink-100 border-pink-300 text-pink-800',
    'Jian Jose Jaralve': 'bg-teal-100 border-teal-300 text-teal-800',
    'John Kyle Toquero': 'bg-cyan-100 border-cyan-300 text-cyan-800',
    'Gerardton Millares': 'bg-orange-100 border-orange-300 text-orange-800'
  };
  
  return agentColors[agentName] || 'bg-gray-100 border-gray-300 text-gray-800';
};

  // Calculate commission after deduction for display
  const calculateCommissionAfterDeduction = (totalAmount, deduction, commissionRate) => {
    const amountAfterDeduction = totalAmount - (deduction || 0);
    return (amountAfterDeduction * commissionRate * 49) / 100;
  };

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-6 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-indigo-700 mb-3">Monthly Commission</h2>
          <p className="text-lg text-indigo-600 font-medium">Track and calculate agent commissions by month</p>
          <div className="w-200 h-1 bg-indigo-500 mx-auto mt-4 rounded-full"></div>
        </div>

        {/* Grand Totals */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-lg p-6 mb-8 text-white">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <h3 className="text-xl font-bold">Grand Totals</h3>
              <p className="text-indigo-200">
                {selectedMonth ? `${monthNames[selectedMonth - 1]} ${selectedYear}` : 'All Time'}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full md:w-auto">
              <div className="bg-white bg-opacity-20 p-4 rounded-xl text-center">
                <p className="text-sm font-medium text-amber-500 mb-1">Total Amount</p>
                <p className="text-2xl font-bold text-amber-500">{formatCurrency(grandTotals.totalAmount.toFixed(2))}</p>
              </div>
              
              <div className="bg-white bg-opacity-20 p-4 rounded-xl text-center">
                <p className="text-sm font-medium mb-1 text-cyan-500">Total Commission</p>
                <p className="text-2xl font-bold text-cyan-500">{formatCurrency(grandTotals.totalCommission.toFixed(2), 'PHP')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="w-full md:w-1/3">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Select Month</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
              >
                <option value="">All Months</option>
                {monthNames.map((month, index) => (
                  <option key={index + 1} value={index + 1}>{month}</option>
                ))}
              </select>
            </div>

            <div className="w-full md:w-1/3">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Select Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
              >
                {getUniqueYears().map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div className="w-full md:w-1/3 mt-6">
              <button
                onClick={openNewRecordModal}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Add New Record
              </button>
            </div>
          </div>
        </div>

        {/* Monthly Summaries */}
        <div className="space-y-6">
          {monthlySummaries.map(summary => {
            // Calculate monthly totals
            let monthlyTotalAmount = 0;
            let monthlyTotalCommission = 0;
            
            Object.values(summary.agents).forEach(agent => {
              monthlyTotalAmount += agent.totalAmount;
              monthlyTotalCommission += agent.totalCommission;
            });
            
            return (
              <div key={`${summary.month}-${summary.year}`} className="bg-white rounded-2xl shadow-lg p-6 border border-indigo-100">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-indigo-100">
                  <h3 className="text-2xl font-bold text-indigo-700">
                    {monthNames[summary.month - 1]} {summary.year} Commissions
                  </h3>
                  <div className="flex items-center space-x-4">
                    <div className="text-sm text-indigo-600 bg-indigo-50 px-3 py-2 rounded-lg">
                      {Object.keys(summary.agents).length} Agents
                    </div>
                    <div className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                      Grand Total Amount: {formatCurrency(monthlyTotalAmount.toFixed(2))}
                    </div>
                    <div className="text-sm text-purple-600 bg-purple-50 px-3 py-2 rounded-lg">
                      Grand Total Commission: {formatCurrency(monthlyTotalCommission.toFixed(2), 'PHP')}
                    </div>
                  </div>
                </div>

                {/* Agents Summary */}
                <div className="space-y-6">
                  {Object.entries(summary.agents).map(([agentName, agentData]) => {
                    const deduction = agentDeductions[agentName] || 0;
                    const commissionRate = agentData.records[0]?.commission_rate || 0;
                    const commissionAfterDeduction = calculateCommissionAfterDeduction(
                      agentData.totalAmount, 
                      deduction, 
                      commissionRate
                    );
                    
                    return (
                      <div key={agentName} className="border border-gray-200 rounded-xl overflow-hidden">
                        {/* Agent Header */}
                        <div className={`p-4 ${getAgentColor(agentName)}`}>
                          <h4 className="text-xl font-bold">{agentName}</h4>
                        </div>
                        
                        {/* Agent Summary */}
                        <div className="p-4 bg-gray-50 grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="bg-white p-4 rounded-lg border border-green-200">
                            <p className="text-sm font-medium text-green-700 mb-1">Total Amount</p>
                            <p className="text-2xl font-bold text-green-800">
                              {formatCurrency(agentData.totalAmount.toFixed(2), 'USD')}
                            </p>
                          </div>
                          
                          <div className="bg-white p-4 rounded-lg border border-blue-200">
                            <p className="text-sm font-medium text-blue-700 mb-1">Commission Rate</p>
                            <p className="text-2xl font-bold text-blue-800">
                              {commissionRate}%
                            </p>
                          </div>
                          
                          <div className="bg-white p-4 rounded-lg border border-purple-200">
                            <p className="text-sm font-medium text-purple-700 mb-1">Total Commission</p>
                            <p className="text-2xl font-bold text-purple-800">
                              {formatCurrency(agentData.totalCommission.toFixed(2), 'PHP')}
                            </p>
                          </div>
                          
                          <div className="bg-white p-4 rounded-lg border border-amber-200">
                            <div className="flex justify-between items-center mb-2">
                              <p className="text-sm font-medium text-amber-700">Deduction</p>
                              <button
                                onClick={() => saveDeductions(agentName)}
                                disabled={savingDeductions[agentName]}
                                className="text-xs bg-amber-500 hover:bg-amber-600 text-white px-2 py-1 rounded-md disabled:opacity-50"
                              >
                                {savingDeductions[agentName] ? 'Saving...' : 'Save'}
                              </button>
                            </div>
                            <input
                              type="number"
                              value={deduction ||''}
                              onChange={(e) => handleDeductionChange(agentName, e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-amber-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                        
                        {/* After Deduction Summary */}
                        {deduction > 0 && (
                          <div className="p-4 bg-amber-50 grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-amber-200">
                            <div className="bg-white p-4 rounded-lg border border-amber-200">
                              <p className="text-sm font-medium text-amber-700 mb-1">Amount After Deduction</p>
                              <p className="text-xl font-bold text-amber-800">
                                {formatCurrency((agentData.totalAmount - deduction).toFixed(2), 'USD')}
                              </p>
                            </div>
                            
                            <div className="bg-white p-4 rounded-lg border border-amber-200">
                              <p className="text-sm font-medium text-amber-700 mb-1">Commission After Deduction</p>
                              <p className="text-xl font-bold text-amber-800">
                                {formatCurrency(commissionAfterDeduction.toFixed(2), 'PHP')}
                              </p>
                            </div>
                            
                            <div className="bg-white p-4 rounded-lg border border-amber-200">
                              <p className="text-sm font-medium text-amber-700 mb-1">Difference</p>
                              <p className="text-xl font-bold text-red-600">
                                -{formatCurrency((agentData.totalCommission - commissionAfterDeduction).toFixed(2), 'PHP')}
                              </p>
                            </div>
                          </div>
                        )}
                        
                        {/* Records Table */}
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-indigo-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-700 uppercase">Payment Date</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-700 uppercase">Author</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-700 uppercase">Services</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-700 uppercase">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-700 uppercase">Commission</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-700 uppercase">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                              {agentData.records.map((record) => (
                                <tr key={record.id} className="hover:bg-indigo-50">
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {formatDate(record.payment_date)}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                    {record.author_name}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                    {record.services}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-700">
                                    {formatCurrency(parseFloat(record.amount || 0).toFixed(2), 'USD')}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-purple-700">
                                    {formatCurrency(parseFloat(record.total_commission || 0).toFixed(2), 'PHP')}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex space-x-2">
                                      <button
                                        onClick={() => editRecord(record)}
                                        className="text-indigo-600 hover:text-indigo-900 p-2 rounded-lg bg-indigo-50 hover:bg-indigo-100"
                                        title="Edit"
                                      >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                      </button>
                                      <button
                                        onClick={() => deleteRecord(record.id)}
                                        className="text-red-600 hover:text-red-900 p-2 rounded-lg bg-red-50 hover:bg-red-100"
                                        title="Delete"
                                      >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {monthlySummaries.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-500 text-lg">
              {savedRecords.length === 0 
                ? "No commission records found" 
                : `No records found for ${selectedMonth ? monthNames[selectedMonth - 1] : ''} ${selectedYear}`}
            </p>
            <p className="text-gray-400 mt-2">
              {savedRecords.length === 0 
                ? "Add your first commission record to get started" 
                : "Try selecting a different month or year"}
            </p>
            <button
              onClick={openNewRecordModal}
              className="mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Add New Record
            </button>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-indigo-100">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-indigo-100">
                <h3 className="text-2xl font-bold text-indigo-700">{editingRecord ? 'Edit Record' : 'New Commission'}</h3>
                <button 
                  onClick={() => {
                    resetForm();
                    setShowModal(false);
                  }} 
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-indigo-700 mb-2">Select Agent:</label>
                    <select 
                      onChange={handleAgentSelect} 
                      value={formData.agent_name}
                      className="w-full px-4 py-3 rounded-xl border-2 border-indigo-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 bg-white"
                    >
                      <option value="">Select an agent</option>
                      {agents.map(agent => (
                        <option key={agent.id} value={agent.name}>
                          {agent.name} ({agent.rate}%)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-indigo-700 mb-2">Created Month:</label>
                    {editingRecord ? (
                      <input
                        type="text"
                        value={formatDate(formData.created_at)}
                        disabled
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 bg-gray-50 text-gray-600 cursor-not-allowed"
                      />
                    ) : (
                      <input
                        type="month"
                        name="created_at"
                        value={formData.created_at.substring(0, 7)} // Extract YYYY-MM part
                        onChange={(e) => {
                          // Set to the first day of the month for proper date storage
                          const monthValue = e.target.value;
                          const firstDayOfMonth = monthValue ? `${monthValue}-01` : '';
                          handleInputChange({
                            target: {
                              name: 'created_at',
                              value: firstDayOfMonth
                            }
                          });
                        }}
                        className="w-full px-4 py-3 rounded-xl border-2 border-indigo-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
                      />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-indigo-700 mb-2">Agent Name:</label>
                    <input
                      type="text"
                      name="agent_name"
                      value={formData.agent_name}
                      onChange={handleInputChange}
                      placeholder="Enter agent name"
                      className="w-full px-4 py-3 rounded-xl border-2 border-indigo-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-indigo-700 mb-2">Author Name:</label>
                    <input
                      type="text"
                      name="author_name"
                      value={formData.author_name}
                      onChange={handleInputChange}
                      placeholder="Enter author name"
                      className="w-full px-4 py-3 rounded-xl border-2 border-indigo-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-indigo-700 mb-2">Services:</label>
                  <input
                    type="text"
                    name="services"
                    value={formData.services}
                    onChange={handleInputChange}
                    placeholder="Enter services provided"
                    className="w-full px-4 py-3 rounded-xl border-2 border-indigo-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-indigo-700 mb-2">Amount ($):</label>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      placeholder="Enter amount"
                      className="w-full px-4 py-3 rounded-xl border-2 border-green-100 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-indigo-700 mb-2">Commission Rate (%):</label>
                    <input
                      type="number"
                      name="commission_rate"
                      value={formData.commission_rate}
                      onChange={handleInputChange}
                      placeholder="Enter rate"
                      className="w-full px-4 py-3 rounded-xl border-2 border-blue-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-indigo-700 mb-2">Deduction ($):</label>
                    <input
                      type="number"
                      name="deduction"
                      value={formData.deduction}
                      onChange={handleInputChange}
                      placeholder="Enter deduction"
                      className="w-full px-4 py-3 rounded-xl border-2 border-amber-100 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all duration-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-indigo-700 mb-2">Payment Date:</label>
                  <input
                    type="date"
                    name="payment_date"
                    value={formData.payment_date || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border-2 border-indigo-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
                  />
                </div>

                <div className="flex space-x-4 pt-4">
                  <button 
                    onClick={calculateCommission} 
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    Calculate Commission
                  </button>
                  <button 
                    onClick={() => {
                      resetForm();
                      setShowModal(false);
                    }} 
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-all duration-200"
                  >
                    Cancel
                  </button>
                </div>

                <div className="mt-6 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border-2 border-indigo-100">
                  <div className="bg-white p-4 rounded-xl border border-green-200 mb-4">
                    <p className="text-sm font-medium text-green-700 mb-1">Amount:</p>
                    <p className="text-2xl font-bold text-green-800">
                      ${parseFloat(formData.amount || 0).toFixed(2)}
                    </p>
                  </div>
                  
                  {formData.deduction > 0 && (
                    <div className="bg-white p-4 rounded-xl border border-amber-200 mb-4">
                      <p className="text-sm font-medium text-amber-700 mb-1">After Deduction:</p>
                      <p className="text-2xl font-bold text-amber-800">
                        ${(parseFloat(formData.amount || 0) - parseFloat(formData.deduction || 0)).toFixed(2)}
                      </p>
                    </div>
                  )}
                  
                  <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 rounded-xl text-center">
                    <h3 className="text-lg font-semibold text-white mb-2">Total Commission</h3>
                    <p className="text-4xl font-bold text-white">₱{formData.total_commission || '0.00'}</p>
                    <p className="text-sm text-indigo-200 mt-2">Calculated as (Amount - Deduction) × Rate × 49</p>
                  </div>
                </div>

                <button 
                  onClick={saveRecord} 
                  disabled={!formData.total_commission}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl text-lg"
                >
                  {editingRecord ? 'Update Record' : 'Save Record'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Commission;