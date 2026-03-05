// import { useState, useEffect } from 'react';
// import React from 'react';
// import { jsPDF } from 'jspdf';
// import 'jspdf-autotable';
// const API_URL = import.meta.env.VITE_API_URL;
// import { FaEye, FaPlus, FaEdit, FaTrash, FaSearch, FaFilter, FaFileExport, FaCalendarAlt, FaUser, FaBook, FaStore, FaPhone, FaEnvelope, FaStickyNote } from 'react-icons/fa';
// export default function AssignedTasks() {
//   const [grouped, setGroupedTransactions] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [showBookstoreForm, setShowBookstoreForm] = useState(false);
//   const [currentTransID, setCurrentTransID] = useState(null);
//   const [bookstoreData, setBookstoreData] = useState({
//     transID: '',
//     bookstore: '',
//     location: '',
//     quantity: '',
//     email: '',
//     phone: '',
//     owner: '',
//     date: '',
//     status: '',
//     agent: ''
//   });

//   const [bookstores, setBookstores] = useState([]);
//   const [showViewBookstoreModal, setShowViewBookstoreModal] = useState(false);
//   const [showEditBookstoreModal, setShowEditBookstoreModal] = useState(false);
  
//   const [selectedBookstoreData, setSelectedBookstoreData] = useState(null);
//   const [filteredData, setFilteredData] = useState({});
//   const [selectedYear, setSelectedYear] = useState('');
//   const [selectedMonth, setSelectedMonth] = useState('');
//   const [searchTerm, setSearchTerm] = useState('');

//   const [showCreateNBSPTransactionModal, setShowCreateNBSPTransactionModal] = useState(false);
//   const [newNBSPTransactionData, setNewNBSPTransactionData] = useState({
//     services: '',
//     authorName: '',
//     bookName: '',
//     remaining: '',
//     bookAvailability: '',
//     genre: '',
//     isbn: '',
//     emailAddress: '',
//     contactNumber: '',
//     targetStates: '',
//     notes: '',
//     agent: ''
//   });

//   const [showEditNBSPTransactionModal, setShowEditNBSPTransactionModal] = useState(false);
//   const [editingTransID, setEditingTransID] = useState(null);
//   const [editNBSPTransactionData, setEditNBSPTransactionData] = useState({
//     services: '',
//     authorName: '',
//     bookName: '',
//     date: '',
//     bookAvailability: '',
//     genre: '',
//     isbn: '',
//     emailAddress: '',
//     contactNumber: '',
//     targetStates: '',
//     notes: '',
//     agent: '',
//     remaining: ''
//   });

//   // Add pagination state
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage, setItemsPerPage] = useState(10);
//   const [totalPages, setTotalPages] = useState(1);

//   // Calculate groupedByDate
//   const calculateGroupedByDate = () => {
//     const searchLower = searchTerm.toLowerCase();
//     const filteredForSearch = Object.entries(filteredData).filter(([, entries]) => {
//       const leadName = entries[0]?.lead_name || '';
//       return leadName.toLowerCase().includes(searchLower);
//     });

//     const result = {};
//     filteredForSearch.forEach(([transID, entries]) => {
//       const main = entries[0];
//       const dateObj = main.date_nbsp_created ? new Date(main.date_nbsp_created) : null;

//       const dateKey = dateObj
//         ? `${dateObj.toLocaleString('default', { month: 'long' })} ${dateObj.getFullYear()}`
//         : 'N/A';

//       if (!result[dateKey]) {
//         result[dateKey] = [];
//       }

//       result[dateKey].push({ transID, entry: main });
//     });
    
//     return result;
//   };

//   // Calculate groupedByDate
//   const groupedByDate = calculateGroupedByDate();

//   // Calculate pagination
//   useEffect(() => {
//     if (Object.keys(groupedByDate).length > 0) {
//       // Calculate total items across all date groups
//       const totalItems = Object.values(groupedByDate).reduce(
//         (total, transactions) => total + transactions.length, 0
//       );
      
//       // Calculate total pages
//       const calculatedTotalPages = Math.ceil(totalItems / itemsPerPage);
//       setTotalPages(calculatedTotalPages);
      
//       // Reset to page 1 if current page exceeds total pages
//       if (currentPage > calculatedTotalPages && calculatedTotalPages > 0) {
//         setCurrentPage(1);
//       }
//     }
//   }, [groupedByDate, itemsPerPage, currentPage]);

//   // Get current page data
//   const getCurrentPageData = () => {
//     if (Object.keys(groupedByDate).length === 0) return {};
    
//     // Flatten all transactions across date groups
//     const allTransactions = [];
//     Object.entries(groupedByDate).forEach(([date, transactions]) => {
//       transactions.forEach(transaction => {
//         allTransactions.push({
//           ...transaction,
//           dateGroup: date
//         });
//       });
//     });
    
//     // Calculate start and end index
//     const startIndex = (currentPage - 1) * itemsPerPage;
//     const endIndex = startIndex + itemsPerPage;
    
//     // Get current page items
//     const currentItems = allTransactions.slice(startIndex, endIndex);
    
//     // Group back by date for rendering
//     const paginatedGroupedByDate = {};
//     currentItems.forEach(item => {
//       if (!paginatedGroupedByDate[item.dateGroup]) {
//         paginatedGroupedByDate[item.dateGroup] = [];
//       }
//       paginatedGroupedByDate[item.dateGroup].push(item);
//     });
    
//     return paginatedGroupedByDate;
//   };

//   // Handle page change
//   const handlePageChange = (pageNumber) => {
//     setCurrentPage(pageNumber);
//     // Scroll to top when page changes
//     window.scrollTo({ top: 0, behavior: 'smooth' });
//   };

//   // Handle items per page change
//   const handleItemsPerPageChange = (e) => {
//     setItemsPerPage(Number(e.target.value));
//     setCurrentPage(1); // Reset to first page when changing items per page
//   };

//   const paginatedData = getCurrentPageData();

//   // Fetch bookstores data
//   useEffect(() => {
//     const fetchBookstores = async () => {
//       try {
//         const response = await fetch(`${API_URL}/api/get-bookstores`);
//         if (!response.ok) throw new Error('Failed to fetch bookstores');
//         const data = await response.json();
//         setBookstores(data);
//       } catch (err) {
//         console.error('Error fetching bookstores:', err);
//       }
//     };

//     fetchBookstores();
//   }, []);

//   // Fetch transactions
//   useEffect(() => {
//     let isMounted = true;

//     const fetchTransactions = async () => {
//       try {
//         const response = await fetch(`${API_URL}/api/service-transactions`);
//         if (!response.ok) throw new Error('Failed to fetch transactions');
//         const data = await response.json();

//         if (isMounted) {
//           const grouped = data.reduce((acc, tx) => {
//             if (!acc[tx.transID]) acc[tx.transID] = [];
//             acc[tx.transID].push(tx);
//             return acc;
//           }, {});

//           setGroupedTransactions(grouped);
//           setFilteredData(grouped);
//         }
//       } catch (err) {
//         if (isMounted) setError(err.message);
//       } finally {
//         if (isMounted) setLoading(false);
//       }
//     };

//     fetchTransactions();

//     return () => {
//       isMounted = false;
//     };
//   }, []);

//   // Format date
//   const formatDate = (dateString) => {
//     if (!dateString) return '- -';
//     try {
//       return new Date(dateString).toLocaleDateString();
//     } catch {
//       return 'Invalid Date';
//     }
//   };

//   const handleBookstoreInputChange = (e) => {
//     const { name, value } = e.target;
//     setBookstoreData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   // Open bookstore form
//   const handleOpenBookstoreForm = (transID) => {
//     setCurrentTransID(transID);
//     setBookstoreData(prev => ({
//       ...prev,
//       transID: transID
//     }));
//     setShowBookstoreForm(true);
//   };

//   // Submit bookstore data
//   const handleBookstoreSubmit = async (e) => {
//     e.preventDefault();

//     const payload = {
//       transaction_id: currentTransID,
//       bookstore: bookstoreData.bookstore,
//       location: bookstoreData.location,
//       quantity: bookstoreData.quantity,
//       email: bookstoreData.email,
//       phone: bookstoreData.phone,
//       owner: bookstoreData.owner,
//       date: bookstoreData.date,
//       status: bookstoreData.status,
//       agent: bookstoreData.agent
//     };

//     try {
//       const response = await fetch(`${API_URL}/api/bookstore`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(payload)
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.error || 'Failed to submit bookstore data');
//       }

//       const data = await response.json();
//       console.log('Bookstore data submitted:', data);

//       // Reset form
//       setBookstoreData({
//         transaction_id: '',
//         bookstore: '',
//         location: '',
//         quantity: '',
//         email: '',
//         phone: '',
//         owner: '',
//         date: '',
//         status: '',
//         agent: ''
//       });
//       setShowBookstoreForm(false);
//       setCurrentTransID(null);
      
//       alert('Bookstore information saved successfully!');
      
//     } catch (error) {
//       console.error('Submission failed:', error);
//       alert(`Error: ${error.message}`);
//     }
//   };

//   const handleViewBookstore = (transID) => {
//     const matchedBookstores = bookstores.filter(b => b.transaction_id === transID);
//     if (matchedBookstores.length > 0) {
//       setSelectedBookstoreData(matchedBookstores);
//       setShowViewBookstoreModal(true);
//     } else {
//       alert('No bookstore information found for this transaction');
//     }
//   };

//   const handleEditBookstoreInputChange = (e) => {
//     const { name, value } = e.target;
//     setSelectedBookstoreData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const handleEditBookstoreSubmit = async (e) => {
//     e.preventDefault();

//     try {
//       const response = await fetch(`${API_URL}/api/bookstore/${selectedBookstoreData.id}`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(selectedBookstoreData)
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.error || 'Failed to update bookstore data');
//       }

//       const updated = await response.json();
//       console.log('Bookstore updated:', updated);

//       setShowEditBookstoreModal(false);
//       setSelectedBookstoreData(null);

//       alert('Bookstore updated successfully!');
//     } catch (error) {
//       console.error('Update failed:', error);
//       alert(`Error: ${error.message}`);
//     }
//   };

//   const handleDeleteBookstore = async (id) => {
//     const confirmDelete = window.confirm("Are you sure you want to delete this bookstore info?");
//     if (!confirmDelete) return;

//     try {
//       const response = await fetch(`${API_URL}/api/bookstore/${id}`, {
//         method: 'DELETE',
//       });

//       if (!response.ok) throw new Error("Failed to delete bookstore");

//       alert("Bookstore deleted successfully.");
//       setShowViewBookstoreModal(false);
//     } catch (err) {
//       console.error(err);
//       alert("Error deleting bookstore");
//     }
//   };

//   // Handle edit transaction
//   const handleEditNBSPTransaction = async (transID) => {
//     try {
//       setShowEditNBSPTransactionModal(true);
//       setEditingTransID(transID);
      
//       const response = await fetch(`${API_URL}/api/nbsp-edit/${transID}`);
//       if (!response.ok) throw new Error('Failed to fetch transaction');
      
//       const data = await response.json();
      
//       setEditNBSPTransactionData({
//         services: data.services || data.service_name || '',
//         authorName: data.authorName || data.lead_name || '',
//         bookName: data.bookName || data.book_name || '',
//         price: data.price || data.amount_pay || '',
//         bookAvailability: data.bookAvailability || data.book_availability_status || '',
//         genre: data.genre || data.book_genre || '',
//         isbn: data.isbn || data.book_isbn || '',
//         emailAddress: data.emailAddress || data.client_email || '',
//         contactNumber: data.contactNumber || data.client_phone || '',
//         targetStates: data.targetStates || data.target_states_count || '',
//         notes: data.notes || data.transaction_notes || '',
//         agent: data.agent || data.lead_owner || '',
//         date: data.date || data.transaction_date || '',
//         remaining: data.remaining || data.remaining || ''
//       });
      
//     } catch (error) {
//       console.error('Error fetching transaction:', error);
//       alert(`Error: ${error.message}`);
//       setShowEditNBSPTransactionModal(false);
//     }
//   };

//   const handleEditNBSPTransactionSubmit = async (e) => {
//     e.preventDefault();
    
//     try {
//       const response = await fetch(`${API_URL}/api/nbsp-transactions/${editingTransID}`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(editNBSPTransactionData)
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.error || 'Failed to update transaction');
//       }

//       // Refresh the transactions list
//       const fetchResponse = await fetch(`${API_URL}/api/service-transactions`);
//       if (!fetchResponse.ok) throw new Error('Failed to fetch transactions');
//       const data = await fetchResponse.json();

//       const grouped = data.reduce((acc, tx) => {
//         if (!acc[tx.transID]) acc[tx.transID] = [];
//         acc[tx.transID].push(tx);
//         return acc;
//       }, {});

//       setGroupedTransactions(grouped);
//       setFilteredData(grouped);
      
//       setShowEditNBSPTransactionModal(false);
//       setEditingTransID(null);
//       alert('Transaction updated successfully!');
      
//     } catch (error) {
//       console.error('Error updating transaction:', error);
//       alert(`Error: ${error.message}`);
//     }
//   };

//   const handleEditNBSPTransactionInputChange = (e) => {
//     const { name, value } = e.target;
//     setEditNBSPTransactionData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   // Handle delete transaction
//   const handleDeleteNBSPTransaction = async (transID) => {
//     if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    
//     try {
//       const response = await fetch(`${API_URL}/api/nbsp-transactions-delete/${transID}`, {
//         method: 'DELETE',
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.error || 'Failed to delete transaction');
//       }

//       // Refresh the transactions list
//       const fetchResponse = await fetch(`${API_URL}/api/service-transactions`);
//       if (!fetchResponse.ok) throw new Error('Failed to fetch transactions');
//       const data = await fetchResponse.json();

