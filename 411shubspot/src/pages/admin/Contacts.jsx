// import React, { useState, useEffect } from "react";
// import { 
//   FaLock, FaSearch, FaPlus, FaFilter, FaUser, FaCalendarAlt, 
//   FaPhone, FaEnvelope, FaBook, FaPen, FaTrash, FaTimes, 
//   FaChevronLeft, FaChevronRight 
// } from "react-icons/fa";
// import { toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// const API_URL = import.meta.env.VITE_API_URL;
// import { useNavigate } from 'react-router-dom';

// export default function Contacts() {
//     const navigate = useNavigate();

//   // State management
//   const [contacts, setContacts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [activeTab, setActiveTab] = useState("all");
//   const [showCreateModal, setShowCreateModal] = useState(false);
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [showAssignModal, setShowAssignModal] = useState(false);
//   const [contactToDelete, setContactToDelete] = useState(null);
//   const [contactToEdit, setContactToEdit] = useState(null);
  
//   const [stats, setStats] = useState({
//     total: 0,
//     assigned: 0,
//     unassigned: 0
//   });
//   const [selectedContacts, setSelectedContacts] = useState([]);
//   const [selectAll, setSelectAll] = useState(false);
//   const [pageSize, setPageSize] = useState(25);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [agents, setAgents] = useState([]);
//   const [selectedAgent, setSelectedAgent] = useState("");

//   const [contactsBatch, setContactsBatch] = useState([{
//     name: "", email: "", phone: [""], leadOwner: "",
//     author: "", publisher: "", book: ""
//   }]);

//   // Fetch data from API
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
        
//         let contactsUrl = `${API_URL}/api/contacts?page=${currentPage}&pageSize=${pageSize}`;
//         const params = new URLSearchParams();
        
//         if (searchTerm) params.append('search', searchTerm);
//         if (activeTab === 'my') params.append('view', 'my');
//         if (activeTab === 'unassigned') params.append('view', 'unassigned');
        
//         if (params.toString()) contactsUrl += `&${params.toString()}`;
        
//         const [contactsResponse, agentsResponse] = await Promise.all([
//           fetch(contactsUrl),
//           fetch(`${API_URL}/api/agents`)
//         ]);

//         const contactsData = await contactsResponse.json();
//         const receivedContacts = Array.isArray(contactsData) ? contactsData : contactsData.contacts || [];
//         setContacts(receivedContacts);
        
//         const agentsData = await agentsResponse.json();
//         if (!Array.isArray(agentsData)) {
//           throw new Error('Agents data is not in expected format');
//         }
        
//         setAgents(agentsData);
//         setStats({
//           total: contactsData.totalCount || receivedContacts.length,
//           assigned: contactsData.assignedCount || receivedContacts.filter(c => c.assigned_to).length,
//           unassigned: contactsData.unassignedCount || receivedContacts.filter(c => !c.assigned_to).length
//         });

//       } catch (error) {
//         console.error("Error fetching data:", error);
//         toast.error("Failed to load data");
//       } finally {
//         setLoading(false);
//       }
//     };
    
//     fetchData();
//   }, [searchTerm, activeTab, pageSize, currentPage]);

//   const handleRedirect = () => {
//     navigate('/changeleads');
//   };

//   const handleCreateContacts = async (e) => {
//     e.preventDefault();
//     try {
//       const contactsToSubmit = contactsBatch.map(contact => ({
//         name: contact.name,
//         email: contact.email,
//         phone: JSON.stringify(contact.phone.filter(p => p !== "")),
//         leadOwner: contact.leadOwner,
//         author: contact.author,
//         publisher: contact.publisher,
//         bookTitle: contact.book
//       })).filter(contact => contact.name.trim() !== "");

//       if (contactsToSubmit.length === 0) {
//         throw new Error("No valid contacts to create");
//       }

//       const response = await fetch(`${API_URL}/api/contacts/batch`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(contactsToSubmit)
//       });
      
//       if (!response.ok) throw new Error(await response.text());
      
//       toast.success(`Successfully created ${contactsToSubmit.length} contacts!`);
//       setShowCreateModal(false);
//       setContactsBatch([{
//         name: "", email: "", phone: [""], leadOwner: "",
//         author: "", publisher: "", book: ""
//       }]);
//       refreshContacts();
//     } catch (error) {
//       toast.error(error.message);
//     }
//   };

//   const handleContactChange = (index, field, value) => {
//     const updatedBatch = [...contactsBatch];
//     updatedBatch[index] = {
//       ...updatedBatch[index],
//       [field]: value
//     };
//     setContactsBatch(updatedBatch);
//   };

//   const handlePhoneChange = (contactIndex, phoneIndex, value) => {
//     const updatedBatch = [...contactsBatch];
//     let updatedPhones = [...updatedBatch[contactIndex].phone];
    
//     updatedPhones[phoneIndex] = value;
    
//     if (phoneIndex === updatedPhones.length - 1 && value.trim() !== "") {
//       updatedPhones.push("");
//     }
    
//     updatedPhones = updatedPhones.filter((p, i) => 
//       p.trim() !== "" || i === updatedPhones.length - 1
//     );
    
//     updatedBatch[contactIndex] = {
//       ...updatedBatch[contactIndex],
//       phone: updatedPhones
//     };
    
//     setContactsBatch(updatedBatch);
//   };

//   const addNewContact = () => {
//     setContactsBatch([...contactsBatch, {
//       name: "", email: "", phone: [""], leadOwner: "",
//       author: "", publisher: "", book: ""
//     }]);
//   };

//   const removeContact = (index) => {
//     if (contactsBatch.length <= 1) return;
//     const updatedBatch = [...contactsBatch];
//     updatedBatch.splice(index, 1);
//     setContactsBatch(updatedBatch);
//   };

//   const handleEditContact = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await fetch(`${API_URL}/api/contacts/${contactToEdit.id}`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           name: contactToEdit.name,
//           email: contactToEdit.email,
//           phone: contactToEdit.phone,
//           leadOwner: contactToEdit.leadOwner,
//           author: contactToEdit.author,
//           publisher: contactToEdit.publisher,
//           bookTitle: contactToEdit.book
//         })
//       });
      
//       if (!response.ok) throw new Error(await response.text());
      
//       toast.success("Contact updated successfully!");
//       setShowEditModal(false);
//       refreshContacts();
//     } catch (error) {
//       toast.error(error.message);
//     }
//   };

//   const handleDeleteContact = async () => {
//     try {
//       const ids = Array.isArray(contactToDelete) ? contactToDelete : [contactToDelete];

//       const response = await fetch(`${API_URL}/api/contacts/bulk-delete`, {
//         method: 'DELETE',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ contactIds: ids })
//       });

//       if (!response.ok) throw new Error(await response.text());

//       toast.success(`${ids.length} contact(s) deleted successfully!`);
//       setShowDeleteModal(false);
//       setSelectedContacts([]);
//       setSelectAll(false);
//       refreshContacts();
//     } catch (error) {
//       toast.error(error.message);
//     }
//   };

//   const handleBulkAssign = async () => {
//     if (!selectedAgent) {
//       alert("Please select an agent first");
//       return;
//     }

//     try {
//       console.log('Sending bulk assign request:', {
//         contactIds: selectedContacts,
//         assignedTo: selectedAgent
//       });
      
//       const response = await fetch(`${API_URL}/api/contacts/bulk-assign`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           contactIds: selectedContacts,
//           assignedTo: selectedAgent
//         })
//       });
      
//       console.log('Response status:', response.status);
      
//       const responseText = await response.text();
//       console.log('Response text:', responseText);
      
//       if (!response.ok) {
//         console.error('Response not OK:', responseText);
//         throw new Error(responseText);
//       }
      
//       const result = JSON.parse(responseText);
//       console.log('Parsed result:', result);
      
//       if (result.success === false) {
//         alert(`⚠️ ${result.message || 'All leads were already assigned to this agent.'}`);
//       } else {
//         const assignedCount = result.updatedCount || 0;
//         const skippedCount = result.skipped || 0;
        
//         if (assignedCount > 0 && skippedCount > 0) {
//           alert(`✅ ${assignedCount} lead(s) assigned successfully!\n${skippedCount} lead(s) were already assigned to this agent.`);
//         } else if (assignedCount > 0) {
//           alert(`✅ ${assignedCount} lead(s) assigned successfully!`);
//         } else {
//           alert(`⚠️ No leads were assigned. Please check selection.`);
//         }
//       }
      
//       setShowAssignModal(false);
//       setSelectedContacts([]);
//       setSelectAll(false);
//       refreshContacts();
//     } catch (error) {
//       console.error('Error in handleBulkAssign:', error);
//       alert(`❌ Error: ${error.message || 'Failed to assign leads'}`);
//     }
//   };

