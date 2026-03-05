import React, { useState, useRef , useEffect} from 'react';
import { FaSearch, FaPhone, FaShoppingCart, FaQuestionCircle, FaBell, FaStar, FaUserCircle,FaSignOutAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
 const API_URL = import.meta.env.VITE_API_URL;


// Removed from the top level and moved inside the Navbar component

export default function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate(); // Moved here inside the Navbar component
  const dropdownRef = useRef(null);
  const userButtonRef = useRef(null);
  const [user, setUser] = useState(null); // Instead of agents, now using 'user

  const handleDropdownToggle = () => setDropdownOpen(!dropdownOpen);

  const handleLogout = async () => {
    try {
      const response = await fetch(`${API_URL}/api/logout`, {
        method: 'POST',
        credentials: 'include'
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close dropdown if clicked outside
      if (dropdownOpen && 
          dropdownRef.current && 
          !dropdownRef.current.contains(event.target) &&
          userButtonRef.current &&
          !userButtonRef.current.contains(event.target)) {
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
    <nav style={styles.nav}>
      
      <div style={styles.right}>
        
        <div style={styles.divider}></div>

        {/* User Dropdown */}
        <div style={styles.user} onClick={handleDropdownToggle}>
          <FaUserCircle style={styles.icon} />
          <span>Profile ▾</span>

          {/* Dropdown Menu */}
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
  );
}

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0E74A0', // Tailwind gray-900
    color: '#fff',
    padding: '0.5rem 1rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    fontFamily: 'sans-serif',
    margin: '0', // Resets all margins
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flexGrow: 1,
    maxWidth: '500px',
  },
  input: {
    backgroundColor: '#fff',
    color: '#fff',
    padding: '0.25rem 0.5rem',
    border: 'none',
    borderRadius: '6px',
    flexGrow: 1,
    fontSize: '0.9rem',
  },
  shortcut: {
    fontSize: '0.75rem',
    color: '#9ca3af',
    border: '1px solid #4b5563',
    borderRadius: '4px',
    padding: '2px 4px',
  },
  plus: {
    color: '#9ca3af',
    background: 'none',
    border: 'none',
    fontSize: '1.25rem',
    cursor: 'pointer',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginLeft: 'auto',
  },
  upgrade: {
    backgroundColor: '#f97316',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '0.4rem 0.75rem',
    fontSize: '0.85rem',
    cursor: 'pointer',
  },
  icon: {
    fontSize: '1rem',
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
  copilot: {
    fontSize: '0.85rem',
    color: '#d1d5db',
    cursor: 'pointer',
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
    top: '30px', // Adjust the position as needed
    right: '0',
    backgroundColor: '#fff',
    color: '#333',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    borderRadius: '6px',
    minWidth: '120px',
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
    backgroundColor: '#f1f5f9', // Tailwind gray-200
  },
};