//       const grouped = data.reduce((acc, tx) => {
//         if (!acc[tx.transID]) acc[tx.transID] = [];
//         acc[tx.transID].push(tx);
//         return acc;
//       }, {});

//       setGroupedTransactions(grouped);
//       setFilteredData(grouped);
      
//       alert('Transaction deleted successfully!');
      
//     } catch (error) {
//       console.error('Error deleting transaction:', error);
//       alert(`Error: ${error.message}`);
//     }
//   };

//   // Handle new transaction input changes
//   const handleNBSPTransactionInputChange = (e) => {
//     const { name, value } = e.target;
//     setNewNBSPTransactionData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   // Handle new transaction submission
//   const handleNBSPTransactionSubmit = async (e) => {
//     e.preventDefault();
    
//     try {
//       const nbspTransactionData = {
//         date: newNBSPTransactionData.date,
//         services: newNBSPTransactionData.services,
//         authorName: newNBSPTransactionData.authorName,
//         bookName: newNBSPTransactionData.bookName,
//         bookAvailability: newNBSPTransactionData.bookAvailability,
//         genre: newNBSPTransactionData.genre,
//         isbn: newNBSPTransactionData.isbn,
//         emailAddress: newNBSPTransactionData.emailAddress,
//         contactNumber: newNBSPTransactionData.contactNumber,
//         targetStates: parseInt(newNBSPTransactionData.targetStates) || null,
//         notes: newNBSPTransactionData.notes,
//         agent: newNBSPTransactionData.agent,
//         remaining: parseInt(newNBSPTransactionData.remaining) || null,
//       };

//       const response = await fetch(`${API_URL}/api/nbsp-transactions`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(nbspTransactionData)
//       });

//       const responseData = await response.json();
      
//       if (!response.ok) {
//         throw new Error(responseData.message || 'NBSP transaction creation failed');
//       }

//       setShowCreateNBSPTransactionModal(false);
//       console.log('NBSP Transaction created:', responseData.transID);
      
//       // Reset form
//       setNewNBSPTransactionData({
//         services: '',
//         authorName: '',
//         bookName: '',
//         price: '',
//         bookAvailability: '',
//         genre: '',
//         isbn: '',
//         emailAddress: '',
//         contactNumber: '',
//         targetStates: '',
//         notes: '',
//         agent: '',
//         remaining: ''
//       });

//       // Refresh transactions
//       const fetchResponse = await fetch(`${API_URL}/api/service-transactions`);
//       if (!fetchResponse.ok) throw new Error('Failed to fetch transactions');
//       const data = await fetchResponse.json();

//       const grouped = data.reduce((acc, tx) => {
//         if (!acc[tx.transID]) acc[tx.transID] = [];
//         acc[tx.transID].push(tx);
//         return acc;
//       }, {});

//       setGroupedTransactions(grouped);
//       setFilteredData(grouped);

//     } catch (error) {
//       console.error('NBSP Transaction Error:', error);
//       alert(`Error: ${error.message}`);
//     }
//   };

//   // Apply filters
//   useEffect(() => {
//     const filterTransactions = () => {
//       if (!selectedYear) {
//         setFilteredData(grouped);
//         return;
//       }

//       const filtered = {};

//       Object.entries(grouped).forEach(([transID, entries]) => {
//         const entry = entries[0];
//         if (!entry.date_nbsp_created) return;

//         const transactionDate = new Date(entry.date_nbsp_created);
//         if (isNaN(transactionDate.getTime())) return;

//         const entryYear = transactionDate.getFullYear();
//         const entryMonth = transactionDate.getMonth();

//         const yearMatch = entryYear === parseInt(selectedYear);
//         const monthMatch = selectedMonth === '' || entryMonth === Number(selectedMonth);

//         if (yearMatch && monthMatch) {
//           filtered[transID] = entries;
//         }
//       });

//       setFilteredData(filtered);
//     };

//     filterTransactions();
//   }, [selectedYear, selectedMonth, grouped]);

//   const exportToPDF = () => {
//     const doc = new jsPDF();
    
//     doc.setFontSize(18);
//     doc.text('NBSP/INBSP Transactions Report', 14, 15);
    
//     doc.setFontSize(10);
    
//     let filterText = 'All time';
//     if (selectedYear && selectedMonth) {
//       filterText = `Filter: ${new Date(2000, selectedMonth).toLocaleString('default', { month: 'long' })} ${selectedYear}`;
//     } else if (selectedYear) {
//       filterText = `Filter: Year ${selectedYear}`;
//     } else if (selectedMonth) {
//       filterText = `Filter: ${new Date(2000, selectedMonth).toLocaleString('default', { month: 'long' })}`;
//     }
//     doc.text(filterText, 14, 25);

//     doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
    
//     const tableData = [];
//     const headers = [
//       'ID',
//       'Lead Name',
//       'Lead Owner',
//       'Status',
//       'Service',
//       'Transaction Date',
//       'Transferred To'
//     ];
    
//     Object.entries(filteredData).forEach(([transID, entries]) => {
//       const main = entries[0];
//       tableData.push([
//         transID,
//         main.lead_name || 'N/A',
//         main.lead_owner || 'N/A',
//         main.trans_status || 'N/A',
//         main.service_name || 'N/A',
//         formatDate(main.date_nbsp_created) || 'N/A',
//         main.lead_transferredTo || 'N/A'
//       ]);
//     });
    
//     doc.autoTable({
//       head: [headers],
//       body: tableData,
//       startY: 40,
//       styles: {
//         fontSize: 8,
//         cellPadding: 2,
//         overflow: 'linebreak'
//       },
//       headStyles: {
//         fillColor: [52, 152, 219],
//         textColor: 255,
//         fontStyle: 'bold'
//       },
//       alternateRowStyles: {
//         fillColor: [245, 245, 245]
//       }
//     });
    
//     doc.save(`nbsp-transactions-${new Date().toISOString().slice(0, 10)}.pdf`);
//   };

//   if (loading) return (
//     <div className="flex items-center justify-center h-screen text-lg text-gray-600">
//       Loading transactions...
//     </div>
//   );
  
//   if (error) return (
//     <div className="flex items-center justify-center h-screen text-lg text-red-500">
//       Error: {error}
//     </div>
//   );

//   return (
//     <div className="min-h-screen bg-gray-50 p-4 font-sans max-w-screen mx-auto">
//       {/* Header Section */}
//       <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
//         <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
//           {/* Title and Create Button */}
//           <div className="flex flex-col sm:flex-row sm:items-center gap-4">
//             <div className="flex items-center gap-4">
//               <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-xl shadow-md">
//                 <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
//                 </svg>
//               </div>
//               <div>
//                 <h1 className="text-2xl font-bold text-gray-800">
//                   NBSP/INBSP Transactions
//                 </h1>
//                 <p className="text-sm text-gray-500 mt-1">Manage your service transactions efficiently</p>
//               </div>
//             </div>
//           </div>
          
//           {/* Create Transaction Button */}
//           <button 
//             onClick={() => setShowCreateNBSPTransactionModal(true)}
//             className="bg-gradient-to-r from-green-500 to-green-600 text-white border-none py-3 px-6 rounded-xl cursor-pointer font-semibold transition-all duration-200 hover:from-green-600 hover:to-green-700 hover:shadow-lg flex items-center gap-2 shadow-md"
//           >
//             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
//             </svg>
//             Create Transaction
//           </button>
//         </div>
//       </div>

//       {/* Filters and Controls Section */}
//       <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
//         <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
//           <div className="flex-1">
//             <div className="relative">
//               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                 <FaSearch className="text-gray-400" />
//               </div>
//               <input
//                 type="text"
//                 placeholder="Search by Lead Name..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="pl-10 pr-4 py-3 w-full rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>
//           </div>
          
//           <div className="flex flex-col sm:flex-row gap-3">
//             {/* Items per page selector */}
//             <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200">
//               <label className="text-sm text-gray-600 font-medium">Show:</label>
//               <select
//                 value={itemsPerPage}
//                 onChange={handleItemsPerPageChange}
//                 className="p-1.5 rounded-lg border border-gray-200 bg-white cursor-pointer text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               >
//                 <option value="5">5</option>
//                 <option value="10">10</option>
//                 <option value="20">20</option>
//                 <option value="50">50</option>
//                 <option value="100">100</option>
//               </select>
//             </div>

//             {/* Year and Month Filters */}
//             <div className="flex gap-2 items-center bg-gray-50 p-2 rounded-lg border border-gray-200">
//               <div className="flex items-center text-gray-400">
//                 <FaFilter className="mr-1" />
//               </div>
//               <select
//                 value={selectedYear}
//                 onChange={(e) => setSelectedYear(e.target.value)}
//                 className="p-2 rounded-lg border border-gray-200 bg-white cursor-pointer text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               >
//                 <option value="">All Years</option>
//                 <option value="2023">2023</option>
//                 <option value="2024">2024</option>
//                 <option value="2025">2025</option>
//               </select>

//               <select
//                 value={selectedMonth}
//                 onChange={(e) => setSelectedMonth(e.target.value)}
//                 className="p-2 rounded-lg border border-gray-200 bg-white cursor-pointer text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               >
//                 <option value="">All Months</option>
//                 <option value="0">January</option>
//                 <option value="1">February</option>
//                 <option value="2">March</option>
//                 <option value="3">April</option>
//                 <option value="4">May</option>
//                 <option value="5">June</option>
//                 <option value="6">July</option>
//                 <option value="7">August</option>
//                 <option value="8">September</option>
//                 <option value="9">October</option>
//                 <option value="10">November</option>
//                 <option value="11">December</option>
//               </select>
//             </div>

//             {/* Export PDF Button */}
//             <button 
//               onClick={exportToPDF}
//               className="bg-gradient-to-r from-red-500 to-red-600 text-white border-none py-2.5 px-4 rounded-xl cursor-pointer font-semibold transition-all duration-200 hover:from-red-600 hover:to-red-700 hover:shadow-lg flex items-center gap-2 shadow-md"
//             >
//               <FaFileExport className="w-4 h-4" />
//               Export PDF
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Transactions Table */}
//       <div className="bg-white rounded-xl shadow-sm overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead>
//               <tr className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
//                 <th className="p-4 text-left font-medium">Author & Book</th>
//                 <th className="p-4 text-left font-medium">Bookstore Details</th>
//                 <th className="p-4 text-left font-medium">Status</th>
//                 <th className="p-4 text-left font-medium">Service & Date</th>
//                 <th className="p-4 text-left font-medium">Contact Info</th>
//                 <th className="p-4 text-left font-medium">Notes</th>
//                 <th className="p-4 text-center font-medium">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {Object.entries(paginatedData).length > 0 ? (
//                 Object.entries(paginatedData).map(([date, transactions]) => (
//                   <React.Fragment key={date}>
//                     {/* Date Group Header Row */}
//                     <tr className="bg-gray-50">
//                       <td colSpan="7" className="p-3 pl-4 font-semibold text-gray-700">
//                         <div className="flex items-center">
//                           <FaCalendarAlt className="mr-2 text-blue-500" />
//                           {date === 'N/A' ? 'No Transaction Date' : date}
//                         </div>
//                       </td>
//                     </tr>

//                     {/* Transactions in this date group */}
//                     {transactions.map(({ transID, entry }) => (
//                       <tr key={transID} className="border-b border-gray-100 transition-colors hover:bg-blue-50 even:bg-gray-50">
//                         <td className="p-4">
//                           <div className="flex items-start">
//                             <div className="bg-blue-100 p-2 rounded-lg mr-3">
//                               <FaUser className="text-blue-600" />
//                             </div>
//                             <div>
//                               <div className="font-medium text-gray-800">{entry.lead_name}</div>
//                               <div className="text-sm text-blue-600 mt-1 flex items-center break-words whitespace-normal max-w-[150px]">
//                                 <FaBook className="mr-1 text-xs" />
//                                 {entry.book_name || 'No book title'}
//                               </div>
//                             </div>
//                           </div>
//                         </td>
                        
//                         <td className="p-4">
//                           <div className="flex items-start">
//                             <div className="bg-purple-100 p-2 rounded-lg mr-3">
//                               <FaStore className="text-purple-600" />
//                             </div>
//                             <div>
//                               <div><span className="font-semibold">Offer:</span> {entry.target_states_count || 'N/A'}</div>
//                               <div className="text-blue-600 mt-1"><span className="font-semibold">Remaining:</span> {entry.remaining || 'N/A'}</div>
//                             </div>
//                           </div>
//                         </td>
                        
//                         <td className="p-4">
//                           <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
//                             entry.book_availability_status?.toLowerCase() === 'completed' 
//                               ? 'bg-green-100 text-green-800' 
//                               : entry.book_availability_status?.toLowerCase() === 'pending'
//                               ? 'bg-yellow-100 text-yellow-800'
//                               : 'bg-blue-100 text-blue-800'
//                           }`}>
//                             {entry.book_availability_status || '----'}
//                           </div>
//                         </td>
                        
//                         <td className="p-4">
//                           <div className="font-medium">{entry.service_name}</div>
//                           <div className="text-sm text-gray-500 mt-1">{formatDate(entry.date_nbsp_created)}</div>
//                         </td>
                        
//                         <td className="p-4">
//                           <div className="flex items-center mb-1">
//                             <FaPhone className="text-gray-400 mr-2 text-xs" />
//                             <span>{entry.client_phone || 'No phone'}</span>
//                           </div>
//                           <div className="flex items-center">
//                             <FaEnvelope className="text-gray-400 mr-2 text-xs" />
//                             <span className="text-sm text-blue-600 truncate max-w-[120px]">{entry.client_email || 'No email'}</span>
//                           </div>
//                         </td>

//                         <td className="p-4">
//                           <div className="flex items-start">
//                             <div className="bg-yellow-100 p-2 rounded-lg mr-3">
//                               <FaStickyNote className="text-yellow-600" />
//                             </div>
//                             <div className="text-sm text-gray-600 break-words max-w-[150px]">
//                               {entry.transaction_notes || 'No notes'}
//                             </div>
//                           </div>
//                         </td>

