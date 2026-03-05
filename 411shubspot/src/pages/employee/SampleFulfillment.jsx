import { useState, useEffect } from 'react';
import { FiDownload, FiTrash2, FiRefreshCw } from 'react-icons/fi';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export default function SampleFulfillment() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/fulfillment-files`);
      setFiles(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching files:', err);
      setError(err.response?.data?.error || 'Failed to load files');
    } finally {
      setLoading(false);
    }
  };

 const handleDownload = async (id, filename) => {
  try {
        setDownloadingId(id);

    // Method 1: Simple window.open
    window.open(`${API_URL}/api/fulfillment/${id}`, '_blank');
    
    // Method 2: Fallback with fetch
    const response = await fetch(`${API_URL}/api/fulfillment/${id}`);
    if (!response.ok) throw new Error('Download failed');
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `file-${id}`;
    document.body.appendChild(link);
    link.click();
    window.URL.revokeObjectURL(url);
    link.remove();
  } catch (error) {
    console.error('Download failed:', error);
    alert('Download failed. Please try again.');
  }
};

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;
    
    try {
      setDeletingId(id);
      const response = await axios.delete(`${API_URL}/api/fulfillment-files/${id}`);
      
      if (response.data.success) {
        setError({ type: 'success', message: 'File deleted successfully' });
        setTimeout(() => setError(null), 3000);
        await fetchFiles();
      }
    } catch (err) {
      console.error('Delete error:', err);
      setError(err.response?.data?.error || 'Failed to delete file');
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>
        Fulfillment Files
        <button 
          onClick={fetchFiles}
          style={{ 
            marginLeft: '16px',
            padding: '6px 12px',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
          disabled={loading}
        >
          <FiRefreshCw />
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </h1>

      {error && (
        <div style={{ 
          color: error.type === 'success' ? '#10b981' : '#ef4444',
          backgroundColor: error.type === 'success' ? '#ecfdf5' : '#fee2e2',
          padding: '12px',
          borderRadius: '6px',
          marginBottom: '16px'
        }}>
          {error.message || error}
        </div>
      )}

      {loading ? (
        <p>Loading files...</p>
      ) : files.length === 0 ? (
        <p>No files found.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Filename</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Type</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {files.map(file => (
              <tr key={file.id}>
                <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb' }}>{file.filename}</td>
                <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb' }}>{file.filetype}</td>
                <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb' }}>
                  <button
                    onClick={() => handleDownload(file.id, file.filename)}
                    disabled={downloadingId === file.id}
                    style={{
                      padding: '6px 12px',
                      marginRight: '8px',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <FiDownload />
                    {downloadingId === file.id ? 'Downloading...' : 'Download'}
                  </button>
                  <button
                    onClick={() => handleDelete(file.id)}
                    disabled={deletingId === file.id}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <FiTrash2 />
                    {deletingId === file.id ? 'Deleting...' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}