//   const refreshContacts = async () => {
//     const response = await fetch(
//       `${API_URL}/api/contacts?page=${currentPage}&pageSize=${pageSize}`
//     );
//     const data = await response.json();
//     setContacts(data.contacts || data);
//   };

//   const toggleSelectAll = (e) => {
//     const isChecked = e.target.checked;
//     setSelectAll(isChecked);
//     setSelectedContacts(isChecked ? contacts.filter(c => !c.assigned_to).map(c => c.id) : []);
//   };

//   const toggleContactSelection = (contactId) => {
//     const contact = contacts.find(c => c.id === contactId);
//     if (contact?.assigned_to) return;
    
//     setSelectedContacts(prev => 
//       prev.includes(contactId) 
//         ? prev.filter(id => id !== contactId) 
//         : [...prev, contactId]
//     );
//     setSelectAll(false);
//   };

//   const openEditModal = (contact) => {
//     setContactToEdit({
//       id: contact.id,
//       name: contact.name,
//       email: contact.email,
//       phone: contact.phone,
//       leadOwner: contact.lead_owner,
//       author: contact.author,
//       publisher: contact.publisher,
//       book: contact.book_title
//     });
//     setShowEditModal(true);
//   };

//   const PaginationControls = () => {
//     const totalPages = Math.ceil(stats.total / pageSize);
    
//     return (
//       <div className="flex justify-between items-center mb-5">
//         <div className="flex items-center gap-1.5 text-sm">
//           <span>Show:</span>
//           <select 
//             value={pageSize} 
//             onChange={(e) => {
//               setPageSize(Number(e.target.value));
//               setCurrentPage(1);
//             }}
//             className="p-1 border border-gray-300 rounded"
//           >
//             {[10, 25, 50, 100, 500, 1000, 2000].map(size => (
//               <option key={size} value={size}>{size}</option>
//             ))}
//           </select>
//           <span>contacts per page</span>
//         </div>
        
//         <div className="flex items-center gap-2.5">
//           <button 
//             onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
//             disabled={currentPage === 1}
//             className="p-1.5 px-2.5 bg-gray-100 border border-gray-300 rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             <FaChevronLeft size={12} />
//           </button>
//           <span className="text-xs">
//             Page {currentPage} of {totalPages}
//           </span>
//           <button 
//             onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
//             disabled={currentPage === totalPages}
//             className="p-1.5 px-2.5 bg-gray-100 border border-gray-300 rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             <FaChevronRight size={12} />
//           </button>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="font-sans p-5 bg-gray-100 min-h-screen">
//       {/* Header */}
//       <div className="flex justify-between items-center mb-5">
//         <div className="flex items-center gap-5 bg-[#0B79A1] p-2 rounded w-full justify-between p-2.5 text-white">
//           <div className="flex flex-col">
//             <span className="text-4xl font-bold mb-1">Contacts</span>
//             <span className="text-sm text-white">
//               {stats.total} records ({stats.assigned} assigned, {stats.unassigned} unassigned)
//             </span>
//           </div>
//           <div className="flex items-center gap-2.5">
//             <button 
//               className="px-4 py-2 bg-[#f59133] border border-gray-300 rounded cursor-pointer flex items-center gap-1.5 text-sm"
//               onClick={handleRedirect}
//             >
//               Change Leads
//             </button>          
//             <button 
//               className="px-4 py-2 bg-[#f59133] border border-gray-300 rounded cursor-pointer flex items-center gap-1.5 text-sm bg-[#ff6b35] text-white border-[#ff6b35]"
//               onClick={() => setShowCreateModal(true)}
//             >
//               <FaPlus size={12} /> Create contact
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Tabs */}
//       <div className="flex border-b border-gray-300 mb-5">
//         <div 
//           className={`px-5 py-2.5 cursor-pointer border-b-2 text-sm ${
//             activeTab === 'all' ? 'border-[#ff6b35] font-bold' : 'border-transparent'
//           }`}
//           onClick={() => setActiveTab('all')}
//         >
//           All contacts
//         </div>
//         <div 
//           className={`px-5 py-2.5 cursor-pointer border-b-2 text-sm ${
//             activeTab === 'unassigned' ? 'border-[#ff6b35] font-bold' : 'border-transparent'
//           }`}
//           onClick={() => setActiveTab('unassigned')}
//         >
//           Unassigned contacts
//         </div>
//       </div>

//       {/* Search Bar */}
//       <div className="relative mb-5 w-full max-w-md">
//         <FaSearch className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" />
//         <input
//           type="text"
//           placeholder="Search name, phone, email"
//           className="w-full p-2 pl-9 rounded border border-gray-300 text-sm"
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//         />
//       </div>

//       {/* Bulk Actions */}
//       {selectedContacts.length > 0 && (
//         <div className="flex items-center gap-2.5 mb-5 p-2.5 bg-gray-200 rounded text-sm">
//           <span>{selectedContacts.length} unassigned contacts selected</span>
//           {contacts.some(c => c.assigned_to && selectedContacts.includes(c.id)) && (
//             <span className="text-gray-400 ml-2.5">
//               (Assigned contacts cannot be selected)
//             </span>
//           )}
//           <button 
//             className="px-2.5 py-1 text-xs bg-[#00A550] border border-gray-300 rounded cursor-pointer flex items-center gap-1.5 text-white"
//             onClick={() => setShowAssignModal(true)}
//           >
//             <FaUser size={10} /> Assign to Agent
//           </button>
//         </div>
//       )}

//       {/* Pagination */}
//       <PaginationControls />

//       {/* Table */}
//       {loading ? (
//         <div className="p-5 text-center text-gray-500">Loading contacts...</div>
//       ) : (
//         <div className="bg-white rounded overflow-hidden shadow-sm">
//           <table className="w-full border-collapse">
//             <thead>
//               <tr>
//                 <th className="p-2.5 text-left bg-[#0B79A1] border-b border-gray-300 font-bold text-sm text-white font-serif">
//                   <input
//                     type="checkbox"
//                     checked={selectAll}
//                     onChange={toggleSelectAll}
//                     className="cursor-pointer"
//                   />
//                 </th>
//                 <th className="p-2.5 text-left bg-[#0B79A1] border-b border-gray-300 font-bold text-sm text-white font-serif">
//                   AUTHOR & LEAD OWNER
//                 </th>
//                 <th className="p-2.5 text-left bg-[#0B79A1] border-b border-gray-300 font-bold text-sm text-white font-serif">
//                   EMAIL & PHONE
//                 </th>
//                 <th className="p-2.5 text-left bg-[#0B79A1] border-b border-gray-300 font-bold text-sm text-white font-serif">
//                   BOOK TITLE
//                 </th>
//                 <th className="p-2.5 text-left bg-[#0B79A1] border-b border-gray-300 font-bold text-sm text-white font-serif">
//                   COMMENTS
//                 </th>
//                 <th className="p-2.5 text-left bg-[#0B79A1] border-b border-gray-300 font-bold text-sm text-white font-serif">
//                   ACTIONS
//                 </th>
//               </tr>
//             </thead>
//             <tbody>
//               {contacts.length > 0 ? (
//                 contacts.map(contact => (
//                   <tr key={contact.id}>
//                     <td className="p-2.5 border-b border-gray-300 text-sm">
//                       <input
//                         type="checkbox"
//                         checked={selectedContacts.includes(contact.id)}
//                         onChange={() => toggleContactSelection(contact.id)}
//                         className="cursor-pointer"
//                         disabled={!!contact.assigned_to}
//                         title={contact.assigned_to ? "Already assigned" : ""}
//                       />
//                       {contact.assigned_to && <FaLock size={12} className="ml-1.5" />}
//                     </td>
//                     <td className="p-2.5 border-b border-gray-300 text-sm">
//                       <div>
//                         <div><strong>Author:</strong> {contact.name || '-'}</div>
//                         <div className="mt-1 text-blue-600"><strong>Lead Owner:</strong> {contact.lead_owner || '-'}</div>
//                       </div>
//                     </td>
//                     <td className="p-2.5 border-b border-gray-300 text-sm">
//                       <div>
//                         <div>{contact.email || '-'}</div>
//                         <div className="mt-1 text-sm text-blue-600">
//                           {(() => {
//                             try {
//                               const phones = JSON.parse(contact.phone);
//                               return Array.isArray(phones) ? phones.join(', ') : contact.phone;
//                             } catch {
//                               return contact.phone || '-';
//                             }
//                           })()}
//                         </div>
//                       </div>
//                     </td>
//                     <td className="p-2.5 border-b border-gray-300 text-sm max-w-[170px] break-words overflow-wrap-break-word whitespace-normal">
//                       {contact.book_title || '-'}
//                     </td>
//                     <td className="p-2.5 border-b border-gray-300 text-sm">
//                       {contact.comments || "-"}
//                     </td>
//                     <td className="p-2.5 border-b border-gray-300 text-sm">
//                       <div className="flex gap-1">
//                         <button 
//                           className="px-2.5 py-1 text-xs bg-[#00A550] border border-gray-300 rounded cursor-pointer flex items-center gap-1.5 text-white"
//                           onClick={() => openEditModal(contact)}
//                         >
//                           <FaPen size={10} /> Edit
//                         </button>
//                         <button 
//                           className="px-2.5 py-1 text-xs bg-[#ff4444] border border-gray-300 rounded cursor-pointer flex items-center gap-1.5 text-white border-[#ff4444]"
//                           onClick={() => {
//                             setContactToDelete(contact.id);
//                             setShowDeleteModal(true);
//                           }}
//                         >
//                           <FaTrash size={10} /> Delete
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan="7" className="text-center p-5">
//                     No contacts found
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       )}
      
