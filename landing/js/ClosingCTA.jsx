import React from 'react';
import styled from 'styled-components';
import { DASHBOARD_URL } from './dashboard';

const ClosingCTA = () => {
  return (
    <Container id="demo">
      <Content>
        <Headline>Stop trusting. Start settling.</Headline>
        <ButtonGroup>
          <PrimaryButton href={DASHBOARD_URL}>Run the demo</PrimaryButton>
          <SecondaryButton href="https://github.com/Atharvchaskar008/Vortexa-3.0.git" target="_blank" rel="noopener noreferrer">
            Read the code
          </SecondaryButton>
        </ButtonGroup>
        <Credit>Built for VORTEXA 3.0, problem B-03 MilestoneVault.</Credit>
      </Content>
    </Container>
  );
};

const Container = styled.section`
  position: relative;
  z-index: 5;
  padding: 120px 20px;
  background: rgba(0, 0, 42, 0.3);
  border-bottom: 1px solid rgba(78, 106, 156, 0.2);
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40px;
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
`;

const Headline = styled.h2`
  font-family: 'Anton', Impact, sans-serif;
  font-size: clamp(2.2rem, 5vw, 3.5rem);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  color: #ffffff;
  margin: 0;
  line-height: 1.2;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  justify-content: center;
`;

const BaseButton = styled.a`
  padding: 16px 40px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 1rem;
  text-decoration: none;
  transition: all 0.3s ease;
  cursor: pointer;
  border: none;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;

const PrimaryButton = styled(BaseButton)`
  background: #1A3F75;
  color: #ffffff;

  &:hover {
    background: #255598;
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(78, 106, 156, 0.4);
  }
`;

const SecondaryButton = styled(BaseButton)`
  background: transparent;
  color: #C9DBE9;
  border: 2px solid #4E6A9C;

  &:hover {
    background: rgba(78, 106, 156, 0.2);
    border-color: #90B0C7;
    transform: translateY(-2px);
  }
`;

const Credit = styled.p`
  font-size: 0.85rem;
  color: #666;
  margin: 0;
  font-style: italic;
`;

export default ClosingCTA;
