import React, { useState, useEffect } from 'react';
import { 
  FaEye, 
  FaTimes, 
  FaCheck, 
  FaSpinner, 
  FaExclamationTriangle,
  FaFilePdf,
  FaFileImage,
  FaMoneyBillWave,
  FaCreditCard,
  FaCalendarAlt,
  FaMedal
} from 'react-icons/fa';
import { format } from 'date-fns';

const API_URL = import.meta.env.VITE_API_URL;

function Fulfillment() {
  // State
  const [selectedLead, setSelectedLead] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [transactionLoading, setTransactionLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [transactionToComplete, setTransactionToComplete] = useState(null);
  const [completingTransaction, setCompletingTransaction] = useState(false);
  const [paymentData, setPaymentData] = useState({
    amount: '',
    method: 'credit_card',
    date: format(new Date(), 'yyyy-MM-dd')
  });
  const [errors, setErrors] = useState({});
  const [completionStatus, setCompletionStatus] = useState(null);

  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newContact, setNewContact] = useState({
    name: '',
    email: '',
    phone: '',
    author: '',
    publisher: '',
    book: ''
  });

  const [user, setUser] = useState(null);
  const [ setIsAuthenticated] = useState(false);

  // Fetch leads on component mount
  useEffect(() => {
    const fetchAssignedLeads = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/contacts-fullfilled`, {
          credentials: 'include'
        });

        if (!response.ok) throw new Error('Failed to fetch leads');

        const data = await response.json();
        const formattedLeads = data.map(contact => ({
          id: contact.id,
          name: contact.name,
          phone: contact.phone,
          email: contact.email,
          status: contact.status,
          bookTitle: contact.book_title || '-',
          publisher: contact.publisher || '-',
        }));

        setLeads(formattedLeads);
      } catch (error) {
        console.error('Error fetching leads:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignedLeads();
  }, []);

  // Check session
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch(`${API_URL}/api/check-session`, {
          credentials: 'include',
        });
        const data = await res.json();

        if (data.loggedIn) {
          setUser(data.user);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error('Error checking session:', err);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  // Handle create fulfillment contact
  const handleAddFulfillment = async (e) => {
    e.preventDefault();
    
    if (!user || !user.id) {
      alert('You must be logged in to create a fulfillment contact');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/fulfilled-contacts`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newContact,
          userId: user.id
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create fulfillment contact');
      }

      const data = await response.json();
      
      setLeads(prevLeads => [
        ...prevLeads,
        {
          id: data.id,
          name: data.name,
          phone: data.phone,
          email: data.email,
          status: data.status,
          bookTitle: data.book_title || '-',
          publisher: data.publisher || '-',
          assigned_to: data.assigned_to
        }
      ]);
      
      setShowCreateModal(false);
      setNewContact({
        name: '',
        email: '',
        phone: '',
        author: '',
        publisher: '',
        book: ''
      });
    } catch (error) {
      console.error('Error creating fulfillment contact:', error);
      alert(error.message);
    }
  };

  // Fetch transactions
  const fetchTransactions = async (leadId) => {
    try {
      setTransactionLoading(true);
      const response = await fetch(`${API_URL}/api/transactions/${leadId}`, {
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to fetch transactions');

      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      alert('Failed to load transactions');
    } finally {
      setTransactionLoading(false);
    }
  };

  const handleViewTransactions = (lead) => {
    setSelectedLead(lead);
    fetchTransactions(lead.id);
  };

  const handleCompleteClick = (transaction) => {
    setTransactionToComplete(transaction);
    setPaymentData({
      amount: transaction.remain_bal,
      method: 'credit_card',
      date: format(new Date(), 'yyyy-MM-dd')
    });
    setShowConfirmation(true);
  };

  const handleConfirmComplete = () => {
    setShowConfirmation(false);
    setShowCompletionModal(true);
  };

  const handleCancelComplete = () => {
    setShowConfirmation(false);
    setTransactionToComplete(null);
  };

  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    setPaymentData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!paymentData.amount || isNaN(paymentData.amount)) {
      newErrors.amount = 'Please enter a valid amount';
    } else if (parseFloat(paymentData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    } else if (transactionToComplete && parseFloat(paymentData.amount) > parseFloat(transactionToComplete.remain_bal)) {
      newErrors.amount = 'Amount cannot exceed remaining balance';
    }

    if (!paymentData.date) {
      newErrors.date = 'Please select a payment date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitCompletion = async () => {
    if (!validateForm()) return;

    try {
      setCompletingTransaction(true);

      const payload = {
        paymentAmount: paymentData.amount,
        paymentStatus: paymentData.status,
        paymentDate: paymentData.date,
        transactionId: transactionToComplete.transaction_id,
        authorName: selectedLead.name,
        serviceName: transactionToComplete.service_name,
        status: transactionToComplete.trans_status,
        filePath: transactionToComplete.file_path,
        fileName: transactionToComplete.file_name,
        fileType: transactionToComplete.file_type,
        totalPrice: transactionToComplete.tot_service_price,
        remainingBalance: transactionToComplete.remain_bal,
      };

      const response = await fetch(
        `${API_URL}/api/complete-transaction/${transactionToComplete.transaction_id}`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to complete transaction');
      }

      const result = await response.json();
      setCompletionStatus(result);

      if (selectedLead) {
        await fetchTransactions(selectedLead.id);
      }

      setTimeout(() => {
        setShowCompletionModal(false);
        setTransactionToComplete(null);
      }, 2000);
    } catch (error) {
      console.error('Error completing transaction:', error);
      alert(error.message || 'Failed to complete transaction');
    } finally {
      setCompletingTransaction(false);
    }
  };

  const handleCloseCompletionModal = () => {
    setShowCompletionModal(false);
    setTransactionToComplete(null);
    setCompletionStatus(null);
  };

  if (loading) {
    return (
      <div className="p-8 bg-slate-50 min-h-screen">
        <h1 className="text-3xl font-bold text-white bg-[#0B79A1] p-8 rounded mb-6 font-serif">Fulfillment</h1>
        <div className="flex justify-center items-center h-48 text-slate-500">Loading your leads...</div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-slate-50 min-h-screen font-sans">
      {/* Header */}
      <div className="bg-[#0B79A1] p-8 rounded mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white font-serif">Fulfillment</h1>
        <button
          className="bg-orange-500 text-white px-4 py-2 rounded font-medium hover:bg-orange-600 transition-colors"
          onClick={() => setShowCreateModal(true)}
        >
          Add New Fulfillment
        </button>
      </div>

      {/* Create Fulfillment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[500px] max-w-[90%] max-h-[90vh] overflow-y-auto shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">Create New Fulfillment</h3>
              <button className="bg-none border-none text-gray-500 hover:text-gray-700" onClick={() => setShowCreateModal(false)}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleAddFulfillment}>
              <div className="mb-4">
                <label className="block mb-1 font-medium text-sm">Name*</label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-200 rounded text-sm"
                  value={newContact.name}
                  onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-medium text-sm">Email</label>
                <input
                  type="email"
                  className="w-full p-2 border border-gray-200 rounded text-sm"
                  value={newContact.email}
                  onChange={(e) => setNewContact({...newContact, email: e.target.value})}
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-medium text-sm">Phone</label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-200 rounded text-sm"
                  placeholder="Enter multiple numbers separated by commas"
                  value={newContact.phone}
                  onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                />
                <small className="text-xs text-gray-500">Separate multiple phone numbers with commas</small>
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-medium text-sm">Author</label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-200 rounded text-sm"
                  value={newContact.author}
                  onChange={(e) => setNewContact({...newContact, author: e.target.value})}
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-medium text-sm">Publisher</label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-200 rounded text-sm"
                  value={newContact.publisher}
                  onChange={(e) => setNewContact({...newContact, publisher: e.target.value})}
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-medium text-sm">Book Title</label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-200 rounded text-sm"
                  value={newContact.book}
                  onChange={(e) => setNewContact({...newContact, book: e.target.value})}
                />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" className="px-4 py-2 bg-gray-200 rounded text-sm hover:bg-gray-300" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-orange-500 text-white rounded text-sm hover:bg-orange-600">
                  Create Fulfillment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded shadow-sm bg-white">
        <table className="w-full min-w-[800px] border-collapse">
          <thead>
            <tr>
              <th className="p-4 bg-[#0B79A1] text-white font-semibold text-left text-sm">Name</th>
              <th className="p-4 bg-[#0B79A1] text-white font-semibold text-left text-sm">Contact</th>
              <th className="p-4 bg-[#0B79A1] text-white font-semibold text-left text-sm">Book Title</th>
              <th className="p-4 bg-[#0B79A1] text-white font-semibold text-left text-sm">Publisher</th>
              <th className="p-4 bg-[#0B79A1] text-white font-semibold text-left text-sm">Status</th>
              <th className="p-4 bg-[#0B79A1] text-white font-semibold text-left text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.length > 0 ? (
              leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50">
                  <td className="p-4 border-b border-gray-200 text-gray-700 text-sm align-top">{lead.name || '-'}</td>
                  <td className="p-4 border-b border-gray-200 text-gray-700 text-sm align-top">
                    <div className="flex flex-col gap-1">
                      {lead.phone ? (
                        <a href={`tel:${lead.phone.replace(/[^0-9+]/g, '')}`} className="text-blue-500 hover:text-blue-700 font-medium no-underline">
                          {lead.phone}
                        </a>
                      ) : (
                        <span className="text-blue-500">-</span>
                      )}
                      {lead.email ? (
                        <a href={`mailto:${lead.email}`} className="text-blue-500 hover:text-blue-700 font-medium no-underline">
                          {lead.email}
                        </a>
                      ) : (
                        <span className="text-blue-500">-</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 border-b border-gray-200 text-gray-700 text-sm align-top">{lead.bookTitle}</td>
                  <td className="p-4 border-b border-gray-200 text-gray-700 text-sm align-top">{lead.publisher}</td>
                  <td className="p-4 border-b border-gray-200 text-gray-700 text-sm align-top">{lead.status}</td>
                  <td className="p-4 border-b border-gray-200 text-gray-700 text-sm align-top">
                    <button className="bg-blue-400 text-white px-3 py-1.5 rounded flex items-center gap-1.5 text-sm hover:bg-blue-500 transition-colors" onClick={() => handleViewTransactions(lead)}>
                      <FaEye /> View Transactions
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="p-8 text-center text-gray-500">
                  No leads assigned to you currently
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Transaction Details Modal */}
      {selectedLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[80%] max-w-[900px] max-h-[80vh] overflow-y-auto shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Transactions for {selectedLead.name}</h2>
              <button className="bg-none border-none text-gray-500 hover:text-gray-700" onClick={() => setSelectedLead(null)}>
                <FaTimes />
              </button>
            </div>

            {transactionLoading ? (
              <div className="flex justify-center items-center h-48 text-gray-500">Loading transactions...</div>
            ) : transactions.length > 0 ? (
              <>
                {transactions.map((transaction) => {
                  const filePath = transaction.file_path;
                  const fileType = transaction.file_type?.toLowerCase();
                  const isFirstPayment = transaction.status === 'Incomplete';

                  return (
                    <div key={transaction.transID} className="flex justify-between items-start p-5 border border-gray-200 rounded-lg mb-5 bg-white shadow-sm">
                      {/* Left - Transaction Info */}
                      <div className="flex-1 mr-5">
                        <table className="w-full border-collapse">
                          <tbody>
                            <tr>
                              <th className="text-left p-2 bg-gray-100 text-gray-700 font-semibold border-b border-gray-200 w-36">Transaction ID:</th>
                              <td className="p-2 border-b border-gray-200 text-gray-700">{transaction.transaction_id}</td>
                            </tr>
                            <tr>
                              <th className="text-left p-2 bg-gray-100 text-gray-700 font-semibold border-b border-gray-200">Status:</th>
                              <td className="p-2 border-b border-gray-200 text-gray-700">{transaction.trans_status}</td>
                            </tr>
                            <tr>
                              <th className="text-left p-2 bg-gray-100 text-gray-700 font-semibold border-b border-gray-200">Services:</th>
                              <td className="p-2 border-b border-gray-200 text-gray-700">{transaction.service_name}</td>
                            </tr>
                            <tr>
                              <th className="text-left p-2 bg-gray-100 text-gray-700 font-semibold border-b border-gray-200">Amount Paid:</th>
                              <td className="p-2 border-b border-gray-200 text-gray-700">${parseFloat(transaction.amount_pay).toFixed(2)}</td>
                            </tr>
                            <tr>
                              <th className="text-left p-2 bg-gray-100 text-gray-700 font-semibold border-b border-gray-200">Payment Status:</th>
                              <td className="p-2 border-b border-gray-200 text-gray-700">{transaction.payment_status}</td>
                            </tr>
                            <tr>
                              <th className="text-left p-2 bg-gray-100 text-gray-700 font-semibold border-b border-gray-200">Total Price:</th>
                              <td className="p-2 border-b border-gray-200 text-gray-700">${parseFloat(transaction.tot_service_price).toFixed(2)}</td>
                            </tr>
                            <tr>
                              <th className="text-left p-2 bg-gray-100 text-gray-700 font-semibold border-b border-gray-200">Remaining Balance:</th>
                              <td className="p-2 border-b border-gray-200 text-gray-700">${parseFloat(transaction.remain_bal).toFixed(2)}</td>
                            </tr>
                            <tr>
                              <th className="text-left p-2 bg-gray-100 text-gray-700 font-semibold border-b border-gray-200">Date:</th>
                              <td className="p-2 border-b border-gray-200 text-gray-700">{new Date(transaction.transaction_date).toLocaleDateString()}</td>
                            </tr>
                          </tbody>
                        </table>

                        {isFirstPayment && (
                          <button
                            onClick={() => handleCompleteClick(transaction)}
                            className="mt-3 bg-green-500 text-white px-4 py-2 rounded font-medium flex items-center gap-1.5 hover:bg-green-600 transition-colors"
                          >
                            <FaCheck /> Complete Transaction
                          </button>
                        )}
                      </div>

                      {/* Right - File Display */}
                      <div className="w-48 text-center flex items-center justify-center">
                        {filePath ? (
                          fileType === '.png' || fileType === '.jpg' || fileType === '.jpeg' ? (
                            <div className="text-center">
                              <img
                                src={`${API_URL}${filePath}`}
                                alt={transaction.file_name}
                                className="w-48 h-72 object-contain border border-gray-200 rounded shadow-sm mx-auto mb-2"
                                onError={(e) => {
                                  e.target.outerHTML = `
                                    <a href="${API_URL}${filePath}" 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      class="text-blue-500 underline">
                                      View File (Image failed to load)
                                    </a>`;
                                }}
                              />
                              <div className="text-sm text-gray-600">{transaction.file_name}</div>
                            </div>
                          ) : fileType === '.pdf' ? (
                            <div className="text-center">
                              <a
                                href={`${API_URL}${filePath}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block px-4 py-2 bg-blue-500 text-white rounded font-bold no-underline hover:bg-blue-600 transition-colors"
                              >
                                <FaFilePdf className="inline mr-1" /> View PDF
                              </a>
                            </div>
                          ) : (
                            <span className="text-gray-400">Unsupported File Type</span>
                          )
                        ) : (
                          <span className="text-gray-400">No File Attached</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </>
            ) : (
              <div className="p-8 text-center text-gray-500">No transactions found for this lead</div>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmation && transactionToComplete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[500px] max-w-[90%] shadow-lg">
            <div className="text-center mb-4">
              <FaExclamationTriangle className="text-yellow-500 text-3xl mx-auto mb-3" />
              <h3 className="text-xl font-semibold mb-2">Complete Transaction #{transactionToComplete.transaction_id}?</h3>
              <p className="text-gray-600">
                You are about to process the final payment for this transaction. 
                The remaining balance is <strong>${parseFloat(transactionToComplete.remain_bal).toFixed(2)}</strong>.
              </p>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button className="px-4 py-2 bg-red-500 text-white rounded font-medium hover:bg-red-600" onClick={handleCancelComplete}>
                Cancel
              </button>
              <button className="px-4 py-2 bg-green-500 text-white rounded font-medium flex items-center gap-1.5 hover:bg-green-600" onClick={handleConfirmComplete}>
                <FaCheck /> Continue to Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Completion/Payment Modal */}
      {showCompletionModal && transactionToComplete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[500px] max-w-[90%] shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Complete Transaction #{transactionToComplete.transaction_id}</h2>
              <button className="text-gray-500 hover:text-gray-700" onClick={handleCloseCompletionModal} disabled={completingTransaction}>
                <FaTimes />
              </button>
            </div>

            {completionStatus ? (
              <div className="text-center py-8">
                <div className="bg-green-500 text-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 text-3xl">
                  <FaCheck />
                </div>
                <h3 className="text-lg font-semibold mb-1">Transaction Completed Successfully!</h3>
                <p className="text-gray-600">The transaction has been marked as completed.</p>
              </div>
            ) : (
              <>
                <div className="bg-gray-100 p-4 rounded-lg mb-4">
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-600 font-medium">Total Service Price:</span>
                    <span className="font-semibold">${parseFloat(transactionToComplete.tot_service_price).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-600 font-medium">Amount Paid:</span>
                    <span className="font-semibold">${parseFloat(transactionToComplete.amount_pay).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-medium">Remaining Balance:</span>
                    <span className="font-semibold text-green-600">${parseFloat(transactionToComplete.remain_bal).toFixed(2)}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block mb-1 font-medium text-sm">Payment Amount</label>
                  <div className="relative">
                    <FaMoneyBillWave className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500" />
                    <input
                      type="number"
                      name="amount"
                      value={paymentData.amount}
                      onChange={handlePaymentChange}
                      className="w-full p-2 pl-8 border border-gray-200 rounded text-sm"
                      placeholder="0.00"
                      min="0"
                      max={transactionToComplete.remain_bal}
                      step="0.01"
                      disabled={completingTransaction}
                    />
                  </div>
                  {errors.amount && <div className="text-red-500 text-xs mt-1">{errors.amount}</div>}
                </div>

                <div className="mb-4">
                  <label className="block mb-1 font-medium text-sm">Payment Status</label>
                  <div className="relative">
                    <FaMoneyBillWave className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500" />
                    <input
                      type="text"
                      name="status"
                      value={paymentData.status || 'Second Payment'}
                      onChange={handlePaymentChange}
                      className="w-full p-2 pl-8 border border-gray-200 rounded text-sm bg-gray-50"
                      disabled={completingTransaction}
                      readOnly
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block mb-1 font-medium text-sm">Payment Date</label>
                  <div className="relative">
                    <FaCalendarAlt className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500" />
                    <input
                      type="date"
                      name="date"
                      value={paymentData.date}
                      onChange={handlePaymentChange}
                      className="w-full p-2 pl-8 border border-gray-200 rounded text-sm"
                      disabled={completingTransaction}
                    />
                  </div>
                  {errors.date && <div className="text-red-500 text-xs mt-1">{errors.date}</div>}
                </div>

                <div className="flex justify-end gap-3 mt-4">
                  <button className="px-4 py-2 bg-red-500 text-white rounded font-medium hover:bg-red-600" onClick={handleCloseCompletionModal} disabled={completingTransaction}>
                    Cancel
                  </button>
                  <button className="px-4 py-2 bg-green-500 text-white rounded font-medium flex items-center gap-1.5 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed" onClick={handleSubmitCompletion} disabled={completingTransaction}>
                    {completingTransaction ? (
                      <>
                        <FaSpinner className="animate-spin" /> Processing...
                      </>
                    ) : (
                      <>
                        <FaCheck /> Complete Transaction
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Fulfillment;