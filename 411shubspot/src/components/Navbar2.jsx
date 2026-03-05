import React, { useState, useRef, useEffect } from 'react';
import {
  FaSearch,
  FaPhone,
  FaShoppingCart,
  FaQuestionCircle,
  FaBell,
  FaStar,
  FaUserCircle,
  FaSignOutAlt,
  FaEnvelope,
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

export default function Navbar2() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showChatBox, setShowChatBox] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const userButtonRef = useRef(null);
  const [user, setUser] = useState(null);

  const handleDropdownToggle = () => setDropdownOpen(!dropdownOpen);

  const handleLogout = async () => {
    try {
      const response = await fetch(`${API_URL}/api/logout`, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        navigate('/login');
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const handleToggleChat = () => setShowChatBox(!showChatBox);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        userButtonRef.current &&
        !userButtonRef.current.contains(event.target)
      ) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch(`${API_URL}/api/current-agents`, {
          credentials: 'include',
        });
        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };

    fetchCurrentUser();
  }, []);

  return (
    <>
      <nav style={styles.nav}>
        <div style={styles.right}>
          {/* Message Icon */}
          <FaEnvelope
            style={styles.icon}
            title="Messages"
            onClick={() => navigate('/agentchat')}
            // onClick={handleToggleChat}
          />

          <div style={styles.divider}></div>

          {/* User Dropdown */}
          <div style={styles.user} onClick={handleDropdownToggle} ref={userButtonRef}>
            <FaUserCircle style={styles.icon} />
            <span>Profile ▾</span>

            {dropdownOpen && (
              <div style={styles.dropdown} ref={dropdownRef}>
                <div style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                    {user ? user.name : 'Loading...'}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '2px' }}>
                    {user ? user.email : ''}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#888' }}>
                    {user ? user.role : ''}
                  </div>
                </div>
                <button onClick={handleLogout} style={styles.dropdownItem}>
                  <FaSignOutAlt style={styles.icons} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Chat Box */}
      {showChatBox && (
        <div style={styles.chatBox}>
          <div style={styles.chatHeader}>
            <span>Chat</span>
            <button style={styles.closeButton} onClick={handleToggleChat}>×</button>
          </div>
          <div style={styles.chatBody}>
            <p style={{ color: '#666' }}>This is a simple chat box. You can place your chat UI here.</p>
          </div>
        </div>
      )}
    </>
  );
}

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0E74A0',
    color: '#fff',
    padding: '0.5rem 1rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    fontFamily: 'sans-serif',
    margin: '0',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginLeft: 'auto',
  },
  icon: {
    fontSize: '1.2rem',
    color: '#d1d5db',
    cursor: 'pointer',
  },
  icons: {
    fontSize: '1rem',
    color: '#4a87e2',
    cursor: 'pointer',
    marginTop: '0.2rem',
    marginRight: '0.5rem',
    top: '0.2rem',
    position: 'relative',
  },
  user: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.3rem',
    fontSize: '0.85rem',
    cursor: 'pointer',
    color: '#d1d5db',
    position: 'relative',
  },
  divider: {
    height: '20px',
    width: '1px',
    backgroundColor: '#4b5563',
    margin: '0 0.5rem',
  },
  dropdown: {
    position: 'absolute',
    top: '30px',
    right: '0',
    backgroundColor: '#fff',
    color: '#333',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    borderRadius: '6px',
    minWidth: '150px',
    zIndex: 1000,
  },
  dropdownItem: {
    backgroundColor: '#fff',
    padding: '0.5rem 1rem',
    border: 'none',
    width: '100%',
    textAlign: 'left',
    fontSize: '0.85rem',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  dropdownItemHover: {
    backgroundColor: '#f1f5f9',
  },

  // Chat Box Styles
  chatBox: {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    width: '300px',
    height: '350px',
    backgroundColor: '#fff',
    border: '1px solid #ccc',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
  },
  chatHeader: {
    backgroundColor: '#0E74A0',
    color: '#fff',
    padding: '10px',
    fontWeight: 'bold',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopLeftRadius: '8px',
    borderTopRightRadius: '8px',
  },
  chatBody: {
    flex: 1,
    padding: '10px',
    overflowY: 'auto',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    color: '#fff',
    fontSize: '1.2rem',
    cursor: 'pointer',
  },
};
