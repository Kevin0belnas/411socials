import { useState } from 'react';
import { FiUpload, FiX, FiFile, FiCheckCircle } from 'react-icons/fi';
import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL;


export default function UploadFulfillmentFile() {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [error, setError] = useState(null);

  // Accepted file types
  const acceptedFileTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'image/jpeg',
    'image/png'
  ];

  // Container styles
  const containerStyles = {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '24px',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  };

  // Title styles
  const titleStyles = {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: '24px'
  };

  // Upload area styles
  const uploadAreaStyles = {
    border: '2px dashed #d1d5db',
    borderRadius: '8px',
    padding: '32px',
    textAlign: 'center',
    marginBottom: '24px',
    backgroundColor: '#f9fafb'
  };

  // Button styles
  const buttonStyles = {
    backgroundColor: '#2563eb',
    color: 'white',
    padding: '8px 16px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'background-color 0.2s'
  };

  const buttonHoverStyles = {
    backgroundColor: '#1d4ed8'
  };

  const disabledButtonStyles = {
    backgroundColor: '#93c5fd',
    cursor: 'not-allowed'
  };

  // File info styles
  const fileInfoStyles = {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '16px'
  };

  // Progress bar styles
  const progressBarContainerStyles = {
    width: '100%',
    backgroundColor: '#e5e7eb',
    borderRadius: '9999px',
    height: '8px',
    marginBottom: '16px'
  };

  const progressBarStyles = {
    backgroundColor: '#2563eb',
    height: '8px',
    borderRadius: '9999px',
    transition: 'width 0.3s'
  };

  // Guidelines styles
  const guidelinesStyles = {
    backgroundColor: '#dbeafe',
    padding: '16px',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#1e40af'
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (acceptedFileTypes.includes(selectedFile.type)) {
        setFile(selectedFile);
        setUploadComplete(false);
        setError(null);
      } else {
        setError('Please upload a valid file type (PDF, DOC, DOCX, XLS, XLSX, TXT, JPG, PNG)');
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await axios.post(`${API_URL}/api/upload-fulfillment`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        }
      });

      setUploadComplete(true);
      console.log('Upload successful:', response.data);
    } catch (err) {
      console.error('Upload failed:', err);
      setError(err.response?.data?.error || 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setUploadProgress(0);
    setUploadComplete(false);
    setError(null);
};
  return (
    <div style={containerStyles}>
      <h1 style={titleStyles}>Upload Fulfillment File</h1>
      
      {error && (
        <div style={{ 
          color: '#ef4444', 
          backgroundColor: '#fee2e2', 
          padding: '12px',
          borderRadius: '6px',
          marginBottom: '16px'
        }}>
          {error}
        </div>
      )}

      <div style={uploadAreaStyles}>
        {!file ? (
          <div>
            <FiUpload style={{ 
              margin: '0 auto', 
              fontSize: '48px', 
              color: '#9ca3af',
              marginBottom: '16px'
            }} />
            <p style={{ marginBottom: '8px', color: '#4b5563' }}>
              Drag and drop files here or
            </p>
            <label style={{ 
              ...buttonStyles,
              display: 'inline-block',
              cursor: 'pointer'
            }}>
              Browse Files
              <input 
                type="file" 
                style={{ display: 'none' }} 
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png"
              />
            </label>
            <p style={{ 
              marginTop: '8px', 
              fontSize: '12px', 
              color: '#6b7280'
            }}>
              Supported formats: PDF, DOC, DOCX, XLS, XLSX, TXT, JPG, PNG
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={fileInfoStyles}>
              <FiFile style={{ 
                fontSize: '24px', 
                color: '#3b82f6', 
                marginRight: '12px' 
              }} />
              <div>
                <p style={{ fontWeight: '500', color: '#1f2937' }}>{file.name}</p>
                <p style={{ fontSize: '12px', color: '#6b7280' }}>
                  {(file.size / 1024).toFixed(2)} KB · {file.type}
                </p>
              </div>
              <button 
                onClick={removeFile}
                style={{ 
                  marginLeft: '16px', 
                  color: '#6b7280',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <FiX />
              </button>
            </div>

            {!uploadComplete ? (
              <>
                <div style={progressBarContainerStyles}>
                  <div 
                    style={{ 
                      ...progressBarStyles,
                      width: `${uploadProgress}%` 
                    }} 
                  ></div>
                </div>
                <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '16px' }}>
                  Uploading... {uploadProgress}%
                </p>
                <button
                  onClick={handleUpload}
                  style={isUploading ? 
                    { ...buttonStyles, ...disabledButtonStyles } : 
                    { ...buttonStyles, ':hover': buttonHoverStyles }
                  }
                  disabled={isUploading}
                >
                  {isUploading ? 'Uploading...' : 'Start Upload'}
                </button>
              </>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <FiCheckCircle style={{ 
                  margin: '0 auto', 
                  fontSize: '48px', 
                  color: '#10b981',
                  marginBottom: '8px'
                }} />
                <p style={{ fontWeight: '500', color: '#10b981' }}>Upload Complete!</p>
                <button
                  onClick={() => {
                    setFile(null);
                    setUploadComplete(false);
                  }}
                  style={{ 
                    marginTop: '16px',
                    color: '#3b82f6',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Upload Another File
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div style={guidelinesStyles}>
        <h2 style={{ fontWeight: 'bold', marginBottom: '8px' }}>Upload Guidelines:</h2>
        <ul style={{ listStyleType: 'disc', paddingLeft: '20px', margin: 0 }}>
          <li style={{ marginBottom: '4px' }}>Maximum file size: 10MB</li>
          <li style={{ marginBottom: '4px' }}>Supported formats: Documents, Spreadsheets, PDFs, Images</li>
          <li style={{ marginBottom: '4px' }}>Ensure files don't contain sensitive information</li>
          <li>Files should be related to order fulfillment</li>
        </ul>
      </div>
    </div>
  );
}