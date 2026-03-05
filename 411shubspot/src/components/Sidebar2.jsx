import React, { useState } from 'react';
import { Link  } from 'react-router-dom';
import { 
  FaHubspot,
  FaHome, 
  FaUser, 
  
  FaChartLine,
  FaCalendarAlt,
  FaSignOutAlt,
  FaTasks,
  FaCheckCircle,
  FaFileAlt,
} from 'react-icons/fa';

export default function Sidebar() {
  const [expanded, setExpanded] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);

  // Logout function


  return (
    <aside 
      style={{
        ...styles.sidebar,
        width: expanded ? '180px' : '50px'
      }}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      {/* Logo with icon - text only shows on hover */}
      <div style={styles.logoContainer}>
        <img 
          src="/logo2.png" 
          alt="Logo" 
          style={styles.logoIcon} 
        />
        <h1 style={{
          ...styles.logoText,
          opacity: expanded ? 1 : 0,
          width: expanded ? 'auto' : 0
        }}>
          411 Socials CRM
        </h1>
      </div>
      
      {/* Navigation items that expand on hover */}
      <ul style={{
        listStyle: 'none',
        padding: 0,
        margin: 0,
      }}>
        {[
        //   { icon: <FaHome />, name: "Home", path: "/home" },
        //   { icon: <FaUser />, name: "Contacts", path: "/contacts" },
          // { icon: <FaChartLine />, name: "Dashboard", path: "/employeedashboard" },
        //   { icon: <FaCalendarAlt />, name: "Calendar", path: "/calendar" },
          { icon: <FaTasks />, name: "Tasks", path: "/tasks" },
          { icon: <FaCheckCircle />, name: "Fulfillment", path: "/fulfillment" },
          { icon: <FaFileAlt />, name: "Sample Fulfillment", path: "/samples" },

          // { 
          //   icon: <FaSignOutAlt />, 
          //   name: "Logout", 
          //   onClick: handleLogout
          // }
        ].map((item, index) => (
          <li 
            key={index} 
            style={{
              padding: '10px',
              transition: 'background-color 0.2s ease',
              backgroundColor: hoveredItem === index ? '#0c5e8a' : 'transparent',
              cursor: 'pointer'
            }}
            onMouseEnter={() => setHoveredItem(index)}
            onMouseLeave={() => setHoveredItem(null)}
            onClick={item.onClick ? item.onClick : undefined}
          >
            {item.path ? (
              <Link to={item.path} style={{
                display: 'flex',
                alignItems: 'center',
                color: 'white',
                textDecoration: 'none',
              }}>
                <span style={{ fontSize: '18px', marginRight: '10px' }}>{item.icon}</span>
                <span style={{
                  whiteSpace: 'nowrap',
                  transition: 'opacity 0.3s ease, width 0.3s ease',
                  opacity: expanded ? 1 : 0,
                  width: expanded ? 'auto' : 0
                }}>{item.name}</span>
              </Link>
            ) : (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                color: 'white',
                textDecoration: 'none',
              }}>
                <span style={{ fontSize: '18px', marginRight: '10px' }}>{item.icon}</span>
                <span style={{
                  whiteSpace: 'nowrap',
                  transition: 'opacity 0.3s ease, width 0.3s ease',
                  opacity: expanded ? 1 : 0,
                  width: expanded ? 'auto' : 0
                }}>{item.name}</span>
              </div>
            )}
          </li>
        ))}
      </ul>
    </aside>
  );
}

const styles = {
  sidebar: {
    height: '100vh',
    backgroundColor: '#0E74A0',
    color: '#fff',
    padding: '1rem 0.5rem',
    transition: 'all 0.3s ease',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  },
  logoContainer: {
    padding: '1rem 0',
    marginBottom: '1rem',
    borderBottom: '1px solid #334155',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    marginLeft: '0.5rem',
  },
  logoIcon: {
    width: '40px',
    height: '40px',
    transition: 'all 0.3s ease-in-out',
    borderRadius: '50%',
  },
  logoText: {
    fontSize: '.9rem',
    fontWeight: 'bold',
    margin: 0,
    whiteSpace: 'nowrap',
    transition: 'all 0.3s ease',
    overflow: 'hidden',
    marginLeft: '0.5rem',
  },
  navList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    flexGrow: 1,
    overflow: 'hidden'
  },
  listItem: {
    marginBottom: '0.5rem',
    borderRadius: '6px',
    transition: 'background-color 0.2s ease'
  },
  link: {
    display: 'flex',
    alignItems: 'center',
    padding: '0.75rem',
    borderRadius: '6px',
    color: '#fff',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    height: '100%'
  },
  icon: {
    fontSize: '1.2rem',
    minWidth: '24px',
    display: 'flex',
    justifyContent: 'center',
    flexShrink: 0
  },
  name: {
    fontSize: '0.95rem',
    marginLeft: '1rem',
    transition: 'all 0.3s ease',
    overflow: 'hidden'
  }
};