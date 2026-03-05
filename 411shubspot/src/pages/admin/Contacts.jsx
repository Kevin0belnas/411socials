
import React, { useState, useEffect } from "react";
import { 
  FaLock, FaSearch, FaPlus, FaFilter, FaUser, FaCalendarAlt, 
  FaPhone, FaEnvelope, FaBook, FaPen, FaTrash, FaTimes, 
  FaChevronLeft, FaChevronRight 
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
  // const [newContact, setNewContact] = useState({
  //   name: "",
  //   email: "",
  //   phone: "",
  //   leadOwner: "",
  //   author: "",
  //   publisher: "",
  //   book: ""
  // });
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

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch contacts with pagination
        let contactsUrl = `${API_URL}/api/contacts?page=${currentPage}&pageSize=${pageSize}`;
        const params = new URLSearchParams();
        
        if (searchTerm) params.append('search', searchTerm);
        if (activeTab === 'my') params.append('view', 'my');
        if (activeTab === 'unassigned') params.append('view', 'unassigned');
        
        if (params.toString()) contactsUrl += `&${params.toString()}`;
        
        // Fetch contacts and agents in parallel
        const [contactsResponse, agentsResponse] = await Promise.all([
          fetch(contactsUrl),
          fetch(`${API_URL}/api/agents`)
        ]);

        // Handle contacts response
        const contactsData = await contactsResponse.json();
        const receivedContacts = Array.isArray(contactsData) ? contactsData : contactsData.contacts || [];
        setContacts(receivedContacts);
        
        // Handle agents response
        const agentsData = await agentsResponse.json();
        if (!Array.isArray(agentsData)) {
          throw new Error('Agents data is not in expected format');
        }
        
        setAgents(agentsData);
        setStats({
          total: contactsData.totalCount || receivedContacts.length,
          assigned: contactsData.assignedCount || receivedContacts.filter(c => c.assigned_to).length,
          unassigned: contactsData.unassignedCount || receivedContacts.filter(c => !c.assigned_to).length
        });

      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [searchTerm, activeTab, pageSize, currentPage]);

  const handleRedirect = () => {
    navigate('/changeleads');
  };
  // Contact CRUD operations
  const handleCreateContacts = async (e) => {
  e.preventDefault();
  try {
    // Prepare all contacts for submission
    const contactsToSubmit = contactsBatch.map(contact => ({
      name: contact.name,
      email: contact.email,
      phone: JSON.stringify(contact.phone.filter(p => p !== "")),
      leadOwner: contact.leadOwner,
      author: contact.author,
      publisher: contact.publisher,
      bookTitle: contact.book
    })).filter(contact => contact.name.trim() !== ""); // Only submit contacts with names

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
  
  // Add new empty field if editing last one
  if (phoneIndex === updatedPhones.length - 1 && value.trim() !== "") {
    updatedPhones.push("");
  }
  
  // Remove empty fields except last one
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
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Bulk operations
  // const handleBulkAssign = async () => {
  //   if (!selectedAgent) {
  //     toast.error("Please select an agent first");
  //     return;
  //   }

  //   try {
  //     const response = await fetch(`${API_URL}/api/contacts/bulk-assign`, {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({
  //         contactIds: selectedContacts,
  //         assignedTo: selectedAgent
  //       })
  //     });
      
  //     if (!response.ok) throw new Error(await response.text());
      
  //     const result = await response.json();
  //     toast.success(`${result.count} contacts assigned successfully!`);
  //     setShowAssignModal(false);
  //     setSelectedContacts([]);
  //     setSelectAll(false);
  //     refreshContacts();
  //   } catch (error) {
  //     toast.error(error.message);
  //   }
  // };
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
    
    // ✅ BROWSER ALERT MESSAGES:
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
  } catch (error) {
    console.error('Error in handleBulkAssign:', error);
    alert(`❌ Error: ${error.message || 'Failed to assign leads'}`);
  }
};

  // Helper functions
  const refreshContacts = async () => {
    const response = await fetch(
      `${API_URL}/api/contacts?page=${currentPage}&pageSize=${pageSize}`
    );
    const data = await response.json();
    setContacts(data.contacts || data);
  };

  const toggleSelectAll = (e) => {
    const isChecked = e.target.checked;
    setSelectAll(isChecked);
    setSelectedContacts(isChecked ? contacts.filter(c => !c.assigned_to).map(c => c.id) : []);
  };

  const toggleContactSelection = (contactId) => {
    const contact = contacts.find(c => c.id === contactId);
    if (contact?.assigned_to) return; // Skip if contact is already assigned
    
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

  // Pagination component
  const PaginationControls = () => {
    const totalPages = Math.ceil(stats.total / pageSize);
    
    return (
      <div style={styles.pagination}>
        <div style={styles.pageSizeControls}>
          <span>Show: </span>
          <select 
            value={pageSize} 
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            style={styles.pageSizeSelect}
          >
            {[10, 25, 50, 100, 500,1000, 2000].map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
          <span> contacts per page</span>
        </div>
        
        <div style={styles.pageNavigation}>
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            style={styles.pageButton}
          >
            <FaChevronLeft size={12} />
          </button>
          <span style={styles.pageInfo}>
            Page {currentPage} of {totalPages}
          </span>
          <button 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            style={styles.pageButton}
          >
            <FaChevronRight size={12} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.leftHeader}>
        <div style={styles.left}>
          <span style={styles.title}>Contacts</span>
          <span style={styles.subtext}>
            {stats.total} records ({stats.assigned} assigned, {stats.unassigned} unassigned)
          </span>
        </div>
        <div style={styles.rightButtons}>
          
          <button style={styles.button} onClick={handleRedirect}>
                Change Leads
              </button>          
          <button 
            style={{ ...styles.button, ...styles.orangeBtn }}
            onClick={() => setShowCreateModal(true)}
          >
            <FaPlus size={12} /> Create contact
          </button>
        </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        <div 
          style={{ ...styles.tab, ...(activeTab === 'all' && styles.activeTab) }}
          onClick={() => setActiveTab('all')}
        >
          All contacts
        </div>
        <div 
          style={{ ...styles.tab, ...(activeTab === 'unassigned' && styles.activeTab) }}
          onClick={() => setActiveTab('unassigned')}
        >
          Unassigned contacts
        </div>
        
      </div>


      {/* Search Bar */}
      <div style={styles.searchContainer}>
        <FaSearch style={styles.searchIcon} />
        <input
          type="text"
          placeholder="Search name, phone, email"
          style={styles.searchBar}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Bulk Actions */}
      {selectedContacts.length > 0 && (
        <div style={styles.bulkActions}>
          <span>{selectedContacts.length} unassigned contacts selected</span>
          {contacts.some(c => c.assigned_to && selectedContacts.includes(c.id)) && (
            <span style={{ color: '#999', marginLeft: 10 }}>
              (Assigned contacts cannot be selected)
            </span>
          )}
          <button 
            style={styles.smallButton}
            onClick={() => setShowAssignModal(true)}
          >
            <FaUser size={10} /> Assign to Agent
          </button>
          
        </div>
      )}

      {/* Pagination */}
      <PaginationControls />

      {/* Table */}
      {loading ? (
        <div style={styles.loading}>Loading contacts...</div>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={toggleSelectAll}
                    style={styles.checkbox}
                  />
                </th>
                <th style={styles.th}>AUTHOR & LEAD OWNER</th>
                {/* <th style={styles.th}>LEAD OWNER</th> */}
                <th style={styles.th}>EMAIL & PHONE</th>
                <th style={styles.th}>BOOK TITLE</th>
                <th style={styles.th}>COMMENTS</th>
                <th style={styles.th}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {contacts.length > 0 ? (
                contacts.map(contact => (
                  <tr key={contact.id}>
                    <td style={styles.td}>
                      <input
                        type="checkbox"
                        checked={selectedContacts.includes(contact.id)}
                        onChange={() => toggleContactSelection(contact.id)}
                        style={styles.checkbox}
                        disabled={!!contact.assigned_to}
                        title={contact.assigned_to ? "Already assigned" : ""}
                      />
                      {contact.assigned_to && <FaLock size={12} style={{ marginLeft: 5 }} />}
                    </td>
                    <td style={styles.td}>
                      <div>
                        <div><strong>Author:</strong> {contact.name || '-'}</div>
                        <div style={{marginTop: '4px', color: 'blue'}}><strong>Lead Owner:</strong> {contact.lead_owner || '-'}</div>
                      </div>
                    </td>
                    {/* <td style={styles.td}>{contact.name || '-'}</td>
                    <td style={styles.td}>{contact.lead_owner || '-'}</td> */}
                    {/* <td style={styles.td}>{contact.email || '-'}</td> */}
                    <td style={styles.td}>
                    <div>
                      <div>{contact.email || '-'}</div>
                      <div style={{marginTop: '4px', fontSize: '0.9em', color: 'blue'}}>
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
                    <td
                      style={{
                        ...styles.td,
                        maxWidth: '170px',
                        wordBreak: 'break-word', // allow long words to break to the next line
                        overflowWrap: 'break-word', // ensures wrapping on long words
                        whiteSpace: 'normal' // allow text to wrap normally
                      }}
                    >
                      {contact.book_title || '-'}
                    </td>

                   
                    {/* <td style={styles.td}>
                      {(() => {
                        try {
                          const phones = JSON.parse(contact.phone);
                          return Array.isArray(phones) ? phones.join(', ') : contact.phone;
                        } catch {
                          return contact.phone || '-';
                        }
                      })()}
                    </td> */}
                    <td style={styles.td}>{contact.comments || "-"}</td>


                    <td style={styles.td}>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button 
                          style={styles.smallButton}
                          onClick={() => openEditModal(contact)}
                        >
                          <FaPen size={10} /> Edit
                        </button>
                        <button 
                          style={{ ...styles.smallButton, ...styles.deleteButton }}
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
                  <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                    No contacts found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
      )}
      
      <PaginationControls />

      {/* Create Contact Modal */}
      {showCreateModal && (
  <div style={styles.modalOverlay}>
    <div style={{...styles.modal, width: '800px', maxHeight: '90vh', overflowY: 'auto'}}>
      <div style={styles.modalHeader}>
        <h3 style={styles.modalTitle}>Create Multiple Contacts</h3>
        <button 
          style={styles.closeButton}
          onClick={() => setShowCreateModal(false)}
        >
          <FaTimes />
        </button>
      </div>
      <form onSubmit={handleCreateContacts}>
        {contactsBatch.map((contact, contactIndex) => (
          <div key={contactIndex} style={{
            marginBottom: '20px',
            padding: '15px',
            border: '1px solid #eee',
            borderRadius: '5px',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              top: '5px',
              right: '5px',
              display: 'flex',
              gap: '5px'
            }}>
              <button 
                type="button"
                onClick={() => removeContact(contactIndex)}
                style={{
                  background: '#ff4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '3px',
                  padding: '2px 5px',
                  cursor: 'pointer'
                }}
                disabled={contactsBatch.length <= 1}
              >
                <FaTimes />
              </button>
            </div>
            
            <h4 style={{marginTop: '0', marginBottom: '15px'}}>Contact #{contactIndex + 1}</h4>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Name*</label>
              <input
                type="text"
                style={styles.input}
                value={contact.name}
                onChange={(e) => handleContactChange(contactIndex, 'name', e.target.value)}
                required
              />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                style={styles.input}
                value={contact.email}
                onChange={(e) => handleContactChange(contactIndex, 'email', e.target.value)}
              />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Phone Numbers</label>
              {contact.phone.map((phone, phoneIndex) => (
                <div key={phoneIndex} style={{display: 'flex', alignItems: 'center', marginBottom: '5px'}}>
                  <input
                    type="tel"
                    style={{...styles.input, flex: 1}}
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
                      style={{...styles.button, marginLeft: '5px', padding: '5px 10px'}}
                    >
                      <FaTimes />
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Author</label>
              <input
                type="text"
                style={styles.input}
                value={contact.author}
                onChange={(e) => handleContactChange(contactIndex, 'author', e.target.value)}
              />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Publisher</label>
              <input
                type="text"
                style={styles.input}
                value={contact.publisher}
                onChange={(e) => handleContactChange(contactIndex, 'publisher', e.target.value)}
              />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Book Title</label>
              <input
                type="text"
                style={styles.input}
                value={contact.book}
                onChange={(e) => handleContactChange(contactIndex, 'book', e.target.value)}
              />
            </div>
          </div>
        ))}
        
        <div style={{marginBottom: '20px'}}>
          <button 
            type="button"
            onClick={addNewContact}
            style={{...styles.button, background: '#4CAF50'}}
          >
            <FaPlus /> Add Another Contact
          </button>
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
            Create {contactsBatch.length} Contacts
          </button>
        </div>
      </form>
    </div>
  </div>
)}

      {/* Edit Contact Modal */}
      {showEditModal && contactToEdit && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Edit Contact</h3>
              <button 
                style={styles.closeButton}
                onClick={() => setShowEditModal(false)}
              >
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleEditContact}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Name*</label>
                <input
                  type="text"
                  style={styles.input}
                  value={contactToEdit.name}
                  onChange={(e) => setContactToEdit({...contactToEdit, name: e.target.value})}
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Email</label>
                <input
                  type="email"
                  style={styles.input}
                  value={contactToEdit.email}
                  onChange={(e) => setContactToEdit({...contactToEdit, email: e.target.value})}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Phone</label>
                <input
                  type="tel"
                  style={styles.input}
                  value={contactToEdit.phone}
                  onChange={(e) => setContactToEdit({...contactToEdit, phone: e.target.value})}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Lead Owner</label>
                <input
                  type="text"
                  style={styles.input}
                  value={contactToEdit.leadOwner}
                  onChange={(e) => setContactToEdit({...contactToEdit, leadOwner: e.target.value})}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Author</label>
                <input
                  type="text"
                  style={styles.input}
                  value={contactToEdit.author}
                  onChange={(e) => setContactToEdit({...contactToEdit, author: e.target.value})}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Publisher</label>
                <input
                  type="text"
                  style={styles.input}
                  value={contactToEdit.publisher}
                  onChange={(e) => setContactToEdit({...contactToEdit, publisher: e.target.value})}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Book Title</label>
                <input
                  type="text"
                  style={styles.input}
                  value={contactToEdit.book}
                  onChange={(e) => setContactToEdit({...contactToEdit, book: e.target.value})}
                />
              </div>
              <div style={styles.modalButtons}>
                <button 
                  type="button" 
                  style={{ ...styles.button, marginRight: '10px' }}
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  style={{ ...styles.button, ...styles.orangeBtn }}
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
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Assign {selectedContacts.length} Contacts</h3>
              <button onClick={() => setShowAssignModal(false)} style={styles.closeButton}>
                <FaTimes />
              </button>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Select Agent*</label>
              <select
                value={selectedAgent}
                onChange={(e) => setSelectedAgent(e.target.value)}
                style={styles.select}
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
            <div style={styles.modalButtons}>
              <button 
                type="button" 
                style={{ ...styles.button, marginRight: '10px' }}
                onClick={() => setShowAssignModal(false)}
              >
                Cancel
              </button>
              <button 
                type="button" 
                style={{ ...styles.button, ...styles.orangeBtn }}
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
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                Confirm Delete {Array.isArray(contactToDelete) ? `${contactToDelete.length} Contacts` : 'Contact'}
              </h3>
              <button 
                style={styles.closeButton}
                onClick={() => setShowDeleteModal(false)}
              >
                <FaTimes />
              </button>
            </div>
            <div style={styles.modalContent}>
              <p>
                Are you sure you want to delete {Array.isArray(contactToDelete) 
                  ? `${contactToDelete.length} contacts` 
                  : 'this contact'}? This action cannot be undone.
              </p>
            </div>
            <div style={styles.modalButtons}>
              <button 
                type="button" 
                style={{ ...styles.button, marginRight: '10px' }}
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button 
                type="button" 
                style={{ ...styles.button, ...styles.deleteButton }}
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

// Styles (make sure to include these at the bottom of your file)
const styles = {
   container: {
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    padding: '20px',
    backgroundColor: '#f5f5f5',
    minHeight: '100vh',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  leftHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    backgroundColor: '#0B79A1', p: 2, borderRadius: 2,
    justifyContent: 'space-between',
    width: '100%',
    padding: '10px',
    color: 'white' ,
    fontFamily: 'Times New Roman, Times, serif',
    fontSize: '100px',
  },

  left: {
    display: 'flex',
    flexDirection: 'column',

  },
  title: {
    fontSize: '40px',
    fontWeight: 'bold',
    marginBottom: '5px',
  },
  subtext: {
    fontSize: '14px',
    color: 'white',
  },
  rightButtons: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  lockText: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '14px',
    color: '#666',
  },
  button: {
    padding: '8px 16px',
    backgroundColor: '#f59133',
    border: '1px solid #ddd',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '14px',
  },
  orangeBtn: {
    backgroundColor: '#ff6b35',
    color: 'white',
    borderColor: '#ff6b35',
  },
  dropdownIcon: {
    fontSize: '10px',
    marginLeft: '5px',
  },
  tabs: {
    display: 'flex',
    borderBottom: '1px solid #ddd',
    marginBottom: '20px',
  },
  tab: {
    padding: '10px 20px',
    cursor: 'pointer',
    borderBottom: '2px solid transparent',
    fontSize: '14px',
  },
  activeTab: {
    borderBottom: '2px solid #ff6b35',
    fontWeight: 'bold',
  },
  filters: {
    display: 'flex',
    gap: '20px',
    fontSize: '14px',
    color: '#666',
    marginBottom: '20px',
    alignItems: 'center',
  },
  searchContainer: {
    position: 'relative',
    marginBottom: '20px',
    width: '100%',
    maxWidth: '400px',
  },
  searchIcon: {
    position: 'absolute',
    left: '10px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#999',
  },
  searchBar: {
    width: '100%',
    padding: '8px 10px 8px 35px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '14px',
  },
  bulkActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '20px',
    padding: '10px',
    backgroundColor: '#f0f0f0',
    borderRadius: '4px',
    fontSize: '14px',
  },
  smallButton: {
    padding: '5px 10px',
    fontSize: '10px',
    backgroundColor: '#00A550',
    border: '1px solid #ddd',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    color: 'white',
  },
  deleteButton: {
    backgroundColor: '#ff4444',
    color: 'white',
    borderColor: '#ff4444',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  pageSizeControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '14px',
  },
  pageSizeSelect: {
    padding: '5px',
    border: '1px solid #ddd',
    borderRadius: '4px',
  },
  pageNavigation: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  pageButton: {
    padding: '5px 10px',
    backgroundColor: '#f0f0f0',
    border: '1px solid #ddd',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  pageInfo: {
    fontSize: '12px',
  },
  tableContainer: {
    backgroundColor: 'white',
    borderRadius: '4px',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    padding: '8px 11px',
    textAlign: 'left',
    backgroundColor: '#0B79A1',
    borderBottom: '1px solid #ddd',
    fontWeight: 'bold',
    fontSize: '14px',
    color: 'white',
    fontFamily: 'Times New Roman', 
  },
  td: {
    padding: '8px 11px',
    borderBottom: '1px solid #ddd',
    fontSize: '14px',
  },
  checkbox: {
    cursor: 'pointer',
  },
  loading: {
    padding: '20px',
    textAlign: 'center',
    color: '#666',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '4px',
    width: '100%',
    maxWidth: '500px',
    maxHeight: '90vh',
    overflowY: 'auto',
    color: 'black' ,
    fontFamily: 'Times New Roman',
  },
  modalHeader: {
    padding: '15px 20px',
    borderBottom: '1px solid #ddd',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    margin: 0,
  },
  closeButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    color: '#666',
  },
  formGroup: {
    marginBottom: '20px',
    padding: '0 20px',
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    padding: '8px 10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
  },
  select: {
    width: '100%',
    padding: '8px 10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    backgroundColor: 'white',
  },
  modalContent: {
    padding: '20px',
  },
  modalButtons: {
    padding: '15px 20px',
    borderTop: '1px solid #ddd',
    display: 'flex',
    justifyContent: 'flex-end',
  },
};