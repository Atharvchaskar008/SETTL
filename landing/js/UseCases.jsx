import React, { useState } from 'react';
import styled from 'styled-components';

const UseCases = () => {
  const [activeTab, setActiveTab] = useState(0);

  const useCases = [
    {
      title: "Flatmates' wifi",
      payers: 'Three flatmates',
      payees: 'The wifi provider',
      stages: '12 monthly stages',
    },
    {
      title: 'Freelance work',
      payers: 'The client',
      payees: 'The freelancer',
      stages: 'Design, development, launch',
    },
    {
      title: 'House construction',
      payers: 'The owner',
      payees: 'Mason, plumber, electrician',
      stages: 'One per trade',
    },
    {
      title: 'Company bonus',
      payers: 'The company',
      payees: 'Employees',
      stages: 'One per person',
    },
  ];

  const current = useCases[activeTab];

  return (
    <Container id="use-cases">
      <Heading>One vault. Every kind of deal.</Heading>

      <TabsContainer>
        {useCases.map((useCase, idx) => (
          <Tab
            key={idx}
            isActive={activeTab === idx}
            onClick={() => setActiveTab(idx)}
          >
            <TabLabel>{useCase.title}</TabLabel>
          </Tab>
        ))}
      </TabsContainer>

      <CardContainer>
        <CardRow>
          <CardLabel>Payers</CardLabel>
          <CardValue>{current.payers}</CardValue>
        </CardRow>
        <CardRow>
          <CardLabel>Payees</CardLabel>
          <CardValue>{current.payees}</CardValue>
        </CardRow>
        <CardRow>
          <CardLabel>Stages</CardLabel>
          <CardValue>{current.stages}</CardValue>
        </CardRow>
      </CardContainer>
    </Container>
  );
};

const Container = styled.section`
  position: relative;
  z-index: 5;
  padding: 80px 20px;
  background: rgba(0, 0, 42, 0.3);
  border-bottom: 1px solid rgba(78, 106, 156, 0.2);
`;

const Heading = styled.h2`
  font-family: 'Anton', Impact, sans-serif;
  font-size: clamp(2rem, 4vw, 2.8rem);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  color: #ffffff;
  text-align: center;
  margin: 0 0 60px 0;
`;

const TabsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 40px;
  max-width: 1000px;
  margin-left: auto;
  margin-right: auto;

  @media (max-width: 768px) {
    gap: 12px;
  }
`;

const Tab = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: ${props =>
    props.isActive
      ? 'linear-gradient(135deg, rgba(26, 63, 117, 0.5), rgba(78, 106, 156, 0.2))'
      : 'rgba(11, 20, 35, 0.5)'};
  border: 2px solid ${props =>
    props.isActive ? '#90B0C7' : 'rgba(78, 106, 156, 0.25)'};
  border-radius: 8px;
  color: ${props =>
    props.isActive ? '#C9DBE9' : '#8A9EB2'};
  font-family: 'Anton', Impact, sans-serif;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: #C9DBE9;
    color: #ffffff;
  }
`;

const TabLabel = styled.span`
  @media (min-width: 600px) {
    display: inline;
  }
`;

const CardContainer = styled.div`
  background: linear-gradient(135deg, rgba(11, 20, 35, 0.8), rgba(26, 63, 117, 0.2));
  border: 2px solid rgba(78, 106, 156, 0.3);
  border-radius: 12px;
  padding: 40px;
  max-width: 600px;
  margin: 0 auto;
  animation: fadeIn 0.3s ease;

  @keyframes fadeIn {
    from {
      opacity: 0.8;
    }
    to {
      opacity: 1;
    }
  }
`;

const CardRow = styled.div`
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 24px;
  padding: 24px 0;
  border-bottom: 1px solid rgba(78, 106, 156, 0.15);
  align-items: start;

  &:last-child {
    border-bottom: none;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 8px;
  }
`;

const CardLabel = styled.span`
  font-family: 'Anton', Impact, sans-serif;
  font-size: 0.9rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #90B0C7;
`;

const CardValue = styled.span`
  font-size: 1rem;
  color: #d0d0d0;
  line-height: 1.6;
`;

export default UseCases;
