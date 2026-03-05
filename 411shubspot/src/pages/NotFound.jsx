import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  const styles = {
    layout: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#f5f5f5',
      textAlign: 'center',
      padding: '0 20px',
    },
    heading: {
      fontSize: '6rem',
      color: '#3b82f6', // Tailwind blue-500 equivalent
      marginBottom: '10px',
      fontWeight: 'bold',
    },
    subheading: {
      fontSize: '1.75rem',
      color: '#333',
      marginBottom: '10px',
      fontWeight: '600',
    },
    text: {
      fontSize: '1rem',
      color: '#666',
      marginBottom: '20px',
    },
    button: {
      padding: '10px 20px',
      backgroundColor: '#3b82f6',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '1rem',
    },
    buttonHover: {
      backgroundColor: '#2563eb',
    },
  };

  return (
    <div style={styles.layout}>
      <h1 style={styles.heading}>404</h1>
      <h2 style={styles.subheading}>Page Not Found</h2>
      <p style={styles.text}>The page you are looking for does not exist or has been moved.</p>
      <button
        style={styles.button}
        onMouseOver={(e) => (e.target.style.backgroundColor = styles.buttonHover.backgroundColor)}
        onMouseOut={(e) => (e.target.style.backgroundColor = styles.button.backgroundColor)}
        onClick={() => navigate('/home')}
      >
        Go Home
      </button>
    </div>
  );
}