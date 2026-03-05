import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaArrowLeft, FaUserShield, FaUserTie } from 'react-icons/fa';
const API_URL = import.meta.env.VITE_API_URL;

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { transform: translateX(-50px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

// Styled Components
const RegisterContainer = styled.div`
  display: flex;
  min-height: 100vh;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const LeftPanel = styled.div`
  flex: 1;
  background:  #73C2FB;
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 2rem;
  animation: ${slideIn} 0.8s ease-out;
  position: relative;

  @media (max-width: 768px) {
    padding: 1.5rem;
    text-align: center;
  }
`;

const RightPanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 2rem;
  background: #f8fafc;
`;

const BackButton = styled.button`
  position: absolute;
  top: 2rem;
  left: 2rem;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateX(-3px);
  }
`;

const RegisterForm = styled.form`
  max-width: 400px;
  width: 100%;
  margin: 0 auto;
  animation: ${fadeIn} 1s ease-out;
`;

const FormTitle = styled.h2`
  font-size: 2rem;
  margin-bottom: 1.5rem;
  color: #2d3748;
`;

const InputGroup = styled.div`
  position: relative;
  margin-bottom: 1.5rem;
`;

const InputIcon = styled.span`
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #a0aec0;
`;

const InputField = styled.input`
  width: 100%;
  padding: 15px 15px 15px 45px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background-color: #ffffff;

  &:focus {
    outline: none;
    border-color:  #73C2FB;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
  }

  &::placeholder {
    color: #a0aec0;
  }
`;

const RoleSelect = styled.select`
  width: 100%;
  padding: 15px 15px 15px 45px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  margin-bottom: 1.5rem;
  background-color: #ffffff;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 1em;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color:  #73C2FB;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
  }
`;

const RoleOption = styled.option`
  padding: 10px;
  margin-top: 5px;
`;

const PasswordToggle = styled.span`
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #a0aec0;
  cursor: pointer;
`;

const TermsContainer = styled.div`
  display: flex;
  align-items: flex-start;
  margin-bottom: 1.5rem;
`;

const TermsText = styled.p`
  font-size: 0.9rem;
  color: #4a5568;
  margin-left: 8px;
  line-height: 1.4;
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 15px;
  background:  #73C2FB;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 1.5rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    background: #a0aec0;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const LoginLink = styled.div`
  text-align: center;
  color: #4a5568;

  a {
    color:  #73C2FB;
    text-decoration: none;
    font-weight: 600;
    margin-left: 0.5rem;
    cursor: pointer;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const ErrorMessage = styled.div`
  color: #e53e3e;
  background-color: #fff5f5;
  padding: 0.75rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  border-left: 4px solid #e53e3e;
`;

const SuccessMessage = styled.div`
  color: #38a169;
  background-color: #f0fff4;
  padding: 0.75rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  border-left: 4px solid #38a169;
`;

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'agent', // Default to agent
    agreeTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "411 Socials HubSpot Register";
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    // Validation
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (!formData.agreeTerms) {
      setError('You must agree to the terms and conditions');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <RegisterContainer>
      <LeftPanel>
        <BackButton onClick={() => navigate(-1)}>
          <FaArrowLeft />
        </BackButton>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', marginTop: '3rem' }}>Join Us Today</h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '1rem', opacity: 0.9 , textAlign: 'justify',  textIndent: '2rem' // <-- this adds the indentation
}}>
        Join thousands of thriving brands, create your account today and unlock a complete suite of tools designed to simplify, amplify, and transform your social media presence. Whether you're building your first audience or scaling to new heights, we're here to make every post, every interaction, and every campaign a success. Don't just manage your social media then master it.
        </p>

         {/* Insert the Image here */}
    <img
      src="logo.png"  // <-- change this to your actual image path
      alt="Welcome Illustration"
      style={{
        maxWidth: '60%',
        height: 'auto',
        marginTop: '1 pax',
        marginLeft: '6rem',
        marginRight: '0rem',
        display: 'block',  
      }}
    />


        <div style={{ marginTop: 'auto' }}>
          <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>
          
          </p>
        </div>
      </LeftPanel>

      <RightPanel>
        <RegisterForm onSubmit={handleSubmit}>
          <FormTitle>Create Account</FormTitle>
          
          {error && <ErrorMessage>{error}</ErrorMessage>}
          {success && <SuccessMessage>{success}</SuccessMessage>}

          <InputGroup>
            <InputIcon><FaUser /></InputIcon>
            <InputField
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </InputGroup>

          <InputGroup>
            <InputIcon><FaEnvelope /></InputIcon>
            <InputField
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </InputGroup>

          <InputGroup>
            <InputIcon>
              {formData.role === 'admin' ? <FaUserShield /> : <FaUserTie />}
            </InputIcon>
            <RoleSelect
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <RoleOption value="agent">Agent</RoleOption>
              <RoleOption value="admin">Admin</RoleOption>
            </RoleSelect>
          </InputGroup>

          <InputGroup>
            <InputIcon><FaLock /></InputIcon>
            <InputField
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password (min 8 characters)"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <PasswordToggle onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </PasswordToggle>
          </InputGroup>

          <InputGroup>
            <InputIcon><FaLock /></InputIcon>
            <InputField
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
            <PasswordToggle onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </PasswordToggle>
          </InputGroup>

          <TermsContainer>
            <input
              type="checkbox"
              id="agreeTerms"
              name="agreeTerms"
              checked={formData.agreeTerms}
              onChange={handleChange}
              required
            />
            <TermsText>
              I agree to the <a href="/terms" style={{ color: '#667eea' }}>Terms of Service</a> and <a href="/privacy" style={{ color: '#667eea' }}>Privacy Policy</a>
            </TermsText>
          </TermsContainer>

          <SubmitButton type="submit" disabled={isLoading}>
            {isLoading ? 'Registering...' : 'Register'}
          </SubmitButton>

          <LoginLink>
            Already have an account? <a onClick={() => navigate('/login')}>Login</a>
          </LoginLink>
        </RegisterForm>
      </RightPanel>
    </RegisterContainer>
  );
}

export default Register;
