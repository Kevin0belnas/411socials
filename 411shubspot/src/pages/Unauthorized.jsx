import { useNavigate } from 'react-router-dom';
import { FaLock, FaHome, FaEnvelope, FaArrowLeft } from 'react-icons/fa';


export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.iconContainer}>
          <FaLock style={styles.icon} />
        </div>
        <h1 style={styles.title}>403 - Access Denied</h1>
        <p style={styles.message}>
          You don't have permission to access this page. Please contact your administrator if you believe this is an error.
        </p>
        
        <div style={styles.buttonGroup}>
          <button 
            onClick={() => navigate(-1)} 
            style={styles.button}
          >
            <FaArrowLeft style={styles.buttonIcon} />
            Go Back
          </button>
          
          <button 
            onClick={() => navigate('/tasks')} 
            style={{...styles.button, ...styles.primaryButton}}
          >
            <FaHome style={styles.buttonIcon} />
            Return Home
          </button>
        </div>
        
        <div style={styles.contact}>
          <FaEnvelope style={styles.contactIcon} />
          <span>Need help? <a href="mailto:support@example.com" style={styles.link}>Contact Support</a></span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f8f9fa',
    padding: '20px',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    padding: '40px',
    maxWidth: '500px',
    width: '100%',
    textAlign: 'center',
  },
  iconContainer: {
    backgroundColor: '#fff4f4',
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    margin: '0 auto 25px',
  },
  icon: {
    fontSize: '40px',
    color: '#ff5252',
  },
  title: {
    color: '#2d3436',
    fontSize: '28px',
    fontWeight: '600',
    marginBottom: '15px',
  },
  message: {
    color: '#636e72',
    fontSize: '16px',
    lineHeight: '1.6',
    marginBottom: '30px',
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'center',
    gap: '15px',
    marginBottom: '30px',
    flexWrap: 'wrap',
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    borderRadius: '6px',
    border: '1px solid #dfe6e9',
    backgroundColor: '#fff',
    color: '#2d3436',
    fontSize: '15px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  primaryButton: {
    backgroundColor: '#0984e3',
    color: '#fff',
    border: 'none',
  },
  buttonIcon: {
    fontSize: '14px',
  },
  contact: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    color: '#636e72',
    fontSize: '14px',
  },
  contactIcon: {
    fontSize: '14px',
    color: '#636e72',
  },
  link: {
    color: '#0984e3',
    textDecoration: 'none',
    fontWeight: '500',
  },
};