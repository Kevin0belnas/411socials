import React, { useState, useEffect, useMemo } from 'react';
const API_URL = import.meta.env.VITE_API_URL;
import { FaSearch, FaPlus, FaEye, FaEdit, FaTrash, FaFileInvoice, 
         FaFilter, FaCalendarAlt, FaMoneyBillWave, FaReceipt, 
         FaPrint, FaTimes, FaChevronLeft, FaChevronRight, 
         FaUser, FaCog, FaUserTie, FaBook, FaCreditCard, 
         FaPercentage, FaInfoCircle, FaDollarSign } from 'react-icons/fa';

function SalesReport() {
  // Add state for totals
  const [totals, setTotals] = useState({
    totalPaid: 0,
    totalBalance: 0
  });
  // Separate states for add and edit forms
  const [addFormData, setAddFormData] = useState({
    date: '',
    paymentType: 'full',
    fullPaymentAmount: '',
    serviceAmount: '',
    service: '',
    author: '',
    leadOwner: '',
    closer: '',
    paymentMethod: '',
    paymentStatus: 'Pending',
    notes: '',
    start: '',
    end: '',
    payments: [{ amount: '', date: '', method: '' }]
  });

  const [editFormData, setEditFormData] = useState({
    date: '',
    paymentType: 'full',
    fullPaymentAmount: '',
    serviceAmount: '',
    service: '',
    author: '',
    leadOwner: '',
    closer: '',
    paymentMethod: '',
    paymentStatus: 'Pending',
    notes: '',
    start: '',
    end: '',
    payments: [{ amount: '', date: '', method: '' }]
  });

  const [filterType, setFilterType] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [reportData, setReportData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [editingSale, setEditingSale] = useState(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchAllData();
    document.title = "411 Socials Sales Report";
  }, []);

  // DATE FORMAT FIX: Create a consistent date formatting function
  const formatDisplayDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/sales`);
      if (!response.ok) throw new Error('Failed to fetch data');
      const data = await response.json();
      setReportData(data);
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredData = useMemo(() => {
  return reportData.filter(item => {
    if (item.payment_type === 'installment') {
      return item.payments && item.payments.length > 0;
    }
    return true;
  }).filter(item => 
    Object.values(item).some(val => 
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );
}, [reportData, searchTerm]); // Add other dependencies used in the filter

  // Pagination calculations
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

// Update totals whenever filteredData changes
useEffect(() => {
  if (filteredData.length > 0) {
    const totalPaid = filteredData.reduce((sum, item) => {
      return sum + parseFloat(item.total_amount_paid || 0);
    }, 0);

    const totalBalance = filteredData.reduce((sum, item) => {
      return sum + parseFloat(item.balance || 0);
    }, 0);

    setTotals({
      totalPaid,
      totalBalance
    });
  } else {
    setTotals({
      totalPaid: 0,
      totalBalance: 0
    });
  }
}, [filteredData]);

  // Reset to first page when items per page changes
  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage, searchTerm, filterType]);

  // Add form handlers
  const handleAddChange = (e) => {
    const { name, value } = e.target;
    setAddFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddPaymentChange = (index, field, value) => {
    const updatedPayments = [...addFormData.payments];
    updatedPayments[index][field] = value;
    setAddFormData(prev => ({
      ...prev,
      payments: updatedPayments,
      paymentStatus: calculatePaymentStatus({
        ...prev,
        payments: updatedPayments
      })
    }));
  };

  const addAddPayment = () => {
    setAddFormData(prev => ({
      ...prev,
      payments: [...prev.payments, { amount: '', date: '', method: '' }]
    }));
  };

  const removeAddPayment = (index) => {
    if (addFormData.payments.length <= 1) return;
    setAddFormData(prev => ({
      ...prev,
      payments: prev.payments.filter((_, i) => i !== index)
    }));
  };

  // Edit form handlers
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditPaymentChange = (index, field, value) => {
    const updatedPayments = [...editFormData.payments];
    updatedPayments[index][field] = value;
    setEditFormData(prev => ({
      ...prev,
      payments: updatedPayments,
      paymentStatus: calculatePaymentStatus({
        ...prev,
        payments: updatedPayments
      })
    }));
  };

  const addEditPayment = () => {
    setEditFormData(prev => ({
      ...prev,
      payments: [...prev.payments, { amount: '', date: '', method: '' }]
    }));
  };

  const removeEditPayment = (index) => {
  if (editFormData.payments.length <= 1) return;
  
  setEditFormData(prev => {
    const updatedPayments = prev.payments.filter((_, i) => i !== index);
    
    // Recalculate payment status
    const totalPaid = updatedPayments.reduce(
      (sum, p) => sum + (parseFloat(p.amount) || 0), 
      0
    );
    const serviceAmount = parseFloat(prev.serviceAmount) || 0;
    
    let paymentStatus = 'Pending';
    if (totalPaid >= serviceAmount) {
      paymentStatus = 'Paid';
    } else if (totalPaid > 0) {
      paymentStatus = 'Partially Paid';
    }
    
    return {
      ...prev,
      payments: updatedPayments,
      paymentStatus: paymentStatus
    };
  });
};

  const calculatePaymentStatus = (payment) => {
    if (payment.paymentType === 'full') {
      return payment.fullPaymentAmount >= payment.serviceAmount 
        ? 'Paid' 
        : 'Partial';
    } else {
      const totalPaid = payment.payments.reduce(
        (sum, p) => sum + (parseFloat(p.amount)) || 0, 
        0
      );
      const serviceAmount = parseFloat(payment.serviceAmount) || 0;
      
      if (totalPaid >= serviceAmount) return 'Paid';
      if (totalPaid > 0) return 'Partially Paid';
      return 'Pending';
    }
  };

  // Add delete function
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this sales record? This action cannot be undone.')) {
      return;
    }
    
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/api/sales/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete record');
      }
      
      alert('Sales record deleted successfully!');
      fetchAllData(); // Refresh the data
    } catch (error) {
      console.error('Delete Error:', error);
      alert('Error: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const totalPaid = addFormData.paymentType === 'full'
        ? parseFloat(addFormData.fullPaymentAmount || 0)
        : addFormData.payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
      
      const serviceAmount = parseFloat(addFormData.serviceAmount || 0);
      
      const dataToSend = {
        date: addFormData.date,
        paymentType: addFormData.paymentType,
        fullPaymentAmount: addFormData.paymentType === 'full' ? parseFloat(addFormData.fullPaymentAmount) : null,
        serviceAmount: serviceAmount,
        service: addFormData.service,
        author: addFormData.author,
        leadOwner: addFormData.leadOwner,
        closer: addFormData.closer,
        paymentMethod: addFormData.paymentMethod,
        paymentStatus: calculatePaymentStatus(addFormData),
        notes: addFormData.notes,
        totalAmountPaid: totalPaid,
        balance: serviceAmount - totalPaid,
        payments: addFormData.paymentType === 'installment' 
          ? addFormData.payments.map(payment => ({
              amount: parseFloat(payment.amount),
              date: payment.date,
              method: payment.method
            }))
          : []
      };

      const response = await fetch(`${API_URL}/api/sales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save data');
      }
      
      const responseData = await response.json();
      console.log('Response data:', responseData);
      alert('Sales data saved successfully!');
      resetAddForm();
      setShowEntryModal(false);
      fetchAllData();
    } catch (error) {
      console.error('Error:', error);
      alert('Error: ' + error.message);
    }
  };

  const handleEdit = (sale) => {
    setEditingSale(sale);
    
    const formData = {
      date: sale.date,
      paymentType: sale.payment_type,
      fullPaymentAmount: sale.full_payment_amount || '',
      serviceAmount: sale.service_amount,
      service: sale.service,
      author: sale.author,
      leadOwner: sale.lead_owner,
      closer: sale.closer,
      paymentMethod: sale.payment_method,
      paymentStatus: sale.payment_status,
      notes: sale.notes || '',
      totalAmountPaid: sale.total_amount_paid,
      balance: sale.balance,
      payments: sale.payment_type === 'installment' 
        ? sale.payments.map(p => ({
            amount: p.amount,
            date: p.date,
            method: p.method,
            id: p.id
          }))
        : [{ amount: '', date: '', method: '' }]
    };
    
    setEditFormData(formData);
    setShowEditModal(true);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      const totalPaid = editFormData.paymentType === 'full'
        ? parseFloat(editFormData.fullPaymentAmount || 0)
        : editFormData.payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
      
      const serviceAmount = parseFloat(editFormData.serviceAmount || 0);
      
      const dataToSend = {
        date: editFormData.date,
        paymentType: editFormData.paymentType,
        fullPaymentAmount: editFormData.paymentType === 'full' ? parseFloat(editFormData.fullPaymentAmount) : null,
        serviceAmount: serviceAmount,
        service: editFormData.service,
        author: editFormData.author,
        leadOwner: editFormData.leadOwner,
        closer: editFormData.closer,
        paymentMethod: editFormData.paymentMethod,
        paymentStatus: calculatePaymentStatus(editFormData),
        notes: editFormData.notes,
        totalAmountPaid: totalPaid,
        balance: serviceAmount - totalPaid,
        payments: editFormData.paymentType === 'installment' 
          ? editFormData.payments.map(payment => ({
              amount: parseFloat(payment.amount),
              date: payment.date,
              method: payment.method
            }))
          : []
      };

      const response = await fetch(`${API_URL}/api/sales/${editingSale.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update data');
      }
      
      const responseData = await response.json();
      console.log('Response data:', responseData);
      alert('Sales data updated successfully!');
      resetEditForm();
      setShowEditModal(false);
      fetchAllData();
    } catch (error) {
      console.error('Update Error:', error);
      alert('Error: ' + error.message);
    }
  };

  const deletePayment = async (paymentId, index) => {
  try {
    // If it's an existing payment with ID, delete from API
    if (paymentId) {
      const response = await fetch(`${API_URL}/api/payments/${paymentId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete payment');
    }
    
    // Update local state immediately
    setEditFormData(prev => {
      const updatedPayments = prev.payments.filter((_, i) => i !== index);
      
      // Recalculate payment status
      const totalPaid = updatedPayments.reduce(
        (sum, p) => sum + (parseFloat(p.amount) || 0), 
        0
      );
      const serviceAmount = parseFloat(prev.serviceAmount) || 0;
      
      let paymentStatus = 'Pending';
      if (totalPaid >= serviceAmount) {
        paymentStatus = 'Paid';
      } else if (totalPaid > 0) {
        paymentStatus = 'Partially Paid';
      }
      
      return {
        ...prev,
        payments: updatedPayments,
        paymentStatus: paymentStatus
      };
    });
    
  } catch (error) {
    alert('Error deleting payment: ' + error.message);
  }
};

  const resetAddForm = () => {
    setAddFormData({
      date: '',
      paymentType: 'full',
      fullPaymentAmount: '',
      serviceAmount: '',
      service: '',
      author: '',
      leadOwner: '',
      closer: '',
      paymentMethod: '',
      paymentStatus: 'Pending',
      notes: '',
      start: '',
      end: '',
      payments: [{ amount: '', date: '', method: '' }]
    });
  };

  const resetEditForm = () => {
    setEditFormData({
      date: '',
      paymentType: 'full',
      fullPaymentAmount: '',
      serviceAmount: '',
      service: '',
      author: '',
      leadOwner: '',
      closer: '',
      paymentMethod: '',
      paymentStatus: 'Pending',
      notes: '',
      start: '',
      end: '',
      payments: [{ amount: '', date: '', method: '' }]
    });
  };

  const formatDateToLocal = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      let url = `${API_URL}/api/sales`;
      
      if (filterType === 'range') {
        const { start, end } = addFormData;
        if (!start || !end) {
          alert('Please select a valid date range');
          return;
        }
        url = `${API_URL}/api/sales/range?start=${start}&end=${end}`;
      } else if (filterType === 'month') {
        if (!selectedMonth) {
          alert('Please select a month');
          return;
        }
        const monthStr = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}`;
        url = `${API_URL}/api/sales/month/${monthStr}`;
      } else if (filterType === 'year') {
        url = `${API_URL}/api/sales/year/current`;
      } else if (filterType === 'week') {
        url = `${API_URL}/api/sales/week/current`;
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch report');
      const data = await response.json();
      setReportData(data);
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (val) => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(Number(val) || 0);

  const viewReceipt = (item) => {
    setSelectedReceipt(item);
    setShowReceiptModal(true);
  };

  const printReceipt = () => {
    const printContent = document.getElementById('receipt-content').innerHTML;
    const originalContent = document.body.innerHTML;
    
    document.body.innerHTML = printContent;
    window.print();
    document.body.innerHTML = originalContent;
    
    window.location.reload();
  };

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Pagination functions
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-[1380px] mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-xl shadow-md">
                <FaFileInvoice className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Sales Reports</h1>
                <p className="text-sm text-gray-500 mt-1">Track and manage all sales transactions</p>
              </div>
            </div>
            
            <button 
              onClick={() => setShowEntryModal(true)} 
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-5 py-3 rounded-xl flex items-center gap-2 hover:from-green-600 hover:to-green-700 transition-all shadow-md"
            >
              <FaPlus className="w-5 h-5" />
              Add New Entry
            </button>
          </div>
        </div>

        {/* Filter Form */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FaFilter className="text-blue-500" />
            Filter Reports
          </h2>
          
          <form onSubmit={handleReportSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <FaFilter className="text-blue-500" />
                  Filter Type
                </label>
                <select 
                  name="filterType" 
                  value={filterType} 
                  onChange={(e) => setFilterType(e.target.value)} 
                  className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Data</option>
                  <option value="week">This Week</option>
                  <option value="month">Specific Month</option>
                  <option value="year">This Year</option>
                  <option value="range">Custom Range</option>
                </select>
              </div>

              {filterType === 'month' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Year
                  </label>
                  <input 
                    type="number" 
                    min="2000" 
                    max="2100" 
                    value={selectedYear} 
                    onChange={(e) => setSelectedYear(e.target.value)} 
                    className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  />
                </div>
              )}

              {filterType === 'range' && (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <FaCalendarAlt className="text-blue-500" />
                      Start Date
                    </label>
                    <input 
                      type="date" 
                      name="start" 
                      value={addFormData.start} 
                      onChange={handleAddChange} 
                      className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <FaCalendarAlt className="text-blue-500" />
                      End Date
                    </label>
                    <input 
                      type="date" 
                      name="end" 
                      value={addFormData.end} 
                      onChange={handleAddChange} 
                      className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                    />
                  </div>
                </>
              )}

              <div className="lg:col-span-1">
                <button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <FaFilter className="w-4 h-4" />
                  )}
                  Apply Filter
                </button>
              </div>
            </div>

            {filterType === 'month' && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Month
                </label>
                <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                  {months.map((month, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setSelectedMonth(index + 1)}
                      className={`px-3 py-2 rounded-lg text-sm transition-all ${
                        selectedMonth === index + 1 
                          ? 'bg-blue-600 text-white shadow-md' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {month}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Search and Stats Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by author, service, etc..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 w-full rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                {filteredData.length} records found
              </div>
              
              <div className="flex items-center">
                <label className="mr-2 text-sm font-medium text-gray-700">Show:</label>
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>
          </div>

          {/* Totals Display */}
          {(filterType === 'week' || filterType === 'month') && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
              <div className="bg-blue-50 p-4 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <FaDollarSign className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Paid</p>
                    <p className="text-xl font-bold text-gray-800">{formatCurrency(totals.totalPaid)}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <FaMoneyBillWave className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Balance</p>
                    <p className="text-xl font-bold text-gray-800">{formatCurrency(totals.totalBalance)}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <FaReceipt className="text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Payments</p>
                    <p className="text-xl font-bold text-gray-800">
                      {filteredData.reduce((sum, item) => sum + (item.payment_type === 'installment' ? item.payments.length : 1), 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                  {["Author & Service", "Payment Date", "Type", "Amount", "Method", "Payments", "Total Paid", "Balance", "Status", "Agents", "Action"].map((col) => (
                    <th 
                      key={col} 
                      className="p-4 text-left font-medium text-sm uppercase tracking-wider"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentItems.length > 0 ? (
                  currentItems.map((item, idx) => {
                    const rowStyle = {
                      backgroundColor: 
                        item.payment_status === 'Paid' ? 'rgba(34, 197, 94, 0.05)' : 
                        item.payment_status === 'Partially Paid' ? 'rgba(234, 179, 8, 0.05)' : 
                        'transparent'
                    };
                    
                    return (
                      <tr key={idx} style={rowStyle} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="bg-blue-100 p-2 rounded-lg">
                              <FaUser className="text-blue-600" />
                            </div>
                            <div>
                              <div className="font-medium text-sm text-gray-900">{item.author}</div>
                              <div className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                                <FaBook className="text-gray-400" />
                                {item.service}
                              </div>
                            </div>
                          </div>
                        </td>
                        
                        <td className="p-4 text-sm text-gray-700">
                          {item.payment_type === 'full' ? (
                            <div className="flex items-center gap-2">
                              <FaCalendarAlt className="text-gray-400" />
                              {/* DATE FORMAT FIX: Use consistent date formatting */}
                              {formatDisplayDate(item.date)}
                            </div>
                          ) : (
                            <div className="space-y-1">
                              {item.payments.map((payment, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-xs">
                                  <FaCalendarAlt className="text-gray-400" />
                                  {/* DATE FORMAT FIX: Use consistent date formatting */}
                                  Payment {idx + 1}: {formatDisplayDate(payment.date)}
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                        
                        <td className="p-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.payment_type === 'full' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-purple-100 text-purple-800'
                          }`}>
                            {item.payment_type === 'full' ? 'Full' : 'Installment'}
                          </span>
                        </td>
                        
                        <td className="p-4 font-medium text-gray-900 text-xs">
                          {formatCurrency(item.service_amount)}
                        </td>
                        
                        <td className="p-4 text-sm text-gray-700">
                          {item.payment_type === 'full' ? (
                            <div className="flex items-center gap-2">
                              <FaCreditCard className="text-gray-400" />
                              {item.payment_method || 'Not specified'}
                            </div>
                          ) : item.payments.length === 1 ? (
                            <div className="flex items-center gap-2">
                              <FaCreditCard className="text-gray-400" />
                              {item.payments[0]?.method || 'Not specified'}
                            </div>
                          ) : (
                            `${item.payments.length} methods`
                          )}
                        </td>
                        
                        <td className="p-4 text-xs text-gray-700">
                          {item.payment_type === 'full' 
                            ? 'Full Payment'
                            : `${item.payments.length} Installments`}
                        </td>
                        
                        <td className="p-4 font-medium text-xs text-green-700">
                          {formatCurrency(item.total_amount_paid)}
                        </td>
                        
                        <td className="p-4 font-medium text-xs text-red-700">
                          {formatCurrency(item.balance)}
                        </td>
                        
                        <td className="p-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.payment_status === 'Paid' 
                              ? 'bg-green-100 text-green-800' 
                              : item.payment_status === 'Partially Paid' 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {item.payment_status}
                          </span>
                        </td>
                        
                        <td className="p-4 text-xs text-gray-700">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <FaUserTie className="text-gray-400" />
                              <span className="font-medium">Lead:</span> {item.lead_owner}
                            </div>
                            <div className="flex items-center gap-2">
                              <FaUser className="text-gray-400" />
                              <span className="font-medium">Closer:</span> {item.closer}
                            </div>
                          </div>
                        </td>
                        
                        <td className="p-4">
                          <div className="flex gap-2">
                            <button 
                              onClick={() => viewReceipt(item)}
                              className="bg-indigo-100 text-indigo-600 p-2 rounded-lg hover:bg-indigo-200 transition-colors flex items-center gap-1"
                              title="View Receipt"
                            >
                              <FaEye className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleEdit(item)}
                              className="bg-yellow-100 text-yellow-600 p-2 rounded-lg hover:bg-yellow-200 transition-colors flex items-center gap-1"
                              title="Edit"
                            >
                              <FaEdit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete(item.id)}
                              className="bg-yellow-100 text-red-600 p-2 rounded-lg hover:bg-red-200 transition-colors flex items-center gap-1"
                              title="Edit"
                            >
                              <FaTrash className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="11" className="text-center p-8">
                      <div className="flex flex-col items-center justify-center text-gray-400 py-8">
                        <FaFileInvoice className="w-16 h-16 mb-4" />
                        <p className="text-lg font-medium text-gray-500">
                          {isLoading ? 'Loading data...' : 'No matching records found'}
                        </p>
                        <p className="text-sm mt-2">
                          Try adjusting your search or filters
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Controls */}
        {filteredData.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center mt-6 bg-white rounded-xl shadow-sm p-6">
            <div className="text-sm text-gray-600 mb-4 sm:mb-0">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredData.length)} of {filteredData.length} entries
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={prevPage}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg border flex items-center ${
                  currentPage === 1 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <FaChevronLeft className="w-4 h-4" />
              </button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNumber;
                if (totalPages <= 5) {
                  pageNumber = i + 1;
                } else if (currentPage <= 3) {
                  pageNumber = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNumber = totalPages - 4 + i;
                } else {
                  pageNumber = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNumber}
                    onClick={() => paginate(pageNumber)}
                    className={`w-10 h-10 rounded-lg border flex items-center justify-center ${
                      currentPage === pageNumber
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}
              
              {totalPages > 5 && currentPage < totalPages - 2 && (
                <span className="px-2 text-gray-500">...</span>
              )}
              
              {totalPages > 5 && currentPage < totalPages - 2 && (
                <button
                  onClick={() => paginate(totalPages)}
                  className="w-10 h-10 rounded-lg border bg-white text-gray-700 border-gray-300 hover:bg-gray-50 flex items-center justify-center"
                >
                  {totalPages}
                </button>
              )}
              
              <button
                onClick={nextPage}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-lg border flex items-center ${
                  currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <FaChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        )}

      {/* Add Entry Modal */}
      {showEntryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-[90%] max-w-[1000px] max-h-[90vh] overflow-y-auto p-5">
            <div className="flex justify-between items-center mb-5 border-b border-gray-200 pb-2.5">
              <h3 className="m-0 text-xl">New Sales Entry</h3>
              <button 
                onClick={() => setShowEntryModal(false)}
                className="bg-transparent border-none text-xl cursor-pointer text-gray-600 hover:text-gray-800"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block mb-1 font-bold">Date*</label>
                  <input
                    type="date"
                    name="date"
                    value={addFormData.date}
                    onChange={handleAddChange}
                    className="w-full p-2.5 mb-2.5 rounded border border-gray-300"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1 font-bold">Payment Type*</label>
                  <select
                    name="paymentType"
                    value={addFormData.paymentType}
                    onChange={handleAddChange}
                    className="w-full p-2.5 mb-2.5 rounded border border-gray-300"
                    required
                  >
                    <option value="full">Full Payment</option>
                    <option value="installment">Installment Payment</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 font-bold">Service*</label>
                  <input
                    type="text"
                    name="service"
                    value={addFormData.service}
                    onChange={handleAddChange}
                    className="w-full p-2.5 mb-2.5 rounded border border-gray-300"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1 font-bold">Service Amount*</label>
                  <input
                    type="number"
                    name="serviceAmount"
                    value={addFormData.serviceAmount}
                    onChange={handleAddChange}
                    className="w-full p-2.5 mb-2.5 rounded border border-gray-300"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>

                {addFormData.paymentType === 'full' ? (
                  <>
                    <div>
                      <label className="block mb-1 font-bold">Full Payment Amount*</label>
                      <input
                        type="number"
                        name="fullPaymentAmount"
                        value={addFormData.fullPaymentAmount}
                        onChange={handleAddChange}
                        className="w-full p-2.5 mb-2.5 rounded border border-gray-300"
                        required
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 font-bold">Payment Method*</label>
                      <select 
                        name="paymentMethod" 
                        value={addFormData.paymentMethod} 
                        onChange={handleAddChange} 
                        className="w-full p-2.5 mb-2.5 rounded border border-gray-300"
                        required
                      >
                        <option value="">Select Method</option>
                        <option value="Zelle">Zelle</option>
                        <option value="Wire Transfer">Wire Transfer</option>
                        <option value="Credit Card">Credit Card</option>
                        <option value="Check">Check</option>
                        <option value="Cash">Cash</option>
                        <option value="PayPal">PayPal</option>
                        <option value="Venmo">Venmo</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </>
                ) : (
                  <div className="col-span-2">
                    <h4 className="mb-2.5">Installment Payments</h4>
                    {addFormData.payments.map((payment, index) => (
                      <div key={index} className="grid grid-cols-3 gap-5 mb-3.5 p-3.5 bg-gray-50 rounded relative">
                        <div>
                          <label className="block mb-1 font-bold">Payment {index + 1} Amount*</label>
                          <input
                            type="number"
                            value={payment.amount}
                            onChange={(e) => handleAddPaymentChange(index, 'amount', e.target.value)}
                            className="w-full p-2.5 mb-2.5 rounded border border-gray-300"
                            required
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <div>
                          <label className="block mb-1 font-bold">Payment {index + 1} Date*</label>
                          <input
                            type="date"
                            value={payment.date}
                            onChange={(e) => handleAddPaymentChange(index, 'date', e.target.value)}
                            className="w-full p-2.5 mb-2.5 rounded border border-gray-300"
                            required
                          />
                        </div>
                        <div>
                          <label className="block mb-1 font-bold">Payment Method*</label>
                          <select
                            value={payment.method || ''}
                            onChange={(e) => handleAddPaymentChange(index, 'method', e.target.value)}
                            className="w-full p-2.5 mb-2.5 rounded border border-gray-300"
                            required
                          >
                            <option value="">Select Method</option>
                            <option value="Zelle">Zelle</option>
                            <option value="Wire Transfer">Wire Transfer</option>
                            <option value="Credit Card">Credit Card</option>
                            <option value="Check">Check</option>
                            <option value="Cash">Cash</option>
                            <option value="PayPal">PayPal</option>
                            <option value="Venmo">Venmo</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        {addFormData.payments.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeAddPayment(index)}
                            className="bg-red-500 text-white px-2.5 py-1.5 rounded absolute top-1 right-1 text-xs hover:bg-red-600 transition-colors"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                    
                    <div className="flex justify-between mt-2.5">
                      <div>
                        <p className="m-1 text-sm text-gray-600">
                          Total Paid: {formatCurrency(
                            addFormData.payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0)
                          )}
                        </p>
                        <p className="m-1 text-sm text-gray-600">
                          Balance: {formatCurrency(
                            (parseFloat(addFormData.serviceAmount) || 0) - 
                            addFormData.payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0)
                          )}
                        </p>
                      </div>
                      
                      <button
                        type="button"
                        onClick={addAddPayment}
                        className="bg-green-500 text-white px-3 py-2 rounded flex items-center gap-1 hover:bg-green-600 transition-colors"
                      >
                        <span>+</span> Add Another Payment
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block mb-1 font-bold">Payment Status</label>
                  <input
                    type="text"
                    name="paymentStatus"
                    value={addFormData.paymentStatus}
                    onChange={handleAddChange}
                    className="w-full p-2.5 mb-2.5 rounded border border-gray-300"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-bold">Author*</label>
                  <input
                    type="text"
                    name="author"
                    value={addFormData.author}
                    onChange={handleAddChange}
                    className="w-full p-2.5 mb-2.5 rounded border border-gray-300"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1 font-bold">Lead Owner*</label>
                  <input
                    type="text"
                    name="leadOwner"
                    value={addFormData.leadOwner}
                    onChange={handleAddChange}
                    className="w-full p-2.5 mb-2.5 rounded border border-gray-300"
                    required
                  />
                </div>
                                    <div>
                      <label className="block mb-1 font-bold">Closer*</label>
                      <input
                        type="text"
                        name="closer"
                        value={addFormData.closer}
                        onChange={handleAddChange}
                        className="w-full p-2.5 mb-2.5 rounded border border-gray-300"
                        required
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block mb-1 font-bold">Notes</label>
                      <textarea
                        name="notes"
                        value={addFormData.notes}
                        onChange={handleAddChange}
                        className="w-full p-2.5 mb-2.5 rounded border border-gray-300 min-h-[80px]"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2.5 mt-5">
                    <button 
                      type="button" 
                      onClick={() => setShowEntryModal(false)}
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
                    >
                      Save Entry
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Edit Entry Modal */}
          {showEditModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg w-[90%] max-w-[1000px] max-h-[90vh] overflow-y-auto p-5">
                <div className="flex justify-between items-center mb-5 border-b border-gray-200 pb-2.5">
                  <h3 className="m-0 text-xl">Edit Sales Entry</h3>
                  <button 
                    onClick={() => setShowEditModal(false)}
                    className="bg-transparent border-none text-xl cursor-pointer text-gray-600 hover:text-gray-800"
                  >
                    ×
                  </button>
                </div>

                <form onSubmit={handleUpdateSubmit}>
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block mb-1 font-bold">Date*</label>
                      <input
                        type="date"
                        name="date"
                        value={editFormData.date ? formatDateToLocal(editFormData.date) : ''}
                        onChange={handleEditChange}
                        className="w-full p-2.5 mb-2.5 rounded border border-gray-300"
                        required
                      />
                    </div>

                    <div>
                      <label className="block mb-1 font-bold">Payment Type*</label>
                      <select
                        name="paymentType"
                        value={editFormData.paymentType}
                        onChange={handleEditChange}
                        className="w-full p-2.5 mb-2.5 rounded border border-gray-300"
                        required
                      >
                        <option value="full">Full Payment</option>
                        <option value="installment">Installment Payment</option>
                      </select>
                    </div>

                    <div>
                      <label className="block mb-1 font-bold">Service*</label>
                      <input
                        type="text"
                        name="service"
                        value={editFormData.service}
                        onChange={handleEditChange}
                        className="w-full p-2.5 mb-2.5 rounded border border-gray-300"
                        required
                      />
                    </div>

                    <div>
                      <label className="block mb-1 font-bold">Service Amount*</label>
                      <input
                        type="number"
                        name="serviceAmount"
                        value={editFormData.serviceAmount}
                        onChange={handleEditChange}
                        className="w-full p-2.5 mb-2.5 rounded border border-gray-300"
                        required
                        min="0"
                        step="0.01"
                      />
                    </div>

                    {editFormData.paymentType === 'full' ? (
                      <div>
                        <label className="block mb-1 font-bold">Full Payment Amount*</label>
                        <input
                          type="number"
                          name="fullPaymentAmount"
                          value={editFormData.fullPaymentAmount}
                          onChange={handleEditChange}
                          className="w-full p-2.5 mb-2.5 rounded border border-gray-300"
                          required
                          min="0"
                          step="0.01"
                        />
                      </div>
                    ) : (
                      <div className="col-span-2">
                        <h4 className="mb-2.5">Installment Payments</h4>
                        {editFormData.payments.map((payment, index) => (
                          <div key={index} className="grid grid-cols-3 gap-5 mb-3.5 p-3.5 bg-gray-50 rounded relative">
                            <div>
                              <label className="block mb-1 font-bold">Payment {index + 1} Amount*</label>
                              <input
                                type="number"
                                value={payment.amount}
                                onChange={(e) => handleEditPaymentChange(index, 'amount', e.target.value)}
                                className="w-full p-2.5 mb-2.5 rounded border border-gray-300"
                                required
                                min="0"
                                step="0.01"
                              />
                            </div>
                            <div>
                              <label className="block mb-1 font-bold">Payment {index + 1} Date*</label>
                              <input
                                type="date"
                                value={payment.date ? formatDateToLocal(payment.date) : ''}
                                onChange={(e) => handleEditPaymentChange(index, 'date', e.target.value)}
                                className="w-full p-2.5 mb-2.5 rounded border border-gray-300"
                                required
                              />
                            </div>
                            <div>
                              <label className="block mb-1 font-bold">Payment Method*</label>
                              <select
                                value={payment.method || ''}
                                onChange={(e) => handleEditPaymentChange(index, 'method', e.target.value)}
                                className="w-full p-2.5 mb-2.5 rounded border border-gray-300"
                                required
                              >
                                <option value="">Select Method</option>
                                <option value="Zelle">Zelle</option>
                                <option value="Wire Transfer">Wire Transfer</option>
                                <option value="Credit Card">Credit Card</option>
                                <option value="Check">Check</option>
                                <option value="Cash">Cash</option>
                                <option value="PayPal">PayPal</option>
                                <option value="Venmo">Venmo</option>
                                <option value="Other">Other</option>
                              </select>
                            </div>
                            {(editFormData.payments.length > 1 || payment.id) && (
  <button
    type="button"
    onClick={() => payment.id ? deletePayment(payment.id, index) : removeEditPayment(index)}
    className="bg-red-500 text-white px-2.5 py-1.5 rounded absolute top-1 right-1 text-xs hover:bg-red-600 transition-colors"
  >
    Remove
  </button>
)}
                          </div>
                        ))}
                        
                        <div className="flex justify-between mt-2.5">
                          <div>
                            <p className="m-1 text-sm text-gray-600">
                              Total Paid: {formatCurrency(
                                editFormData.payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0)
                              )}
                            </p>
                            <p className="m-1 text-sm text-gray-600">
                              Balance: {formatCurrency(
                                (parseFloat(editFormData.serviceAmount) || 0) - 
                                editFormData.payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0)
                              )}
                            </p>
                          </div>
                          
                          <button
                            type="button"
                            onClick={addEditPayment}
                            className="bg-green-500 text-white px-3 py-2 rounded flex items-center gap-1 hover:bg-green-600 transition-colors"
                          >
                            <span>+</span> Add Another Payment
                          </button>
                        </div>
                      </div>
                    )}

                    {editFormData.paymentType === 'full' && (
                      <div>
                        <label className="block mb-1 font-bold">Payment Method*</label>
                        <select 
                          name="paymentMethod" 
                          value={editFormData.paymentMethod} 
                          onChange={handleEditChange} 
                          className="w-full p-2.5 mb-2.5 rounded border border-gray-300"
                          required
                        >
                          <option value="">Select Method</option>
                          <option value="Zelle">Zelle</option>
                          <option value="Wire Transfer">Wire Transfer</option>
                          <option value="Credit Card">Credit Card</option>
                          <option value="Check">Check</option>
                          <option value="Cash">Cash</option>
                          <option value="PayPal">PayPal</option>
                          <option value="Venmo">Venmo</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    )}

                    <div>
                      <label className="block mb-1 font-bold">Payment Status</label>
                      <input
                        type="text"
                        name="paymentStatus"
                        value={editFormData.paymentStatus}
                        onChange={handleEditChange}
                        className="w-full p-2.5 mb-2.5 rounded border border-gray-300"
                      />
                    </div>

                    <div>
                      <label className="block mb-1 font-bold">Author*</label>
                      <input
                        type="text"
                        name="author"
                        value={editFormData.author}
                        onChange={handleEditChange}
                        className="w-full p-2.5 mb-2.5 rounded border border-gray-300"
                        required
                      />
                    </div>

                    <div>
                      <label className="block mb-1 font-bold">Lead Owner*</label>
                      <input
                        type="text"
                        name="leadOwner"
                        value={editFormData.leadOwner}
                        onChange={handleEditChange}
                        className="w-full p-2.5 mb-2.5 rounded border border-gray-300"
                        required
                      />
                    </div>

                    <div>
                      <label className="block mb-1 font-bold">Closer*</label>
                      <input
                        type="text"
                        name="closer"
                        value={editFormData.closer}
                        onChange={handleEditChange}
                        className="w-full p-2.5 mb-2.5 rounded border border-gray-300"
                        required
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block mb-1 font-bold">Notes</label>
                      <textarea
                        name="notes"
                        value={editFormData.notes}
                        onChange={handleEditChange}
                        className="w-full p-2.5 mb-2.5 rounded border border-gray-300 min-h-[80px]"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2.5 mt-5">
                    <button 
                      type="button" 
                      onClick={() => setShowEditModal(false)}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                    >
                      Update Entry
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Receipt Modal */}
          {showReceiptModal && selectedReceipt && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg w-full max-w-[1000px] max-h-[100vh] overflow-y-auto p-5">
                {/* Printable Receipt Content */}
                <div id="receipt-content" className="w-full max-w-[800px] mx-auto p-5 border border-gray-300 bg-white mt-5 font-sans">
                  <div className="text-center mb-5">
                    <img 
                      src="/receiptlogo.png" 
                      alt="Company Logo" 
                      className="h-20 mb-2.5 mx-auto" 
                    />
                    <h1 className="m-1 text-gray-800 text-2xl font-bold">Payment Receipt</h1>
                    <p className="text-gray-600 mb-1">411 Socials LLC</p>
                    <p className="text-gray-600 mb-5">116 E. Lafayette Street, Palmyra Missouri</p>
                  </div>

                  <div className="flex justify-between mb-7 border-b border-gray-200 pb-3.5">
                    <div>
                      <p className="m-0 font-bold">Receipt #: {selectedReceipt.id || 'N/A'}</p>
                      {/* DATE FORMAT FIX: Use consistent date formatting */}
                      <p className="m-0">Date: {formatDisplayDate(selectedReceipt.date)}</p>
                    </div>
                    <div className="text-right">
                      <p className="m-0 font-bold">Status: {selectedReceipt.payment_status}</p>
                      <p className="m-0">Type: {selectedReceipt.payment_type === 'full' ? 'Full Payment' : `${selectedReceipt.payments.length} Installments`}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between mb-7 border-b border-gray-200 pb-3.5">
                    <div>
                      <p className="m-0 font-bold">Author Name:</p>
                    </div>
                    <div className="text-right">
                      <p className="m-0 font-bold">{selectedReceipt.author || 'N/A'}</p>                
                    </div>
                  </div>

                  <div className="mb-7">
                    <h2 className="border-b border-gray-200 pb-2.5 mb-3.5 text-xl font-semibold">
                      Payment Details
                    </h2>
                    <table className="w-full border-collapse mb-5">
                      <tbody>
                        <tr>
                          <td className="py-2 border-b border-gray-200">Service:</td>
                          <td className="py-2 border-b border-gray-200 text-right">
                            {selectedReceipt.service}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2 border-b border-gray-200">Service Amount:</td>
                          <td className="py-2 border-b border-gray-200 text-right">
                            {formatCurrency(selectedReceipt.service_amount)}
                          </td>
                        </tr>

                        {selectedReceipt.payment_type === 'full' ? (
                          <>
                            <tr>
                              <td className="py-2 border-b border-gray-200">Payment Method:</td>
                              <td className="py-2 border-b border-gray-200 text-right">
                                {selectedReceipt.payment_method || 'Not specified'}
                              </td>
                            </tr>
                            <tr>
                              <td className="py-2 border-b border-gray-200">Amount Paid:</td>
                              <td className="py-2 border-b border-gray-200 text-right">
                                {formatCurrency(selectedReceipt.full_payment_amount)}
                              </td>
                            </tr>
                            <tr>
                              <td className="py-2 border-b border-gray-200">Payment Date:</td>
                              <td className="py-2 border-b border-gray-200 text-right">
                                {/* DATE FORMAT FIX: Use consistent date formatting */}
                                {formatDisplayDate(selectedReceipt.date)}
                              </td>
                            </tr>
                          </>
                        ) : (
                          selectedReceipt.payments.map((payment, idx) => (
                            <React.Fragment key={idx}>
                              <tr>
                                <td className="py-2 border-b border-gray-200">
                                  Payment {idx + 1} Method:
                                </td>
                                <td className="py-2 border-b border-gray-200 text-right">
                                  {payment.method || payment.payment_method || 'Not specified'}
                                </td>
                              </tr>
                              <tr>
                                <td className="py-2 border-b border-gray-200">
                                  Payment {idx + 1} Amount:
                                </td>
                                <td className="py-2 border-b border-gray-200 text-right">
                                  {formatCurrency(payment.amount)}
                                </td>
                              </tr>
                              <tr>
                                <td className="py-2 border-b border-gray-200">
                                  Payment {idx + 1} Date:
                                </td>
                                <td className="py-2 border-b border-gray-200 text-right">
                                  {/* DATE FORMAT FIX: Use consistent date formatting */}
                                  {formatDisplayDate(payment.date)}
                                </td>
                              </tr>
                              {idx < selectedReceipt.payments.length - 1 && (
                                <tr>
                                  <td colSpan="2" className="py-2">
                                    <hr className="border-t border-dashed border-gray-300 my-2.5" />
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          ))
                        )}

                        <tr>
                          <td className="py-2 border-b border-gray-200 font-bold">Total Amount Paid:</td>
                          <td className="py-2 border-b border-gray-200 text-right font-bold">
                            {formatCurrency(
                              selectedReceipt.payment_type === 'full' 
                                ? selectedReceipt.full_payment_amount
                                : selectedReceipt.payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0)
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2 font-bold">Balance:</td>
                          <td className="py-2 font-bold text-right">
                            {formatCurrency(
                              parseFloat(selectedReceipt.service_amount || 0) - 
                              (selectedReceipt.payment_type === 'full' 
                                ? parseFloat(selectedReceipt.full_payment_amount || 0)
                                : selectedReceipt.payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0)
                              )
                            )}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {selectedReceipt.notes && (
                    <div className="mb-5 p-3.5 bg-gray-50 rounded flex justify-between items-center">
                      <h3 className="m-0">Notes</h3>
                      <p className="m-0">{selectedReceipt.notes}</p>
                    </div>
                  )}

                  <div className="mt-7 pt-3.5 border-t border-gray-200 text-center text-gray-600 text-sm leading-relaxed">
                    <p><strong>Please make check payable to 411 Socials LLC</strong></p>
                    <p className="mt-2.5">
                      For questions concerning this receipt, please contact:
                    </p>
                    <p>411 Socials LLC</p>
                    <p>(636) 371-0602</p>
                    <p>
                      <a href="mailto:finance@411socials.space" className="text-blue-500 no-underline hover:underline">
                        finance@411socials.space
                      </a>
                    </p>
                    <p>
                      <a href="https://411socials.com/" target="_blank" rel="noopener noreferrer" className="text-blue-500 no-underline hover:underline">
                        https://411socials.com/
                      </a>
                    </p>
                    <p className="mt-3.5">Thank you for your business!</p>
                    <p className="mt-2.5">
                      © {new Date().getFullYear()} 411 Socials LLC. All rights reserved.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-2.5 mt-5 border-t border-gray-200 pt-5">
                  <button 
                    onClick={printReceipt}
                    className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors"
                  >
                    Print Receipt
                  </button>
                  <button 
                    onClick={() => setShowReceiptModal(false)}
                    className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      );
    }

    export default SalesReport;