import React, { useState, useEffect } from "react";
import { FaTimes, FaPlus, FaLock, FaPen, FaTrash } from "react-icons/fa";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const API_URL = import.meta.env.VITE_API_URL;

// Main Page Component
const NBSPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [entries, setEntries] = useState([]);
  const [newEntry, setNewEntry] = useState({
    date: "",
    services: "",
    author: "",
    book: "",
    price: "",
    availability: "",
    genre: "",
    isbn: "",
    email: "",
    phone: ""
  });

  const [entryToDelete, setEntryToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const openEditModal = (entry) => {
  setEditingEntry(entry);
  setShowEditModal(true);
};

// Fetch existing entries on component mount
  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const response = await fetch(`${API_URL}/api/service-entries`);
        const data = await response.json();
        setEntries(data);
      } catch (error) {
        console.error('Error fetching entries:', error);
        toast.error('Failed to load entries');
      }
    };
    fetchEntries();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/service-entries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEntry),
      });

      if (!response.ok) {
        throw new Error('Failed to save data');
      }

      const result = await response.json();
      toast.success("Service entry created successfully!");
        console.log('Entry created:', result);
      
      // Refresh the entries list
      const updatedResponse = await fetch(`${API_URL}/api/service-entries`);
      const updatedData = await updatedResponse.json();
      setEntries(updatedData);

      // Reset form and close modal
      setNewEntry({
        date: "",
        services: "",
        author: "",
        book: "",
        price: "",
        availability: "",
        genre: "",
        isbn: "",
        email: "",
        phone: ""
      });
      setShowModal(false);
    } catch (error) {
      console.error('Error saving entry:', error);
      toast.error("Failed to create entry");
    }
  };

