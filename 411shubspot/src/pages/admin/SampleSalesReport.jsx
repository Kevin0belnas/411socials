import React, { useState, useEffect } from 'react';
const API_URL = import.meta.env.VITE_API_URL;

function SampleSalesReport() {
  const [formData, setFormData] = useState({
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

  useEffect(() => {
    fetchAllData();
    document.title = "411 Socials Sales Report";
  }, []);

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

  const filteredData = reportData.filter(item => 
    Object.values(item).some(val => 
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePaymentChange = (index, field, value) => {
    const updatedPayments = [...formData.payments];
    updatedPayments[index][field] = value;
    setFormData(prev => ({
      ...prev,
      payments: updatedPayments,
      paymentStatus: calculatePaymentStatus({
        ...prev,
        payments: updatedPayments
      })
    }));
  };

  const addPayment = () => {
  setFormData(prev => ({
    ...prev,
    payments: [...prev.payments, { 
      amount: '', 
      date: '', 
      method: '' ,
    }]
  }));
};

  const removePayment = (index) => {
    if (formData.payments.length <= 1) return;
    setFormData(prev => ({
      ...prev,
      payments: prev.payments.filter((_, i) => i !== index)
    }));
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

  // const handleFormSubmit = async (e) => {
  //   e.preventDefault();
  //   try {
  //     // Calculate final payment status and totals
  //     const totalPaid = formData.paymentType === 'full'
  //       ? parseFloat(formData.fullPaymentAmount || 0)
  //       : formData.payments.reduce((sum, p) => sum + (parseFloat(p.amount)) || 0, 0);
      
  //     const dataToSend = {
  //       ...formData,
  //       paymentStatus: calculatePaymentStatus(formData),
  //       totalAmountPaid: totalPaid,
  //       balance: parseFloat(formData.serviceAmount || 0) - totalPaid
  //     };

  //     const response = await fetch(`${API_URL}/api/sales`, {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify(dataToSend)
  //     });
      
  //     if (!response.ok) throw new Error('Failed to save data');
  //     alert('Sales data saved successfully!');
  //     resetForm();
  //     setShowEntryModal(false);
  //     fetchAllData();
  //   } catch (error) {
  //     alert('Error: ' + error.message);
  //   }
  // };

  const handleFormSubmit = async (e) => {
  e.preventDefault();
  try {
    // Calculate totals and status
    const totalPaid = formData.paymentType === 'full'
      ? parseFloat(formData.fullPaymentAmount || 0)
      : formData.payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
    
    const serviceAmount = parseFloat(formData.serviceAmount || 0);
    
    const dataToSend = {
      date: formData.date,
      paymentType: formData.paymentType,
      fullPaymentAmount: formData.paymentType === 'full' ? parseFloat(formData.fullPaymentAmount) : null,
      serviceAmount: serviceAmount,
      service: formData.service,
      author: formData.author,
      leadOwner: formData.leadOwner,
      closer: formData.closer,
      paymentMethod: formData.paymentMethod,
      paymentStatus: calculatePaymentStatus(formData),
      notes: formData.notes,
      totalAmountPaid: totalPaid,
      balance: serviceAmount - totalPaid,
      payments: formData.paymentType === 'installment' 
        ? formData.payments.map(payment => ({
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
    resetForm();
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
            method: p.method, // Add this line
            id: p.id
          }))
        : [{ amount: '', date: '', method: '' }]
    };
    
    setFormData(formData);
    setShowEditModal(true);
  };

  const handleUpdateSubmit = async (e) => {
  e.preventDefault();
  try {
    // Calculate totals and status
    const totalPaid = formData.paymentType === 'full'
      ? parseFloat(formData.fullPaymentAmount || 0)
      : formData.payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
    
    const serviceAmount = parseFloat(formData.serviceAmount || 0);
    
    const dataToSend = {
      date: formData.date,
      paymentType: formData.paymentType,
      fullPaymentAmount: formData.paymentType === 'full' ? parseFloat(formData.fullPaymentAmount) : null,
      serviceAmount: serviceAmount,
      service: formData.service,
      author: formData.author,
      leadOwner: formData.leadOwner,
      closer: formData.closer,
      paymentMethod: formData.paymentMethod,
      paymentStatus: calculatePaymentStatus(formData),
      notes: formData.notes,
      totalAmountPaid: totalPaid,
      balance: serviceAmount - totalPaid,
      payments: formData.paymentType === 'installment' 
        ? formData.payments.map(payment => ({
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
    setShowEditModal(false);
    fetchAllData();
  } catch (error) {
    console.error('Update Error:', error);
    alert('Error: ' + error.message);
  }
};

  const deletePayment = async (paymentId) => {
    try {
      const response = await fetch(`${API_URL}/api/payments/${paymentId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete payment');
      fetchAllData();
    } catch (error) {
      alert('Error deleting payment: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
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
  const month = String(d.getMonth() + 1).padStart(2, '0'); // Month is 0-based
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`; // This is safe for <input type="date">
};

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      let url = `${API_URL}/api/sales`;
      
      if (filterType === 'range') {
        const { start, end } = formData;
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

  const labelStyle = { marginBottom: '5px', fontWeight: 'bold', display: 'block' };
  const inputStyle = { 
    width: '100%', 
    padding: '10px', 
    marginBottom: '10px',
    borderRadius: '4px',
    border: '1px solid #d1d5db'
  };
  const buttonStyle = { 
    padding: '10px 20px', 
    backgroundColor: '#2563eb', 
    color: '#fff', 
    border: 'none', 
    cursor: 'pointer',
    borderRadius: '4px'
  };

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>Sales Reports</h2>
        <button 
          onClick={() => setShowEntryModal(true)} 
          style={{
            ...buttonStyle,
            backgroundColor: '#10b981',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>+</span> Add New Entry
        </button>
      </div>

      {/* Filter Form */}
      <form onSubmit={handleReportSubmit} style={{
        backgroundColor: '#f8fafc',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Filter Type</label>
            <select 
              name="filterType" 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value)} 
              style={inputStyle}
            >
              <option value="all">All Data</option>
              <option value="week">This Week</option>
              <option value="month">Specific Month</option>
              <option value="year">This Year</option>
              <option value="range">Custom Range</option>
            </select>
          </div>

          {filterType === 'month' && (
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Select Year</label>
              <input 
                type="number" 
                min="2000" 
                max="2100" 
                value={selectedYear} 
                onChange={(e) => setSelectedYear(e.target.value)} 
                style={inputStyle} 
              />
            </div>
          )}

          {filterType === 'range' && (
            <>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Start Date</label>
                <input 
                  type="date" 
                  name="start" 
                  value={formData.start} 
                  onChange={handleChange} 
                  style={inputStyle} 
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>End Date</label>
                <input 
                  type="date" 
                  name="end" 
                  value={formData.end} 
                  onChange={handleChange} 
                  style={inputStyle} 
                />
              </div>
            </>
          )}

          <button 
            type="submit" 
            style={{
              ...buttonStyle,
              height: '40px',
              marginBottom: '10px'
            }} 
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Apply Filter'}
          </button>
        </div>

        {filterType === 'month' && (
          <div style={{ marginTop: '10px' }}>
            <label style={labelStyle}>Select Month</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {months.map((month, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setSelectedMonth(index + 1)}
                  style={{ 
                    ...buttonStyle, 
                    backgroundColor: selectedMonth === index + 1 ? '#1e40af' : '#2563eb',
                    padding: '8px 12px',
                    fontSize: '14px'
                  }}
                >
                  {month}
                </button>
              ))}
            </div>
          </div>
        )}
      </form>

      {/* Search and Results Count */}
      <div style={{ margin: '20px 0', display: 'flex', alignItems: 'center' }}>
        <label style={{ marginRight: '10px', fontWeight: 'bold' }}>Search:</label>
        <input
          type="text"
          placeholder="Search by author, service, etc..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: '10px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            flex: 1,
            maxWidth: '400px'
          }}
        />
        <div style={{ marginLeft: '10px', color: '#666' }}>
          {filteredData.length} records found
        </div>
      </div>

      {/* Results Table */}
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9' }}>
                {["Author","Date", "Type", "Service", "Amount", "Method", "Payments", "Total Paid", "Balance", "Status", "Action"].map((col) => (
                  <th 
                    key={col} 
                    style={{ 
                      border: '1px solid #e2e8f0', 
                      padding: '12px 15px', 
                      textAlign: 'left',
                      fontWeight: '600',
                      color: '#334155'
                    }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((item, idx) => {
                 const totalPaid = item.payment_type === 'full' 
                    ? parseFloat(item.full_payment_amount || 0)
                    : item.payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

                  const balance = parseFloat(item.service_amount || 0) - totalPaid;
                  
                  const rowStyle = {
                    backgroundColor: 
                      item.payment_status === 'Paid' ? 'rgba(34, 197, 94, 0.1)' : 
                      item.payment_status === 'Partially Paid' ? 'rgba(234, 179, 8, 0.1)' : 
                      'transparent'
                  };
                  
                  return (
                    <tr key={idx} style={rowStyle}>
                      <td style={tdStyle}>{item.author}</td>
                      <td style={tdStyle}>{new Date(item.date).toLocaleDateString()}</td>
                      <td style={tdStyle}>{item.payment_type === 'full' ? 'Full' : 'Installment'}</td>
                      <td style={tdStyle}>{item.service}</td>
                      <td style={tdStyle}>{formatCurrency(item.service_amount)}</td>
                      {/* <td style={tdStyle}>{item.payment_method}</td> */}
                      <td style={tdStyle}>
  {item.payment_type === 'full' ? (
    item.payment_method || 'Not specified'
  ) : item.payments.length === 1 ? (
    item.payments[0]?.method || 'Not specified'
  ) : (
    `${item.payments.length} payments`
  )}
</td>
                      <td style={tdStyle}>
                        {item.payment_type === 'full' 
                          ? 'Full Payment'
                          : `${item.payments.length} Installments`}
                      </td>
                      <td style={tdStyle}>{formatCurrency(totalPaid)}</td>
                      <td style={tdStyle}>{formatCurrency(balance)}</td>
                      <td style={{
                        ...tdStyle,
                        fontWeight: 'bold',
                        color: item.payment_status === 'Paid' ? '#166534' : 
                               item.payment_status === 'Partially Paid' ? '#854d0e' : '#991b1b'
                      }}>
                        {item.payment_status}
                      </td>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            onClick={() => viewReceipt(item)}
                            style={{
                              ...buttonStyle,
                              backgroundColor: '#4f46e5',
                              padding: '8px 12px',
                              fontSize: '14px'
                            }}
                          >
                            View
                          </button>
                          <button 
                            onClick={() => handleEdit(item)}
                            style={{
                              ...buttonStyle,
                              backgroundColor: '#f59e0b',
                              padding: '8px 12px',
                              fontSize: '14px'
                            }}
                          >
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
                    {isLoading ? 'Loading data...' : 'No matching records found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Entry Modal */}
      {showEntryModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            width: '90%',
            maxWidth: '800px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '20px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              borderBottom: '1px solid #e2e8f0',
              paddingBottom: '10px'
            }}>
              <h3 style={{ margin: 0, fontSize: '20px' }}>New Sales Entry</h3>
              <button 
                onClick={() => setShowEntryModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: '#64748b'
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                <div>
                  <label style={labelStyle}>Date*</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    style={inputStyle}
                    required
                  />
                </div>

                <div>
                  <label style={labelStyle}>Payment Type*</label>
                  <select
                    name="paymentType"
                    value={formData.paymentType}
                    onChange={handleChange}
                    style={inputStyle}
                    required
                  >
                    <option value="full">Full Payment</option>
                    <option value="installment">Installment Payment</option>
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Service*</label>
                  <input
                    type="text"
                    name="service"
                    value={formData.service}
                    onChange={handleChange}
                    style={inputStyle}
                    required
                  />
                </div>

                <div>
                  <label style={labelStyle}>Service Amount*</label>
                  <input
                    type="number"
                    name="serviceAmount"
                    value={formData.serviceAmount}
                    onChange={handleChange}
                    style={inputStyle}
                    required
                    min="0"
                    step="0.01"
                  />
                </div>

                {formData.paymentType === 'full' ? (
                  <>
                    <div>
                      <label style={labelStyle}>Full Payment Amount*</label>
                      <input
                        type="number"
                        name="fullPaymentAmount"
                        value={formData.fullPaymentAmount}
                        onChange={handleChange}
                        style={inputStyle}
                        required
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Payment Method*</label>
                      <select 
                        name="paymentMethod" 
                        value={formData.paymentMethod} 
                        onChange={handleChange} 
                        style={inputStyle}
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
                  <div style={{ gridColumn: '1 / -1' }}>
                    <h4 style={{ marginBottom: '10px' }}>Installment Payments</h4>
                    {formData.payments.map((payment, index) => (
                      <div key={index} style={{ 
                        display: 'grid', 
                        gridTemplateColumns: '1fr 1fr 1fr', 
                        gap: '20px',
                        marginBottom: '15px',
                        padding: '15px',
                        backgroundColor: '#f8fafc',
                        borderRadius: '4px',
                        position: 'relative'
                      }}>
                        <div>
                          <label style={labelStyle}>Payment {index + 1} Amount*</label>
                          <input
                            type="number"
                            value={payment.amount}
                            onChange={(e) => handlePaymentChange(index, 'amount', e.target.value)}
                            style={inputStyle}
                            required
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <div>
                          <label style={labelStyle}>Payment {index + 1} Date*</label>
                          <input
                            type="date"
                            value={payment.date}
                            onChange={(e) => handlePaymentChange(index, 'date', e.target.value)}
                            style={inputStyle}
                            required
                          />
                        </div>
                        <div>
                          <label style={labelStyle}>Payment Method*</label>
                          <select
                            value={payment.method || ''}
                            onChange={(e) => handlePaymentChange(index, 'method', e.target.value)}
                            style={inputStyle}
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
                        {formData.payments.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removePayment(index)}
                            style={{
                              ...buttonStyle,
                              backgroundColor: '#ef4444',
                              padding: '6px 10px',
                              position: 'absolute',
                              top: '5px',
                              right: '5px',
                              fontSize: '12px'
                            }}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                      <div>
                        <p style={{ margin: '5px 0', fontSize: '14px', color: '#64748b' }}>
                          Total Paid: {formatCurrency(
                            formData.payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0)
                          )}
                        </p>
                        <p style={{ margin: '5px 0', fontSize: '14px', color: '#64748b' }}>
                          Balance: {formatCurrency(
                            (parseFloat(formData.serviceAmount) || 0) - 
                            formData.payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0)
                          )}
                        </p>
                      </div>
                      
                      <button
                        type="button"
                        onClick={addPayment}
                        style={{
                          ...buttonStyle,
                          backgroundColor: '#10b981',
                          padding: '8px 12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                      >
                        <span>+</span> Add Another Payment
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  <label style={labelStyle}>Payment Status</label>
                  <input
                    type="text"
                    name="paymentStatus"
                    value={formData.paymentStatus}
                    onChange={handleChange}
                    style={inputStyle}
                    readOnly
                  />
                </div>

                <div>
                  <label style={labelStyle}>Author*</label>
                  <input
                    type="text"
                    name="author"
                    value={formData.author}
                    onChange={handleChange}
                    style={inputStyle}
                    required
                  />
                </div>

                <div>
                  <label style={labelStyle}>Lead Owner*</label>
                  <input
                    type="text"
                    name="leadOwner"
                    value={formData.leadOwner}
                    onChange={handleChange}
                    style={inputStyle}
                    required
                  />
                </div>

                <div>
                  <label style={labelStyle}>Closer*</label>
                  <input
                    type="text"
                    name="closer"
                    value={formData.closer}
                    onChange={handleChange}
                    style={inputStyle}
                    required
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    style={{ ...inputStyle, minHeight: '80px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button 
                  type="button" 
                  onClick={() => setShowEntryModal(false)}
                  style={{
                    ...buttonStyle,
                    backgroundColor: '#ef4444'
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  style={{
                    ...buttonStyle,
                    backgroundColor: '#10b981'
                  }}
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
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            width: '90%',
            maxWidth: '800px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '20px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              borderBottom: '1px solid #e2e8f0',
              paddingBottom: '10px'
            }}>
              <h3 style={{ margin: 0, fontSize: '20px' }}>Edit Sales Entry</h3>
              <button 
                onClick={() => setShowEditModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: '#64748b'
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                <div>
                  <label style={labelStyle}>Date*</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date ? formatDateToLocal(formData.date) : ''}
                    onChange={handleChange}
                    style={inputStyle}
                    required
                  />
                </div>

                <div>
                  <label style={labelStyle}>Payment Type*</label>
                  <select
                    name="paymentType"
                    value={formData.paymentType}
                    onChange={handleChange}
                    style={inputStyle}
                    required
                  >
                    <option value="full">Full Payment</option>
                    <option value="installment">Installment Payment</option>
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Service*</label>
                  <input
                    type="text"
                    name="service"
                    value={formData.service}
                    onChange={handleChange}
                    style={inputStyle}
                    required
                  />
                </div>

                <div>
                  <label style={labelStyle}>Service Amount*</label>
                  <input
                    type="number"
                    name="serviceAmount"
                    value={formData.serviceAmount}
                    onChange={handleChange}
                    style={inputStyle}
                    required
                    min="0"
                    step="0.01"
                  />
                </div>

                {formData.paymentType === 'full' ? (
                  <div>
                    <label style={labelStyle}>Full Payment Amount*</label>
                    <input
                      type="number"
                      name="fullPaymentAmount"
                      value={formData.fullPaymentAmount}
                      onChange={handleChange}
                      style={inputStyle}
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>
                ) : (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <h4 style={{ marginBottom: '10px' }}>Installment Payments</h4>
                    {formData.payments.map((payment, index) => (
                      <div key={index} style={{ 
                        display: 'grid', 
                        gridTemplateColumns: '1fr 1fr 1fr', 
                        gap: '20px',
                        marginBottom: '15px',
                        padding: '15px',
                        backgroundColor: '#f8fafc',
                        borderRadius: '4px',
                        position: 'relative'
                      }}>
                        <div>
                          <label style={labelStyle}>Payment {index + 1} Amount*</label>
                          <input
                            type="number"
                            value={payment.amount}
                            onChange={(e) => handlePaymentChange(index, 'amount', e.target.value)}
                            style={inputStyle}
                            required
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <div>
                          <label style={labelStyle}>Payment {index + 1} Date*</label>
                          <input
                            type="date"
                            value={payment.date ? formatDateToLocal(payment.date) : ''}
                            onChange={(e) => handlePaymentChange(index, 'date', e.target.value)}
                            style={inputStyle}
                            
                          />
                        </div>
                        <div>
                          <label style={labelStyle}>Payment Method*</label>
                          <select
                            value={payment.method || ''}
                            onChange={(e) => handlePaymentChange(index, 'method', e.target.value)}
                            style={inputStyle}
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
                        {(formData.payments.length > 1 || payment.id) && (
                          <button
                            type="button"
                            onClick={() => payment.id ? deletePayment(payment.id) : removePayment(index)}
                            style={{
                              ...buttonStyle,
                              backgroundColor: '#ef4444',
                              padding: '6px 10px',
                              position: 'absolute',
                              top: '5px',
                              right: '5px',
                              fontSize: '12px'
                            }}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                      <div>
                        <p style={{ margin: '5px 0', fontSize: '14px', color: '#64748b' }}>
                          Total Paid: {formatCurrency(
                            formData.payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0)
                          )}
                        </p>
                        <p style={{ margin: '5px 0', fontSize: '14px', color: '#64748b' }}>
                          Balance: {formatCurrency(
                            (parseFloat(formData.serviceAmount) || 0) - 
                            formData.payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0)
                          )}
                        </p>
                      </div>
                      
                      <button
                        type="button"
                        onClick={addPayment}
                        style={{
                          ...buttonStyle,
                          backgroundColor: '#10b981',
                          padding: '8px 12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                      >
                        <span>+</span> Add Another Payment
                      </button>
                    </div>
                  </div>
                )}

                {formData.paymentType === 'full' && (
                  <div>
                    <label style={labelStyle}>Payment Method*</label>
                    <select 
                      name="paymentMethod" 
                      value={formData.paymentMethod} 
                      onChange={handleChange} 
                      style={inputStyle}
                      
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
                  <label style={labelStyle}>Payment Status</label>
                  <input
                    type="text"
                    name="paymentStatus"
                    value={formData.paymentStatus}
                    onChange={handleChange}
                    style={inputStyle}
                    readOnly
                  />
                </div>

                <div>
                  <label style={labelStyle}>Author*</label>
                  <input
                    type="text"
                    name="author"
                    value={formData.author}
                    onChange={handleChange}
                    style={inputStyle}
                    required
                  />
                </div>

                <div>
                  <label style={labelStyle}>Lead Owner*</label>
                  <input
                    type="text"
                    name="leadOwner"
                    value={formData.leadOwner}
                    onChange={handleChange}
                    style={inputStyle}
                    required
                  />
                </div>

                <div>
                  <label style={labelStyle}>Closer*</label>
                  <input
                    type="text"
                    name="closer"
                    value={formData.closer}
                    onChange={handleChange}
                    style={inputStyle}
                    required
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    style={{ ...inputStyle, minHeight: '80px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button 
                  type="button" 
                  onClick={() => setShowEditModal(false)}
                  style={{
                    ...buttonStyle,
                    backgroundColor: '#ef4444'
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  style={{
                    ...buttonStyle,
                    backgroundColor: '#3b82f6'
                  }}
                >
                  Update Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
{showReceiptModal && selectedReceipt && (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  }}>
    <div style={{
      backgroundColor: '#fff',
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      width: '100%',
      maxWidth: '1000px',
      maxHeight: '100vh',
      overflowY: 'auto',
      padding: '20px'
    }}>
      {/* Printable Receipt Content */}
      <div id="receipt-content" style={{
        width: '100%',
        maxWidth: '800px',
        margin: '0 auto',
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
        border: '1px solid #ddd',
        backgroundColor: '#fff',
        marginTop: '20px',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <img 
            src="/receiptlogo.png" 
            alt="Company Logo" 
            style={{ height: '80px', marginBottom: '10px' }} 
          />
          <h1 style={{ margin: '5px 0', color: '#333' }}>Payment Receipt</h1>
          <p style={{ color: '#666', marginBottom: '5px' }}>411 Socials LLC</p>
          <p style={{ color: '#666', marginBottom: '20px' }}>116 E. Lafayette Street, Palmyra Missouri</p>
        </div>

        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          marginBottom: '30px',
          borderBottom: '1px solid #eee',
          paddingBottom: '15px'
        }}>
          <div>
            <p style={{ margin: '3px 0', fontWeight: 'bold' }}>Receipt #: {selectedReceipt.id || 'N/A'}</p>
            <p style={{ margin: '3px 0' }}>Date: {new Date(selectedReceipt.date).toLocaleDateString()}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: '3px 0', fontWeight: 'bold' }}>Status: {selectedReceipt.payment_status}</p>
            <p style={{ margin: '3px 0' }}>Type: {selectedReceipt.payment_type === 'full' ? 'Full Payment' : `${selectedReceipt.payments.length} Installments`}</p>
          </div>
        </div>
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          marginBottom: '30px',
          borderBottom: '1px solid #eee',
          paddingBottom: '15px'
        }}>
          <div>
            <p style={{ margin: '3px 0', fontWeight: 'bold' }}>Author Name:</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: '3px 0', fontWeight: 'bold' }}>{selectedReceipt.author || 'N/A'}</p>                
          </div>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '15px' }}>
            Payment Details
          </h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
            <tbody>
              <tr>
                <td style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>Service:</td>
                <td style={{ padding: '8px 0', borderBottom: '1px solid #eee', textAlign: 'right' }}>
                  {selectedReceipt.service}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>Service Amount:</td>
                <td style={{ padding: '8px 0', borderBottom: '1px solid #eee', textAlign: 'right' }}>
                  {formatCurrency(selectedReceipt.service_amount)}
                </td>
              </tr>

              {selectedReceipt.payment_type === 'full' ? (
                <>
                  <tr>
                    <td style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>Payment Method:</td>
                    <td style={{ padding: '8px 0', borderBottom: '1px solid #eee', textAlign: 'right' }}>
                      {selectedReceipt.payment_method || 'Not specified'}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>Amount Paid:</td>
                    <td style={{ padding: '8px 0', borderBottom: '1px solid #eee', textAlign: 'right' }}>
                      {formatCurrency(selectedReceipt.full_payment_amount)}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>Payment Date:</td>
                    <td style={{ padding: '8px 0', borderBottom: '1px solid #eee', textAlign: 'right' }}>
                      {new Date(selectedReceipt.date).toLocaleDateString()}
                    </td>
                  </tr>
                </>
              ) : (
                selectedReceipt.payments.map((payment, idx) => (
                  <React.Fragment key={idx}>
                    <tr>
                      <td style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>
                        Payment {idx + 1} Method:
                      </td>
                      <td style={{ padding: '8px 0', borderBottom: '1px solid #eee', textAlign: 'right' }}>
                        {payment.method || payment.payment_method || 'Not specified'}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>
                        Payment {idx + 1} Amount:
                      </td>
                      <td style={{ padding: '8px 0', borderBottom: '1px solid #eee', textAlign: 'right' }}>
                        {formatCurrency(payment.amount)}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>
                        Payment {idx + 1} Date:
                      </td>
                      <td style={{ padding: '8px 0', borderBottom: '1px solid #eee', textAlign: 'right' }}>
                        {new Date(payment.date).toLocaleDateString()}
                      </td>
                    </tr>
                    {idx < selectedReceipt.payments.length - 1 && (
                      <tr>
                        <td colSpan="2" style={{ padding: '8px 0' }}>
                          <hr style={{ borderTop: '1px dashed #ddd', margin: '10px 0' }} />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}

              <tr>
                <td style={{ padding: '8px 0', borderBottom: '1px solid #eee', fontWeight: 'bold' }}>Total Amount Paid:</td>
                <td style={{ padding: '8px 0', borderBottom: '1px solid #eee', textAlign: 'right', fontWeight: 'bold' }}>
                  {formatCurrency(
                    selectedReceipt.payment_type === 'full' 
                      ? selectedReceipt.full_payment_amount
                      : selectedReceipt.payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0)
                  )}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '8px 0', fontWeight: 'bold' }}>Balance:</td>
                <td style={{ padding: '8px 0', fontWeight: 'bold', textAlign: 'right' }}>
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
          <div style={{ 
              marginBottom: '20px', 
              padding: '15px', 
              backgroundColor: '#f8fafc', 
              borderRadius: '4px',
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center'
              }}>
              <h3 style={{ margin: 0 }}>Notes</h3>
              <p style={{ margin: 0 }}>{selectedReceipt.notes}</p>
          </div>
        )}

        <div style={{
          marginTop: '30px',
          paddingTop: '15px',
          borderTop: '1px solid #eee',
          textAlign: 'center',
          color: '#666',
          fontSize: '14px',
          lineHeight: '1.6',
        }}>
          <p><strong>Please make check payable to 411 Socials LLC</strong></p>
          <p style={{ marginTop: '10px' }}>
            For questions concerning this receipt, please contact:
          </p>
          <p>411 Socials LLC</p>
          <p>(636) 371-0602</p>
          <p>
            <a href="mailto:finance@411socials.space" style={{ color: '#4281f7', textDecoration: 'none' }}>
              finance@411socials.space
            </a>
          </p>
          <p>
            <a href="https://411socials.com/" target="_blank" rel="noopener noreferrer" style={{ color: '#4281f7', textDecoration: 'none' }}>
              https://411socials.com/
            </a>
          </p>
          <p style={{ marginTop: '15px' }}>Thank you for your business!</p>
          <p style={{ marginTop: '10px' }}>
            © {new Date().getFullYear()} 411 Socials LLC. All rights reserved.
          </p>
        </div>
      </div>

      <div style={{ 
        display: 'flex', 
        justifyContent: 'flex-end', 
        gap: '10px', 
        marginTop: '20px',
        borderTop: '1px solid #eee',
        paddingTop: '20px'
      }}>
        <button 
          onClick={printReceipt}
          style={{
            ...buttonStyle,
            backgroundColor: '#4f46e5'
          }}
        >
          Print Receipt
        </button>
        <button 
          onClick={() => setShowReceiptModal(false)}
          style={{
            ...buttonStyle,
            backgroundColor: '#64748b'
          }}
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}
      
     
    </div>
  );
}

const tdStyle = {
  border: '1px solid #e2e8f0',
  padding: '12px 15px',
  fontSize: '14px',
  color: '#334155'
};

export default SampleSalesReport;