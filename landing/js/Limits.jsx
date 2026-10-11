import React from 'react';
import styled from 'styled-components';

const Limits = () => {
  const limits = [
    'Funds are simulated. No real UPI or bank connection.',
    'It controls when money moves, not whether the work gets done.',
    'People still decide: a person approves, a person judges.',
    'It does not replace a legal contract.',
  ];

  return (
    <Container id="limits">
      <Heading>What Settl is not</Heading>
      <Subheading>Radical transparency</Subheading>

      <LimitsGrid>
        {limits.map((limit, idx) => (
          <LimitCard key={idx}>
            <LimitIcon>→</LimitIcon>
            <LimitText>{limit}</LimitText>
          </LimitCard>
        ))}
      </LimitsGrid>
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
  margin: 0 0 12px 0;
`;

const Subheading = styled.p`
  font-size: 1rem;
  color: #999;
  text-align: center;
  margin: 0 0 60px 0;
  font-style: italic;
  font-weight: 400;
`;

const LimitsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 24px;
  max-width: 1000px;
  margin: 0 auto;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const LimitCard = styled.div`
  background: rgba(11, 20, 35, 0.6);
  border-left: 3px solid rgba(78, 106, 156, 0.5);
  border-radius: 4px;
  padding: 24px;
  display: flex;
  gap: 16px;
  transition: all 0.3s ease;

  &:hover {
    border-left-color: #90B0C7;
    background: rgba(26, 63, 117, 0.2);
  }
`;

const LimitIcon = styled.span`
  font-size: 1.5rem;
  color: #90B0C7;
  font-weight: bold;
  flex-shrink: 0;
  line-height: 1.4;
`;

const LimitText = styled.p`
  font-size: 0.95rem;
  color: #d0d0d0;
  line-height: 1.6;
  margin: 0;
`;

export default Limits;