const handleUpdate = async (e) => {
  e.preventDefault();
  try {
    const response = await fetch(`${API_URL}/api/service-entries/${editingEntry.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: editingEntry.date,
        services: editingEntry.services,
        author: editingEntry.author,
        book: editingEntry.book,
        price: editingEntry.price,
        availability: editingEntry.availability,
        genre: editingEntry.genre,
        isbn: editingEntry.isbn,
        email: editingEntry.email,
        phone: editingEntry.phone
      })
    });
    
    if (!response.ok) throw new Error(await response.text());
    
    toast.success("NBSP service entry updated successfully!");
    setShowEditModal(false);
    
    // Refresh the entries list
    const updatedResponse = await fetch(`${API_URL}/api/service-entries`);
    const updatedData = await updatedResponse.json();
    setEntries(updatedData);
  } catch (error) {
    toast.error(error.message);
  }
};

const handleDelete = async () => {
  try {
    const response = await fetch(`${API_URL}/api/service-entries/${entryToDelete}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) throw new Error(await response.text());

    toast.success("Entry deleted successfully!");
    setShowDeleteModal(false);
    
    // Refresh the entries list
    const updatedResponse = await fetch(`${API_URL}/api/service-entries`);
    const updatedData = await updatedResponse.json();
    setEntries(updatedData);
  } catch (error) {
    toast.error(error.message);
  }
};

 
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.leftHeader}>
          <div style={styles.left}>
            <div style={styles.title}>NBSP Service Entries</div>
            <div style={styles.subtext}>Manage your NBSP service entries</div>
          </div>
          <div style={styles.rightButtons}>
            <div style={styles.lockText}>
              <FaLock /> Admin Mode
            </div>
            <button 
              style={{ ...styles.button, ...styles.orangeBtn }}
              onClick={() => setShowModal(true)}
            >
              <FaPlus /> Create New Entry
            </button>
          </div>
        </div>
      </div>

            {/* Table showing existing entries */}
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Services</th>
                <th style={styles.th}>Author</th>
                <th style={styles.th}>Book</th>
                <th style={styles.th}>Price</th>
                <th style={styles.th}>Availability</th>
                <th style={styles.th}>Genre</th>
                <th style={styles.th}>ISBN</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Phone</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {entries.length > 0 ? (
                entries.map(entry => (
                  <tr key={entry.id}>
                    <td style={styles.td}>{new Date(entry.date).toLocaleDateString()}</td>
                    <td style={styles.td}>{entry.services || '-'}</td>
                    <td style={styles.td}>{entry.author || '-'}</td>
                    <td style={styles.td}>{entry.book || '-'}</td>
                    <td style={styles.td}>{entry.price ? `$${parseFloat(entry.price).toFixed(2)}` : '-'}</td>
                    <td style={styles.td}>{entry.availability || '-'}</td>
                    <td style={styles.td}>{entry.genre || '-'}</td>
                    <td style={styles.td}>{entry.isbn || '-'}</td>
                    <td style={styles.td}>{entry.email || '-'}</td>
                    <td style={styles.td}>{entry.phone || '-'}</td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button 
                          style={styles.smallButton}
                          onClick={() => openEditModal(entry)}
                        >
                          <FaPen size={10} /> Edit
                        </button>
                        <button 
                          style={{ ...styles.smallButton, ...styles.deleteButton }}
                          onClick={() => {
                            setEntryToDelete(entry.id);
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
                  <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                    No data as of the moment
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

 {/* Create Modal */}
      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Create New Service Entry</h3>
              <button style={styles.closeButton} onClick={() => setShowModal(false)}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Date*</label>
                <input
                  type="date"
                  style={styles.input}
                  value={newEntry.date}
                  onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Services*</label>
                <input
                  type="text"
                  style={styles.input}
                  value={newEntry.services}
                  onChange={(e) => setNewEntry({ ...newEntry, services: e.target.value })}
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Author Name</label>
                <input
                  type="text"
                  style={styles.input}
                  value={newEntry.author}
                  onChange={(e) => setNewEntry({ ...newEntry, author: e.target.value })}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Book Name</label>
                <input
                  type="text"
                  style={styles.input}
                  value={newEntry.book}
                  onChange={(e) => setNewEntry({ ...newEntry, book: e.target.value })}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Price</label>
                <input
                  type="number"
                  step="0.01"
                  style={styles.input}
                  value={newEntry.price}
                  onChange={(e) => setNewEntry({ ...newEntry, price: e.target.value })}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Book Availability</label>
                <select
                  style={styles.input}
                  value={newEntry.availability}
                  onChange={(e) => setNewEntry({ ...newEntry, availability: e.target.value })}
                >
                  <option value="">Select Availability</option>
                  <option value="Available">Available</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Genre</label>
                <input
                  type="text"
                  style={styles.input}
                  value={newEntry.genre}
                  onChange={(e) => setNewEntry({ ...newEntry, genre: e.target.value })}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>ISBN</label>
                <input
                  type="text"
                  style={styles.input}
                  value={newEntry.isbn}
                  onChange={(e) => setNewEntry({ ...newEntry, isbn: e.target.value })}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Email Address</label>
                <input
                  type="email"
                  style={styles.input}
                  value={newEntry.email}
                  onChange={(e) => setNewEntry({ ...newEntry, email: e.target.value })}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Contact Number</label>
                <input
                  type="text"
                  style={styles.input}
                  placeholder="Enter phone number"
                  value={newEntry.phone}
                  onChange={(e) => setNewEntry({ ...newEntry, phone: e.target.value })}
                />
                {/* <small style={{ fontSize: '12px', color: '#888' }}>
                  Separate multiple numbers with commas
                </small> */}
              </div>
              <div style={styles.modalButtons}>
                <button
                  type="button"
                  style={{ ...styles.button, marginRight: '10px' }}
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" style={{ ...styles.button, ...styles.orangeBtn }}>
                  Create Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    {/* Edit Modal */}
      {showEditModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Edit Service Entry</h3>
              <button style={styles.closeButton} onClick={() => setShowEditModal(false)}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleUpdate}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Date*</label>
                <input
                  type="date"
                  style={styles.input}
                  // value={editingEntry?.date || ''}
                  value={editingEntry?.date ? editingEntry.date.split('T')[0] : ''}
                  onChange={(e) => setEditingEntry({ ...editingEntry, date: e.target.value })}
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Services*</label>
                <input
                  type="text"
                  style={styles.input}
                  value={editingEntry?.services || ''}
                  onChange={(e) => setEditingEntry({ ...editingEntry, services: e.target.value })}
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Author Name</label>
                <input
                  type="text"
                  style={styles.input}
                  value={editingEntry?.author || ''}
                  onChange={(e) => setEditingEntry({ ...editingEntry, author: e.target.value })}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Book Name</label>
                <input
                  type="text"
                  style={styles.input}
                  value={editingEntry?.book || ''}
                  onChange={(e) => setEditingEntry({ ...editingEntry, book: e.target.value })}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Price</label>
                <input
                  type="number"
                  step="0.01"
                  style={styles.input}
                  value={editingEntry?.price || ''}
                  onChange={(e) => setEditingEntry({ ...editingEntry, price: e.target.value })}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Book Availability</label>
                <select
                  style={styles.input}
                  value={editingEntry?.availability || ''}
                  onChange={(e) => setEditingEntry({ ...editingEntry, availability: e.target.value })}
                >
                  <option value="">Select Availability</option>
                  <option value="Available">Available</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Genre</label>
                <input
                  type="text"
                  style={styles.input}
                  value={editingEntry?.genre || ''}
                  onChange={(e) => setEditingEntry({ ...editingEntry, genre: e.target.value })}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>ISBN</label>
                <input
                  type="text"
                  style={styles.input}
                  value={editingEntry?.isbn || ''}
                  onChange={(e) => setEditingEntry({ ...editingEntry, isbn: e.target.value })}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Email Address</label>
                <input
                  type="email"
                  style={styles.input}
                  value={editingEntry?.email || ''}
                  onChange={(e) => setEditingEntry({ ...editingEntry, email: e.target.value })}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Contact Number</label>
                <input
                  type="text"
                  style={styles.input}
                  placeholder="Enter phone number"
                  value={editingEntry?.phone || ''}
                  onChange={(e) => setEditingEntry({ ...editingEntry, phone: e.target.value })}
                />
                {/* <small style={{ fontSize: '12px', color: '#888' }}>
                  Separate multiple numbers with commas
                </small> */}
              </div>
              <div style={styles.modalButtons}>
                <button
                  type="button"
                  style={{ ...styles.button, marginRight: '10px' }}
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" style={{ ...styles.button, ...styles.orangeBtn }}>
                  Update Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

       {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modal, maxWidth: '400px' }}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Confirm Deletion</h3>
              <button style={styles.closeButton} onClick={() => setShowDeleteModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div style={{ padding: '20px' }}>
              <p>Are you sure you want to delete this entry? This action cannot be undone.</p>
            </div>
            <div style={{ ...styles.modalButtons, justifyContent: 'flex-end' }}>
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
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NBSPage;



// Styles
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
    backgroundColor: '#0B79A1',
    borderRadius: '4px',
    justifyContent: 'space-between',
    width: '100%',
    padding: '15px 20px',
    color: 'white',
    fontFamily: 'Times New Roman, Times, serif',
  },
  left: {
    display: 'flex',
    flexDirection: 'column',
  },
  title: {
    fontSize: '24px',
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
    gap: '15px',
  },
  lockText: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '14px',
  },
  button: {
    padding: '8px 16px',
    backgroundColor: '#f0f0f0',
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
    padding: '12px 15px',
    textAlign: 'left',
    backgroundColor: '#0B79A1',
    borderBottom: '1px solid #ddd',
    fontWeight: 'bold',
    fontSize: '14px',
    color: 'white',
    fontFamily: 'Times New Roman', 
  },
  td: {
    padding: '12px 15px',
    borderBottom: '1px solid #ddd',
    fontSize: '14px',
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
    color: 'black',
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
  modalButtons: {
    padding: '15px 20px',
    borderTop: '1px solid #ddd',
    display: 'flex',
    justifyContent: 'flex-end',
  },

   smallButton: {
    padding: '4px 8px',
    fontSize: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    backgroundColor: '#f0f0f0',
    border: '1px solid #ddd',
    borderRadius: '3px',
    cursor: 'pointer'
  },
  deleteButton: {
    backgroundColor: '#ffebee',
    borderColor: '#ffcdd2',
    color: '#c62828'
  },
  checkbox: {
    cursor: 'pointer'
  }
};