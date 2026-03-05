import React, { useState, useEffect } from 'react';
import { FaEye, FaEdit, FaTrash, FaPlus, FaPrint, FaTimes, FaSearch, FaMinus, FaFileInvoiceDollar, FaUserTie, FaUsers, FaMoneyBillWave, FaCalendarAlt, FaFilter, FaSortNumericDown, FaHistory } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL;

const PaymentReceipt = () => {
  const [receipts, setReceipts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [editingReceipt, setEditingReceipt] = useState(null);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [monthFilter, setMonthFilter] = useState('All');
  
  const [formData, setFormData] = useState({
    authors: [
      {
        author_name: '',
        services: [{ name: '', amount: '' }],
        total_amount: ''
      }
    ],
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'Cash',
    status: 'Pending', // Default to Pending instead of Fully Paid
    notes: '',
    receipt_number: '',
    amount_paid: '', // Amount paid in this transaction
    past_payments: [], // Array to store past payment history
    total_amount_paid: 0, // Cumulative total paid including past payments
    balance: '', // Remaining balance
    total_amount: 0 // Grand total of all services
  });

  // Fetch all receipts
  const fetchReceipts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/receipts`);
      if (!response.ok) throw new Error('Failed to fetch receipts');
      const data = await response.json();
      
      // Use the balance from database, don't recalculate
      setReceipts(data);
    } catch (error) {
      console.error('Error fetching receipts:', error);
      alert('Error loading receipts: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, []);



  // Generate month options for the filter
  const getMonthOptions = () => {
    const months = [
      { value: 'All', label: 'All Months' },
      { value: '01', label: 'January' },
      { value: '02', label: 'February' },
      { value: '03', label: 'March' },
      { value: '04', label: 'April' },
      { value: '05', label: 'May' },
      { value: '06', label: 'June' },
      { value: '07', label: 'July' },
      { value: '08', label: 'August' },
      { value: '09', label: 'September' },
      { value: '10', label: 'October' },
      { value: '11', label: 'November' },
      { value: '12', label: 'December' }
    ];
    
    return months;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'amount_paid') {
      const grandTotal = calculateGrandTotal();
      const amountPaid = parseFloat(value) || 0;
      
      // Calculate past payments total
      const pastPaymentsTotal = formData.past_payments.reduce(
        (sum, payment) => sum + (parseFloat(payment.amount) || 0), 
        0
      );
      
      // Total amount paid is past payments + current payment
      const totalAmountPaid = pastPaymentsTotal + amountPaid;
      const balance = Math.max(0, grandTotal - totalAmountPaid);
      
      // Determine status
      let status = 'Pending';
      if (totalAmountPaid >= grandTotal) {
        status = 'Fully Paid';
      } else if (totalAmountPaid > 0) {
        status = 'Partial';
      }
      
      setFormData(prev => ({
        ...prev,
        [name]: value,
        total_amount_paid: totalAmountPaid,
        balance: balance,
        status: status
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleAuthorChange = (authorIndex, field, value) => {
    const updatedAuthors = [...formData.authors];
    updatedAuthors[authorIndex][field] = value;
    
    setFormData(prev => ({
      ...prev,
      authors: updatedAuthors
    }));
  };

  const handleServiceChange = (authorIndex, serviceIndex, field, value) => {
    const updatedAuthors = [...formData.authors];
    updatedAuthors[authorIndex].services[serviceIndex][field] = value;
    
    // Calculate total amount for this author
    const authorTotal = updatedAuthors[authorIndex].services.reduce((sum, service) => {
      return sum + (parseFloat(service.amount) || 0);
    }, 0);
    
    updatedAuthors[authorIndex].total_amount = authorTotal.toFixed(2);
    
    // Recalculate balance
    const grandTotal = updatedAuthors.reduce((total, author) => {
      return total + (parseFloat(author.total_amount) || 0);
    }, 0);
    
    const amountPaid = parseFloat(formData.amount_paid) || 0;
    const pastPaymentsTotal = formData.past_payments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
    const totalAmountPaid = pastPaymentsTotal + amountPaid;
    const balance = grandTotal - totalAmountPaid;
    
    setFormData(prev => ({
      ...prev,
      authors: updatedAuthors,
      total_amount_paid: totalAmountPaid,
      balance: balance > 0 ? balance : 0,
      status: balance > 0 ? (totalAmountPaid > 0 ? 'Partial' : 'Pending') : 'Fully Paid'
    }));
  };

  const addAuthor = () => {
    setFormData(prev => ({
      ...prev,
      authors: [
        ...prev.authors,
        {
          author_name: '',
          services: [{ name: '', amount: '' }],
          total_amount: ''
        }
      ]
    }));
  };

  const removeAuthor = (index) => {
    if (formData.authors.length <= 1) return;
    
    const updatedAuthors = [...formData.authors];
    updatedAuthors.splice(index, 1);
    
    setFormData(prev => ({
      ...prev,
      authors: updatedAuthors
    }));
  };

  const addService = (authorIndex) => {
    const updatedAuthors = [...formData.authors];
    updatedAuthors[authorIndex].services.push({ name: '', amount: '' });
    
    // Recalculate total for this author
    const authorTotal = updatedAuthors[authorIndex].services.reduce((sum, service) => {
      return sum + (parseFloat(service.amount) || 0);
    }, 0);
    
    updatedAuthors[authorIndex].total_amount = authorTotal.toFixed(2);
    
    setFormData(prev => ({
      ...prev,
      authors: updatedAuthors
    }));
  };

  const removeService = (authorIndex, serviceIndex) => {
    const updatedAuthors = [...formData.authors];
    
    if (updatedAuthors[authorIndex].services.length <= 1) return;
    
    updatedAuthors[authorIndex].services.splice(serviceIndex, 1);
    
    // Recalculate total for this author
    const authorTotal = updatedAuthors[authorIndex].services.reduce((sum, service) => {
      return sum + (parseFloat(service.amount) || 0);
    }, 0);
    
    updatedAuthors[authorIndex].total_amount = authorTotal.toFixed(2);
    
    setFormData(prev => ({
      ...prev,
      authors: updatedAuthors
    }));
  };

  // Add a past payment entry
  const addPastPayment = () => {
    setFormData(prev => ({
      ...prev,
      past_payments: [
        ...prev.past_payments,
        { date: new Date().toISOString().split('T')[0], amount: '', receipt_number: '' }
      ]
    }));
  };

  // Remove a past payment entry
  const removePastPayment = (index) => {
    const updatedPastPayments = [...formData.past_payments];
    updatedPastPayments.splice(index, 1);
    
    // Recalculate totals
    const grandTotal = calculateGrandTotal();
    const amountPaid = parseFloat(formData.amount_paid) || 0;
    const pastPaymentsTotal = updatedPastPayments.reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0);
    const totalAmountPaid = pastPaymentsTotal + amountPaid;
    const balance = grandTotal - totalAmountPaid;
    
    setFormData(prev => ({
      ...prev,
      past_payments: updatedPastPayments,
      total_amount_paid: totalAmountPaid,
      balance: balance > 0 ? balance : 0,
      status: balance > 0 ? (totalAmountPaid > 0 ? 'Partial' : 'Pending') : 'Fully Paid'
    }));
  };

  // Handle past payment field changes
  const handlePastPaymentChange = (index, field, value) => {
    const updatedPastPayments = [...formData.past_payments];
    updatedPastPayments[index][field] = value;
    
    // Recalculate totals
    const grandTotal = calculateGrandTotal();
    const amountPaid = parseFloat(formData.amount_paid) || 0;
    const pastPaymentsTotal = updatedPastPayments.reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0);
    const totalAmountPaid = pastPaymentsTotal + amountPaid;
    const balance = grandTotal - totalAmountPaid;
    
    setFormData(prev => ({
      ...prev,
      past_payments: updatedPastPayments,
      total_amount_paid: totalAmountPaid,
      balance: balance > 0 ? balance : 0,
      status: balance > 0 ? (totalAmountPaid > 0 ? 'Partial' : 'Pending') : 'Fully Paid'
    }));
  };

  const calculateGrandTotal = () => {
    return formData.authors.reduce((total, author) => {
      return total + (parseFloat(author.total_amount) || 0);
    }, 0);
  };

const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const url = editingReceipt 
        ? `${API_URL}/api/receipts/${editingReceipt.id}`
        : `${API_URL}/api/receipts`;
      
      const method = editingReceipt ? 'PUT' : 'POST';
      
      const grandTotal = calculateGrandTotal();
      const amountPaid = parseFloat(formData.amount_paid) || 0;
      
      // Calculate past payments total
      const pastPaymentsTotal = formData.past_payments.reduce(
        (sum, payment) => sum + (parseFloat(payment.amount) || 0), 
        0
      );
      
      // Total amount paid is past payments + current payment
      const totalAmountPaid = pastPaymentsTotal + amountPaid;
      const balance = Math.max(0, grandTotal - totalAmountPaid);
      
      // Determine status
      let status = 'Pending';
      if (totalAmountPaid >= grandTotal) {
        status = 'Fully Paid';
      } else if (totalAmountPaid > 0) {
        status = 'Partial';
      }

      const payload = {
        ...formData,
        total_amount: grandTotal,
        amount_paid: amountPaid, // Current payment amount
        total_amount_paid: totalAmountPaid, // Cumulative total
        balance: balance,
        status: status
      };

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save receipt');
      }

      const savedReceipt = await response.json();
      console.log('Receipt saved:', savedReceipt);
      alert(editingReceipt ? 'Receipt updated successfully!' : 'Receipt created successfully!');
      
      // Reset form
      setFormData({
        authors: [
          {
            author_name: '',
            services: [{ name: '', amount: '' }],
            total_amount: ''
          }
        ],
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: 'Cash',
        status: 'Pending',
        notes: '',
        receipt_number: '',
        amount_paid: '',
        past_payments: [],
        total_amount_paid: 0,
        balance: 0,
        total_amount: 0
      });
      
      setEditingReceipt(null);
      setShowModal(false);
      fetchReceipts(); // Refresh the list
    } catch (error) {
      console.error('Error saving receipt:', error);
      alert('Error: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (receipt) => {
    // Convert old format to new format if needed
    const authors = receipt.authors || [{
      author_name: receipt.customer_name || '',
      services: [{ 
        name: receipt.service || '', 
        amount: receipt.amount || ''
      }],
      total_amount: receipt.amount || ''
    }];

    // Handle past payments if they exist
    const past_payments = receipt.past_payments || [];

    setFormData({
      authors: authors,
      payment_date: receipt.payment_date.split('T')[0],
      payment_method: receipt.payment_method || 'Cash',
      status: receipt.status || 'Pending',
      notes: receipt.notes || '',
      receipt_number: receipt.receipt_number,
      amount_paid: receipt.amount_paid || '', // Current payment amount
      past_payments: past_payments,
      total_amount_paid: receipt.total_amount_paid || 0, // Cumulative total
      balance: receipt.balance || 0,
      total_amount: receipt.total_amount || 0
    });
    setEditingReceipt(receipt);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this receipt?')) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/receipts/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete receipt');

      alert('Receipt deleted successfully!');
      fetchReceipts(); // Refresh the list
    } catch (error) {
      console.error('Error deleting receipt:', error);
      alert('Error: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleView = (receipt) => {
    setSelectedReceipt(receipt);
    setShowReceiptModal(true);
  };

  const printReceipt = () => {
    const printContent = document.getElementById('receipt-content').innerHTML;
    const originalContent = document.body.innerHTML;
    
    document.body.innerHTML = printContent;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload(); // Reload to restore functionality
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Filter receipts based on search term, status, and month
  const filteredReceipts = receipts.filter(receipt => {
    const matchesSearch = 
      (receipt.authors && receipt.authors.some(author => 
        author.author_name.toLowerCase().includes(searchTerm.toLowerCase())
      )) ||
      (receipt.authors && receipt.authors.some(author => 
        author.services.some(service => 
          service.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )) ||
      receipt.receipt_number.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || receipt.status === statusFilter;
    
    // Filter by month if selected
    const matchesMonth = monthFilter === 'All' || 
      (receipt.payment_date && receipt.payment_date.split('-')[1] === monthFilter);
    
    return matchesSearch && matchesStatus && matchesMonth;
  });

  // Calculate statistics for dashboard (filtered by month if selected)
  const filteredReceiptsForStats = monthFilter === 'All' 
    ? receipts 
    : receipts.filter(receipt => 
        receipt.payment_date && receipt.payment_date.split('-')[1] === monthFilter
      );
  
  const totalReceipts = filteredReceiptsForStats.length;
  const totalRevenue = filteredReceiptsForStats.reduce((sum, receipt) => sum + (parseFloat(receipt.total_amount) || 0), 0);
  const totalPaid = filteredReceiptsForStats.reduce((sum, receipt) => sum + (parseFloat(receipt.total_amount_paid) || 0), 0);
  const totalBalance = filteredReceiptsForStats.reduce((sum, receipt) => sum + (parseFloat(receipt.balance) || 0), 0);
  const paidReceipts = filteredReceiptsForStats.filter(r => r.status === 'Fully Paid').length;
  const pendingReceipts = filteredReceiptsForStats.filter(r => r.status === 'Pending').length;
  const partialReceipts = filteredReceiptsForStats.filter(r => r.status === 'Partial').length;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-md p-6 mb-6 text-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                <FaFileInvoiceDollar className="w-8 h-8" />
                Payment Receipts
              </h1>
              <p className="text-blue-100 mt-1">Manage and track all payment receipts</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-white text-blue-700 px-4 py-3 rounded-lg flex items-center gap-2 hover:bg-blue-50 transition-colors shadow-md font-medium"
            >
              <FaPlus className="w-4 h-4" />
              New Receipt
            </button>
          </div>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-blue-500">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <FaFileInvoiceDollar className="text-blue-600 w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Receipts</p>
                <p className="text-xl font-bold">{totalReceipts}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-green-500">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full mr-4">
                <FaMoneyBillWave className="text-green-600 w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="text-xl font-bold">{formatCurrency(totalRevenue)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-purple-500">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-full mr-4">
                <FaUserTie className="text-purple-600 w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Amount Paid</p>
                <p className="text-xl font-bold">{formatCurrency(totalPaid)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-yellow-500">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-3 rounded-full mr-4">
                <FaUsers className="text-yellow-600 w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Outstanding Balance</p>
                <p className="text-xl font-bold">{formatCurrency(totalBalance)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Status Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Paid Receipts</p>
                <p className="text-xl font-bold text-green-600">{paidReceipts}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <FaMoneyBillWave className="text-green-600 w-5 h-5" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending Receipts</p>
                <p className="text-xl font-bold text-yellow-600">{pendingReceipts}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <FaCalendarAlt className="text-yellow-600 w-5 h-5" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Partial Payments</p>
                <p className="text-xl font-bold text-blue-600">{partialReceipts}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <FaMoneyBillWave className="text-blue-600 w-5 h-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by agent, author, service, or receipt number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex items-center gap-2 bg-gray-100 px-3 rounded-lg">
              <FaFilter className="text-gray-500" />
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent py-2 focus:outline-none"
              >
                <option value="All">All Status</option>
                <option value="Fully Paid">Fully Paid</option>
                <option value="Pending">Pending</option>
                <option value="Partial">Partial</option>
              </select>
            </div>

            <div className="flex items-center gap-2 bg-gray-100 px-3 rounded-lg">
              <FaCalendarAlt className="text-gray-500" />
              <select 
                value={monthFilter} 
                onChange={(e) => setMonthFilter(e.target.value)}
                className="bg-transparent py-2 focus:outline-none"
              >
                {getMonthOptions().map(month => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Receipts Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Receipt #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Authors
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount Paid Today
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Paid
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Balance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan="9" className="px-6 py-8 text-center">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-gray-500">Loading receipts...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredReceipts.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <FaFileInvoiceDollar className="w-12 h-12 text-gray-300 mb-2" />
                        <p className="text-lg">{searchTerm || statusFilter !== 'All' || monthFilter !== 'All' ? 'No receipts found matching your criteria' : 'No receipts found'}</p>
                        <p className="text-sm mt-1">Create your first receipt to get started</p>
                        <button
                          onClick={() => setShowModal(true)}
                          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 text-sm"
                        >
                          <FaPlus className="w-3 h-3" />
                          Add New Receipt
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                filteredReceipts.map((receipt) => (
                  <tr key={receipt.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-blue-600">{receipt.receipt_number}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {receipt.authors && receipt.authors.length > 0 ? (
                          <div>
                            {receipt.authors.slice(0, 2).map((author, index) => (
                              <div key={index} className="flex items-center mb-1">
                                <div className="bg-gray-100 p-1 rounded-full mr-2">
                                  <FaUsers className="text-gray-600 w-3 h-3" />
                                </div>
                                {author.author_name}
                              </div>
                            ))}
                            {receipt.authors.length > 2 && (
                              <div className="text-blue-600 text-xs mt-1">+{receipt.authors.length - 2} more</div>
                            )}
                          </div>
                        ) : (
                          <div>{receipt.customer_name || 'N/A'}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {formatCurrency(receipt.total_amount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-blue-600">
                        {formatCurrency(receipt.amount_paid || 0)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-green-600">
                        {formatCurrency(receipt.total_amount_paid || 0)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-red-600">
                        {formatCurrency(receipt.balance || 0)}
                      </div>
                    </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500">
                          <FaCalendarAlt className="w-3 h-3 mr-1 text-gray-400" />
                          {formatDate(receipt.payment_date)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          receipt.status === 'Fully Paid' 
                            ? 'bg-green-100 text-green-800' 
                            : receipt.status === 'Pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {receipt.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleView(receipt)}
                            className="text-blue-600 hover:text-blue-900 p-2 rounded-full hover:bg-blue-50 transition-colors"
                            title="View Receipt"
                          >
                            <FaEye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(receipt)}
                            className="text-yellow-600 hover:text-yellow-900 p-2 rounded-full hover:bg-yellow-50 transition-colors"
                            title="Edit"
                          >
                            <FaEdit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(receipt.id)}
                            className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add/Edit Modal */}
        {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl my-8 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center px-6 py-4 border-b sticky top-0 bg-white z-10">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                {editingReceipt ? 
                    <><FaEdit className="text-yellow-500" /> Edit Receipt</> : 
                    <><FaPlus className="text-blue-500" /> Add New Receipt</>
                }
                </h2>
                <button
                onClick={() => {
                    setShowModal(false);
                    setEditingReceipt(null);
                    setFormData({
                    
                    authors: [
                        {
                        author_name: '',
                        services: [{ name: '', amount: '' }],
                        total_amount: ''
                        }
                    ],
                    payment_date: new Date().toISOString().split('T')[0],
                    payment_method: 'Cash',
                    status: 'Fully Paid',
                    notes: '',
                    receipt_number: `RCPT-${Date.now().toString().slice(-6)}`,
                    amount_paid: '',
                    past_payments: [],
                    total_amount_paid: '',
                    balance: 0
                    });
                }}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                disabled={isLoading}
                >
                <FaTimes className="w-5 h-5" />
                </button>
            </div>
            
            <div className="overflow-y-auto flex-1">
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                        <FaSortNumericDown className="text-gray-500" /> Receipt Number *
                    </label>
                    <input
                        type="text"
                        name="receipt_number"
                        value={formData.receipt_number}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                        disabled={isLoading}
                        placeholder="Enter receipt number"
                    />
                    </div>
                    <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                        <FaCalendarAlt className="text-gray-500" /> Payment Date *
                    </label>
                    <input
                        type="date"
                        name="payment_date"
                        value={formData.payment_date}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                        disabled={isLoading}
                    />
                    </div>
                </div>
                
                {/* Authors Section */}
                <div className="border-t pt-6">
                    <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-medium text-gray-800 flex items-center gap-2">
                        <FaUsers className="text-blue-500" /> Authors & Services
                    </h3>
                    <button
                        type="button"
                        onClick={addAuthor}
                        className="text-sm bg-blue-100 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-200 flex items-center gap-1 transition-colors"
                    >
                        <FaPlus className="w-3 h-3" /> Add Author
                    </button>
                    </div>
                    
                    {formData.authors.map((author, authorIndex) => (
                    <div key={authorIndex} className="mb-6 p-5 border rounded-xl bg-gray-50">
                        <div className="flex justify-between items-center mb-4">
                        <h4 className="font-medium text-gray-700 flex items-center gap-2">
                            <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                            {authorIndex + 1}
                            </span>
                            Author #{authorIndex + 1}
                        </h4>
                        {formData.authors.length > 1 && (
                            <button
                            type="button"
                            onClick={() => removeAuthor(authorIndex)}
                            className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1 bg-red-50 px-3 py-1 rounded-lg"
                            >
                            <FaMinus className="w-3 h-3" /> Remove Author
                            </button>
                        )}
                        </div>
                        
                        <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Author Name *
                        </label>
                        <input
                            type="text"
                            value={author.author_name}
                            onChange={(e) => handleAuthorChange(authorIndex, 'author_name', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                            disabled={isLoading}
                            placeholder="Enter author name"
                        />
                        </div>
                        
                        <div>
                        <div className="flex justify-between items-center mb-4">
                            <label className="block text-sm font-medium text-gray-700">
                            Services *
                            </label>
                            <button
                            type="button"
                            onClick={() => addService(authorIndex)}
                            className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                            >
                            <FaPlus className="w-3 h-3" /> Add Service
                            </button>
                        </div>
                        
                        {author.services.map((service, serviceIndex) => (
                            <div key={serviceIndex} className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-3 items-center">
                            <div className="md:col-span-7">
                                <input
                                type="text"
                                placeholder="Service name"
                                value={service.service_name}
                                onChange={(e) => handleServiceChange(authorIndex, serviceIndex, 'name', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                                disabled={isLoading}
                                />
                            </div>
                            <div className="md:col-span-4">
                                <input
                                type="number"
                                placeholder="Amount"
                                value={service.amount}
                                onChange={(e) => handleServiceChange(authorIndex, serviceIndex, 'amount', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                                min="0"
                                step="0.01"
                                disabled={isLoading}
                                />
                            </div>
                            <div className="md:col-span-1 flex justify-center">
                                {author.services.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeService(authorIndex, serviceIndex)}
                                    className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50"
                                    disabled={isLoading}
                                >
                                    <FaMinus className="w-4 h-4" />
                                </button>
                                )}
                            </div>
                            </div>
                        ))}
                        
                        <div className="mt-4 text-right font-medium text-lg p-3 bg-white rounded-lg border">
                            Author Total: {formatCurrency(author.total_amount)}
                        </div>
                        </div>
                    </div>
                    ))}
                    
                    <div className="text-right text-xl font-bold border-t pt-4 bg-blue-50 p-4 rounded-lg">
                    Grand Total: {formatCurrency(calculateGrandTotal())}
                    </div>
                </div>

                {/* Past Payments Section */}
                <div className="border-t pt-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-medium text-gray-800 flex items-center gap-2">
                      <FaHistory className="text-blue-500" /> Past Payments
                    </h3>
                    <button
                      type="button"
                      onClick={addPastPayment}
                      className="text-sm bg-blue-100 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-200 flex items-center gap-1 transition-colors"
                    >
                      <FaPlus className="w-3 h-3" /> Add Past Payment
                    </button>
                  </div>

                  {formData.past_payments.length > 0 ? (
                    formData.past_payments.map((payment, index) => (
                      <div key={index} className="mb-4 p-4 border rounded-xl bg-gray-50">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-medium text-gray-700">Past Payment #{index + 1}</h4>
                          <button
                            type="button"
                            onClick={() => removePastPayment(index)}
                            className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1 bg-red-50 px-3 py-1 rounded-lg"
                          >
                            <FaMinus className="w-3 h-3" /> Remove
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Payment Date
                            </label>
                            <input
                              type="date"
                              value={payment.date}
                              onChange={(e) => handlePastPaymentChange(index, 'date', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              disabled={isLoading}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Amount
                            </label>
                            <input
                              type="number"
                              value={payment.amount}
                              onChange={(e) => handlePastPaymentChange(index, 'amount', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              min="0"
                              step="0.01"
                              disabled={isLoading}
                              placeholder="Enter amount"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Receipt Number
                            </label>
                            <input
                              type="text"
                              value={payment.receipt_number}
                              onChange={(e) => handlePastPaymentChange(index, 'receipt_number', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              disabled={isLoading}
                              placeholder="Receipt number"
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-4 bg-gray-50 rounded-lg">
                      No past payments recorded
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Payment Method *
                    </label>
                    <select
                        name="payment_method"
                        value={formData.payment_method}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                        disabled={isLoading}
                    >
                        <option value="Cash">Cash</option>
                        <option value="Credit Card">Credit Card</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="PayPal">PayPal</option>
                        <option value="Other">Other</option>
                    </select>
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Amount Paid Today *
                    </label>
                    <input
                        type="number"
                        name="amount_paid"
                        value={formData.amount_paid}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                        min="0"
                        step="0.01"
                        disabled={isLoading}
                        placeholder="Enter amount paid today"
                    />
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                    </label>
                    <div className="p-2 bg-gray-100 rounded-lg">
                        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                        formData.status === 'Fully Paid' 
                            ? 'bg-green-100 text-green-800' 
                            : formData.status === 'Pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                        {formData.status}
                        </span>
                        <div className="mt-2 text-sm">
                          <div className="text-green-600">Total Paid: {formatCurrency(formData.total_amount_paid)}</div>
                          {formData.balance > 0 && (
                            <div className="text-red-600">Balance: {formatCurrency(formData.balance)}</div>
                          )}
                        </div>
                    </div>
                    </div>
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                    </label>
                    <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isLoading}
                    placeholder="Add any additional notes here..."
                    />
                </div>
                
                <div className="flex justify-end space-x-4 pt-6 border-t sticky bottom-0 bg-white pb-2">
                    <button
                    type="button"
                    onClick={() => {
                        setShowModal(false);
                        setEditingReceipt(null);
                        setFormData({
                       
                        authors: [
                            {
                            author_name: '',
                            services: [{ name: '', amount: '' }],
                            total_amount: ''
                            }
                        ],
                        payment_date: new Date().toISOString().split('T')[0],
                        payment_method: 'Cash',
                        status: 'Fully Paid',
                        notes: '',
                        receipt_number: '',
                        amount_paid: '',
                        past_payments: [],
                        total_amount_paid: 0,
                        balance: 0
                        });
                    }}
                    className="px-5 py-2.5 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
                    disabled={isLoading}
                    >
                    Cancel
                    </button>
                    <button
                    type="submit"
                    className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
                    disabled={isLoading}
                    >
                    {isLoading ? (
                        <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Processing...
                        </>
                    ) : editingReceipt ? (
                        <>Update Receipt</>
                    ) : (
                        <>Create Receipt</>
                    )}
                    </button>
                </div>
                </form>
            </div>
            </div>
        </div>
        )}

        {/* Receipt View Modal */}
        {showReceiptModal && selectedReceipt && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl my-8 max-h-[90vh] flex flex-col">
              <div className="flex justify-between items-center px-6 py-4 border-b sticky top-0 bg-white z-10">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <FaFileInvoiceDollar className="text-blue-500" /> Payment Receipt
                </h2>
                <div className="flex space-x-2">
                  <button
                    onClick={printReceipt}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
                  >
                    <FaPrint className="w-4 h-4" />
                    Print
                  </button>
                  <button
                    onClick={() => setShowReceiptModal(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                  >
                    <FaTimes className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="overflow-y-auto flex-1 p-6" id="receipt-content">
                <div className="relative flex items-center mb-12">
                {/* Logo on the left */}
                <div className="absolute left-0">
                  <img 
                    src="/pplogo.png" 
                    alt="411 Socials LLC Logo" 
                    className="h-24 object-contain"
                  />
                </div>

                {/* Text centered */}
                <div className="mx-auto text-center">
                  <h1 className="text-3xl font-bold text-gray-800">PAYMENT RECEIPT</h1>
                  <p className="text-gray-600 mt-1">Page & Pixel Digital Solutions</p>
                  <p className="text-gray-600">116 E. Lafayette Street, Palmyra Missouri</p>
                </div>
              </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <FaFileInvoiceDollar className="text-blue-600 w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-gray-500">Receipt Number:</p>
                        <p className="text-lg">{selectedReceipt.receipt_number}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 justify-end mb-1">
                      <div>
                        <p className="font-semibold text-sm text-gray-500">Date:</p>
                        <p className="text-lg">{formatDate(selectedReceipt.payment_date)}</p>
                      </div>
                      <div className="bg-blue-100 p-2 rounded-full">
                        <FaCalendarAlt className="text-blue-600 w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="bg-green-100 p-2 rounded-full">
                        <FaMoneyBillWave className="text-green-600 w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-gray-500">Service Amount:</p>
                        <p className="text-lg text-green-600 font-bold">
                          {formatCurrency(selectedReceipt.total_amount || selectedReceipt.amount)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <FaMoneyBillWave className="text-blue-600 w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-gray-500">Total Paid:</p>
                        <p className="text-lg text-blue-600 font-bold">
                          {formatCurrency(selectedReceipt.total_amount_paid || 0)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="bg-red-100 p-2 rounded-full">
                        <FaMoneyBillWave className="text-red-600 w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-gray-500">Balance:</p>
                        <p className="text-lg text-red-600 font-bold">
                          {formatCurrency(selectedReceipt.balance || 0)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Display past payments if they exist */}
                {selectedReceipt.past_payments && selectedReceipt.past_payments.length > 0 && (
                  <div className="mb-8">
                    <p className="font-semibold mb-4 text-lg border-b pb-2">Past Payments:</p>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse min-w-[600px]">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="text-left p-3 border">Date</th>
                            <th className="text-left p-3 border">Receipt #</th>
                            <th className="text-right p-3 border">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedReceipt.past_payments.map((payment, index) => (
                            <tr key={index}>
                              <td className="p-3 border">{formatDate(payment.date)}</td>
                              <td className="p-3 border">{payment.receipt_number}</td>
                              <td className="p-3 border text-right">{formatCurrency(payment.amount)}</td>
                            </tr>
                          ))}
                          <tr className="font-bold bg-gray-50">
                            <td colSpan="2" className="p-3 border text-right">Total Past Payments:</td>
                            <td className="p-3 border text-right">
                              {formatCurrency(selectedReceipt.past_payments.reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0))}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="mb-8">
                  <p className="font-semibold mb-4 text-lg border-b pb-2">Authors & Services:</p>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse min-w-[600px]">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="text-left p-3 border">Author</th>
                          <th className="text-left p-3 border">Service</th>
                          <th className="text-right p-3 border">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedReceipt.authors && selectedReceipt.authors.length > 0 ? (
                          selectedReceipt.authors.map((author, authorIndex) => (
                            <React.Fragment key={authorIndex}>
                              {author.services.map((service, serviceIndex) => (
                                <tr key={`${authorIndex}-${serviceIndex}`}>
                                  <td className="p-3 border">
                                    {serviceIndex === 0 ? author.author_name : ''}
                                  </td>
                                  <td className="p-3 border">{service.service_name}</td>
                                  <td className="p-3 border text-right">{formatCurrency(service.amount)}</td>
                                </tr>
                              ))}
                              <tr className="bg-gray-50 font-semibold">
                                <td colSpan="2" className="p-3 border text-right">Author Total:</td>
                                <td className="p-3 border text-right">
                                  {formatCurrency(author.total_amount)}
                                </td>
                              </tr>
                            </React.Fragment>
                          ))
                        ) : (
                          <tr>
                            <td className="p-3 border">{selectedReceipt.customer_name || 'N/A'}</td>
                            <td className="p-3 border">{selectedReceipt.service || 'N/A'}</td>
                            <td className="p-3 border text-right">{formatCurrency(selectedReceipt.amount)}</td>
                          </tr>
                        )}
                        <tr className="font-bold bg-blue-50">
                          <td colSpan="2" className="p-3 border text-right text-lg">Grand Total:</td>
                          <td className="p-3 border text-right text-lg">
                            {formatCurrency(selectedReceipt.total_amount || selectedReceipt.amount)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <p className="font-semibold mb-1">Payment Method:</p>
                    <div className="flex items-center gap-2">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <FaMoneyBillWave className="text-blue-600 w-4 h-4" />
                      </div>
                      <p>{selectedReceipt.payment_method}</p>
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">Status:</p>
                    <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                      selectedReceipt.status === 'Fully Paid' 
                        ? 'bg-green-100 text-green-800' 
                        : selectedReceipt.status === 'Pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {selectedReceipt.status}
                    </span>
                  </div>
                </div>

                {selectedReceipt.notes && (
                  <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                    <p className="font-semibold mb-2">Notes:</p>
                    <p className="text-gray-600">{selectedReceipt.notes}</p>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-6 text-center">
                  <p className="text-sm text-gray-500">Thank you for your business!</p>
                  <p className="text-xs text-gray-400 mt-2">
                    This is an official receipt from Page & Pixel Digital Solutions
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentReceipt;