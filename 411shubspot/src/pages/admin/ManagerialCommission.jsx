import React, { useState, useEffect } from 'react'

export default function ManagerialCommission() {
  const API_URL = import.meta.env.VITE_API_URL;
  const [commissions, setCommissions] = useState([]);
  const [filteredCommissions, setFilteredCommissions] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [grandTotal, setGrandTotal] = useState({ amount: 0, commission: 0 });
  const [managerialCommission, setManagerialCommission] = useState(0);

  // Month names for display
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Fetch commissions from backend
  const fetchCommissions = async () => {
    try {
      const response = await fetch(`${API_URL}/api/commissions`);
      if (response.ok) {
        const data = await response.json();
        setCommissions(data);
      } else {
        console.error('Failed to fetch commissions');
      }
    } catch (error) {
      console.error('Error fetching commissions:', error);
    }
  };

  // Calculate totals and filter data based on selected month/year
  useEffect(() => {
    let filteredData = commissions;
    
    // Apply month filter if selected
    if (selectedMonth) {
      filteredData = filteredData.filter(commission => {
        const commissionDate = new Date(commission.created_at);
        return commissionDate.getMonth() + 1 === parseInt(selectedMonth);
      });
    }
    
    // Apply year filter
    filteredData = filteredData.filter(commission => {
      const commissionDate = new Date(commission.created_at);
      return commissionDate.getFullYear() === parseInt(selectedYear);
    });
    
    setFilteredCommissions(filteredData);
    
    // Calculate grand totals
    const totalAmount = filteredData.reduce((sum, commission) => 
      sum + parseFloat(commission.amount || 0), 0);
    
    const totalCommission = filteredData.reduce((sum, commission) => 
      sum + parseFloat(commission.total_commission || 0), 0);
    
    setGrandTotal({ amount: totalAmount, commission: totalCommission });
    
    // Calculate managerial commission: 
    
    const step1 = totalAmount * 0.04; 
    const step2 = (totalAmount - step1) * 0.02 * 49; 
    const managerialComm = step2;
    
    setManagerialCommission(managerialComm);
  }, [commissions, selectedMonth, selectedYear]);

  // Get unique years from commissions
  const getUniqueYears = () => {
    const years = new Set();
    commissions.forEach(commission => {
      const date = new Date(commission.created_at);
      years.add(date.getFullYear());
    });
    
    // Add current year if no commissions exist yet
    if (years.size === 0) {
      years.add(new Date().getFullYear());
    }
    
    return Array.from(years).sort((a, b) => b - a);
  };

  // Format currency
  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchCommissions();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-6 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-indigo-700 mb-3">Managerial Commission Calculator</h2>
          <p className="text-lg text-indigo-600 font-medium">Calculate managerial commission based on total sales</p>
          <div className="w-24 h-1 bg-indigo-500 mx-auto mt-4 rounded-full"></div>
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

            <div className="w-full md:w-1/3">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Records Count</label>
              <div className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50">
                {filteredCommissions.length} records
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-200">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-green-700 mb-2">Total Amount</h3>
              <p className="text-3xl font-bold text-green-800">
                {formatCurrency(grandTotal.amount, 'USD')}
              </p>
              <p className="text-sm text-green-600 mt-2">
                {selectedMonth ? `${monthNames[selectedMonth - 1]} ${selectedYear}` : `All Months ${selectedYear}`}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-purple-200">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-purple-700 mb-2">Total Agent Commission</h3>
              <p className="text-3xl font-bold text-purple-800">
                {formatCurrency(grandTotal.commission, 'PHP')}
              </p>
              <p className="text-sm text-purple-600 mt-2">
                Commission paid to agents
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-indigo-200">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-indigo-700 mb-2">Managerial Commission</h3>
              <p className="text-3xl font-bold text-indigo-800">
                {formatCurrency(managerialCommission, 'PHP')}
              </p>
            </div>
          </div>
        </div>

        {/* Commission Details */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h3 className="text-2xl font-bold text-indigo-700 mb-6">Commission Details</h3>
          
          {filteredCommissions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-indigo-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-700 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-700 uppercase">Agent</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-700 uppercase">Author</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-700 uppercase">Services</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-700 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-700 uppercase">Commission</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredCommissions.map((commission) => (
                    <tr key={commission.id} className="hover:bg-indigo-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(commission.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {commission.agent_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {commission.author_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {commission.services}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-700">
                        {formatCurrency(parseFloat(commission.amount || 0), 'USD')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-purple-700">
                        {formatCurrency(parseFloat(commission.total_commission || 0), 'PHP')}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-indigo-50 font-semibold">
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-right text-sm text-indigo-700">Grand Totals:</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-700">
                      {formatCurrency(grandTotal.amount, 'USD')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-purple-700">
                      {formatCurrency(grandTotal.commission, 'PHP')}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-500 text-lg">
                {commissions.length === 0 
                  ? "No commission records found" 
                  : `No records found for ${selectedMonth ? monthNames[selectedMonth - 1] : ''} ${selectedYear}`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}