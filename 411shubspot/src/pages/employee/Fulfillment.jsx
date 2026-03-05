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
  // Styles
  const styles = {
    container: {
      padding: '2rem',
      backgroundColor: '#f8fafc',
      minHeight: '100vh',
      fontFamily: "'Inter', sans-serif",
    },
    title: {
      fontSize: '2.0rem',
      marginBottom: '24px',
      color: 'white',
      fontWeight: 'bold',
      backgroundColor: '#0B79A1',
      padding: '30px',
      borderRadius: '2px',
      width: '100%',
      boxSizing: 'border-box',
      textAlign: 'left',
      fontFamily: "'Times New Roman', Times, serif",
    },
    tableContainer: {
      overflowX: 'auto',
      borderRadius: '0rem',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      backgroundColor: 'white',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      minWidth: '800px',
    },
    th: {
      padding: '1rem',
      backgroundColor: '#0B79A1',
      color: '#fff',
      fontWeight: '600',
      textAlign: 'left',
      fontSize: '0.875rem',
      letterSpacing: '0.03em',
    },
    td: {
      padding: '1rem',
      borderBottom: '1px solid #e2e8f0',
      color: '#334155',
      fontSize: '0.875rem',
      verticalAlign: 'top',
    },
    contactLinksContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
    },
    phoneLink: {
      color: '#0ea5e9',
      textDecoration: 'none',
      fontWeight: '500',
    },
    emailLink: {
      color: '#0ea5e9',
      textDecoration: 'none',
      fontWeight: '500',
    },
    loading: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '200px',
      fontSize: '1rem',
      color: '#64748b',
    },
    emptyState: {
      padding: '2rem',
      textAlign: 'center',
      color: '#64748b',
    },
    actionButton: {
      backgroundColor: '#45b1e8',
      color: 'white',
      border: 'none',
      padding: '8px 12px',
      borderRadius: '6px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      fontSize: '0.8125rem',
    },
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    },
    modalContent: {
      backgroundColor: 'white',
      padding: '2rem',
      borderRadius: '8px',
      width: '80%',
      maxWidth: '900px',
      maxHeight: '80vh',
      overflowY: 'auto',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    },
    modalHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1.5rem',
    },
    modalTitle: {
      fontSize: '1.5rem',
      fontWeight: '600',
      color: '#1f2937',
    },
    closeButton: {
      background: 'none',
      border: 'none',
      fontSize: '1.25rem',
      cursor: 'pointer',
      color: '#64748b',
    },
    completeButton: {
      backgroundColor: '#10b981',
      color: 'white',
      border: 'none',
      padding: '8px 16px',
      borderRadius: '6px',
      cursor: 'pointer',
      marginTop: '12px',
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      width: 'fit-content'
    },
    completeButtonDisabled: {
      backgroundColor: '#9ca3af',
      cursor: 'not-allowed',
    },
    confirmationModal: {
      backgroundColor: 'white',
      padding: '2rem',
      borderRadius: '8px',
      width: '500px',
      maxWidth: '90%',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    },
    confirmationContent: {
      textAlign: 'center',
      marginBottom: '1.5rem',
    },
    confirmationButtons: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '12px',
      marginTop: '24px'
    },
    confirmButton: {
      backgroundColor: '#10b981',
      color: 'white',
      border: 'none',
      padding: '8px 16px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontWeight: '500'
    },
    cancelButton: {
      backgroundColor: '#ef4444',
      color: 'white',
      border: 'none',
      padding: '8px 16px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontWeight: '500'
    },
    warningIcon: {
      color: '#f59e0b',
      fontSize: '2rem',
      marginBottom: '16px'
    },
    completionModal: {
      backgroundColor: 'white',
      padding: '2rem',
      borderRadius: '8px',
      width: '500px',
      maxWidth: '90%',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    },
    formGroup: {
      marginBottom: '1rem',
    },
    formLabel: {
      display: 'block',
      marginBottom: '0.5rem',
      fontWeight: '500',
    },
    formInput: {
      width: '100%',
      padding: '0.5rem',
      border: '1px solid #e2e8f0',
      borderRadius: '4px',
      fontSize: '0.875rem',
    },
    formSelect: {
      width: '100%',
      padding: '0.5rem',
      border: '1px solid #e2e8f0',
      borderRadius: '4px',
      fontSize: '0.875rem',
      backgroundColor: 'white',
    },
    paymentSummary: {
      backgroundColor: '#f1f5f9',
      padding: '1rem',
      borderRadius: '6px',
      marginBottom: '1.5rem',
    },
    paymentSummaryItem: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '0.5rem',
    },
    paymentSummaryLabel: {
      fontWeight: '500',
      color: '#64748b',
    },
    paymentSummaryValue: {
      fontWeight: '600',
    },
    inputWithIcon: {
      position: 'relative',
    },
    inputIcon: {
      position: 'absolute',
      left: '10px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#64748b',
    },
    inputField: {
      width: '90%',
      padding: '0.5rem 0.5rem 0.5rem 2rem',
      border: '1px solid #e2e8f0',
      borderRadius: '4px',
      fontSize: '0.875rem',
    },
    errorMessage: {
      color: '#ef4444',
      fontSize: '0.75rem',
      marginTop: '0.25rem',
    },
    // Create Contact Modal Styles
    modal: {
      backgroundColor: 'white',
      borderRadius: '8px',
      width: '500px',
      maxWidth: '90%',
      maxHeight: '90vh',
      overflowY: 'auto',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      padding: '20px',
    },
    
    label: {
      display: 'block',
      marginBottom: '5px',
      fontWeight: '500',
      fontSize: '14px',
    },
    input: {
      width: '100%',
      padding: '8px 12px',
      border: '1px solid #e2e8f0',
      borderRadius: '4px',
      fontSize: '14px',
    },
    modalButtons: {
      display: 'flex',
      justifyContent: 'flex-end',
      marginTop: '20px',
    },
    button: {
      padding: '8px 16px',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
    },
    orangeBtn: {
      backgroundColor: '#f97316',
      color: 'white',
    },
  };

  const tranStyle = {
    transactionContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      padding: '20px',
      border: '1px solid #e2e8f0',
      borderRadius: '10px',
      marginBottom: '20px',
      backgroundColor: 'white',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    },
    transactionLeft: {
      flex: 1,
      marginRight: '20px',
    },
    transactionRight: {
      width: '200px',
      textAlign: 'center',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    transactionTable: {
      width: '100%',
      borderCollapse: 'collapse',
    },
    transactionTh: {
      textAlign: 'left',
      padding: '8px',
      backgroundColor: '#f1f5f9',
      color: '#334155',
      fontWeight: '600',
      borderBottom: '1px solid #e2e8f0',
      width: '150px',
    },
    transactionTd: {
      padding: '8px',
      borderBottom: '1px solid #e2e8f0',
      color: '#334155',
    },
  };

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

  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Add this useEffect to check session on component mount
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
        console.log('User is not authenticated',isAuthenticated);
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
        userId: user.id  // Pass the logged-in user's ID
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create fulfillment contact');
    }

    const data = await response.json();
    console.log('Fulfillment contact created:', data);
    
    // Update the leads state with the new contact
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
    
    // Close modal and reset form
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

  // Fetch transactions when a lead is selected
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

  // const handleViewTransactions = (lead) => {
  //   setSelectedLead(lead);
  //   fetchTransactions(lead.id);
  // };

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

    // Optional: update status before sending if needed
    paymentData.status = 'Second Payment'; // fixed typo

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

    console.log('Payload being sent:', payload);
    // console.log('status:', transactionToComplete.trans_status);

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

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error response from server:', errorData);
      throw new Error(errorData.error || 'Failed to complete transaction');
    }

    const result = await response.json();
    console.log('Response data:', result);
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
      <div style={styles.container}>
        <h1 style={styles.title}>Fulfillment</h1>
        <div style={styles.loading}>Loading your leads...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div
  style={{
    backgroundColor: '#0B79A1',
    padding: '30px',
    borderRadius: '2px',
    width: '100%',
    boxSizing: 'border-box',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  }}