//                         <td className="p-4">
//                           <div className="flex gap-2 justify-center">
//                             <button 
//                               onClick={() => handleViewBookstore(transID)} 
//                               className="bg-blue-100 text-blue-600 p-2 rounded-lg hover:bg-blue-200 transition-colors"
//                               title="View Bookstore"
//                             >
//                               <FaEye />
//                             </button>
//                             <button 
//                               onClick={() => handleOpenBookstoreForm(transID)} 
//                               className="bg-green-100 text-green-600 p-2 rounded-lg hover:bg-green-200 transition-colors"
//                               title="Add Bookstore"
//                             >
//                               <FaPlus />
//                             </button>
//                             <button 
//                               onClick={() => handleEditNBSPTransaction(transID)} 
//                               className="bg-yellow-100 text-yellow-600 p-2 rounded-lg hover:bg-yellow-200 transition-colors"
//                               title="Edit Services"
//                             >
//                               <FaEdit />
//                             </button>
//                             <button 
//                               onClick={() => handleDeleteNBSPTransaction(transID)} 
//                               className="bg-red-100 text-red-600 p-2 rounded-lg hover:bg-red-200 transition-colors"
//                               title="Delete"
//                             >
//                               <FaTrash />
//                             </button>
//                           </div>
//                         </td>
//                       </tr>
//                     ))}
//                   </React.Fragment>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan="7" className="p-8 text-center">
//                     <div className="flex flex-col items-center justify-center text-gray-400 py-8">
//                       <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
//                       </svg>
//                       <p className="text-lg font-medium">No transactions found</p>
//                       <p className="text-sm mt-1">Try adjusting your search or filters</p>
//                     </div>
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>

//         {/* Pagination Controls */}
//         {totalPages > 1 && (
//           <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t border-gray-200 bg-gray-50">
//             <div className="text-sm text-gray-600 mb-4 sm:mb-0">
//               Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, Object.values(groupedByDate).reduce((total, transactions) => total + transactions.length, 0))} of {Object.values(groupedByDate).reduce((total, transactions) => total + transactions.length, 0)} entries
//             </div>
            
//             <div className="flex gap-1">
//               <button
//                 onClick={() => handlePageChange(1)}
//                 disabled={currentPage === 1}
//                 className={`px-3 py-1.5 rounded-lg border ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-blue-600 hover:bg-blue-50 shadow-sm'}`}
//               >
//                 First
//               </button>
              
//               <button
//                 onClick={() => handlePageChange(currentPage - 1)}
//                 disabled={currentPage === 1}
//                 className={`px-3 py-1.5 rounded-lg border ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-blue-600 hover:bg-blue-50 shadow-sm'}`}
//               >
//                 Previous
//               </button>
              
//               {/* Page numbers */}
//               {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
//                 let pageNumber;
//                 if (totalPages <= 5) {
//                   pageNumber = i + 1;
//                 } else if (currentPage <= 3) {
//                   pageNumber = i + 1;
//                 } else if (currentPage >= totalPages - 2) {
//                   pageNumber = totalPages - 4 + i;
//                 } else {
//                   pageNumber = currentPage - 2 + i;
//                 }
                
//                 return (
//                   <button
//                     key={pageNumber}
//                     onClick={() => handlePageChange(pageNumber)}
//                     className={`px-3 py-1.5 rounded-lg border ${currentPage === pageNumber ? 'bg-blue-500 text-white shadow-md' : 'bg-white text-blue-600 hover:bg-blue-50 shadow-sm'}`}
//                   >
//                     {pageNumber}
//                   </button>
//                 );
//               })}
              
//               <button
//                 onClick={() => handlePageChange(currentPage + 1)}
//                 disabled={currentPage === totalPages}
//                 className={`px-3 py-1.5 rounded-lg border ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-blue-600 hover:bg-blue-50 shadow-sm'}`}
//               >
//                 Next
//               </button>
              
//               <button
//                 onClick={() => handlePageChange(totalPages)}
//                 disabled={currentPage === totalPages}
//                 className={`px-3 py-1.5 rounded-lg border ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-blue-600 hover:bg-blue-50 shadow-sm'}`}
//               >
//                 Last
//               </button>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* View Bookstore Modal */}
//       {showViewBookstoreModal && selectedBookstoreData && (
//         <div className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-xl p-8 w-[95%] max-w-7xl max-h-[90vh] overflow-y-auto shadow-lg">
//             <div className="flex justify-between items-center mb-6 pb-3 border-b border-gray-200">
//               <h2 className="text-2xl font-bold text-gray-900 m-0">Bookstore Details</h2>
//               <button 
//                 onClick={() => setShowViewBookstoreModal(false)}
//                 className="bg-red-500 text-white border-none rounded px-3 py-1 text-sm cursor-pointer"
//               >
//                 Close
//               </button>
//             </div>

//             <div className="overflow-x-auto">
//               <table className="w-full border-collapse text-sm">
//                 <thead>
//                   <tr className="bg-blue-500 text-white">
//                     <th className="p-2 text-left font-medium">ID</th>
//                     <th className="p-2 text-left font-medium">Transaction ID</th>
//                     <th className="p-2 text-left font-medium">Bookstore Name</th>
//                     <th className="p-2 text-left font-medium">Location</th>
//                     <th className="p-2 text-left font-medium">Quantity</th>
//                     <th className="p-2 text-left font-medium">Email</th>
//                     <th className="p-2 text-left font-medium">Phone</th>
//                     <th className="p-2 text-left font-medium">Owner</th>
//                     <th className="p-2 text-left font-medium">Date</th>
//                     <th className="p-2 text-left font-medium">Status</th>
//                     <th className="p-2 text-left font-medium">Agent</th>
//                     <th className="p-2 text-left font-medium">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {Array.isArray(selectedBookstoreData) ? (
//                     selectedBookstoreData.map((bookstore, idx) => (
//                       <tr key={idx}>
//                         <td className="p-2">{bookstore.id || 'N/A'}</td>
//                         <td className="p-2">{bookstore.transaction_id || 'N/A'}</td>
//                         <td className="p-2">{bookstore.bookstore || 'N/A'}</td>
//                         <td className="p-2">{bookstore.location || 'N/A'}</td>
//                         <td className="p-2">{bookstore.quantity || 'N/A'}</td>
//                         <td className="p-2">{bookstore.email || 'N/A'}</td>
//                         <td className="p-2">{bookstore.phone || 'N/A'}</td>
//                         <td className="p-2">{bookstore.owner || 'N/A'}</td>
//                         <td className="p-2">{formatDate(bookstore.date) || 'N/A'}</td>
//                         <td className={`p-3 font-bold capitalize ${
//                           bookstore.status?.toLowerCase() === 'completed' ? 'text-green-600' : 
//                           bookstore.status?.toLowerCase() === 'active' ? 'text-blue-500' : 'text-yellow-500'
//                         }`}>
//                           {bookstore.status || 'N/A'}
//                         </td>
//                         <td className="p-3">{bookstore.agent || 'N/A'}</td>
//                         <td className="p-2">
//                           <div className="flex gap-2">
//                             <button 
//                               onClick={() => {
//                                 setSelectedBookstoreData(bookstore);
//                                 setShowEditBookstoreModal(true);
//                               }} 
//                               className="bg-transparent border-none text-gray-600 cursor-pointer"
//                               title="Edit Bookstore"
//                             >
//                               <FaEdit />
//                             </button>

//                             <button 
//                               onClick={() => handleDeleteBookstore(bookstore.id)} 
//                               title="Delete" 
//                               className="bg-transparent border-none cursor-pointer text-red-500" 
//                             >
//                               <FaTrash />
//                             </button>
//                           </div>
//                         </td>
//                       </tr>
//                     ))
//                   ) : (
//                     <tr>
//                       <td colSpan="12" className="text-center p-5">
//                         No bookstore data available
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>

//             <div className="flex justify-end mt-5 pt-4 border-t border-gray-200">
//               <button 
//                 onClick={() => setShowViewBookstoreModal(false)}
//                 className="bg-gray-500 text-white border-none py-2 px-5 rounded cursor-pointer font-medium transition-colors hover:bg-gray-600"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Bookstore Form Modal */}
//       {showBookstoreForm && (
//         <div className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-xl p-8 w-[95%] max-w-6xl max-h-[90vh] overflow-y-auto shadow-lg">
//             <div className="flex justify-between items-center mb-6 pb-3 border-b border-gray-200">
//               <h2 className="text-2xl font-bold text-gray-900 m-0">
//                 Add Bookstore Information {currentTransID && `(Transaction: ${currentTransID})`}
//               </h2>
//               <button 
//                 onClick={() => {
//                   setShowBookstoreForm(false);
//                   setCurrentTransID(null);
//                 }}
//                 className="bg-red-500 text-white border-none rounded px-3 py-1 text-sm cursor-pointer"
//               >
//                 Close
//               </button>
//             </div>

//             <form onSubmit={handleBookstoreSubmit}>
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
//                 <div>
//                   <div className="flex flex-col mb-4">
//                     <label className="text-sm font-medium mb-1">Bookstore Name</label>
//                     <input
//                       type="text"
//                       name="bookstore"
//                       value={bookstoreData.bookstore}
//                       onChange={handleBookstoreInputChange}
//                       className="p-3 text-sm rounded border border-gray-300"
//                     />
//                   </div>

//                   <div className="flex flex-col mb-4">
//                     <label className="text-sm font-medium mb-1">Location</label>
//                     <input
//                       type="text"
//                       name="location"
//                       value={bookstoreData.location}
//                       onChange={handleBookstoreInputChange}
//                       className="p-3 text-sm rounded border border-gray-300"
//                     />
//                   </div>

//                   <div className="flex flex-col mb-4">
//                     <label className="text-sm font-medium mb-1">Quantity</label>
//                     <input
//                       type="number"
//                       name="quantity"
//                       value={bookstoreData.quantity}
//                       onChange={handleBookstoreInputChange}
//                       className="p-3 text-sm rounded border border-gray-300"
//                     />
//                   </div>
//                 </div>

//                 <div>
//                   <div className="flex flex-col mb-4">
//                     <label className="text-sm font-medium mb-1">Email</label>
//                     <input
//                       type="email"
//                       name="email"
//                       value={bookstoreData.email}
//                       onChange={handleBookstoreInputChange}
//                       className="p-3 text-sm rounded border border-gray-300"
//                     />
//                   </div>

//                   <div className="flex flex-col mb-4">
//                     <label className="text-sm font-medium mb-1">Phone Number</label>
//                     <input
//                       type="tel"
//                       name="phone"
//                       value={bookstoreData.phone}
//                       onChange={handleBookstoreInputChange}
//                       className="p-3 text-sm rounded border border-gray-300"
//                     />
//                   </div>

//                   <div className="flex flex-col mb-4">
//                     <label className="text-sm font-medium mb-1">Owner</label>
//                     <input
//                       type="text"
//                       name="owner"
//                       value={bookstoreData.owner}
//                       onChange={handleBookstoreInputChange}
//                       className="p-3 text-sm rounded border border-gray-300"
//                     />
//                   </div>
//                 </div>

//                 <div>
//                   <div className="flex flex-col mb-4">
//                     <label className="text-sm font-medium mb-1">Date</label>
//                     <input
//                       type="date"
//                       name="date"
//                       value={bookstoreData.date}
//                       onChange={handleBookstoreInputChange}
//                       className="p-3 text-sm rounded border border-gray-300"
//                     />
//                   </div>

//                   <div className="flex flex-col mb-4">
//                     <label className="text-sm font-medium mb-1">Status</label>
//                     <select
//                       name="status"
//                       value={bookstoreData.status}
//                       onChange={handleBookstoreInputChange}
//                       className="p-3 text-sm rounded border border-gray-300"
//                     >
//                       <option value="">Select Status</option>
//                       <option value="Active">Active</option>
//                       <option value="Inactive">Inactive</option>
//                       <option value="Pending">Pending</option>
//                       <option value="Completed">Completed</option>
//                       <option value="Processing">Processing</option>
//                       <option value="On Hold">On Hold</option>
//                       <option value="Working On It">Working On It</option>
//                     </select>
//                   </div>

//                   <div className="flex flex-col mb-4">
//                     <label className="text-sm font-medium mb-1">Agent</label>
//                     <input
//                       type="text"
//                       name="agent"
//                       value={bookstoreData.agent}
//                       onChange={handleBookstoreInputChange}
//                       className="p-3 text-sm rounded border border-gray-300"
//                     />
//                   </div>
//                 </div>
//               </div>

