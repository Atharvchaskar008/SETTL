import React from 'react';
import styled from 'styled-components';

const AIGuardrails = () => {
  const claims = [
    'Every stage must quote the deal text exactly, or it is dropped.',
    'The AI never invents a name, amount or judge. Gaps become questions.',
    'Vague words ("satisfactory", "a reasonable time") are flagged, not guessed.',
    'Nothing reaches the contract without human confirmation.',
    'A fingerprint of the deal text is stored in the vault, tying it to exactly what everyone agreed to.',
    'If the model fails, an offline reader takes over and the product still works.',
  ];

  return (
    <Container id="ai-guardrails">
      <Heading>AI helps you write the deal. It never touches the money.</Heading>

      <FlowDiagram>
        <FlowNode>
          <NodeLabel>AI proposes</NodeLabel>
        </FlowNode>
        <FlowArrow>→</FlowArrow>
        <FlowNode>
          <NodeLabel>Human confirms</NodeLabel>
        </FlowNode>
        <FlowArrow>→</FlowArrow>
        <FlowNode>
          <NodeLabel>Everyone agrees</NodeLabel>
        </FlowNode>
        <FlowArrow>→</FlowArrow>
        <FlowNode>
          <NodeLabel>Contract locks</NodeLabel>
        </FlowNode>
      </FlowDiagram>

      <ClaimsGrid>
        {claims.map((claim, idx) => (
          <ClaimCard key={idx}>
            <ClaimIcon>✓</ClaimIcon>
            <ClaimText>{claim}</ClaimText>
          </ClaimCard>
        ))}
      </ClaimsGrid>
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
  font-size: clamp(1.8rem, 4vw, 2.6rem);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  color: #ffffff;
  text-align: center;
  margin: 0 0 60px 0;
`;

const FlowDiagram = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
  max-width: 1000px;
  margin: 0 auto 60px;
  padding: 40px 20px;
  background: rgba(11, 20, 35, 0.5);
  border: 1px solid rgba(78, 106, 156, 0.25);
  border-radius: 12px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
  }
`;

const FlowNode = styled.div`
  background: linear-gradient(135deg, rgba(26, 63, 117, 0.35), rgba(78, 106, 156, 0.15));
  border: 2px solid rgba(78, 106, 156, 0.4);
  border-radius: 8px;
  padding: 16px 24px;
  min-width: 160px;
  text-align: center;
`;

const NodeLabel = styled.span`
  font-family: 'Anton', Impact, sans-serif;
  font-size: 1rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #C9DBE9;
`;

const FlowArrow = styled.div`
  font-size: 1.5rem;
  color: #90B0C7;
  font-weight: bold;

  @media (max-width: 768px) {
    transform: rotate(90deg);
  }
`;

const ClaimsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
`;

const ClaimCard = styled.div`
  background: rgba(11, 20, 35, 0.6);
  border: 1px solid rgba(78, 106, 156, 0.25);
  border-radius: 8px;
  padding: 24px;
  display: flex;
  gap: 16px;
  transition: all 0.3s ease;

  &:hover {
    border-color: #90B0C7;
    background: rgba(26, 63, 117, 0.2);
  }
`;

const ClaimIcon = styled.span`
  font-size: 1.5rem;
  color: #90B0C7;
  font-weight: 700;
  flex-shrink: 0;
`;

const ClaimText = styled.p`
  font-size: 0.95rem;
  color: #d0d0d0;
  line-height: 1.6;
  margin: 0;
`;

export default AIGuardrails;