>
  <h1
    style={{
      fontSize: '2.0rem',
      color: 'white',
      fontWeight: 'bold',
      fontFamily: "'Times New Roman', Times, serif",
      margin: 0,
    }}
  >
    Fulfillment
  </h1>

  <button
    style={{
      backgroundColor: '#f97316',
      color: 'white',
      border: 'none',
      padding: '10px 15px',
      borderRadius: '4px',
      cursor: 'pointer',
      fontWeight: '500',
    }}
    onClick={() => setShowCreateModal(true)}
  >
    Add New Fulfillment
  </button>
</div>



      {/* Create Fulfillment Modal */}
      {showCreateModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Create New Fulfillment</h3>
              <button 
                style={styles.closeButton}
                onClick={() => setShowCreateModal(false)}
              >
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleAddFulfillment}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Name*</label>
                <input
                  type="text"
                  style={styles.input}
                  value={newContact.name}
                  onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Email</label>
                <input
                  type="email"
                  style={styles.input}
                  value={newContact.email}
                  onChange={(e) => setNewContact({...newContact, email: e.target.value})}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Phone</label>
                <input
                  type="text"
                  style={styles.input}
                  placeholder="Enter multiple numbers separated by commas"
                  value={newContact.phone}
                  onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                />
                <small style={{ fontSize: '12px', color: '#888' }}>
                  Separate multiple phone numbers with commas
                </small>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Author</label>
                <input
                  type="text"
                  style={styles.input}
                  value={newContact.author}
                  onChange={(e) => setNewContact({...newContact, author: e.target.value})}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Publisher</label>
                <input
                  type="text"
                  style={styles.input}
                  value={newContact.publisher}
                  onChange={(e) => setNewContact({...newContact, publisher: e.target.value})}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Book Title</label>
                <input
                  type="text"
                  style={styles.input}
                  value={newContact.book}
                  onChange={(e) => setNewContact({...newContact, book: e.target.value})}
                />
              </div>
              <div style={styles.modalButtons}>
                <button 
                  type="button" 
                  style={{ ...styles.button, marginRight: '10px' }}
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  style={{ ...styles.button, ...styles.orangeBtn }}
                >
                  Create Fulfillment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Contact</th>
              <th style={styles.th}>Book Title</th>
              <th style={styles.th}>Publisher</th>
              <th style={styles.th}>Status</th>
              {/* <th style={styles.th}>Actions</th> */}
            </tr>
          </thead>
          <tbody>
            {leads.length > 0 ? (
              leads.map((lead) => (
                <tr key={lead.id}>
                  <td style={styles.td}>{lead.name || '-'}</td>
                  <td style={styles.td}>
                    <div style={styles.contactLinksContainer}>
                      <a href={`tel:${lead.phone.replace(/[^0-9+]/g, '')}`} style={styles.phoneLink}>
                        {lead.phone || '-'}
                      </a>
                      <a href={`mailto:${lead.email}`} style={styles.emailLink}>
                        {lead.email || '-'}
                      </a>
                    </div>
                  </td>
                  <td style={styles.td}>{lead.bookTitle}</td>
                  <td style={styles.td}>{lead.publisher}</td>
                  <td style={styles.td}>{lead.status}</td>
                  {/* <td style={styles.td}>
                    <button style={styles.actionButton} onClick={() => handleViewTransactions(lead)}>
                      <FaEye /> View Transactions
                    </button>
                  </td> */}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={styles.emptyState}>
                  No leads assigned to you currently
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Transaction Details Modal */}
      {selectedLead && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                Transactions for {selectedLead.name}
              </h2>
              <button style={styles.closeButton} onClick={() => setSelectedLead(null)}>
                <FaTimes />
              </button>
            </div>

            {transactionLoading ? (
              <div style={styles.loading}>Loading transactions...</div>
            ) : transactions.length > 0 ? (
              <>
                {transactions.map((transaction) => {
                  const filePath = transaction.file_path;
                  const fileType = transaction.file_type?.toLowerCase();
                  const isFirstPayment = transaction.status === 'Incomplete';

                  return (
                    <div key={transaction.transID} style={tranStyle.transactionContainer}>
                      {/* Left - Transaction Info */}
                      <div style={tranStyle.transactionLeft}>
                        <table style={tranStyle.transactionTable}>
                          <tbody>
                            <tr>
                              <th style={tranStyle.transactionTh}>Transaction ID:</th>
                              <td style={tranStyle.transactionTd}>{transaction.transaction_id}</td>
                            </tr>
                            <tr>
                              <th style={tranStyle.transactionTh}>Status:</th>
                              <td style={tranStyle.transactionTd}>{transaction.trans_status}</td>
                            </tr>
                            <tr>
                              <th style={tranStyle.transactionTh}>Services:</th>
                              <td style={tranStyle.transactionTd}>{transaction.service_name}</td>
                            </tr>
                            <tr>
                              <th style={tranStyle.transactionTh}>Amount Paid:</th>
                              <td style={tranStyle.transactionTd}>
                                ${parseFloat(transaction.amount_pay).toFixed(2)}
                              </td>
                            </tr>
                            <tr>
                              <th style={tranStyle.transactionTh}>Payment Status:</th>
                              <td style={tranStyle.transactionTd}>{transaction.payment_status}</td>
                            </tr>
                            <tr>
                              <th style={tranStyle.transactionTh}>Total Price:</th>
                              <td style={tranStyle.transactionTd}>
                                ${parseFloat(transaction.tot_service_price).toFixed(2)}
                              </td>
                            </tr>
                            <tr>
                              <th style={tranStyle.transactionTh}>Remaining Balance:</th>
                              <td style={tranStyle.transactionTd}>
                                ${parseFloat(transaction.remain_bal).toFixed(2)}
                              </td>
                            </tr>
                            <tr>
                              <th style={tranStyle.transactionTh}>Date:</th>
                              <td style={tranStyle.transactionTd}>
                                {new Date(transaction.transaction_date).toLocaleDateString()}
                              </td>
                            </tr>
                          </tbody>
                        </table>

                        {isFirstPayment && (
                          <button
                            onClick={() => handleCompleteClick(transaction)}
                            style={styles.completeButton}
                          >
                            <FaCheck /> Complete Transaction
                          </button>
                        )}
                      </div>

                      {/* Right - File Display */}
                      <div style={tranStyle.transactionRight}>
                        {filePath ? (
                          fileType === '.png' || fileType === '.jpg' || fileType === '.jpeg' ? (
                            <div style={{ textAlign: 'center' }}>
                              <img
                                src={`${API_URL}${filePath}`}
                                alt={transaction.file_name}
                                style={{
                                  width: '200px',
                                  height: '300px',
                                  objectFit: 'contain',
                                  border: '1px solid #e2e8f0',
                                  borderRadius: '8px',
                                  boxShadow: '0 0 4px rgba(0,0,0,0.1)',
                                  display: 'block',
                                  margin: '0 auto 0.5rem'
                                }}
                                onError={(e) => {
                                  e.target.outerHTML = `
                                    <a href="${API_URL}${filePath}" 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      style="color: #3b82f6; text-decoration: underline;">
                                      View File (Image failed to load)
                                    </a>`;
                                }}
                              />
                              <div style={{ fontSize: '0.9rem', color: '#475569' }}>
                                {transaction.file_name}
                              </div>
                            </div>
                          ) : fileType === '.pdf' ? (
                            <div style={{ textAlign: 'center', marginTop: '110px', marginLeft: '35px'}}>
                              <a
                                href={`${API_URL}${filePath}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  display: 'inline-block',
                                  padding: '10px 15px',
                                  backgroundColor: '#007BFF',
                                  color: '#fff',
                                  textDecoration: 'none',
                                  borderRadius: '6px',
                                  fontWeight: 'bold',
                                }}
                              >
                                <FaFilePdf /> View PDF
                              </a>
                            </div>
                          ) : (
                            <span style={{ color: "#999" }}>Unsupported File Type</span>
                          )
                        ) : (
                          <span style={{ color: "#999" }}>No File Attached</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </>
            ) : (
              <div style={styles.emptyState}>No transactions found for this lead</div>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmation && transactionToComplete && (
        <div style={styles.modalOverlay}>
          <div style={styles.confirmationModal}>
            <div style={styles.confirmationContent}>
              <FaExclamationTriangle style={styles.warningIcon} />
              <h3 style={{ marginBottom: '12px', fontSize: '1.25rem' }}>
                Complete Transaction #{transactionToComplete.transaction_id}?
              </h3>
              <p>
                You are about to process the final payment for this transaction. 
                The remaining balance is <strong>${parseFloat(transactionToComplete.remain_bal).toFixed(2)}</strong>.
              </p>
            </div>
            <div style={styles.confirmationButtons}>
              <button 
                style={styles.cancelButton}
                onClick={handleCancelComplete}
              >
                Cancel
              </button>
              <button 
                style={styles.confirmButton}
                onClick={handleConfirmComplete}
              >
                <FaCheck /> Continue to Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Completion/Payment Modal */}
      {showCompletionModal && transactionToComplete && (
        <div style={styles.modalOverlay}>
          <div style={styles.completionModal}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                Complete Transaction #{transactionToComplete.transaction_id}
              </h2>
              <button 
                style={styles.closeButton} 
                onClick={handleCloseCompletionModal}
                disabled={completingTransaction}
              >
                <FaTimes />
              </button>
            </div>

            {completionStatus ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div style={{ 
                  backgroundColor: '#10b981', 
                  color: 'white',
                  borderRadius: '50%',
                  width: '80px',
                  height: '80px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                  fontSize: '2rem'
                }}>
                  <FaCheck />
                </div>
                <h3 style={{ marginBottom: '0.5rem' }}>Transaction Completed Successfully!</h3>
                <p>The transaction has been marked as completed.</p>
              </div>
            ) : (
              <>
                <div style={styles.paymentSummary}>
                  <div style={styles.paymentSummaryItem}>
                    <span style={styles.paymentSummaryLabel}>Total Service Price:</span>
                    <span style={styles.paymentSummaryValue}>
                      ${parseFloat(transactionToComplete.tot_service_price).toFixed(2)}
                    </span>
                  </div>
                  <div style={styles.paymentSummaryItem}>
                    <span style={styles.paymentSummaryLabel}>Amount Paid:</span>
                    <span style={styles.paymentSummaryValue}>
                      ${parseFloat(transactionToComplete.amount_pay).toFixed(2)}
                    </span>
                  </div>
                  <div style={styles.paymentSummaryItem}>
                    <span style={styles.paymentSummaryLabel}>Remaining Balance:</span>
                    <span style={{ ...styles.paymentSummaryValue, color: '#10b981' }}>
                      ${parseFloat(transactionToComplete.remain_bal).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Payment Amount</label>
                  <div style={styles.inputWithIcon}>
                    <FaMoneyBillWave style={styles.inputIcon} />
                    <input
                      type="number"
                      name="amount"
                      value={paymentData.amount}
                      onChange={handlePaymentChange}
                      style={styles.inputField}
                      placeholder="0.00"
                      min="0"
                      max={transactionToComplete.remain_bal}
                      step="0.01"
                      disabled={completingTransaction}
                    />
                  </div>
                  {errors.amount && <div style={styles.errorMessage}>{errors.amount}</div>}
                </div>

                <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Payment Status</label>
                    <div style={styles.inputWithIcon}>
                        <FaMoneyBillWave style={styles.inputIcon} />
                        <input
                            type="text"
                            name="status"
                            value={paymentData.status || 'Second Payment'}
                            onChange={handlePaymentChange}
                            style={styles.inputField}
                            disabled={completingTransaction}
                            readOnly
                        />
                    </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Payment Date</label>
                  <div style={styles.inputWithIcon}>
                    <FaCalendarAlt style={styles.inputIcon} />
                    <input
                      type="date"
                      name="date"
                      value={paymentData.date}
                      onChange={handlePaymentChange}
                      style={styles.inputField}
                      disabled={completingTransaction}
                    />
                  </div>
                  {errors.date && <div style={styles.errorMessage}>{errors.date}</div>}
                </div>

                <div style={styles.confirmationButtons}>
                  <button 
                    style={styles.cancelButton}
                    onClick={handleCloseCompletionModal}
                    disabled={completingTransaction}
                  >
                    Cancel
                  </button>
                  <button 
                    style={styles.confirmButton}
                    onClick={handleSubmitCompletion}
                    disabled={completingTransaction}
                  >
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