//               <div className="flex justify-end gap-3 mt-8">
//                 <button 
//                   type="button"
//                   onClick={() => {
//                     setShowBookstoreForm(false);
//                     setCurrentTransID(null);
//                   }}
//                   className="bg-gray-300 text-gray-800 border-none py-2 px-4 rounded cursor-pointer font-medium"
//                 >
//                   Cancel
//                 </button>
//                 <button 
//                   type="submit"
//                   className="bg-blue-500 text-white border-none py-2 px-4 rounded cursor-pointer font-medium"
//                 >
//                   Submit
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {showEditBookstoreModal && selectedBookstoreData && (
//         <div className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-xl p-8 w-[95%] max-w-6xl max-h-[90vh] overflow-y-auto shadow-lg">
//             <div className="flex justify-between items-center mb-6 pb-3 border-b border-gray-200">
//               <h2 className="text-2xl font-bold text-gray-900 m-0">Edit Bookstore Information</h2>
//               <button 
//                 onClick={() => {
//                   setShowEditBookstoreModal(false);
//                   setSelectedBookstoreData(null);
//                 }}
//                 className="bg-red-500 text-white border-none rounded px-3 py-1 text-sm cursor-pointer"
//               >
//                 Close
//               </button>
//             </div>

//             <form onSubmit={handleEditBookstoreSubmit}>
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
//                 <div>
//                   <div className="flex flex-col mb-4">
//                     <label className="text-sm font-medium mb-1">Bookstore Name</label>
//                     <input
//                       type="text"
//                       name="bookstore"
//                       value={selectedBookstoreData.bookstore}
//                       onChange={handleEditBookstoreInputChange}
//                       required
//                       className="p-3 text-sm rounded border border-gray-300"
//                     />
//                   </div>

//                   <div className="flex flex-col mb-4">
//                     <label className="text-sm font-medium mb-1">Location</label>
//                     <input
//                       type="text"
//                       name="location"
//                       value={selectedBookstoreData.location}
//                       onChange={handleEditBookstoreInputChange}
//                       required
//                       className="p-3 text-sm rounded border border-gray-300"
//                     />
//                   </div>

//                   <div className="flex flex-col mb-4">
//                     <label className="text-sm font-medium mb-1">Quantity</label>
//                     <input
//                       type="number"
//                       name="quantity"
//                       value={selectedBookstoreData.quantity}
//                       onChange={handleEditBookstoreInputChange}
//                       required
//                       className="p-3 text-sm rounded border border-gray-300"
//                     />
//                   </div>
//                 </div>

//                 <div>
//                   <div className="flex flex-col mb-4">
//                     <label className="text-sm font-medium mb-1">Email</label>
//                     <input
//                       type="email"
//                       name="email"
//                       value={selectedBookstoreData.email}
//                       onChange={handleEditBookstoreInputChange}
//                       required
//                       className="p-3 text-sm rounded border border-gray-300"
//                     />
//                   </div>

//                   <div className="flex flex-col mb-4">
//                     <label className="text-sm font-medium mb-1">Phone</label>
//                     <input
//                       type="tel"
//                       name="phone"
//                       value={selectedBookstoreData.phone}
//                       onChange={handleEditBookstoreInputChange}
//                       required
//                       className="p-3 text-sm rounded border border-gray-300"
//                     />
//                   </div>

//                   <div className="flex flex-col mb-4">
//                     <label className="text-sm font-medium mb-1">Owner</label>
//                     <input
//                       type="text"
//                       name="owner"
//                       value={selectedBookstoreData.owner}
//                       onChange={handleEditBookstoreInputChange}
//                       required
//                       className="p-3 text-sm rounded border border-gray-300"
//                     />
//                   </div>
//                 </div>

//                 <div>
//                   <div className="flex flex-col mb-4">
//                     <label className="text-sm font-medium mb-1">Date</label>
//                     <input
//                       type="date"
//                       name="date"
//                       value={selectedBookstoreData.date?.slice(0, 10) || ''}
//                       onChange={handleEditBookstoreInputChange}
//                       required
//                       className="p-3 text-sm rounded border border-gray-300"
//                     />
//                   </div>

//                   <div className="flex flex-col mb-4">
//                     <label className="text-sm font-medium mb-1">Status</label>
//                     <select
//                       name="status"
//                       value={selectedBookstoreData.status}
//                       onChange={handleEditBookstoreInputChange}
//                       required
//                       className="p-3 text-sm rounded border border-gray-300"
//                     >
//                       <option value="">Select Status</option>
//                       <option value="Active">Active</option>
//                       <option value="Inactive">Inactive</option>
//                       <option value="Pending">Pending</option>
//                       <option value="Completed">Completed</option>
//                       <option value="Processing">Processing</option>
//                       <option value="On Hold">On Hold</option>
//                       <option value="Working On It">Working On It</option>
//                     </select>
//                   </div>

//                   <div className="flex flex-col mb-4">
//                     <label className="text-sm font-medium mb-1">Agent</label>
//                     <input
//                       type="text"
//                       name="agent"
//                       value={selectedBookstoreData.agent}
//                       onChange={handleEditBookstoreInputChange}
//                       required
//                       className="p-3 text-sm rounded border border-gray-300"
//                     />
//                   </div>
//                 </div>
//               </div>

//               <div className="flex justify-end gap-3 mt-8">
//                 <button 
//                   type="button"
//                   onClick={() => {
//                     setShowEditBookstoreModal(false);
//                     setSelectedBookstoreData(null);
//                   }}
//                   className="bg-gray-300 text-gray-800 border-none py-2 px-4 rounded cursor-pointer font-medium"
//                 >
//                   Cancel
//                 </button>
//                 <button 
//                   type="submit"
//                   className="bg-blue-500 text-white border-none py-2 px-4 rounded cursor-pointer font-medium"
//                 >
//                   Save Changes
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* Create NBSP Transaction Modal */}
//       {showCreateNBSPTransactionModal && (
//         <div className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-xl p-8 w-[95%] max-w-6xl max-h-[90vh] overflow-y-auto shadow-lg">
//             <div className="flex justify-between items-center mb-6 pb-3 border-b border-gray-200">
//               <h2 className="text-2xl font-bold text-gray-900 m-0">Create New NBSP Transaction</h2>
//               <button 
//                 onClick={() => setShowCreateNBSPTransactionModal(false)}
//                 className="bg-red-500 text-white border-none rounded px-3 py-1 text-sm cursor-pointer"
//               >
//                 Close
//               </button>
//             </div>

//             <form onSubmit={handleNBSPTransactionSubmit}>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//                 <div>
//                   <h3 className="text-lg font-semibold mb-3 border-b border-gray-300 pb-1 text-gray-700 col-span-full">General Information</h3>
//                   <div className="flex flex-col mb-4">
//                     <label className="text-sm font-medium mb-1">Date</label>
//                     <input
//                       type="date"
//                       name="date"
//                       value={newNBSPTransactionData.date}
//                       onChange={handleNBSPTransactionInputChange}
//                       className="p-3 text-sm rounded border border-gray-300"
//                     />
//                   </div>
                  
//                   <div className="flex flex-col mb-4">
//                     <label className="text-sm font-medium mb-1">Services</label>
//                     <input
//                       type="text"
//                       name="services"
//                       value={newNBSPTransactionData.services}
//                       onChange={handleNBSPTransactionInputChange}
//                       className="p-3 text-sm rounded border border-gray-300"
//                     />
//                   </div>

//                   <div className="flex flex-col mb-4">
//                     <label className="text-sm font-medium mb-1">Author Name</label>
//                     <input
//                       type="text"
//                       name="authorName"
//                       value={newNBSPTransactionData.authorName}
//                       onChange={handleNBSPTransactionInputChange}
//                       className="p-3 text-sm rounded border border-gray-300"
//                     />
//                   </div>

//                   <div className="flex flex-col mb-4">
//                     <label className="text-sm font-medium mb-1">Book Name</label>
//                     <input
//                       type="text"
//                       name="bookName"
//                       value={newNBSPTransactionData.bookName}
//                       onChange={handleNBSPTransactionInputChange}
//                       className="p-3 text-sm rounded border border-gray-300"
//                     />
//                   </div>

//                   <div className="flex flex-col mb-4">
//                     <label className="text-sm font-medium mb-1">Status</label>
//                     <select
//                       name="bookAvailability"
//                       value={newNBSPTransactionData.bookAvailability}
//                       onChange={handleNBSPTransactionInputChange}
//                       className="p-3 text-sm rounded border border-gray-300"
//                     >
//                       <option value="">Select Status</option>
//                       <option value="Fulfilled">Fulfilled</option>
//                       <option value="Pre-Fulfilled">Pre-Fulfilled</option>
//                       <option value="On-Hold">On-Hold</option>
//                       <option value="Pending">Pending</option>
//                     </select>
//                   </div>
//                   <div className="flex flex-col mb-4">
//                     <label className="text-sm font-medium mb-1">Agent</label>
//                     <input
//                       type="text"
//                       name="agent"
//                       value={newNBSPTransactionData.agent}
//                       onChange={handleNBSPTransactionInputChange}
//                       className="p-3 text-sm rounded border border-gray-300"
//                     />
//                   </div>
//                 </div>
                

//                 <div>
//                   <h3 className="text-lg font-semibold mb-3 border-b border-gray-300 pb-1 text-gray-700 col-span-full">Additional Information</h3>
                  
//                   <div className="flex flex-col mb-4">
//                     <label className="text-sm font-medium mb-1">Genre</label>
//                     <input
//                       type="text"
//                       name="genre"
//                       value={newNBSPTransactionData.genre}
//                       onChange={handleNBSPTransactionInputChange}
//                       className="p-3 text-sm rounded border border-gray-300"
//                     />
//                   </div>

//                   <div className="flex flex-col mb-4">
//                     <label className="text-sm font-medium mb-1">ISBN</label>
//                     <input
//                       type="text"
//                       name="isbn"
//                       value={newNBSPTransactionData.isbn}
//                       onChange={handleNBSPTransactionInputChange}
//                       className="p-3 text-sm rounded border border-gray-300"
//                     />
//                   </div>

//                   <div className="flex flex-col mb-4">
//                     <label className="text-sm font-medium mb-1">Email Address</label>
//                     <input
//                       type="email"
//                       name="emailAddress"
//                       value={newNBSPTransactionData.emailAddress}
//                       onChange={handleNBSPTransactionInputChange}
//                       className="p-3 text-sm rounded border border-gray-300"
//                     />
//                   </div>

//                   <div className="flex flex-col mb-4">
//                     <label className="text-sm font-medium mb-1">Contact Number</label>
//                     <input
//                       type="tel"
//                       name="contactNumber"
//                       value={newNBSPTransactionData.contactNumber}
//                       onChange={handleNBSPTransactionInputChange}
//                       className="p-3 text-sm rounded border border-gray-300"
//                     />
//                   </div>

//                   <div className="flex flex-col mb-4">
//                     <label className="text-sm font-medium mb-1"># of Target States</label>
//                     <input
//                       type="number"
//                       name="targetStates"
//                       value={newNBSPTransactionData.targetStates}
//                       onChange={handleNBSPTransactionInputChange}
//                       className="p-3 text-sm rounded border border-gray-300"
//                     />
//                   </div>
//                   <div className="flex flex-col mb-4">
//                     <label className="text-sm font-medium mb-1">Remaining</label>
//                     <input
//                       type="number"
//                       name="remaining"
//                       value={newNBSPTransactionData.remaining}
//                       onChange={handleNBSPTransactionInputChange}
//                       className="p-3 text-sm rounded border border-gray-300"
//                     />
//                   </div>
                  

//                   <div className="flex flex-col mb-4">
//                     <label className="text-sm font-medium mb-1">Notes</label>
//                     <textarea
//                       name="notes"
//                       value={newNBSPTransactionData.notes}
//                       onChange={handleNBSPTransactionInputChange}
//                       className="p-3 text-sm rounded border border-gray-300 min-h-[80px]"
//                     />
//                   </div>
//                 </div>
//               </div>

//               <div className="flex justify-end gap-3 mt-8">
//                 <button 
//                   type="button"
//                   onClick={() => setShowCreateNBSPTransactionModal(false)}
//                   className="bg-gray-300 text-gray-800 border-none py-2 px-4 rounded cursor-pointer font-medium"
//                 >
//                   Cancel
//                 </button>
//                 <button 
//                   type="submit"
//                   className="bg-blue-500 text-white border-none py-2 px-4 rounded cursor-pointer font-medium"
//                 >
//                   Create Transaction
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* Edit NBSP Transaction Modal */}
//       {showEditNBSPTransactionModal && (
//         <div className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-xl p-8 w-[95%] max-w-6xl max-h-[90vh] overflow-y-auto shadow-lg">
//             <div className="flex justify-between items-center mb-6 pb-3 border-b border-gray-200">
//               <h2 className="text-2xl font-bold text-gray-900 m-0">Edit NBSP Transaction</h2>
//               <button 
//                 onClick={() => setShowEditNBSPTransactionModal(false)}
//                 className="bg-red-500 text-white border-none rounded px-3 py-1 text-sm cursor-pointer"
//               >
//                 Close
//               </button>
//             </div>

//             <form onSubmit={handleEditNBSPTransactionSubmit}>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//                 <div>
//                   <h3 className="text-lg font-semibold mb-3 border-b border-gray-300 pb-1 text-gray-700 col-span-full">General Information</h3>
//                   <div className="flex flex-col mb-4">
//                     <label className="text-sm font-medium mb-1">Date</label>
//                     <input
//                       type="date"
//                       name="date"
//                       value={editNBSPTransactionData.date.split('T')[0]}
//                       onChange={handleEditNBSPTransactionInputChange}
//                       className="p-3 text-sm rounded border border-gray-300"
//                     />
//                   </div>
//                   <div className="flex flex-col mb-4">
//                     <label className="text-sm font-medium mb-1">Services</label>
//                     <input
//                       type="text"
//                       name="services"
//                       value={editNBSPTransactionData.services}
//                       onChange={handleEditNBSPTransactionInputChange}
//                       className="p-3 text-sm rounded border border-gray-300"
//                     />
//                   </div>

//                   <div className="flex flex-col mb-4">
//                     <label className="text-sm font-medium mb-1">Author Name</label>
//                     <input
//                       type="text"
//                       name="authorName"
//                       value={editNBSPTransactionData.authorName}
//                       onChange={handleEditNBSPTransactionInputChange}
//                       className="p-3 text-sm rounded border border-gray-300"
//                     />
//                   </div>

//                   <div className="flex flex-col mb-4">
//                     <label className="text-sm font-medium mb-1">Book Name</label>
//                     <input
//                       type="text"
//                       name="bookName"
//                       value={editNBSPTransactionData.bookName}
//                       onChange={handleEditNBSPTransactionInputChange}
//                       className="p-3 text-sm rounded border border-gray-300"
//                     />
//                   </div>

