import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaGoogle, FaGithub, FaArrowLeft } from 'react-icons/fa';
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
const LoginContainer = styled.div`
  display: flex;
  min-height: 100vh;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const LeftPanel = styled.div`
  flex: 1;
  background: #73C2FB;
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 2rem;
  animation: ${slideIn} 0.8s ease-out;

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

const LoginForm = styled.form`
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
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
  }

  &::placeholder {
    color: #a0aec0;
  }
`;

const PasswordToggle = styled.span`
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #a0aec0;
  cursor: pointer;
`;

const RememberForgot = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
`;

const RememberMe = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #4a5568;
`;

const ForgotPassword = styled.a`
  color: #73C2FB;
  text-decoration: none;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 15px;
  background: #73C2FB;
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
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  margin: 1.5rem 0;
  color: #a0aec0;

  &::before, &::after {
    content: "";
    flex: 1;
    border-bottom: 1px solid #e2e8f0;
  }

  &::before {
    margin-right: 1rem;
  }

  &::after {
    margin-left: 1rem;
  }
`;

const SocialLogin = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const SocialButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 1px solid #e2e8f0;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
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
  margin-left: 1rem;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateX(-3px);
  }
`;

const RegisterLink = styled.div`
  text-align: center;
  color: #4a5568;

  a {
    color: #73C2FB;
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

// Component Logic
function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "411 Socials CRM Login";
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
  
    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: email,
          password: password
        }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }
  
      // Successful login - redirect based on role
      if (data.user && data.user.role) {
        switch(data.user.role.toLowerCase()) {
          case 'admin':
            window.location.href = '/dashboard';  // Full page redirect
            break;
          case 'agent':
            window.location.href = '/tasks';
            break;
          default:
            window.location.href = '/unauthorized';
        }
      } else {
        throw new Error('Invalid user data received');
      }
      
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
// const handleSubmit = async (e) => {
//   e.preventDefault();
//   setIsLoading(true);
//   setError('');

//   try {
//     const response = await fetch(`${API_URL}/api/login`, {
//       method: 'POST',
//       credentials: 'include', // Must include for cookies
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ 
//         email: email,
//         password: password
//       }),
//     });

//     const data = await response.json();

//     if (!response.ok) {
//       throw new Error(data.error || 'Login failed');
//     }

//     // Use window.location for absolute redirect
//     console.log('Redirecting to:', data.redirect);
//     window.location.href = data.redirect;
    
//   } catch (err) {
//     console.error('Login error:', err);
//     setError(err.message || 'Login failed. Please try again.');
//   } finally {
//     setIsLoading(false);
//   }
// };

  return (
    <LoginContainer>
      <BackButton onClick={() => navigate('/')}>
        <FaArrowLeft />
      </BackButton>
      <LeftPanel>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Welcome Back!</h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '1rem', opacity: 0.9 ,  textAlign: 'justify',  textIndent: '2rem' // <-- this adds the indentation
}}>
        Take full control of your brand’s voice with our all-in-one social media management tools. Effortlessly schedule posts, engage with your audience, and grow your online presence all from one powerful, easy-to-use platform. Start today and experience the future of social media success.
        </p>

        
    {/* Insert the Image here */}
    <img
      src="logo.png"  // <-- change this to your actual image path
      alt="Welcome Illustration"
      style={{
        maxWidth: '60%',
        height: 'auto',
        marginTop: '1rem',
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
        <LoginForm onSubmit={handleSubmit}>
          <FormTitle>Login to Your Account</FormTitle>

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <InputGroup>
            <InputIcon><FaUser /></InputIcon>
            <InputField
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </InputGroup>

          <InputGroup>
            <InputIcon><FaLock /></InputIcon>
            <InputField
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <PasswordToggle onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </PasswordToggle>
          </InputGroup>

          <RememberForgot>
            <RememberMe>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
                style={{ marginRight: '8px' }}
              />
              Remember me
            </RememberMe>
            <ForgotPassword onClick={() => navigate('/forgot-password')}>
              Forgot password?
            </ForgotPassword>
          </RememberForgot>

          <SubmitButton type="submit" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </SubmitButton>

          <Divider>or continue with</Divider>

          <SocialLogin>
            <SocialButton type="button">
              <FaGoogle style={{ color: '#DB4437', fontSize: '1.2rem' }} />
            </SocialButton>
            <SocialButton type="button">
              <FaGithub style={{ color: '#333', fontSize: '1.2rem' }} />
            </SocialButton>
          </SocialLogin>

          <RegisterLink>
            Don't have an account?
            <a onClick={() => navigate('/register')}>Register</a>
          </RegisterLink>
        </LoginForm>
      </RightPanel>
    </LoginContainer>
  );
}

export default Login;

