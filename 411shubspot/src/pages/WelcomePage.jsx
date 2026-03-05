import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const WelcomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #73C2FB;
  color: white;
  text-align: center;
  padding: 2rem;
`;

const Title = styled.h1`
  font-size: 3.5rem;
  margin-bottom: 1.5rem;
  animation: ${fadeIn} 1s ease-out;
  text-shadow: 0 2px 10px rgba(0,0,0,0.2);
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.5rem;
  margin-bottom: 3rem;
  max-width: 700px;
  line-height: 1.6;
  animation: ${fadeIn} 1s ease-out 0.3s both;
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

const CTAButton = styled.button`
  padding: 1rem 2rem;
  font-size: 1.2rem;
  background: white;
  color: #73C2FB;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  animation: ${fadeIn} 1s ease-out 0.6s both, ${pulse} 2s infinite 2s;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  
  &:hover {
    background: #f8f9fa;
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.15);
  }
  
  &:active {
    transform: translateY(1px);
  }
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin: 4rem 0;
  width: 100%;
  max-width: 1200px;
  animation: ${fadeIn} 1s ease-out 0.9s both;
  font-family: Arial, sans-serif;
  color: black;

`;

const FeatureCard = styled.div`
  background: #EEEEEE;
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 2rem;
  transition: all 0.3s ease;
  font-family: Arial, sans-serif;
  
  &:hover {
    transform: translateY(-10px);
    background: rgba(255,255,255,0.2);
  }
`;


function WelcomePage() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Welcome to 411 Socials HubSpot";
  }, []);

  const handleGetStarted = () => {
    navigate('/login');
  };

  return (
    <WelcomeContainer>
      <Title>Welcome to 411 Socials CRM</Title>
      <Subtitle>
        Your all-in-one platform for seamless social media management, 
        contact organization, and powerful analytics.
      </Subtitle>
      
      <CTAButton onClick={handleGetStarted}>
        Get Started →
      </CTAButton>
      
      <FeatureGrid>
        <FeatureCard>
          <h3>📊 Analytics Dashboard</h3>
          <p>Track your social media performance with real-time data</p>
        </FeatureCard>
        <FeatureCard>
          <h3>👥 Contact Management</h3>
          <p>Organize and manage all your contacts in one place</p>
        </FeatureCard>
        {/* <FeatureCard>
          <h3>🚀 Campaign Tools</h3>
          <p>Create and schedule content across multiple platforms</p>
        </FeatureCard> */}
      </FeatureGrid>
    </WelcomeContainer>
  );
}

export default WelcomePage;