//                   <div className="flex flex-col mb-4">
//                     <label className="text-sm font-medium mb-1">Status</label>
//                     <select
//                       name="bookAvailability"
//                       value={editNBSPTransactionData.bookAvailability || ""}
//                       onChange={handleEditNBSPTransactionInputChange}
//                       className="p-3 text-sm rounded border border-gray-300"
//                     >
//                       <option value="">Select Status</option>
//                       <option value="Fulfilled">Fulfilled</option>
//                       <option value="Pre-Fulfilled">Pre-Fulfilled</option>
//                       <option value="On-Hold">On-Hold</option>
//                       <option value="Pending">Pending</option>
//                     </select>
//                   </div>
//                   <div className="flex flex-col mb-4">
//                     <label className="text-sm font-medium mb-1">Agent</label>
//                     <input
//                       type="text"
//                       name="agent"
//                       value={editNBSPTransactionData.agent}
//                       onChange={handleEditNBSPTransactionInputChange}
//                       className="p-3 text-sm rounded border border-gray-300"
//                     />
//                   </div>
//                 </div>

//                 <div>
//                   <h3 className="text-lg font-semibold mb-3 border-b border-gray-300 pb-1 text-gray-700 col-span-full">Additional Information</h3>
                  
//                   <div className="flex flex-col mb-4">
//                     <label className="text-sm font-medium mb-1">Genre</label>
//                     <input
//                       type="text"
//                       name="genre"
//                       value={editNBSPTransactionData.genre}
//                       onChange={handleEditNBSPTransactionInputChange}
//                       className="p-3 text-sm rounded border border-gray-300"
//                     />
//                   </div>

//                   <div className="flex flex-col mb-4">
//                     <label className="text-sm font-medium mb-1">ISBN</label>
//                     <input
//                       type="text"
//                       name="isbn"
//                       value={editNBSPTransactionData.isbn}
//                       onChange={handleEditNBSPTransactionInputChange}
//                       className="p-3 text-sm rounded border border-gray-300"
//                     />
//                   </div>

//                   <div className="flex flex-col mb-4">
//                     <label className="text-sm font-medium mb-1">Email Address</label>
//                     <input
//                       type="email"
//                       name="emailAddress"
//                       value={editNBSPTransactionData.emailAddress}
//                       onChange={handleEditNBSPTransactionInputChange}
//                       className="p-3 text-sm rounded border border-gray-300"
//                     />
//                   </div>

//                   <div className="flex flex-col mb-4">
//                     <label className="text-sm font-medium mb-1">Contact Number</label>
//                     <input
//                       type="tel"
//                       name="contactNumber"
//                       value={editNBSPTransactionData.contactNumber}
//                       onChange={handleEditNBSPTransactionInputChange}
//                       className="p-3 text-sm rounded border border-gray-300"
//                     />
//                   </div>

//                   <div className="flex flex-col mb-4">
//                     <label className="text-sm font-medium mb-1"># of Target States</label>
//                     <input
//                       type="number"
//                       name="targetStates"
//                       value={editNBSPTransactionData.targetStates}
//                       onChange={handleEditNBSPTransactionInputChange}
//                       className="p-3 text-sm rounded border border-gray-300"
//                     />
//                   </div>
//                   <div className="flex flex-col mb-4">
//                     <label className="text-sm font-medium mb-1">Remaining</label>
//                     <input
//                       type="number"
//                       name="remaining"
//                       value={editNBSPTransactionData.remaining}
//                       onChange={handleEditNBSPTransactionInputChange}
//                       className="p-3 text-sm rounded border border-gray-300"
//                     />
//                   </div>
                  

//                   <div className="flex flex-col mb-4">
//                     <label className="text-sm font-medium mb-1">Notes</label>
//                     <textarea
//                       name="notes"
//                       value={editNBSPTransactionData.notes}
//                       onChange={handleEditNBSPTransactionInputChange}
//                       className="p-3 text-sm rounded border border-gray-300 min-h-[80px]"
//                     />
//                   </div>
//                 </div>
//               </div>

//               <div className="flex justify-end gap-3 mt-8">
//                 <button 
//                   type="button"
//                   onClick={() => setShowEditNBSPTransactionModal(false)}
//                   className="bg-gray-300 text-gray-800 border-none py-2 px-4 rounded cursor-pointer font-medium"
//                 >
//                   Cancel
//                 </button>
//                 <button 
//                   type="submit"
//                   className="bg-blue-500 text-white border-none py-2 px-4 rounded cursor-pointer font-medium"
//                 >
//                   Update Transaction
//                 </button>
//                 <button 
//                   type="button"
//                   onClick={() => handleDeleteNBSPTransaction(editingTransID)}
//                   className="bg-red-500 text-white border-none py-2 px-4 rounded cursor-pointer font-medium hover:bg-red-700 ml-3"
//                 >
//                   Delete Transaction
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


import { useState, useEffect } from 'react';
import React from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
const API_URL = import.meta.env.VITE_API_URL;
import { FaEye, FaPlus, FaEdit, FaTrash, FaSearch, FaFilter, FaFileExport, FaCalendarAlt, FaUser, FaBook, FaStore, FaPhone, FaEnvelope, FaStickyNote } from 'react-icons/fa';

// Add date validation helper function
const validateAndFormatDate = (dateString) => {
  if (!dateString) return null;
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    
    // Format as YYYY-MM-DD
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error parsing date:', error);
    return null;
  }
};