//       <PaginationControls />

//       {/* Create Contact Modal */}
//       {showCreateModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
//           <div className="bg-white rounded w-full max-w-2xl max-h-[90vh] overflow-y-auto text-black font-serif">
//             <div className="p-4 px-5 border-b border-gray-300 flex justify-between items-center">
//               <h3 className="text-lg font-bold m-0">Create Multiple Contacts</h3>
//               <button 
//                 className="bg-none border-none cursor-pointer text-base text-gray-500"
//                 onClick={() => setShowCreateModal(false)}
//               >
//                 <FaTimes />
//               </button>
//             </div>
//             <form onSubmit={handleCreateContacts}>
//               {contactsBatch.map((contact, contactIndex) => (
//                 <div key={contactIndex} className="mb-5 p-4 border border-gray-200 rounded relative">
//                   <div className="absolute top-1 right-1 flex gap-1">
//                     <button 
//                       type="button"
//                       onClick={() => removeContact(contactIndex)}
//                       className="bg-[#ff4444] text-white border-none rounded px-1.5 py-0.5 cursor-pointer disabled:opacity-50"
//                       disabled={contactsBatch.length <= 1}
//                     >
//                       <FaTimes />
//                     </button>
//                   </div>
                  
//                   <h4 className="mt-0 mb-4">Contact #{contactIndex + 1}</h4>
                  
//                   <div className="mb-5 px-0">
//                     <label className="block mb-1 text-sm font-bold">Name*</label>
//                     <input
//                       type="text"
//                       className="w-full p-2 px-2.5 border border-gray-300 rounded text-sm"
//                       value={contact.name}
//                       onChange={(e) => handleContactChange(contactIndex, 'name', e.target.value)}
//                       required
//                     />
//                   </div>
                  
//                   <div className="mb-5 px-0">
//                     <label className="block mb-1 text-sm font-bold">Email</label>
//                     <input
//                       type="email"
//                       className="w-full p-2 px-2.5 border border-gray-300 rounded text-sm"
//                       value={contact.email}
//                       onChange={(e) => handleContactChange(contactIndex, 'email', e.target.value)}
//                     />
//                   </div>
                  
//                   <div className="mb-5 px-0">
//                     <label className="block mb-1 text-sm font-bold">Phone Numbers</label>
//                     {contact.phone.map((phone, phoneIndex) => (
//                       <div key={phoneIndex} className="flex items-center mb-1">
//                         <input
//                           type="tel"
//                           className="flex-1 p-2 px-2.5 border border-gray-300 rounded text-sm"
//                           value={phone}
//                           onChange={(e) => handlePhoneChange(contactIndex, phoneIndex, e.target.value)}
//                           placeholder={`Phone #${phoneIndex + 1}`}
//                         />
//                         {phoneIndex !== contact.phone.length - 1 && (
//                           <button 
//                             type="button"
//                             onClick={() => {
//                               const updatedBatch = [...contactsBatch];
//                               const updatedPhones = [...contact.phone];
//                               updatedPhones.splice(phoneIndex, 1);
//                               updatedBatch[contactIndex] = {
//                                 ...contact,
//                                 phone: updatedPhones
//                               };
//                               setContactsBatch(updatedBatch);
//                             }}
//                             className="px-4 py-2 bg-[#f59133] border border-gray-300 rounded cursor-pointer flex items-center gap-1.5 text-sm ml-1.5 px-2.5 py-1"
//                           >
//                             <FaTimes />
//                           </button>
//                         )}
//                       </div>
//                     ))}
//                   </div>
                  
//                   <div className="mb-5 px-0">
//                     <label className="block mb-1 text-sm font-bold">Author</label>
//                     <input
//                       type="text"
//                       className="w-full p-2 px-2.5 border border-gray-300 rounded text-sm"
//                       value={contact.author}
//                       onChange={(e) => handleContactChange(contactIndex, 'author', e.target.value)}
//                     />
//                   </div>
                  
//                   <div className="mb-5 px-0">
//                     <label className="block mb-1 text-sm font-bold">Publisher</label>
//                     <input
//                       type="text"
//                       className="w-full p-2 px-2.5 border border-gray-300 rounded text-sm"
//                       value={contact.publisher}
//                       onChange={(e) => handleContactChange(contactIndex, 'publisher', e.target.value)}
//                     />
//                   </div>
                  
//                   <div className="mb-5 px-0">
//                     <label className="block mb-1 text-sm font-bold">Book Title</label>
//                     <input
//                       type="text"
//                       className="w-full p-2 px-2.5 border border-gray-300 rounded text-sm"
//                       value={contact.book}
//                       onChange={(e) => handleContactChange(contactIndex, 'book', e.target.value)}
//                     />
//                   </div>
//                 </div>
//               ))}
              
//               <div className="mb-5">
//                 <button 
//                   type="button"
//                   onClick={addNewContact}
//                   className="px-4 py-2 bg-[#4CAF50] border border-gray-300 rounded cursor-pointer flex items-center gap-1.5 text-sm"
//                 >
//                   <FaPlus /> Add Another Contact
//                 </button>
//               </div>
              
