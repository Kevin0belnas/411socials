import { useState, useEffect } from 'react';
const API_URL = import.meta.env.VITE_API_URL;
import { useNavigate } from 'react-router-dom';


export default function ChangeLeads() {
  const [agents, setAgents] = useState([]);
  const [filteredAgents, setFilteredAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [clearing, setClearing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const navigate = useNavigate();
  

  // Styles
  const styles = {
    container: {
      padding: '24px',
      fontFamily: 'Arial, sans-serif'
    },
    card: {
      background: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      padding: '20px'
    },
    heading: {
      margin: '0 0 20px 0',
      color: '#333'
    },
    searchContainer: {
      position: 'relative',
      marginBottom: '20px',
      width: '300px'
    },
    searchInput: {
      width: '100%',
      padding: '8px 30px 8px 10px',
      border: '1px solid #ddd',
      borderRadius: '4px'
    },
    searchIcon: {
      position: 'absolute',
      right: '10px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#999'
    },
    tableContainer: {
      overflowX: 'auto'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse'
    },
    tableCell: {
      padding: '12px 15px',
      textAlign: 'left',
      borderBottom: '1px solid #ddd'
    },
    tableHeader: {
      backgroundColor: '#f5f5f5',
      fontWeight: 'bold'
    },
    clearButton: {
      background: 'none',
      border: 'none',
      color: '#ff4d4f',
      cursor: 'pointer',
      padding: '5px'
    },
    loadingContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh'
    },
    spinner: {
      border: '4px solid rgba(0, 0, 0, 0.1)',
      borderRadius: '50%',
      borderTop: '4px solid #1890ff',
      width: '40px',
      height: '40px',
      animation: 'spin 1s linear infinite'
    },
    errorContainer: {
      padding: '24px'
    },
    errorAlert: {
      backgroundColor: '#fff2f0',
      border: '1px solid #ffccc7',
      padding: '15px',
      borderRadius: '4px'
    },
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: showConfirm ? 'flex' : 'none',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    },
    confirmModal: {
      background: 'white',
      padding: '20px',
      borderRadius: '8px',
      width: '400px',
      maxWidth: '90%'
    },
    secondaryText: {
      color: '#666',
      fontSize: '0.9em'
    },
    modalActions: {
      display: 'flex',
      justifyContent: 'flex-end',
      marginTop: '20px',
      gap: '10px'
    },
    confirmButton: {
      background: '#ff4d4f',
      color: 'white',
      border: 'none',
      padding: '8px 16px',
      borderRadius: '4px',
      cursor: 'pointer'
    },
    cancelButton: {
      background: '#f5f5f5',
      border: '1px solid #d9d9d9',
      padding: '8px 16px',
      borderRadius: '4px',
      cursor: 'pointer'
    }
  };

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await fetch(`${API_URL}/api/agents`);
        if (!response.ok) {
          throw new Error('Failed to fetch agents');
        }
        const data = await response.json();
        setAgents(data);
        setFilteredAgents(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, []);

  useEffect(() => {
    const filtered = agents.filter(agent =>
      agent.name.toLowerCase().includes(searchText.toLowerCase()) ||
      agent.email.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredAgents(filtered);
  }, [searchText, agents]);

  const handleClearLeads = (agent) => {
    setSelectedAgent(agent);
    setShowConfirm(true);
  };

  const confirmClearLeads = async () => {
    setClearing(true);
    try {
      const response = await fetch(`${API_URL}/api/clear-leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ agentId: selectedAgent.id }),
      });

      if (!response.ok) {
        throw new Error('Failed to clear leads');
      }

      const result = await response.json();
      alert(`Successfully cleared leads for ${result.affectedRows} contacts`);

      navigate('/contacts'); // Redirect to contacts page after clearing leads
      
    } catch (err) {
      alert(err.message);
    } finally {
      setClearing(false);
      setShowConfirm(false);
      setSelectedAgent(null);
    }
  };

  const cancelClearLeads = () => {
    setShowConfirm(false);
    setSelectedAgent(null);
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading agents...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorAlert}>
          <h3>Error</h3>
          <p>{error}</p>
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.heading}>Clear Agent Leads</h2>
        
        <div style={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search agents..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={styles.searchInput}
          />
          <span style={styles.searchIcon}>🔍</span>
        </div>

        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{ ...styles.tableCell, ...styles.tableHeader }}>Name</th>
                <th style={{ ...styles.tableCell, ...styles.tableHeader }}>Email</th>
                <th style={{ ...styles.tableCell, ...styles.tableHeader }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAgents.map(agent => (
                <tr key={agent.id}>
                  <td style={styles.tableCell}>{agent.name}</td>
                  <td style={styles.tableCell}>{agent.email}</td>
                  <td style={styles.tableCell}>
                    <button 
                      style={styles.clearButton}
                      onClick={() => handleClearLeads(agent)}
                    >
                      Clear Leads
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={styles.modalOverlay}>
        <div style={styles.confirmModal}>
          <h3>Confirm Clear Leads</h3>
          <p>Are you sure you want to clear leads for: <strong>{selectedAgent?.name}</strong>?</p>
          <p style={styles.secondaryText}>
            This will remove lead ownership for all unrated or non-Flagged contacts currently assigned to this agent.
          </p>
          <div style={styles.modalActions}>
            <button 
              style={styles.cancelButton}
              onClick={cancelClearLeads}
              disabled={clearing}
            >
              Cancel
            </button>
            <button 
              style={{
                ...styles.confirmButton,
                backgroundColor: clearing ? '#ffccc7' : '#ff4d4f'
              }}
              onClick={confirmClearLeads}
              disabled={clearing}
            >
              {clearing ? 'Clearing...' : 'Clear Leads'}
            </button>
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          button:hover {
            opacity: 0.8;
          }
          .clear-btn:hover {
            text-decoration: underline;
          }
          tr:hover {
            background-color: #f9f9f9;
          }
        `}
      </style>
    </div>
  );
}