export default function AssignedTasks() {
  const [grouped, setGroupedTransactions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBookstoreForm, setShowBookstoreForm] = useState(false);
  const [currentTransID, setCurrentTransID] = useState(null);
  const [bookstoreData, setBookstoreData] = useState({
    transID: '',
    bookstore: '',
    location: '',
    quantity: '',
    email: '',
    phone: '',
    owner: '',
    date: '',
    status: '',
    agent: ''
  });

  const [bookstores, setBookstores] = useState([]);
  const [showViewBookstoreModal, setShowViewBookstoreModal] = useState(false);
  const [showEditBookstoreModal, setShowEditBookstoreModal] = useState(false);
  
  const [selectedBookstoreData, setSelectedBookstoreData] = useState(null);
  const [filteredData, setFilteredData] = useState({});
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [showCreateNBSPTransactionModal, setShowCreateNBSPTransactionModal] = useState(false);
  const [newNBSPTransactionData, setNewNBSPTransactionData] = useState({
    services: '',
    authorName: '',
    bookName: '',
    remaining: '',
    bookAvailability: '',
    genre: '',
    isbn: '',
    emailAddress: '',
    contactNumber: '',
    targetStates: '',
    notes: '',
    agent: ''
  });

  const [showEditNBSPTransactionModal, setShowEditNBSPTransactionModal] = useState(false);
  const [editingTransID, setEditingTransID] = useState(null);
  const [editNBSPTransactionData, setEditNBSPTransactionData] = useState({
    services: '',
    authorName: '',
    bookName: '',
    date: '',
    bookAvailability: '',
    genre: '',
    isbn: '',
    emailAddress: '',
    contactNumber: '',
    targetStates: '',
    notes: '',
    agent: '',
    remaining: ''
  });

  // Add date error state
  const [dateError, setDateError] = useState('');

  // Add pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Calculate groupedByDate
  const calculateGroupedByDate = () => {
    const searchLower = searchTerm.toLowerCase();
    const filteredForSearch = Object.entries(filteredData).filter(([, entries]) => {
      const leadName = entries[0]?.lead_name || '';
      return leadName.toLowerCase().includes(searchLower);
    });

    const result = {};
    filteredForSearch.forEach(([transID, entries]) => {
      const main = entries[0];
      const dateObj = main.date_nbsp_created ? new Date(main.date_nbsp_created) : null;

      const dateKey = dateObj
        ? `${dateObj.toLocaleString('default', { month: 'long' })} ${dateObj.getFullYear()}`
        : 'N/A';

      if (!result[dateKey]) {
        result[dateKey] = [];
      }

      result[dateKey].push({ transID, entry: main });
    });
    
    return result;
  };

  // Calculate groupedByDate
  const groupedByDate = calculateGroupedByDate();

  // Calculate pagination
  useEffect(() => {
    if (Object.keys(groupedByDate).length > 0) {
      // Calculate total items across all date groups
      const totalItems = Object.values(groupedByDate).reduce(
        (total, transactions) => total + transactions.length, 0
      );
      
      // Calculate total pages
      const calculatedTotalPages = Math.ceil(totalItems / itemsPerPage);
      setTotalPages(calculatedTotalPages);
      
      // Reset to page 1 if current page exceeds total pages
      if (currentPage > calculatedTotalPages && calculatedTotalPages > 0) {
        setCurrentPage(1);
      }
    }
  }, [groupedByDate, itemsPerPage, currentPage]);

  // Get current page data
  const getCurrentPageData = () => {
    if (Object.keys(groupedByDate).length === 0) return {};
    
    // Flatten all transactions across date groups
    const allTransactions = [];
    Object.entries(groupedByDate).forEach(([date, transactions]) => {
      transactions.forEach(transaction => {
        allTransactions.push({
          ...transaction,
          dateGroup: date
        });
      });
    });
    
    // Calculate start and end index
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    // Get current page items
    const currentItems = allTransactions.slice(startIndex, endIndex);
    
    // Group back by date for rendering
    const paginatedGroupedByDate = {};
    currentItems.forEach(item => {
      if (!paginatedGroupedByDate[item.dateGroup]) {
        paginatedGroupedByDate[item.dateGroup] = [];
      }
      paginatedGroupedByDate[item.dateGroup].push(item);
    });
    
    return paginatedGroupedByDate;
  };

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle items per page change
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const paginatedData = getCurrentPageData();

  // Fetch bookstores data
  useEffect(() => {
    const fetchBookstores = async () => {
      try {
        const response = await fetch(`${API_URL}/api/get-bookstores`);
        if (!response.ok) throw new Error('Failed to fetch bookstores');
        const data = await response.json();
        setBookstores(data);
      } catch (err) {
        console.error('Error fetching bookstores:', err);
      }
    };

    fetchBookstores();
  }, []);

  // Fetch transactions
  useEffect(() => {
    let isMounted = true;

    const fetchTransactions = async () => {
      try {
        const response = await fetch(`${API_URL}/api/service-transactions`);
        if (!response.ok) throw new Error('Failed to fetch transactions');
        const data = await response.json();

        if (isMounted) {
          const grouped = data.reduce((acc, tx) => {
            if (!acc[tx.transID]) acc[tx.transID] = [];
            acc[tx.transID].push(tx);
            return acc;
          }, {});

          setGroupedTransactions(grouped);
          setFilteredData(grouped);
        }
      } catch (err) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchTransactions();

    return () => {
      isMounted = false;
    };
  }, []);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '- -';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Invalid Date';
    }
  };

  const InfoRow = ({ label, value, type = 'text', badge = false }) => {
  if (!value || value === 'N/A') {
    return (
      <div>
        <label className="text-sm font-medium text-gray-600 block mb-1">{label}</label>
        <span className="text-gray-400 italic">Not available</span>
      </div>
    );
  }

  const getStatusColor = (status) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'completed') return 'bg-green-100 text-green-800';
    if (statusLower === 'active') return 'bg-blue-100 text-blue-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  return (
    <div>
      <label className="text-sm font-medium text-gray-600 block mb-1">{label}</label>
      {badge ? (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(value)}`}>
          {value}
        </span>
      ) : (
        <span className="text-gray-900 break-words">
          {type === 'email' ? (
            <a href={`mailto:${value}`} className="text-blue-600 hover:text-blue-800 hover:underline">
              {value}
            </a>
          ) : type === 'phone' ? (
            <a href={`tel:${value}`} className="text-blue-600 hover:text-blue-800 hover:underline">
              {value}
            </a>
          ) : (
            value
          )}
        </span>
      )}
    </div>
  );
};
  const handleBookstoreInputChange = (e) => {
    const { name, value } = e.target;
    
    // Validate date input
    if (name === 'date') {
      const formattedDate = validateAndFormatDate(value);
      if (value && !formattedDate) {
        setDateError('Please enter a valid date (YYYY-MM-DD)');
      } else {
        setDateError('');
      }
    }
    
    setBookstoreData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Open bookstore form
  const handleOpenBookstoreForm = (transID) => {
    setCurrentTransID(transID);
    setBookstoreData(prev => ({
      ...prev,
      transID: transID,
      date: '' // Reset date when opening form
    }));
    setDateError(''); // Clear any previous errors
    setShowBookstoreForm(true);
  };

  // Submit bookstore data - FIXED
  const handleBookstoreSubmit = async (e) => {
    e.preventDefault();

    // Validate date before submission
    const formattedDate = validateAndFormatDate(bookstoreData.date);
    if (bookstoreData.date && !formattedDate) {
      alert('Please enter a valid date');
      return;
    }

    const payload = {
      transaction_id: currentTransID,
      bookstore: bookstoreData.bookstore,
      location: bookstoreData.location,
      quantity: bookstoreData.quantity || 0, // Ensure number type
      email: bookstoreData.email,
      phone: bookstoreData.phone,
      owner: bookstoreData.owner,
      date: formattedDate, // Use validated date
      status: bookstoreData.status,
      agent: bookstoreData.agent,
      state: bookstoreData.state || '',
      zipcode: bookstoreData.zipcode || ''
    };

    try {
      const response = await fetch(`${API_URL}/api/bookstore`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit bookstore data');
      }

      const data = await response.json();
      console.log('Bookstore data submitted:', data);

      // Reset form
      setBookstoreData({
        transID: '',
        bookstore: '',
        location: '',
        quantity: '',
        email: '',
        phone: '',
        owner: '',
        date: '',
        status: '',
        agent: '',
        state: '',
        zipcode: ''
      });
      setShowBookstoreForm(false);
      setCurrentTransID(null);
      setDateError('');
      
      alert('Bookstore information saved successfully!');
      
    } catch (error) {
      console.error('Submission failed:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleViewBookstore = (transID) => {
    const matchedBookstores = bookstores.filter(b => b.transaction_id === transID);
    if (matchedBookstores.length > 0) {
      setSelectedBookstoreData(matchedBookstores);
      setShowViewBookstoreModal(true);
    } else {
      alert('No bookstore information found for this transaction');
    }
  };

  const handleEditBookstoreInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedBookstoreData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Edit bookstore submit - FIXED
  const handleEditBookstoreSubmit = async (e) => {
  e.preventDefault();

  // Validate date before submission
  const formattedDate = validateAndFormatDate(selectedBookstoreData.date);
  if (selectedBookstoreData.date && !formattedDate) {
    alert('Please enter a valid date');
    return;
  }

  try {
    const response = await fetch(`${API_URL}/api/bookstore/${selectedBookstoreData.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...selectedBookstoreData,
        date: formattedDate // Use validated date
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update bookstore data');
    }

    const updated = await response.json();
    console.log('Bookstore updated:', updated);

    // Refresh the bookstores data
    const bookstoresResponse = await fetch(`${API_URL}/api/get-bookstores`);
    if (!bookstoresResponse.ok) throw new Error('Failed to fetch bookstores');
    const bookstoresData = await bookstoresResponse.json();
    setBookstores(bookstoresData);

    // Also refresh the view modal data if it's open
    if (showViewBookstoreModal) {
      const matchedBookstores = bookstoresData.filter(b => b.transaction_id === selectedBookstoreData.transaction_id);
      if (matchedBookstores.length > 0) {
        setSelectedBookstoreData(matchedBookstores);
      }
    }

    setShowEditBookstoreModal(false);
    setSelectedBookstoreData(null);

    alert('Bookstore updated successfully!');
  } catch (error) {
    console.error('Update failed:', error);
    alert(`Error: ${error.message}`);
  }
};

  const handleDeleteBookstore = async (id) => {
  const confirmDelete = window.confirm("Are you sure you want to delete this bookstore info?");
  if (!confirmDelete) return;

  try {
    const response = await fetch(`${API_URL}/api/bookstore/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) throw new Error("Failed to delete bookstore");

    // Refresh the bookstores data
    const bookstoresResponse = await fetch(`${API_URL}/api/get-bookstores`);
    if (!bookstoresResponse.ok) throw new Error('Failed to fetch bookstores');
    const bookstoresData = await bookstoresResponse.json();
    setBookstores(bookstoresData);

    // Close the view modal since the data is deleted
    setShowViewBookstoreModal(false);
    
    alert("Bookstore deleted successfully.");
  } catch (err) {
    console.error(err);
    alert("Error deleting bookstore");
  }
};

  // Handle edit transaction
  const handleEditNBSPTransaction = async (transID) => {
    try {
      setShowEditNBSPTransactionModal(true);
      setEditingTransID(transID);
      
      const response = await fetch(`${API_URL}/api/nbsp-edit/${transID}`);
      if (!response.ok) throw new Error('Failed to fetch transaction');
      
      const data = await response.json();
      
      setEditNBSPTransactionData({
        services: data.services || data.service_name || '',
        authorName: data.authorName || data.lead_name || '',
        bookName: data.bookName || data.book_name || '',
        price: data.price || data.amount_pay || '',
        bookAvailability: data.bookAvailability || data.book_availability_status || '',
        genre: data.genre || data.book_genre || '',
        isbn: data.isbn || data.book_isbn || '',
        emailAddress: data.emailAddress || data.client_email || '',
        contactNumber: data.contactNumber || data.client_phone || '',
        targetStates: data.targetStates || data.target_states_count || '',
        notes: data.notes || data.transaction_notes || '',
        agent: data.agent || data.lead_owner || '',
        date: data.date || data.transaction_date || '',
        remaining: data.remaining || data.remaining || ''
      });
      
    } catch (error) {
      console.error('Error fetching transaction:', error);
      alert(`Error: ${error.message}`);
      setShowEditNBSPTransactionModal(false);
    }
  };

  const handleEditNBSPTransactionSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`${API_URL}/api/nbsp-transactions/${editingTransID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editNBSPTransactionData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update transaction');
      }

      // Refresh the transactions list
      const fetchResponse = await fetch(`${API_URL}/api/service-transactions`);
      if (!fetchResponse.ok) throw new Error('Failed to fetch transactions');
      const data = await fetchResponse.json();

      const grouped = data.reduce((acc, tx) => {
        if (!acc[tx.transID]) acc[tx.transID] = [];
        acc[tx.transID].push(tx);
        return acc;
      }, {});

      setGroupedTransactions(grouped);
      setFilteredData(grouped);
      
      setShowEditNBSPTransactionModal(false);
      setEditingTransID(null);
      alert('Transaction updated successfully!');
      
    } catch (error) {
      console.error('Error updating transaction:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleEditNBSPTransactionInputChange = (e) => {
    const { name, value } = e.target;
    setEditNBSPTransactionData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle delete transaction
  const handleDeleteNBSPTransaction = async (transID) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    
    try {
      const response = await fetch(`${API_URL}/api/nbsp-transactions-delete/${transID}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete transaction');
      }

      // Refresh the transactions list
      const fetchResponse = await fetch(`${API_URL}/api/service-transactions`);
      if (!fetchResponse.ok) throw new Error('Failed to fetch transactions');
      const data = await fetchResponse.json();

      const grouped = data.reduce((acc, tx) => {
        if (!acc[tx.transID]) acc[tx.transID] = [];
        acc[tx.transID].push(tx);
        return acc;
      }, {});

      setGroupedTransactions(grouped);
      setFilteredData(grouped);
      
      alert('Transaction deleted successfully!');
      
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert(`Error: ${error.message}`);
    }
  };

  // Handle new transaction input changes
  const handleNBSPTransactionInputChange = (e) => {
    const { name, value } = e.target;
    setNewNBSPTransactionData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle new transaction submission
  const handleNBSPTransactionSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const nbspTransactionData = {
        date: newNBSPTransactionData.date,
        services: newNBSPTransactionData.services,
        authorName: newNBSPTransactionData.authorName,
        bookName: newNBSPTransactionData.bookName,
        bookAvailability: newNBSPTransactionData.bookAvailability,
        genre: newNBSPTransactionData.genre,
        isbn: newNBSPTransactionData.isbn,
        emailAddress: newNBSPTransactionData.emailAddress,
        contactNumber: newNBSPTransactionData.contactNumber,
        targetStates: parseInt(newNBSPTransactionData.targetStates) || null,
        notes: newNBSPTransactionData.notes,
        agent: newNBSPTransactionData.agent,
        remaining: parseInt(newNBSPTransactionData.remaining) || null,
      };

      const response = await fetch(`${API_URL}/api/nbsp-transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nbspTransactionData)
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.message || 'NBSP transaction creation failed');
      }

      setShowCreateNBSPTransactionModal(false);
      console.log('NBSP Transaction created:', responseData.transID);
      
      // Reset form
      setNewNBSPTransactionData({
        services: '',
        authorName: '',
        bookName: '',
        price: '',
        bookAvailability: '',
        genre: '',
        isbn: '',
        emailAddress: '',
        contactNumber: '',
        targetStates: '',
        notes: '',
        agent: '',
        remaining: ''
      });

      // Refresh transactions
      const fetchResponse = await fetch(`${API_URL}/api/service-transactions`);
      if (!fetchResponse.ok) throw new Error('Failed to fetch transactions');
      const data = await fetchResponse.json();

      const grouped = data.reduce((acc, tx) => {
        if (!acc[tx.transID]) acc[tx.transID] = [];
        acc[tx.transID].push(tx);
        return acc;
      }, {});

      setGroupedTransactions(grouped);
      setFilteredData(grouped);

    } catch (error) {
      console.error('NBSP Transaction Error:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const FormField = ({ 
  label, 
  type = 'text', 
  name, 
  value, 
  onChange, 
  placeholder, 
  required = false,
  options = [],
  rows = 3,
  min,
  ...props 
}) => {
  const inputBaseClasses = "w-full p-4 text-sm rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white shadow-sm";
  
  return (
    <div className="flex flex-col">
      <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      
      {type === 'select' ? (
        <select
          name={name}
          value={value}
          onChange={onChange}
          className={`${inputBaseClasses} appearance-none bg-white`}
          required={required}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          className={`${inputBaseClasses} resize-none`}
          required={required}
          {...props}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={inputBaseClasses}
          required={required}
          min={min}
          {...props}
        />
      )}
    </div>
  );
};

  // Apply filters
  useEffect(() => {
    const filterTransactions = () => {
      if (!selectedYear) {
        setFilteredData(grouped);
        return;
      }

      const filtered = {};

      Object.entries(grouped).forEach(([transID, entries]) => {
        const entry = entries[0];
        if (!entry.date_nbsp_created) return;

        const transactionDate = new Date(entry.date_nbsp_created);
        if (isNaN(transactionDate.getTime())) return;

        const entryYear = transactionDate.getFullYear();
        const entryMonth = transactionDate.getMonth();

        const yearMatch = entryYear === parseInt(selectedYear);
        const monthMatch = selectedMonth === '' || entryMonth === Number(selectedMonth);

        if (yearMatch && monthMatch) {
          filtered[transID] = entries;
        }
      });

      setFilteredData(filtered);
    };

    filterTransactions();
  }, [selectedYear, selectedMonth, grouped]);

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('NBSP/INBSP Transactions Report', 14, 15);
    
    doc.setFontSize(10);
    
    let filterText = 'All time';
    if (selectedYear && selectedMonth) {
      filterText = `Filter: ${new Date(2000, selectedMonth).toLocaleString('default', { month: 'long' })} ${selectedYear}`;
    } else if (selectedYear) {
      filterText = `Filter: Year ${selectedYear}`;
    } else if (selectedMonth) {
      filterText = `Filter: ${new Date(2000, selectedMonth).toLocaleString('default', { month: 'long' })}`;
    }
    doc.text(filterText, 14, 25);

    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
    
    const tableData = [];
    const headers = [
      'ID',
      'Lead Name',
      'Lead Owner',
      'Status',
      'Service',
      'Transaction Date',
      'Transferred To'
    ];
    
    Object.entries(filteredData).forEach(([transID, entries]) => {
      const main = entries[0];
      tableData.push([
        transID,
        main.lead_name || 'N/A',
        main.lead_owner || 'N/A',
        main.trans_status || 'N/A',
        main.service_name || 'N/A',
        formatDate(main.date_nbsp_created) || 'N/A',
        main.lead_transferredTo || 'N/A'
      ]);
    });
    
    doc.autoTable({
      head: [headers],
      body: tableData,
      startY: 40,
      styles: {
        fontSize: 8,
        cellPadding: 2,
        overflow: 'linebreak'
      },
      headStyles: {
        fillColor: [52, 152, 219],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      }
    });
    
    doc.save(`nbsp-transactions-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen text-lg text-gray-600">
      Loading transactions...
    </div>
  );
  
  if (error) return (
    <div className="flex items-center justify-center h-screen text-lg text-red-500">
      Error: {error}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 font-sans max-w-screen mx-auto">
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Title and Create Button */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-xl shadow-md">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  NBSP/INBSP Transactions
                </h1>
                <p className="text-sm text-gray-500 mt-1">Manage your service transactions efficiently</p>
              </div>
            </div>
          </div>
          
          {/* Create Transaction Button */}
          <button 
            onClick={() => setShowCreateNBSPTransactionModal(true)}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white border-none py-3 px-6 rounded-xl cursor-pointer font-semibold transition-all duration-200 hover:from-green-600 hover:to-green-700 hover:shadow-lg flex items-center gap-2 shadow-md"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Transaction
          </button>
        </div>
      </div>

      {/* Filters and Controls Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by Lead Name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 w-full rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Items per page selector */}
            <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200">
              <label className="text-sm text-gray-600 font-medium">Show:</label>
              <select
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
                className="p-1.5 rounded-lg border border-gray-200 bg-white cursor-pointer text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>

            {/* Year and Month Filters */}
            <div className="flex gap-2 items-center bg-gray-50 p-2 rounded-lg border border-gray-200">
              <div className="flex items-center text-gray-400">
                <FaFilter className="mr-1" />
              </div>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="p-2 rounded-lg border border-gray-200 bg-white cursor-pointer text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Years</option>
                <option value="2023">2023</option>
                <option value="2024">2024</option>
                <option value="2025">2025</option>
              </select>

              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="p-2 rounded-lg border border-gray-200 bg-white cursor-pointer text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Months</option>
                <option value="0">January</option>
                <option value="1">February</option>
                <option value="2">March</option>
                <option value="3">April</option>
                <option value="4">May</option>
                <option value="5">June</option>
                <option value="6">July</option>
                <option value="7">August</option>
                <option value="8">September</option>
                <option value="9">October</option>
                <option value="10">November</option>
                <option value="11">December</option>
              </select>
            </div>

            {/* Export PDF Button */}
            <button 
              onClick={exportToPDF}
              className="bg-gradient-to-r from-red-500 to-red-600 text-white border-none py-2.5 px-4 rounded-xl cursor-pointer font-semibold transition-all duration-200 hover:from-red-600 hover:to-red-700 hover:shadow-lg flex items-center gap-2 shadow-md"
            >
              <FaFileExport className="w-4 h-4" />
              Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <th className="p-4 text-left font-medium">Author & Book</th>
                <th className="p-4 text-left font-medium">Bookstore Details</th>
                <th className="p-4 text-left font-medium">Status</th>
                <th className="p-4 text-left font-medium">Service & Date</th>
                <th className="p-4 text-left font-medium">Contact Info</th>
                <th className="p-4 text-left font-medium">Notes</th>
                <th className="p-4 text-center font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(paginatedData).length > 0 ? (
                Object.entries(paginatedData).map(([date, transactions]) => (
                  <React.Fragment key={date}>
                    {/* Date Group Header Row */}
                    <tr className="bg-gray-50">
                      <td colSpan="7" className="p-3 pl-4 font-semibold text-gray-700">
                        <div className="flex items-center">
                          <FaCalendarAlt className="mr-2 text-blue-500" />
                          {date === 'N/A' ? 'No Transaction Date' : date}
                        </div>
                      </td>
                    </tr>

                    {/* Transactions in this date group */}
                    {transactions.map(({ transID, entry }) => (
                      <tr key={transID} className="border-b border-gray-100 transition-colors hover:bg-blue-50 even:bg-gray-50">
                        <td className="p-4">
                          <div className="flex items-start">
                            <div className="bg-blue-100 p-2 rounded-lg mr-3">
                              <FaUser className="text-blue-600" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-800">{entry.lead_name}</div>
                              <div className="text-sm text-blue-600 mt-1 flex items-center break-words whitespace-normal max-w-[150px]">
                                <FaBook className="mr-1 text-xs" />
                                {entry.book_name || 'No book title'}
                              </div>
                            </div>
                          </div>
                        </td>
                        
                        <td className="p-4">
                          <div className="flex items-start">
                            <div className="bg-purple-100 p-2 rounded-lg mr-3">
                              <FaStore className="text-purple-600" />
                            </div>
                            <div>
                              <div><span className="font-semibold">Offer:</span> {entry.target_states_count || 0}</div>
                              <div className="text-blue-600 mt-1"><span className="font-semibold">Remaining:</span> {entry.remaining || 0}</div>
                            </div>
                          </div>
                        </td>
                        
                        <td className="p-4">
                          <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            entry.book_availability_status?.toLowerCase() === 'completed' 
                              ? 'bg-green-100 text-green-800' 
                              : entry.book_availability_status?.toLowerCase() === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {entry.book_availability_status || '----'}
                          </div>
                        </td>
                        
                        <td className="p-4">
                          <div className="font-medium">{entry.service_name}</div>
                          <div className="text-sm text-gray-500 mt-1">{formatDate(entry.date_nbsp_created)}</div>
                        </td>
                        
                        <td className="p-4">
                          <div className="flex items-center mb-1">
                            <FaPhone className="text-gray-400 mr-2 text-xs" />
                            <span>{entry.client_phone || 'No phone'}</span>
                          </div>
                          <div className="flex items-center">
                            <FaEnvelope className="text-gray-400 mr-2 text-xs" />
                            <span className="text-sm text-blue-600 truncate max-w-[120px]">{entry.client_email || 'No email'}</span>
                          </div>
                        </td>

                        <td className="p-4">
                          <div className="flex items-start">
                            <div className="bg-yellow-100 p-2 rounded-lg mr-3">
                              <FaStickyNote className="text-yellow-600" />
                            </div>
                            <div className="text-sm text-gray-600 break-words max-w-[150px]">
                              {entry.transaction_notes || 'No notes'}
                            </div>
                          </div>
                        </td>

                        <td className="p-4">
                          <div className="flex gap-2 justify-center">
                            <button 
                              onClick={() => handleViewBookstore(transID)} 
                              className="bg-blue-100 text-blue-600 p-2 rounded-lg hover:bg-blue-200 transition-colors"
                              title="View Bookstore"
                            >
                              <FaEye />
                            </button>
                            <button 
                              onClick={() => handleOpenBookstoreForm(transID)} 
                              className="bg-green-100 text-green-600 p-2 rounded-lg hover:bg-green-200 transition-colors"
                              title="Add Bookstore"
                            >
                              <FaPlus />
                            </button>
                            <button 
                              onClick={() => handleEditNBSPTransaction(transID)} 
                              className="bg-yellow-100 text-yellow-600 p-2 rounded-lg hover:bg-yellow-200 transition-colors"
                              title="Edit Services"
                            >
                              <FaEdit />
                            </button>
                            <button 
                              onClick={() => handleDeleteNBSPTransaction(transID)} 
                              className="bg-red-100 text-red-600 p-2 rounded-lg hover:bg-red-200 transition-colors"
                              title="Delete"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="p-8 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400 py-8">
                      <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <p className="text-lg font-medium">No transactions found</p>
                      <p className="text-sm mt-1">Try adjusting your search or filters</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-600 mb-4 sm:mb-0">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, Object.values(groupedByDate).reduce((total, transactions) => total + transactions.length, 0))} of {Object.values(groupedByDate).reduce((total, transactions) => total + transactions.length, 0)} entries
            </div>
            
            <div className="flex gap-1">
              <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className={`px-3 py-1.5 rounded-lg border ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-blue-600 hover:bg-blue-50 shadow-sm'}`}
              >
                First
              </button>
              
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1.5 rounded-lg border ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-blue-600 hover:bg-blue-50 shadow-sm'}`}
              >
                Previous
              </button>
              
              {/* Page numbers */}
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
                    onClick={() => handlePageChange(pageNumber)}
                    className={`px-3 py-1.5 rounded-lg border ${currentPage === pageNumber ? 'bg-blue-500 text-white shadow-md' : 'bg-white text-blue-600 hover:bg-blue-50 shadow-sm'}`}
                  >
                    {pageNumber}
                  </button>
                );
              })}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1.5 rounded-lg border ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-blue-600 hover:bg-blue-50 shadow-sm'}`}
              >
                Next
              </button>
              
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1.5 rounded-lg border ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-blue-600 hover:bg-blue-50 shadow-sm'}`}
              >
                Last
              </button>
            </div>
          </div>
        )}
      </div>

      {/* View Bookstore Modal */}
      {showViewBookstoreModal && selectedBookstoreData && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-[95%] max-w-8xl max-h-[95vh] overflow-y-auto shadow-2xl border border-gray-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Bookstore Details</h2>
                  <p className="text-blue-100 text-sm">
                    {Array.isArray(selectedBookstoreData) 
                      ? `${selectedBookstoreData.length} bookstore(s) found` 
                      : 'Viewing bookstore information'
                    }
                  </p>
                </div>
                <button 
                  onClick={() => setShowViewBookstoreModal(false)}
                  className="bg-white/20 hover:bg-white/30 text-white border-none rounded-full w-10 h-10 flex items-center justify-center cursor-pointer transition-all duration-200 backdrop-blur-sm"
                  title="Close"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              {Array.isArray(selectedBookstoreData) ? (
                <div className="space-y-6">
                  {selectedBookstoreData.map((bookstore, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-md transition-all duration-200">
                      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {/* Basic Information */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
                          <div className="space-y-2">
                            <InfoRow label="Bookstore Name:" value={bookstore.bookstore} />
                            <InfoRow label="Owner:" value={bookstore.owner} />
                            <InfoRow label="Agent:" value={bookstore.agent} />
                            <InfoRow label="Status:" value={bookstore.status} badge />
                          </div>
                        </div>

                        {/* Contact Details */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Contact Details</h3>
                          <div className="space-y-3">
                            <InfoRow label="Email:" value={bookstore.email} type="email" />
                            <InfoRow label="Phone:" value={bookstore.phone} type="phone" />
                            <div>
                              <label className="text-sm font-medium text-gray-600 block mb-1">Location:</label>
                              <div className="text-gray-900">
                                <div>{bookstore.location || 'N/A'}</div>
                                {bookstore.state && bookstore.zipcode && (
                                  <div className="text-sm text-gray-600 mt-1">
                                    {bookstore.state}, {bookstore.zipcode}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Transaction Details */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Transaction Details</h3>
                          <div className="space-y-3">
                            <InfoRow label="Quantity:" value={bookstore.quantity} />
                            <InfoRow label="Date:" value={formatDate(bookstore.date)} />
                            {/* <InfoRow label="Transaction ID" value={bookstore.transaction_id} /> */}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                        <button 
                          onClick={() => {
                            setSelectedBookstoreData(bookstore);
                            setShowEditBookstoreModal(true);
                          }} 
                          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 font-medium"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteBookstore(bookstore.id)} 
                          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 font-medium"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No bookstore data available</h3>
                  <p className="text-gray-500">Please check back later or add new bookstore information.</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-8 py-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  {Array.isArray(selectedBookstoreData) && `${selectedBookstoreData.length} items`}
                </span>
                <button 
                  onClick={() => setShowViewBookstoreModal(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white border-none py-3 px-8 rounded-xl cursor-pointer font-medium transition-colors duration-200"
                >
                  Close Window
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Bookstore Modal - ENHANCED */}
{showBookstoreForm && (
  <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden shadow-2xl border border-gray-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Add Bookstore Information
            </h2>
            <p className="text-blue-100 text-sm">
              {currentTransID ? `Transaction: ${currentTransID}` : 'Fill in the bookstore details below'}
            </p>
          </div>
          <button 
            onClick={() => {
              setShowBookstoreForm(false);
              setCurrentTransID(null);
              setDateError('');
            }}
            className="bg-white/20 hover:bg-white/30 text-white border-none rounded-full w-10 h-10 flex items-center justify-center cursor-pointer transition-all duration-200 backdrop-blur-sm"
            title="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Form Content */}
      <div className="p-8 max-h-[70vh] overflow-y-auto">
        <form onSubmit={handleBookstoreSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Column 1: Basic Information */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-600 rounded-lg p-2">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-700 mb-2">Bookstore Name *</label>
                <input
                  type="text"
                  name="bookstore"
                  value={bookstoreData.bookstore}
                  onChange={handleBookstoreInputChange}
                  placeholder="Enter bookstore name"
                  className="w-full p-4 text-sm rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white shadow-sm"
                  required
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-700 mb-2">Location *</label>
                <input
                  type="text"
                  name="location"
                  value={bookstoreData.location}
                  onChange={handleBookstoreInputChange}
                  placeholder="Enter location"
                  className="w-full p-4 text-sm rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white shadow-sm"
                  required
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-700 mb-2">State *</label>
                <input
                  type="text"
                  name="state"
                  value={bookstoreData.state}
                  onChange={handleBookstoreInputChange}
                  placeholder="Enter state"
                  className="w-full p-4 text-sm rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white shadow-sm"
                  required
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-700 mb-2">Zip Code *</label>
                <input
                  type="text"
                  name="zipcode"
                  value={bookstoreData.zipcode}
                  onChange={handleBookstoreInputChange}
                  placeholder="Enter zip code"
                  className="w-full p-4 text-sm rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white shadow-sm"
                  required
                />
              </div>
            </div>

            {/* Column 2: Contact Information */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-green-600 rounded-lg p-2">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={bookstoreData.email}
                  onChange={handleBookstoreInputChange}
                  placeholder="bookstore@example.com"
                  className="w-full p-4 text-sm rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white shadow-sm"
                  required
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={bookstoreData.phone}
                  onChange={handleBookstoreInputChange}
                  placeholder="+1 (555) 123-4567"
                  className="w-full p-4 text-sm rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white shadow-sm"
                  required
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-700 mb-2">Owner *</label>
                <input
                  type="text"
                  name="owner"
                  value={bookstoreData.owner}
                  onChange={handleBookstoreInputChange}
                  placeholder="Enter owner's name"
                  className="w-full p-4 text-sm rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white shadow-sm"
                  required
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-700 mb-2">Quantity *</label>
                <input
                  type="number"
                  name="quantity"
                  value={bookstoreData.quantity}
                  onChange={handleBookstoreInputChange}
                  placeholder="0"
                  min="0"
                  className="w-full p-4 text-sm rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white shadow-sm"
                  required
                />
              </div>
            </div>

            {/* Column 3: Transaction Details */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-purple-600 rounded-lg p-2">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Transaction Details</h3>
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-700 mb-2">Date *</label>
                <input
                  type="date"
                  name="date"
                  value={bookstoreData.date}
                  onChange={handleBookstoreInputChange}
                  className="w-full p-4 text-sm rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white shadow-sm"
                  required
                />
                {dateError && (
                  <div className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg p-3 mt-2 flex items-center gap-2">
                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    {dateError}
                  </div>
                )}
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-700 mb-2">Status *</label>
                <select
                  name="status"
                  value={bookstoreData.status}
                  onChange={handleBookstoreInputChange}
                  className="w-full p-4 text-sm rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white shadow-sm appearance-none pr-10"
                  required
                >
                  <option value="">Select Status</option>
                  <option value="Active">🟢 Active</option>
                  <option value="Inactive">🔴 Inactive</option>
                  <option value="Pending">🟡 Pending</option>
                  <option value="Completed">✅ Completed</option>
                  <option value="Processing">🔄 Processing</option>
                  <option value="On Hold">⏸️ On Hold</option>
                  <option value="Working On It">👨‍💻 Working On It</option>
                </select>
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-700 mb-2">Agent *</label>
                <input
                  type="text"
                  name="agent"
                  value={bookstoreData.agent}
                  onChange={handleBookstoreInputChange}
                  placeholder="Assign agent"
                  className="w-full p-4 text-sm rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white shadow-sm"
                  required
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
            <button 
              type="button"
              onClick={() => {
                setShowBookstoreForm(false);
                setCurrentTransID(null);
                setDateError('');
              }}
              className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white border-none py-3 px-6 rounded-xl cursor-pointer font-medium transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel
            </button>
            <button 
              type="submit"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white border-none py-3 px-8 rounded-xl cursor-pointer font-medium transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Bookstore
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
)}

      {/* Edit Bookstore Modal - ENHANCED */}
{showEditBookstoreModal && selectedBookstoreData && (
  <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden shadow-2xl border border-gray-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Edit Bookstore Information</h2>
            <p className="text-blue-100 text-sm">
              Update details for {selectedBookstoreData.bookstore || 'this bookstore'}
            </p>
          </div>
          <button 
            onClick={() => {
              setShowEditBookstoreModal(false);
              setSelectedBookstoreData(null);
            }}
            className="bg-white/20 hover:bg-white/30 text-white border-none rounded-full w-10 h-10 flex items-center justify-center cursor-pointer transition-all duration-200 backdrop-blur-sm"
            title="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Form Content */}
      <div className="p-8 max-h-[70vh] overflow-y-auto">
        <form onSubmit={handleEditBookstoreSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Column 1: Basic Information */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-600 rounded-lg p-2">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-700 mb-2">Bookstore Name *</label>
                <input
                  type="text"
                  name="bookstore"
                  value={selectedBookstoreData.bookstore || ''}
                  onChange={handleEditBookstoreInputChange}
                  placeholder="Enter bookstore name"
                  className="w-full p-4 text-sm rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white shadow-sm"
                  required
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-700 mb-2">Location *</label>
                <input
                  type="text"
                  name="location"
                  value={selectedBookstoreData.location || ''}
                  onChange={handleEditBookstoreInputChange}
                  placeholder="Enter location"
                  className="w-full p-4 text-sm rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white shadow-sm"
                  required
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-700 mb-2">State *</label>
                <input
                  type="text"
                  name="state"
                  value={selectedBookstoreData.state || ''}
                  onChange={handleEditBookstoreInputChange}
                  placeholder="Enter state"
                  className="w-full p-4 text-sm rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white shadow-sm"
                  required
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-700 mb-2">Zip Code *</label>
                <input
                  type="text"
                  name="zipcode"
                  value={selectedBookstoreData.zipcode || ''}
                  onChange={handleEditBookstoreInputChange}
                  placeholder="Enter zip code"
                  className="w-full p-4 text-sm rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white shadow-sm"
                  required
                />
              </div>
            </div>

            {/* Column 2: Contact Information */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-green-600 rounded-lg p-2">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={selectedBookstoreData.email || ''}
                  onChange={handleEditBookstoreInputChange}
                  placeholder="bookstore@example.com"
                  className="w-full p-4 text-sm rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white shadow-sm"
                  required
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-700 mb-2">Phone *</label>
                <input
                  type="tel"
                  name="phone"
                  value={selectedBookstoreData.phone || ''}
                  onChange={handleEditBookstoreInputChange}
                  placeholder="+1 (555) 123-4567"
                  className="w-full p-4 text-sm rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white shadow-sm"
                  required
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-700 mb-2">Owner *</label>
                <input
                  type="text"
                  name="owner"
                  value={selectedBookstoreData.owner || ''}
                  onChange={handleEditBookstoreInputChange}
                  placeholder="Enter owner's name"
                  className="w-full p-4 text-sm rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white shadow-sm"
                  required
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-700 mb-2">Quantity *</label>
                <input
                  type="number"
                  name="quantity"
                  value={selectedBookstoreData.quantity || ''}
                  onChange={handleEditBookstoreInputChange}
                  placeholder="0"
                  min="0"
                  className="w-full p-4 text-sm rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white shadow-sm"
                  required
                />
              </div>
            </div>

            {/* Column 3: Transaction Details */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-purple-600 rounded-lg p-2">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Transaction Details</h3>
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-700 mb-2">Date *</label>
                <input
                  type="date"
                  name="date"
                  value={selectedBookstoreData.date ? selectedBookstoreData.date.split('T')[0] : ''}
                  onChange={handleEditBookstoreInputChange}
                  className="w-full p-4 text-sm rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white shadow-sm"
                  required
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-700 mb-2">Status *</label>
                <select
                  name="status"
                  value={selectedBookstoreData.status || ''}
                  onChange={handleEditBookstoreInputChange}
                  className="w-full p-4 text-sm rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white shadow-sm appearance-none pr-10"
                  required
                >
                  <option value="">Select Status</option>
                  <option value="Active">🟢 Active</option>
                  <option value="Inactive">🔴 Inactive</option>
                  <option value="Pending">🟡 Pending</option>
                  <option value="Completed">✅ Completed</option>
                  <option value="Processing">🔄 Processing</option>
                  <option value="On Hold">⏸️ On Hold</option>
                  <option value="Working On It">👨‍💻 Working On It</option>
                </select>
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-700 mb-2">Agent *</label>
                <input
                  type="text"
                  name="agent"
                  value={selectedBookstoreData.agent || ''}
                  onChange={handleEditBookstoreInputChange}
                  placeholder="Assign agent"
                  className="w-full p-4 text-sm rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white shadow-sm"
                  required
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
            <button 
              type="button"
              onClick={() => {
                setShowEditBookstoreModal(false);
                setSelectedBookstoreData(null);
              }}
              className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white border-none py-3 px-6 rounded-xl cursor-pointer font-medium transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel
            </button>
            <button 
              type="submit"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white border-none py-3 px-8 rounded-xl cursor-pointer font-medium transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
)}

      {/* Create NBSP Transaction Modal */}
      {showCreateNBSPTransactionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden shadow-2xl border border-gray-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Create New NBSP Transaction</h2>
                  <p className="text-blue-100 text-sm">Fill in the transaction details below</p>
                </div>
                <button 
                  onClick={() => setShowCreateNBSPTransactionModal(false)}
                  className="bg-white/20 hover:bg-white/30 text-white border-none rounded-full w-10 h-10 flex items-center justify-center cursor-pointer transition-all duration-200 backdrop-blur-sm"
                  title="Close"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Form Content */}
            <div className="p-8 max-h-[70vh] overflow-y-auto">
              <form onSubmit={handleNBSPTransactionSubmit} className="space-y-8">
                {/* General Information Section */}
                <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-blue-600 rounded-lg p-2">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">General Information</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      label="Date"
                      type="date"
                      name="date"
                      value={newNBSPTransactionData.date}
                      onChange={handleNBSPTransactionInputChange}
                      required
                    />
                    
                    <FormField
                      label="Services"
                      type="text"
                      name="services"
                      value={newNBSPTransactionData.services}
                      onChange={handleNBSPTransactionInputChange}
                      placeholder="Enter services required"
                    />

                    <FormField
                      label="Author Name"
                      type="text"
                      name="authorName"
                      value={newNBSPTransactionData.authorName}
                      onChange={handleNBSPTransactionInputChange}
                      placeholder="Enter author's full name"
                    />

                    <FormField
                      label="Book Name"
                      type="text"
                      name="bookName"
                      value={newNBSPTransactionData.bookName}
                      onChange={handleNBSPTransactionInputChange}
                      placeholder="Enter book title"
                    />

                    <FormField
                      label="Status"
                      type="select"
                      name="bookAvailability"
                      value={newNBSPTransactionData.bookAvailability}
                      onChange={handleNBSPTransactionInputChange}
                      options={[
                        { value: "", label: "Select Status" },
                        { value: "Fulfilled", label: "Fulfilled" },
                        { value: "Pre-Fulfilled", label: "Pre-Fulfilled" },
                        { value: "On-Hold", label: "On-Hold" },
                        { value: "Pending", label: "Pending" }
                      ]}
                    />

                    <FormField
                      label="Agent"
                      type="text"
                      name="agent"
                      value={newNBSPTransactionData.agent}
                      onChange={handleNBSPTransactionInputChange}
                      placeholder="Assign agent"
                    />
                  </div>
                </div>

                {/* Additional Information Section */}
                <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-green-600 rounded-lg p-2">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Additional Information</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      label="Genre"
                      type="text"
                      name="genre"
                      value={newNBSPTransactionData.genre}
                      onChange={handleNBSPTransactionInputChange}
                      placeholder="Book genre/category"
                    />

                    <FormField
                      label="ISBN"
                      type="text"
                      name="isbn"
                      value={newNBSPTransactionData.isbn}
                      onChange={handleNBSPTransactionInputChange}
                      placeholder="Enter ISBN number"
                    />

                    <FormField
                      label="Email Address"
                      type="email"
                      name="emailAddress"
                      value={newNBSPTransactionData.emailAddress}
                      onChange={handleNBSPTransactionInputChange}
                      placeholder="client@example.com"
                    />

                    <FormField
                      label="Contact Number"
                      type="tel"
                      name="contactNumber"
                      value={newNBSPTransactionData.contactNumber}
                      onChange={handleNBSPTransactionInputChange}
                      placeholder="+1 (555) 123-4567"
                    />

                    <FormField
                      label="Number of Bookstores"
                      type="number"
                      name="targetStates"
                      value={newNBSPTransactionData.targetStates}
                      onChange={handleNBSPTransactionInputChange}
                      min="0"
                    />

                    <FormField
                      label="Remaining"
                      type="number"
                      name="remaining"
                      value={newNBSPTransactionData.remaining}
                      onChange={handleNBSPTransactionInputChange}
                      min="0"
                    />

                    {/* Notes - Full Width */}
                    <div className="md:col-span-2">
                      <FormField
                        label="Notes"
                        type="textarea"
                        name="notes"
                        value={newNBSPTransactionData.notes}
                        onChange={handleNBSPTransactionInputChange}
                        placeholder="Additional notes or comments..."
                        rows="4"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                  <button 
                    type="button"
                    onClick={() => setShowCreateNBSPTransactionModal(false)}
                    className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white border-none py-3 px-6 rounded-xl cursor-pointer font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white border-none py-3 px-8 rounded-xl cursor-pointer font-medium transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Create Transaction
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit NBSP Transaction Modal */}
      {showEditNBSPTransactionModal && (
  <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden shadow-2xl border border-gray-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Edit NBSP Transaction</h2>
            <p className="text-blue-100 text-sm">
              Update transaction details for {editNBSPTransactionData.bookName || 'this book'}
            </p>
          </div>
          <button 
            onClick={() => setShowEditNBSPTransactionModal(false)}
            className="bg-white/20 hover:bg-white/30 text-white border-none rounded-full w-10 h-10 flex items-center justify-center cursor-pointer transition-all duration-200 backdrop-blur-sm"
            title="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Form Content */}
      <div className="p-8 max-h-[70vh] overflow-y-auto">
        <form onSubmit={handleEditNBSPTransactionSubmit} className="space-y-8">
          {/* General Information Section */}
          <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-600 rounded-lg p-2">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">General Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Date"
                type="date"
                name="date"
                value={editNBSPTransactionData.date ? editNBSPTransactionData.date.split('T')[0] : ''}
                onChange={handleEditNBSPTransactionInputChange}
                required
              />
              
              <FormField
                label="Services"
                type="text"
                name="services"
                value={editNBSPTransactionData.services}
                onChange={handleEditNBSPTransactionInputChange}
                placeholder="Enter services required"
              />

              <FormField
                label="Author Name"
                type="text"
                name="authorName"
                value={editNBSPTransactionData.authorName}
                onChange={handleEditNBSPTransactionInputChange}
                placeholder="Enter author's full name"
              />

              <FormField
                label="Book Name"
                type="text"
                name="bookName"
                value={editNBSPTransactionData.bookName}
                onChange={handleEditNBSPTransactionInputChange}
                placeholder="Enter book title"
              />

              <FormField
                label="Status"
                type="select"
                name="bookAvailability"
                value={editNBSPTransactionData.bookAvailability || ""}
                onChange={handleEditNBSPTransactionInputChange}
                options={[
                  { value: "", label: "Select Status" },
                  { value: "Fulfilled", label: "✅ Fulfilled" },
                  { value: "Pre-Fulfilled", label: "⏳ Pre-Fulfilled" },
                  { value: "On-Hold", label: "⏸️ On-Hold" },
                  { value: "Pending", label: "🔄 Pending" }
                ]}
              />

              <FormField
                label="Agent"
                type="text"
                name="agent"
                value={editNBSPTransactionData.agent}
                onChange={handleEditNBSPTransactionInputChange}
                placeholder="Assign agent"
              />
            </div>
          </div>

          {/* Additional Information Section */}
          <div className="bg-green-50 rounded-xl p-6 border border-green-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-green-600 rounded-lg p-2">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Additional Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Genre"
                type="text"
                name="genre"
                value={editNBSPTransactionData.genre}
                onChange={handleEditNBSPTransactionInputChange}
                placeholder="Book genre/category"
              />

              <FormField
                label="ISBN"
                type="text"
                name="isbn"
                value={editNBSPTransactionData.isbn}
                onChange={handleEditNBSPTransactionInputChange}
                placeholder="Enter ISBN number"
              />

              <FormField
                label="Email Address"
                type="email"
                name="emailAddress"
                value={editNBSPTransactionData.emailAddress}
                onChange={handleEditNBSPTransactionInputChange}
                placeholder="client@example.com"
              />

              <FormField
                label="Contact Number"
                type="tel"
                name="contactNumber"
                value={editNBSPTransactionData.contactNumber}
                onChange={handleEditNBSPTransactionInputChange}
                placeholder="+1 (555) 123-4567"
              />

              <FormField
                label="Number of Bookstores"
                type="number"
                name="targetStates"
                value={editNBSPTransactionData.targetStates}
                onChange={handleEditNBSPTransactionInputChange}
                min="0"
              />

              <FormField
                label="Remaining"
                type="number"
                name="remaining"
                value={editNBSPTransactionData.remaining}
                onChange={handleEditNBSPTransactionInputChange}
                min="0"
              />

              {/* Notes - Full Width */}
              <div className="md:col-span-2">
                <FormField
                  label="Notes"
                  type="textarea"
                  name="notes"
                  value={editNBSPTransactionData.notes}
                  onChange={handleEditNBSPTransactionInputChange}
                  placeholder="Additional notes or comments..."
                  rows="4"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <div>
              <button 
                type="button"
                onClick={() => handleDeleteNBSPTransaction(editingTransID)}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white border-none py-3 px-6 rounded-xl cursor-pointer font-medium transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Transaction
              </button>
            </div>

            <div className="flex gap-4">
              <button 
                type="button"
                onClick={() => setShowEditNBSPTransactionModal(false)}
                className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white border-none py-3 px-6 rounded-xl cursor-pointer font-medium transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel
              </button>
              <button 
                type="submit"
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white border-none py-3 px-8 rounded-xl cursor-pointer font-medium transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Update Transaction
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
)}
    </div>
  );
}