//               <div className="p-4 px-5 border-t border-gray-300 flex justify-end">
//                 <button 
//                   type="button" 
//                   className="px-4 py-2 bg-[#f59133] border border-gray-300 rounded cursor-pointer flex items-center gap-1.5 text-sm mr-2.5"
//                   onClick={() => setShowCreateModal(false)}
//                 >
//                   Cancel
//                 </button>
//                 <button 
//                   type="submit" 
//                   className="px-4 py-2 bg-[#f59133] border border-gray-300 rounded cursor-pointer flex items-center gap-1.5 text-sm bg-[#ff6b35] text-white border-[#ff6b35]"
//                 >
//                   Create {contactsBatch.length} Contacts
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* Edit Contact Modal */}
//       {showEditModal && contactToEdit && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
//           <div className="bg-white rounded w-full max-w-lg max-h-[90vh] overflow-y-auto text-black font-serif">
//             <div className="p-4 px-5 border-b border-gray-300 flex justify-between items-center">
//               <h3 className="text-lg font-bold m-0">Edit Contact</h3>
//               <button 
//                 className="bg-none border-none cursor-pointer text-base text-gray-500"
//                 onClick={() => setShowEditModal(false)}
//               >
//                 <FaTimes />
//               </button>
//             </div>
//             <form onSubmit={handleEditContact}>
//               <div className="mb-5 px-5">
//                 <label className="block mb-1 text-sm font-bold">Name*</label>
//                 <input
//                   type="text"
//                   className="w-full p-2 px-2.5 border border-gray-300 rounded text-sm"
//                   value={contactToEdit.name}
//                   onChange={(e) => setContactToEdit({...contactToEdit, name: e.target.value})}
//                   required
//                 />
//               </div>
//               <div className="mb-5 px-5">
//                 <label className="block mb-1 text-sm font-bold">Email</label>
//                 <input
//                   type="email"
//                   className="w-full p-2 px-2.5 border border-gray-300 rounded text-sm"
//                   value={contactToEdit.email}
//                   onChange={(e) => setContactToEdit({...contactToEdit, email: e.target.value})}
//                 />
//               </div>
//               <div className="mb-5 px-5">
//                 <label className="block mb-1 text-sm font-bold">Phone</label>
//                 <input
//                   type="tel"
//                   className="w-full p-2 px-2.5 border border-gray-300 rounded text-sm"
//                   value={contactToEdit.phone}
//                   onChange={(e) => setContactToEdit({...contactToEdit, phone: e.target.value})}
//                 />
//               </div>
//               <div className="mb-5 px-5">
//                 <label className="block mb-1 text-sm font-bold">Lead Owner</label>
//                 <input
//                   type="text"
//                   className="w-full p-2 px-2.5 border border-gray-300 rounded text-sm"
//                   value={contactToEdit.leadOwner}
//                   onChange={(e) => setContactToEdit({...contactToEdit, leadOwner: e.target.value})}
//                 />
//               </div>
//               <div className="mb-5 px-5">
//                 <label className="block mb-1 text-sm font-bold">Author</label>
//                 <input
//                   type="text"
//                   className="w-full p-2 px-2.5 border border-gray-300 rounded text-sm"
//                   value={contactToEdit.author}
//                   onChange={(e) => setContactToEdit({...contactToEdit, author: e.target.value})}
//                 />
//               </div>
//               <div className="mb-5 px-5">
//                 <label className="block mb-1 text-sm font-bold">Publisher</label>
//                 <input
//                   type="text"
//                   className="w-full p-2 px-2.5 border border-gray-300 rounded text-sm"
//                   value={contactToEdit.publisher}
//                   onChange={(e) => setContactToEdit({...contactToEdit, publisher: e.target.value})}
//                 />
//               </div>
//               <div className="mb-5 px-5">
//                 <label className="block mb-1 text-sm font-bold">Book Title</label>
//                 <input
//                   type="text"
//                   className="w-full p-2 px-2.5 border border-gray-300 rounded text-sm"
//                   value={contactToEdit.book}
//                   onChange={(e) => setContactToEdit({...contactToEdit, book: e.target.value})}
//                 />
//               </div>
//               <div className="p-4 px-5 border-t border-gray-300 flex justify-end">
//                 <button 
//                   type="button" 
//                   className="px-4 py-2 bg-[#f59133] border border-gray-300 rounded cursor-pointer flex items-center gap-1.5 text-sm mr-2.5"
//                   onClick={() => setShowEditModal(false)}
//                 >
//                   Cancel
//                 </button>
//                 <button 
//                   type="submit" 
//                   className="px-4 py-2 bg-[#f59133] border border-gray-300 rounded cursor-pointer flex items-center gap-1.5 text-sm bg-[#ff6b35] text-white border-[#ff6b35]"
//                 >
//                   Update Contact
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* Assign Contacts Modal */}
//       {showAssignModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
//           <div className="bg-white rounded w-full max-w-lg max-h-[90vh] overflow-y-auto text-black font-serif">
//             <div className="p-4 px-5 border-b border-gray-300 flex justify-between items-center">
//               <h3 className="text-lg font-bold m-0">Assign {selectedContacts.length} Contacts</h3>
//               <button onClick={() => setShowAssignModal(false)} className="bg-none border-none cursor-pointer text-base text-gray-500">
//                 <FaTimes />
//               </button>
//             </div>
//             <div className="mb-5 px-5">
//               <label className="block mb-1 text-sm font-bold">Select Agent*</label>
//               <select
//                 value={selectedAgent}
//                 onChange={(e) => setSelectedAgent(e.target.value)}
//                 className="w-full p-2 px-2.5 border border-gray-300 rounded text-sm bg-white"
//                 required
//               >
//                 <option value="">-- Select Agent --</option>
//                 {agents.map(agent => (
//                   <option key={agent.id} value={agent.id}>
//                     {agent.name} ({agent.email})
//                   </option>
//                 ))}
//               </select>
//             </div>
//             <div className="p-4 px-5 border-t border-gray-300 flex justify-end">
//               <button 
//                 type="button" 
//                 className="px-4 py-2 bg-[#f59133] border border-gray-300 rounded cursor-pointer flex items-center gap-1.5 text-sm mr-2.5"
//                 onClick={() => setShowAssignModal(false)}
//               >
//                 Cancel
//               </button>
//               <button 
//                 type="button" 
//                 className="px-4 py-2 bg-[#f59133] border border-gray-300 rounded cursor-pointer flex items-center gap-1.5 text-sm bg-[#ff6b35] text-white border-[#ff6b35] disabled:opacity-50 disabled:cursor-not-allowed"
//                 onClick={handleBulkAssign}
//                 disabled={!selectedAgent}
//               >
//                 Assign Contacts
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Delete Confirmation Modal */}
//       {showDeleteModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
//           <div className="bg-white rounded w-full max-w-lg max-h-[90vh] overflow-y-auto text-black font-serif">
//             <div className="p-4 px-5 border-b border-gray-300 flex justify-between items-center">
//               <h3 className="text-lg font-bold m-0">
//                 Confirm Delete {Array.isArray(contactToDelete) ? `${contactToDelete.length} Contacts` : 'Contact'}
//               </h3>
//               <button 
//                 className="bg-none border-none cursor-pointer text-base text-gray-500"
//                 onClick={() => setShowDeleteModal(false)}
//               >
//                 <FaTimes />
//               </button>
//             </div>
//             <div className="p-5">
//               <p>
//                 Are you sure you want to delete {Array.isArray(contactToDelete) 
//                   ? `${contactToDelete.length} contacts` 
//                   : 'this contact'}? This action cannot be undone.
//               </p>
//             </div>
//             <div className="p-4 px-5 border-t border-gray-300 flex justify-end">
//               <button 
//                 type="button" 
//                 className="px-4 py-2 bg-[#f59133] border border-gray-300 rounded cursor-pointer flex items-center gap-1.5 text-sm mr-2.5"
//                 onClick={() => setShowDeleteModal(false)}
//               >
//                 Cancel
//               </button>
//               <button 
//                 type="button" 
//                 className="px-4 py-2 bg-[#ff4444] border border-gray-300 rounded cursor-pointer flex items-center gap-1.5 text-sm text-white border-[#ff4444]"
//                 onClick={handleDeleteContact}
//               >
//                 Confirm Delete
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


import React, { useState, useEffect } from "react";
import { 
  FaLock, FaSearch, FaPlus, FaFilter, FaUser, FaCalendarAlt, 
  FaPhone, FaEnvelope, FaBook, FaPen, FaTrash, FaTimes, 
  FaChevronLeft, FaChevronRight, FaRandom, FaSync 
} from "react-icons/fa";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const API_URL = import.meta.env.VITE_API_URL;
import { useNavigate } from 'react-router-dom';

export default function Contacts() {
    const navigate = useNavigate();

  // State management
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [contactToDelete, setContactToDelete] = useState(null);
  const [contactToEdit, setContactToEdit] = useState(null);
  
  // Random contacts state
  const [randomMode, setRandomMode] = useState(false);
  const [randomContacts, setRandomContacts] = useState([]);
  const [randomLoading, setRandomLoading] = useState(false);
  
  const [stats, setStats] = useState({
    total: 0,
    assigned: 0,
    unassigned: 0
  });
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [pageSize, setPageSize] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState("");

  const [contactsBatch, setContactsBatch] = useState([{
    name: "", email: "", phone: [""], leadOwner: "",
    author: "", publisher: "", book: ""
  }]);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');

  const [refreshingCooling, setRefreshingCooling] = useState(false);


  // Replace your existing handleRefreshCooling with this
const handleRefreshCooling = () => {
  setShowPasswordModal(true);
};

const confirmRefreshCooling = async () => {
  setRefreshingCooling(true);
  try {
    const response = await fetch(`${API_URL}/api/refresh-cooling-period`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ days: 0, password: adminPassword })
    });
    const result = await response.json();
    
    if (result.success) {
      toast.success(result.message);
      refreshContacts(); // Refresh the list
    } else {
      toast.error(result.message || 'Failed to refresh cooling period');
    }
  } catch (error) {
    console.error('Error refreshing cooling period:', error);
    toast.error('Failed to refresh cooling period');
  } finally {
    setRefreshingCooling(false);
    setShowPasswordModal(false);
    setAdminPassword('');
  }
};

const cancelPasswordModal = () => {
  setShowPasswordModal(false);
  setAdminPassword('');
  setRefreshingCooling(false);
};

  // Fetch data from API
  useEffect(() => {
    if (!randomMode) {
      fetchData();
    }
  }, [searchTerm, activeTab, pageSize, currentPage, randomMode]);

  // const fetchData = async () => {
  //   try {
  //     setLoading(true);
      
  //     let contactsUrl = `${API_URL}/api/contacts?page=${currentPage}&pageSize=${pageSize}`;
  //     const params = new URLSearchParams();
      
  //     if (searchTerm) params.append('search', searchTerm);
  //     if (activeTab === 'my') params.append('view', 'my');
  //     if (activeTab === 'unassigned') params.append('view', 'unassigned');
      
  //     if (params.toString()) contactsUrl += `&${params.toString()}`;
      
  //     const [contactsResponse, agentsResponse] = await Promise.all([
  //       fetch(contactsUrl),
  //       fetch(`${API_URL}/api/agents`)
  //     ]);

  //     const contactsData = await contactsResponse.json();
  //     const receivedContacts = Array.isArray(contactsData) ? contactsData : contactsData.contacts || [];
  //     setContacts(receivedContacts);
      
  //     const agentsData = await agentsResponse.json();
  //     if (!Array.isArray(agentsData)) {
  //       throw new Error('Agents data is not in expected format');
  //     }
      
  //     setAgents(agentsData);
  //     setStats({
  //       total: contactsData.totalCount || receivedContacts.length,
  //       assigned: contactsData.assignedCount || receivedContacts.filter(c => c.assigned_to).length,
  //       unassigned: contactsData.unassignedCount || receivedContacts.filter(c => !c.assigned_to).length
  //     });

  //   } catch (error) {
  //     console.error("Error fetching data:", error);
  //     toast.error("Failed to load data");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // Function to fetch random contacts based on pageSize
  const fetchData = async () => {
  try {
    setLoading(true);
    
    let contactsUrl = `${API_URL}/api/contacts?page=${currentPage}&pageSize=${pageSize}`;
    const params = new URLSearchParams();
    
    if (searchTerm) params.append('search', searchTerm);
    if (activeTab === 'my') params.append('view', 'my');
    
    // 🔥 FIX: For unassigned tab, we only want leads with status = 'New' and not assigned
    if (activeTab === 'unassigned') {
      params.append('view', 'unassigned');
      params.append('status', 'New'); // Only show leads with status 'New'
    }
    
    if (params.toString()) contactsUrl += `&${params.toString()}`;
    
    const [contactsResponse, agentsResponse] = await Promise.all([
      fetch(contactsUrl),
      fetch(`${API_URL}/api/agents`)
    ]);

    const contactsData = await contactsResponse.json();
    const receivedContacts = Array.isArray(contactsData) ? contactsData : contactsData.contacts || [];
    
    // 🔥 Additional filter on frontend to ensure only 'New' status shows in unassigned tab
    let filteredContacts = receivedContacts;
    if (activeTab === 'unassigned') {
      filteredContacts = receivedContacts.filter(contact => contact.status === 'New' && !contact.assigned_to);
    }
    
    setContacts(filteredContacts);
    
    const agentsData = await agentsResponse.json();
    if (!Array.isArray(agentsData)) {
      throw new Error('Agents data is not in expected format');
    }
    
    setAgents(agentsData);
    setStats({
      total: contactsData.totalCount || receivedContacts.length,
      assigned: contactsData.assignedCount || receivedContacts.filter(c => c.assigned_to).length,
      unassigned: contactsData.unassignedCount || receivedContacts.filter(c => !c.assigned_to && c.status === 'New').length
    });

  } catch (error) {
    console.error("Error fetching data:", error);
    toast.error("Failed to load data");
  } finally {
    setLoading(false);
  }
};
  const fetchRandomContacts = async () => {
    try {
      setRandomLoading(true);
      setRandomMode(true);
      
      // Build URL with filters - fetch more to have enough for randomization
      // Fetch 5000 or all available (whichever is smaller) to ensure good randomization
      const fetchSize = Math.min(5000, 10000); // Cap at 5000 for performance
      let url = `${API_URL}/api/contacts?page=1&pageSize=${fetchSize}`;
      const params = new URLSearchParams();
      
      if (searchTerm) params.append('search', searchTerm);
      if (activeTab === 'unassigned') params.append('view', 'unassigned');
      
      if (params.toString()) url += `&${params.toString()}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      const allContacts = data.contacts || [];
      
      if (allContacts.length === 0) {
        toast.info("No contacts found to randomize");
        setRandomMode(false);
        return;
      }
      
      // Shuffle array using Fisher-Yates algorithm
      const shuffled = [...allContacts];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      
      // Take number of contacts based on pageSize
      const numberOfContacts = Math.min(pageSize, shuffled.length);
      const selected = shuffled.slice(0, numberOfContacts);
      setRandomContacts(selected);
      
      toast.success(`Showing ${numberOfContacts} random contacts out of ${allContacts.length}`);
      
    } catch (error) {
      console.error("Error fetching random contacts:", error);
      toast.error("Failed to get random contacts");
      setRandomMode(false);
    } finally {
      setRandomLoading(false);
    }
  };

  // Function to reset to normal view
  const resetToNormal = () => {
    setRandomMode(false);
    setRandomContacts([]);
    fetchData();
  };

  const handleRedirect = () => {
    navigate('/changeleads');
  };

  const handleCreateContacts = async (e) => {
    e.preventDefault();
    try {
      const contactsToSubmit = contactsBatch.map(contact => ({
        name: contact.name,
        email: contact.email,
        phone: JSON.stringify(contact.phone.filter(p => p !== "")),
        leadOwner: contact.leadOwner,
        author: contact.author,
        publisher: contact.publisher,
        bookTitle: contact.book
      })).filter(contact => contact.name.trim() !== "");

      if (contactsToSubmit.length === 0) {
        throw new Error("No valid contacts to create");
      }

      const response = await fetch(`${API_URL}/api/contacts/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactsToSubmit)
      });
      
      if (!response.ok) throw new Error(await response.text());
      
      toast.success(`Successfully created ${contactsToSubmit.length} contacts!`);
      setShowCreateModal(false);
      setContactsBatch([{
        name: "", email: "", phone: [""], leadOwner: "",
        author: "", publisher: "", book: ""
      }]);
      refreshContacts();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleContactChange = (index, field, value) => {
    const updatedBatch = [...contactsBatch];
    updatedBatch[index] = {
      ...updatedBatch[index],
      [field]: value
    };
    setContactsBatch(updatedBatch);
  };

  const handlePhoneChange = (contactIndex, phoneIndex, value) => {
    const updatedBatch = [...contactsBatch];
    let updatedPhones = [...updatedBatch[contactIndex].phone];
    
    updatedPhones[phoneIndex] = value;
    
    if (phoneIndex === updatedPhones.length - 1 && value.trim() !== "") {
      updatedPhones.push("");
    }
    
    updatedPhones = updatedPhones.filter((p, i) => 
      p.trim() !== "" || i === updatedPhones.length - 1
    );
    
    updatedBatch[contactIndex] = {
      ...updatedBatch[contactIndex],
      phone: updatedPhones
    };
    
    setContactsBatch(updatedBatch);
  };

  const addNewContact = () => {
    setContactsBatch([...contactsBatch, {
      name: "", email: "", phone: [""], leadOwner: "",
      author: "", publisher: "", book: ""
    }]);
  };

  const removeContact = (index) => {
    if (contactsBatch.length <= 1) return;
    const updatedBatch = [...contactsBatch];
    updatedBatch.splice(index, 1);
    setContactsBatch(updatedBatch);
  };

  const handleEditContact = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/contacts/${contactToEdit.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: contactToEdit.name,
          email: contactToEdit.email,
          phone: contactToEdit.phone,
          leadOwner: contactToEdit.leadOwner,
          author: contactToEdit.author,
          publisher: contactToEdit.publisher,
          bookTitle: contactToEdit.book
        })
      });
      
      if (!response.ok) throw new Error(await response.text());
      
      toast.success("Contact updated successfully!");
      setShowEditModal(false);
      refreshContacts();
      
      // If in random mode, refresh random contacts too
      if (randomMode) {
        fetchRandomContacts();
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDeleteContact = async () => {
    try {
      const ids = Array.isArray(contactToDelete) ? contactToDelete : [contactToDelete];

      const response = await fetch(`${API_URL}/api/contacts/bulk-delete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contactIds: ids })
      });

      if (!response.ok) throw new Error(await response.text());

      toast.success(`${ids.length} contact(s) deleted successfully!`);
      setShowDeleteModal(false);
      setSelectedContacts([]);
      setSelectAll(false);
      refreshContacts();
      
      // If in random mode, refresh random contacts too
      if (randomMode) {
        fetchRandomContacts();
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleBulkAssign = async () => {
    if (!selectedAgent) {
      alert("Please select an agent first");
      return;
    }

    try {
      console.log('Sending bulk assign request:', {
        contactIds: selectedContacts,
        assignedTo: selectedAgent
      });
      
      const response = await fetch(`${API_URL}/api/contacts/bulk-assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactIds: selectedContacts,
          assignedTo: selectedAgent
        })
      });
      
      console.log('Response status:', response.status);
      
      const responseText = await response.text();
      console.log('Response text:', responseText);
      
      if (!response.ok) {
        console.error('Response not OK:', responseText);
        throw new Error(responseText);
      }
      
      const result = JSON.parse(responseText);
      console.log('Parsed result:', result);
      
      if (result.success === false) {
        alert(`⚠️ ${result.message || 'All leads were already assigned to this agent.'}`);
      } else {
        const assignedCount = result.updatedCount || 0;
        const skippedCount = result.skipped || 0;
        
        if (assignedCount > 0 && skippedCount > 0) {
          alert(`✅ ${assignedCount} lead(s) assigned successfully!\n${skippedCount} lead(s) were already assigned to this agent.`);
        } else if (assignedCount > 0) {
          alert(`✅ ${assignedCount} lead(s) assigned successfully!`);
        } else {
          alert(`⚠️ No leads were assigned. Please check selection.`);
        }
      }
      
      setShowAssignModal(false);
      setSelectedContacts([]);
      setSelectAll(false);
      refreshContacts();
      
      // If in random mode, refresh random contacts too
      if (randomMode) {
        fetchRandomContacts();
      }
    } catch (error) {
      console.error('Error in handleBulkAssign:', error);
      alert(`❌ Error: ${error.message || 'Failed to assign leads'}`);
    }
  };

  const refreshContacts = async () => {
    const response = await fetch(
      `${API_URL}/api/contacts?page=${currentPage}&pageSize=${pageSize}`
    );
    const data = await response.json();
    setContacts(data.contacts || data);
  };

  // const toggleSelectAll = (e) => {
  //   const currentContacts = randomMode ? randomContacts : contacts;
  //   const isChecked = e.target.checked;
  //   setSelectAll(isChecked);
  //   setSelectedContacts(isChecked ? currentContacts.filter(c => !c.assigned_to).map(c => c.id) : []);
  // };

  const toggleSelectAll = (e) => {
  const currentContacts = randomMode ? randomContacts : contacts;
  const isChecked = e.target.checked;
  setSelectAll(isChecked);
  // 🔥 Only select leads that are NOT assigned AND have status = 'New'
  setSelectedContacts(isChecked ? currentContacts.filter(c => !c.assigned_to && c.status === 'New').map(c => c.id) : []);
};

  // const toggleContactSelection = (contactId) => {
  //   const currentContacts = randomMode ? randomContacts : contacts;
  //   const contact = currentContacts.find(c => c.id === contactId);
  //   if (contact?.assigned_to) return;
    
  //   setSelectedContacts(prev => 
  //     prev.includes(contactId) 
  //       ? prev.filter(id => id !== contactId) 
  //       : [...prev, contactId]
  //   );
  //   setSelectAll(false);
  // };

  const toggleContactSelection = (contactId) => {
  const currentContacts = randomMode ? randomContacts : contacts;
  const contact = currentContacts.find(c => c.id === contactId);
  // 🔥 Only allow selection if not assigned AND status is 'New'
  if (contact?.assigned_to || contact?.status !== 'New') return;
  
  setSelectedContacts(prev => 
    prev.includes(contactId) 
      ? prev.filter(id => id !== contactId) 
      : [...prev, contactId]
  );
  setSelectAll(false);
};
  const openEditModal = (contact) => {
    setContactToEdit({
      id: contact.id,
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      leadOwner: contact.lead_owner,
      author: contact.author,
      publisher: contact.publisher,
      book: contact.book_title
    });
    setShowEditModal(true);
  };

  const PaginationControls = () => {
    if (randomMode) return null; // No pagination in random mode
    
    const totalPages = Math.ceil(stats.total / pageSize);
    
    return (
      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-1.5 text-sm">
          <span>Show:</span>
          <select 
            value={pageSize} 
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="p-1 border border-gray-300 rounded"
          >
            {[5,10, 25, 50, 100, 500, 1000, 2000].map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
          <span>contacts per page</span>
        </div>
        
        <div className="flex items-center gap-2.5">
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 px-2.5 bg-gray-100 border border-gray-300 rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaChevronLeft size={12} />
          </button>
          <span className="text-xs">
            Page {currentPage} of {totalPages}
          </span>
          <button 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 px-2.5 bg-gray-100 border border-gray-300 rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaChevronRight size={12} />
          </button>
        </div>
      </div>
    );
  };

  // Get current display contacts
  const displayContacts = randomMode ? randomContacts : contacts;
  const isLoading = randomMode ? randomLoading : loading;

  return (
    <div className="font-sans p-5 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-5 bg-[#0B79A1] p-2 rounded w-full justify-between p-2.5 text-white">
          <div className="flex flex-col">
            <span className="text-4xl font-bold mb-1">Contacts</span>
            <span className="text-sm text-white">
              {randomMode 
                ? `Showing ${randomContacts.length} random contacts` 
                : `${stats.total} records (${stats.assigned} assigned, ${stats.unassigned} unassigned)`
              }
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            
            <button 
              className="px-4 py-2 bg-[#f59133] border border-gray-300 rounded cursor-pointer flex items-center gap-1.5 text-sm"
              onClick={handleRedirect}
            >
              Change Leads
            </button>          
            <button 
              className="px-4 py-2 bg-[#f59133] border border-gray-300 rounded cursor-pointer flex items-center gap-1.5 text-sm bg-[#ff6b35] text-white border-[#ff6b35]"
              onClick={() => setShowCreateModal(true)}
            >
              <FaPlus size={12} /> Create contact
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-300 mb-5">
        <div 
          className={`px-5 py-2.5 cursor-pointer border-b-2 text-sm ${
            activeTab === 'all' ? 'border-[#ff6b35] font-bold' : 'border-transparent'
          }`}
          onClick={() => {
            setActiveTab('all');
            if (randomMode) resetToNormal();
          }}
        >
          All contacts
        </div>
        <div 
          className={`px-5 py-2.5 cursor-pointer border-b-2 text-sm ${
            activeTab === 'unassigned' ? 'border-[#ff6b35] font-bold' : 'border-transparent'
          }`}
          onClick={() => {
            setActiveTab('unassigned');
            if (randomMode) resetToNormal();
          }}
        >
          Unassigned contacts
        </div>
      </div>

      {/* Search and Random Controls */}
      <div className="flex flex-wrap gap-3 mb-5">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <FaSearch className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search name, phone, email"
            className="w-full p-2 pl-9 rounded border border-gray-300 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Random Button */}
        <div className="flex items-center gap-2">
          {!randomMode ? (
            <button
              onClick={fetchRandomContacts}
              disabled={randomLoading}
              className="px-4 py-2 bg-purple-600 text-white rounded flex items-center gap-2 text-sm hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaRandom className="text-sm" />
              {randomLoading ? "Loading..." : `Show Random ${pageSize}`}
            </button>
          ) : (
            <button
              onClick={resetToNormal}
              className="px-4 py-2 bg-gray-600 text-white rounded flex items-center gap-2 text-sm hover:bg-gray-700"
            >
              <FaTimes /> Back to Normal View
            </button>
          )}
        </div>
      </div>

      {/* Bulk Actions */}
      {/* {selectedContacts.length > 0 && (
        <div className="flex items-center gap-2.5 mb-5 p-2.5 bg-gray-200 rounded text-sm">
          <span>{selectedContacts.length} unassigned contacts selected</span>
          {displayContacts.some(c => c.assigned_to && selectedContacts.includes(c.id)) && (
            <span className="text-gray-400 ml-2.5">
              (Assigned contacts cannot be selected)
            </span>
          )}
          <button 
            className="px-2.5 py-1 text-xs bg-[#00A550] border border-gray-300 rounded cursor-pointer flex items-center gap-1.5 text-white"
            onClick={() => setShowAssignModal(true)}
          >
            <FaUser size={10} /> Assign to Agent
          </button>
        </div>
      )} */}
      {selectedContacts.length > 0 && (
        <div className="flex items-center gap-2.5 mb-5 p-2.5 bg-gray-200 rounded text-sm">
          <span>{selectedContacts.length} new contact(s) selected</span>
          {contacts.some(c => c.assigned_to && selectedContacts.includes(c.id)) && (
            <span className="text-gray-400 ml-2.5">
              (Assigned contacts cannot be selected)
            </span>
          )}
          {contacts.some(c => c.status !== 'New' && selectedContacts.includes(c.id)) && (
            <span className="text-orange-500 ml-2.5">
              (Contacted leads cannot be reassigned)
            </span>
          )}
          <button 
            className="px-2.5 py-1 text-xs bg-[#00A550] border border-gray-300 rounded cursor-pointer flex items-center gap-1.5 text-white"
            onClick={() => setShowAssignModal(true)}
          >
            <FaUser size={10} /> Assign to Agent
          </button>
        </div>
      )}

      {/* Pagination (only in normal mode) */}
      <PaginationControls />

      {/* Table */}
      {isLoading ? (
        <div className="p-5 text-center text-gray-500">
          {randomMode ? `Fetching ${pageSize} random contacts...` : "Loading contacts..."}
        </div>
      ) : (
        <div className="bg-white rounded overflow-hidden shadow-sm">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="p-2.5 text-left bg-[#0B79A1] border-b border-gray-300 font-bold text-sm text-white font-serif">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={toggleSelectAll}
                    className="cursor-pointer"
                  />
                </th>
                <th className="p-2.5 text-left bg-[#0B79A1] border-b border-gray-300 font-bold text-sm text-white font-serif">
                  AUTHOR & LEAD OWNER
                </th>
                <th className="p-2.5 text-left bg-[#0B79A1] border-b border-gray-300 font-bold text-sm text-white font-serif">
                  EMAIL & PHONE
                </th>
                <th className="p-2.5 text-left bg-[#0B79A1] border-b border-gray-300 font-bold text-sm text-white font-serif">
                  BOOK TITLE
                </th>
                <th className="p-2.5 text-left bg-[#0B79A1] border-b border-gray-300 font-bold text-sm text-white font-serif">
                  STATUS
                </th>
                <th className="p-2.5 text-left bg-[#0B79A1] border-b border-gray-300 font-bold text-sm text-white font-serif">
                  COMMENTS
                </th>
                <th className="p-2.5 text-left bg-[#0B79A1] border-b border-gray-300 font-bold text-sm text-white font-serif">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody>
              {displayContacts.length > 0 ? (
                displayContacts.map(contact => (
                  <tr key={contact.id}>
                    {/* <td className="p-2.5 border-b border-gray-300 text-sm">
                      <input
                        type="checkbox"
                        checked={selectedContacts.includes(contact.id)}
                        onChange={() => toggleContactSelection(contact.id)}
                        className="cursor-pointer"
                        disabled={!!contact.assigned_to}
                        title={contact.assigned_to ? "Already assigned" : ""}
                      />
                      {contact.assigned_to && <FaLock size={12} className="ml-1.5" />}
                    </td> */}
                    <td className="p-2.5 border-b border-gray-300 text-sm">
                      <input
                        type="checkbox"
                        checked={selectedContacts.includes(contact.id)}
                        onChange={() => toggleContactSelection(contact.id)}
                        className="cursor-pointer"
                        disabled={!!contact.assigned_to || contact.status !== 'New'}
                        title={
                          contact.assigned_to 
                            ? "Already assigned" 
                            : (contact.status !== 'New' 
                                ? "Lead is in cooling period (already contacted)" 
                                : "")
                        }
                      />
                      {contact.assigned_to && <FaLock size={12} className="ml-1.5" />}
                      {!contact.assigned_to && contact.status !== 'New' && (
                        <span className="ml-1.5 text-xs text-orange-500" title="Cooling period">⏳</span>
                      )}
                    </td>
                    <td className="p-2.5 border-b border-gray-300 text-sm">
                      <div>
                        <div><strong>Author:</strong> {contact.name || '-'}</div>
                        <div className="mt-1 text-blue-600"><strong>Lead Owner:</strong> {contact.lead_owner || '-'}</div>
                      </div>
                    </td>
                    <td className="p-2.5 border-b border-gray-300 text-sm">
                      <div>
                        <div>{contact.email || '-'}</div>
                        <div className="mt-1 text-sm text-blue-600">
                          {(() => {
                            try {
                              const phones = JSON.parse(contact.phone);
                              return Array.isArray(phones) ? phones.join(', ') : contact.phone;
                            } catch {
                              return contact.phone || '-';
                            }
                          })()}
                        </div>
                      </div>
                    </td>
                    <td className="p-2.5 border-b border-gray-300 text-sm max-w-[170px] break-words overflow-wrap-break-word whitespace-normal">
                      {contact.book_title || '-'}
                    </td>
                    <td className="p-2.5 border-b border-gray-300 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        contact.status === 'New' 
                          ? 'bg-green-100 text-green-800' 
                          : contact.status === 'Contacted'
                          ? 'bg-blue-100 text-blue-800'
                          : contact.status === 'In Progress'
                          ? 'bg-yellow-100 text-yellow-800'
                          : contact.status === 'Completed'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {contact.status || 'New'}
                      </span>
                    </td>
                    <td className="p-2.5 border-b border-gray-300 text-sm">
                      {contact.comments || "-"}
                    </td>
                    <td className="p-2.5 border-b border-gray-300 text-sm">
                      <div className="flex gap-1">
                        <button 
                          className="px-2.5 py-1 text-xs bg-[#00A550] border border-gray-300 rounded cursor-pointer flex items-center gap-1.5 text-white"
                          onClick={() => openEditModal(contact)}
                        >
                          <FaPen size={10} /> Edit
                        </button>
                        <button 
                          className="px-2.5 py-1 text-xs bg-[#ff4444] border border-gray-300 rounded cursor-pointer flex items-center gap-1.5 text-white border-[#ff4444]"
                          onClick={() => {
                            setContactToDelete(contact.id);
                            setShowDeleteModal(true);
                          }}
                        >
                          <FaTrash size={10} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center p-5">
                    No contacts found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Second Pagination (only in normal mode) */}
      {!randomMode && <PaginationControls />}

      {/* 🔥 Footer with Admin Action */}
<div className="mt-8 pt-4 border-t border-gray-200">
  <div className="flex justify-end">
    <button
      onClick={handleRefreshCooling}
      disabled={refreshingCooling}
      className="text-gray-400 hover:text-red-500 text-xs flex items-center gap-1 transition-colors"
      title="Admin: Reset cooling period (move all contacted leads back to New)"
    >
      <FaSync className={`text-xs ${refreshingCooling ? 'animate-spin' : ''}`} />
      <span className="hidden sm:inline">Admin: Reset Cooling Period</span>
    </button>
  </div>
</div>

{/* Password Confirmation Modal */}
{showPasswordModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 w-full max-w-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-red-600 flex items-center gap-2">
          <FaSync className="text-sm" />
          Admin Action Required
        </h3>
        <button
          onClick={cancelPasswordModal}
          className="text-gray-400 hover:text-gray-600"
        >
          <FaTimes />
        </button>
      </div>
      
      <div className="mb-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-red-700 font-medium">⚠️ Warning</p>
          <p className="text-xs text-red-600 mt-1">
            This action will move ALL contacted leads back to "New" status immediately.
            This bypasses the cooling period and cannot be undone.
          </p>
        </div>
        
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Enter Admin Password
        </label>
        <input
          type="password"
          value={adminPassword}
          onChange={(e) => setAdminPassword(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              confirmRefreshCooling();
            }
          }}
          placeholder="Enter admin password"
          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          autoFocus
        />
      </div>
      
      <div className="flex justify-end gap-3">
        <button
          onClick={cancelPasswordModal}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={confirmRefreshCooling}
          disabled={!adminPassword || refreshingCooling}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {refreshingCooling ? (
            <>
              <FaSync className="animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <FaSync />
              Confirm Reset
            </>
          )}
        </button>
      </div>
    </div>
  </div>
)}


      {/* Create Contact Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded w-full max-w-2xl max-h-[90vh] overflow-y-auto text-black font-serif">
            <div className="p-4 px-5 border-b border-gray-300 flex justify-between items-center">
              <h3 className="text-lg font-bold m-0">Create Multiple Contacts</h3>
              <button 
                className="bg-none border-none cursor-pointer text-base text-gray-500"
                onClick={() => setShowCreateModal(false)}
              >
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleCreateContacts}>
              {contactsBatch.map((contact, contactIndex) => (
                <div key={contactIndex} className="mb-5 p-4 border border-gray-200 rounded relative">
                  <div className="absolute top-1 right-1 flex gap-1">
                    <button 
                      type="button"
                      onClick={() => removeContact(contactIndex)}
                      className="bg-[#ff4444] text-white border-none rounded px-1.5 py-0.5 cursor-pointer disabled:opacity-50"
                      disabled={contactsBatch.length <= 1}
                    >
                      <FaTimes />
                    </button>
                  </div>
                  
                  <h4 className="mt-0 mb-4">Contact #{contactIndex + 1}</h4>
                  
                  <div className="mb-5 px-0">
                    <label className="block mb-1 text-sm font-bold">Name*</label>
                    <input
                      type="text"
                      className="w-full p-2 px-2.5 border border-gray-300 rounded text-sm"
                      value={contact.name}
                      onChange={(e) => handleContactChange(contactIndex, 'name', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="mb-5 px-0">
                    <label className="block mb-1 text-sm font-bold">Email</label>
                    <input
                      type="email"
                      className="w-full p-2 px-2.5 border border-gray-300 rounded text-sm"
                      value={contact.email}
                      onChange={(e) => handleContactChange(contactIndex, 'email', e.target.value)}
                    />
                  </div>
                  
                  <div className="mb-5 px-0">
                    <label className="block mb-1 text-sm font-bold">Phone Numbers</label>
                    {contact.phone.map((phone, phoneIndex) => (
                      <div key={phoneIndex} className="flex items-center mb-1">
                        <input
                          type="tel"
                          className="flex-1 p-2 px-2.5 border border-gray-300 rounded text-sm"
                          value={phone}
                          onChange={(e) => handlePhoneChange(contactIndex, phoneIndex, e.target.value)}
                          placeholder={`Phone #${phoneIndex + 1}`}
                        />
                        {phoneIndex !== contact.phone.length - 1 && (
                          <button 
                            type="button"
                            onClick={() => {
                              const updatedBatch = [...contactsBatch];
                              const updatedPhones = [...contact.phone];
                              updatedPhones.splice(phoneIndex, 1);
                              updatedBatch[contactIndex] = {
                                ...contact,
                                phone: updatedPhones
                              };
                              setContactsBatch(updatedBatch);
                            }}
                            className="px-4 py-2 bg-[#f59133] border border-gray-300 rounded cursor-pointer flex items-center gap-1.5 text-sm ml-1.5 px-2.5 py-1"
                          >
                            <FaTimes />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="mb-5 px-0">
                    <label className="block mb-1 text-sm font-bold">Author</label>
                    <input
                      type="text"
                      className="w-full p-2 px-2.5 border border-gray-300 rounded text-sm"
                      value={contact.author}
                      onChange={(e) => handleContactChange(contactIndex, 'author', e.target.value)}
                    />
                  </div>
                  
                  <div className="mb-5 px-0">
                    <label className="block mb-1 text-sm font-bold">Publisher</label>
                    <input
                      type="text"
                      className="w-full p-2 px-2.5 border border-gray-300 rounded text-sm"
                      value={contact.publisher}
                      onChange={(e) => handleContactChange(contactIndex, 'publisher', e.target.value)}
                    />
                  </div>
                  
                  <div className="mb-5 px-0">
                    <label className="block mb-1 text-sm font-bold">Book Title</label>
                    <input
                      type="text"
                      className="w-full p-2 px-2.5 border border-gray-300 rounded text-sm"
                      value={contact.book}
                      onChange={(e) => handleContactChange(contactIndex, 'book', e.target.value)}
                    />
                  </div>
                </div>
              ))}
              
              <div className="mb-5">
                <button 
                  type="button"
                  onClick={addNewContact}
                  className="px-4 py-2 bg-[#4CAF50] border border-gray-300 rounded cursor-pointer flex items-center gap-1.5 text-sm"
                >
                  <FaPlus /> Add Another Contact
                </button>
              </div>
              
              <div className="p-4 px-5 border-t border-gray-300 flex justify-end">
                <button 
                  type="button" 
                  className="px-4 py-2 bg-[#f59133] border border-gray-300 rounded cursor-pointer flex items-center gap-1.5 text-sm mr-2.5"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-[#f59133] border border-gray-300 rounded cursor-pointer flex items-center gap-1.5 text-sm bg-[#ff6b35] text-white border-[#ff6b35]"
                >
                  Create {contactsBatch.length} Contacts
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Contact Modal */}
      {showEditModal && contactToEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded w-full max-w-lg max-h-[90vh] overflow-y-auto text-black font-serif">
            <div className="p-4 px-5 border-b border-gray-300 flex justify-between items-center">
              <h3 className="text-lg font-bold m-0">Edit Contact</h3>
              <button 
                className="bg-none border-none cursor-pointer text-base text-gray-500"
                onClick={() => setShowEditModal(false)}
              >
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleEditContact}>
              <div className="mb-5 px-5">
                <label className="block mb-1 text-sm font-bold">Name*</label>
                <input
                  type="text"
                  className="w-full p-2 px-2.5 border border-gray-300 rounded text-sm"
                  value={contactToEdit.name}
                  onChange={(e) => setContactToEdit({...contactToEdit, name: e.target.value})}
                  required
                />
              </div>
              <div className="mb-5 px-5">
                <label className="block mb-1 text-sm font-bold">Email</label>
                <input
                  type="email"
                  className="w-full p-2 px-2.5 border border-gray-300 rounded text-sm"
                  value={contactToEdit.email}
                  onChange={(e) => setContactToEdit({...contactToEdit, email: e.target.value})}
                />
              </div>
              <div className="mb-5 px-5">
                <label className="block mb-1 text-sm font-bold">Phone</label>
                <input
                  type="tel"
                  className="w-full p-2 px-2.5 border border-gray-300 rounded text-sm"
                  value={contactToEdit.phone}
                  onChange={(e) => setContactToEdit({...contactToEdit, phone: e.target.value})}
                />
              </div>
              <div className="mb-5 px-5">
                <label className="block mb-1 text-sm font-bold">Lead Owner</label>
                <input
                  type="text"
                  className="w-full p-2 px-2.5 border border-gray-300 rounded text-sm"
                  value={contactToEdit.leadOwner}
                  onChange={(e) => setContactToEdit({...contactToEdit, leadOwner: e.target.value})}
                />
              </div>
              <div className="mb-5 px-5">
                <label className="block mb-1 text-sm font-bold">Author</label>
                <input
                  type="text"
                  className="w-full p-2 px-2.5 border border-gray-300 rounded text-sm"
                  value={contactToEdit.author}
                  onChange={(e) => setContactToEdit({...contactToEdit, author: e.target.value})}
                />
              </div>
              <div className="mb-5 px-5">
                <label className="block mb-1 text-sm font-bold">Publisher</label>
                <input
                  type="text"
                  className="w-full p-2 px-2.5 border border-gray-300 rounded text-sm"
                  value={contactToEdit.publisher}
                  onChange={(e) => setContactToEdit({...contactToEdit, publisher: e.target.value})}
                />
              </div>
              <div className="mb-5 px-5">
                <label className="block mb-1 text-sm font-bold">Book Title</label>
                <input
                  type="text"
                  className="w-full p-2 px-2.5 border border-gray-300 rounded text-sm"
                  value={contactToEdit.book}
                  onChange={(e) => setContactToEdit({...contactToEdit, book: e.target.value})}
                />
              </div>
              <div className="p-4 px-5 border-t border-gray-300 flex justify-end">
                <button 
                  type="button" 
                  className="px-4 py-2 bg-[#f59133] border border-gray-300 rounded cursor-pointer flex items-center gap-1.5 text-sm mr-2.5"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-[#f59133] border border-gray-300 rounded cursor-pointer flex items-center gap-1.5 text-sm bg-[#ff6b35] text-white border-[#ff6b35]"
                >
                  Update Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Contacts Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded w-full max-w-lg max-h-[90vh] overflow-y-auto text-black font-serif">
            <div className="p-4 px-5 border-b border-gray-300 flex justify-between items-center">
              <h3 className="text-lg font-bold m-0">Assign {selectedContacts.length} Contacts</h3>
              <button onClick={() => setShowAssignModal(false)} className="bg-none border-none cursor-pointer text-base text-gray-500">
                <FaTimes />
              </button>
            </div>
            <div className="mb-5 px-5">
              <label className="block mb-1 text-sm font-bold">Select Agent*</label>
              <select
                value={selectedAgent}
                onChange={(e) => setSelectedAgent(e.target.value)}
                className="w-full p-2 px-2.5 border border-gray-300 rounded text-sm bg-white"
                required
              >
                <option value="">-- Select Agent --</option>
                {agents.map(agent => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name} ({agent.email})
                  </option>
                ))}
              </select>
            </div>
            <div className="p-4 px-5 border-t border-gray-300 flex justify-end">
              <button 
                type="button" 
                className="px-4 py-2 bg-[#f59133] border border-gray-300 rounded cursor-pointer flex items-center gap-1.5 text-sm mr-2.5"
                onClick={() => setShowAssignModal(false)}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="px-4 py-2 bg-[#f59133] border border-gray-300 rounded cursor-pointer flex items-center gap-1.5 text-sm bg-[#ff6b35] text-white border-[#ff6b35] disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleBulkAssign}
                disabled={!selectedAgent}
              >
                Assign Contacts
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded w-full max-w-lg max-h-[90vh] overflow-y-auto text-black font-serif">
            <div className="p-4 px-5 border-b border-gray-300 flex justify-between items-center">
              <h3 className="text-lg font-bold m-0">
                Confirm Delete {Array.isArray(contactToDelete) ? `${contactToDelete.length} Contacts` : 'Contact'}
              </h3>
              <button 
                className="bg-none border-none cursor-pointer text-base text-gray-500"
                onClick={() => setShowDeleteModal(false)}
              >
                <FaTimes />
              </button>
            </div>
            <div className="p-5">
              <p>
                Are you sure you want to delete {Array.isArray(contactToDelete) 
                  ? `${contactToDelete.length} contacts` 
                  : 'this contact'}? This action cannot be undone.
              </p>
            </div>
            <div className="p-4 px-5 border-t border-gray-300 flex justify-end">
              <button 
                type="button" 
                className="px-4 py-2 bg-[#f59133] border border-gray-300 rounded cursor-pointer flex items-center gap-1.5 text-sm mr-2.5"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="px-4 py-2 bg-[#ff4444] border border-gray-300 rounded cursor-pointer flex items-center gap-1.5 text-sm text-white border-[#ff4444]"
                onClick={handleDeleteContact}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}