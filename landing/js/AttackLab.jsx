import React, { useState } from 'react';
import styled from 'styled-components';

const AttackLab = () => {
  const [activeAttack, setActiveAttack] = useState(null);
  const [attackResults, setAttackResults] = useState({});

  const attacks = [
    {
      id: 'second-release',
      name: 'Second Release',
      tries: 'Pay the same stage twice',
      blocked: 'Refused. A stage settles once.',
    },
    {
      id: 'unauthorized-refund',
      name: 'Unauthorised Refund',
      tries: 'A non-judge triggers a refund',
      blocked: 'Refused. Only the judge can resolve.',
    },
    {
      id: 'out-of-order',
      name: 'Out-of-Order Step',
      tries: 'Approve before the work is marked done',
      blocked: 'Refused. Caller, phase and stage state are all checked.',
    },
    {
      id: 're-entrancy',
      name: 'Re-entrancy',
      tries: 'Call back into withdraw to drain the vault',
      blocked: 'Refused. Credit is cleared before sending.',
    },
  ];

  const guarantees = [
    'No second release',
    'No unauthorised refund',
    'No out-of-order step',
    'No re-entrancy theft',
    'Books always reconcile',
    'Fair group rules',
  ];

  const handleRunAttack = (attackId) => {
    setActiveAttack(attackId);
    // Simulate attack result
    setTimeout(() => {
      setAttackResults(prev => ({
        ...prev,
        [attackId]: 'blocked'
      }));
    }, 800);
  };

  return (
    <Container id="security">
      <Heading>Security and Attack Lab</Heading>
      <Description>Hundreds of random actions tested. Books checked after every single step.</Description>

      {/* Attack Cards */}
      <AttackCardsGrid>
        {attacks.map(attack => (
          <AttackCard key={attack.id} isActive={activeAttack === attack.id}>
            <AttackTitle>{attack.name}</AttackTitle>
            <AttackContent>
              <AttackWhat>
                <Label>What it tries</Label>
                <Value>{attack.tries}</Value>
              </AttackWhat>
              <AttackResult>
                <Label>What the vault does</Label>
                <Value>{attack.blocked}</Value>
              </AttackResult>
            </AttackContent>
            <RunButton
              onClick={() => handleRunAttack(attack.id)}
              disabled={activeAttack === attack.id}
            >
              {activeAttack === attack.id ? 'Running...' : 'Run attack'}
            </RunButton>
            {attackResults[attack.id] && (
              <BlockedBadge>BLOCKED</BlockedBadge>
            )}
          </AttackCard>
        ))}
      </AttackCardsGrid>

      {/* Guarantee Badges */}
      <GuaranteeSection>
        <GuaranteeTitle>Guarantee Badges</GuaranteeTitle>
        <BadgeGrid>
          {guarantees.map((guarantee, idx) => (
            <Badge key={idx}>✓ {guarantee}</Badge>
          ))}
        </BadgeGrid>
      </GuaranteeSection>

      {/* WeakVault Comparison */}
      <ComparisonSection>
        <ComparisonTitle>Same attacker. Same code. One tiny difference.</ComparisonTitle>
        <ComparisonGrid>
          <div>
            <ComparisonHeader>Settl Vault</ComparisonHeader>
            <ComparisonColumn>
              <ComparisonRow label="Owed to the attacker">
                One stage
              </ComparisonRow>
              <ComparisonRow label="Attacker receives">
                <Highlight>Exactly one stage</Highlight>
              </ComparisonRow>
              <ComparisonRow label="Honest payee afterwards">
                <SuccessText>Still paid</SuccessText>
              </ComparisonRow>
            </ComparisonColumn>
          </div>

          <div>
            <ComparisonHeader>Unprotected Copy</ComparisonHeader>
            <ComparisonColumn>
              <ComparisonRow label="Owed to the attacker">
                One stage
              </ComparisonRow>
              <ComparisonRow label="Attacker receives">
                <FailureText>Every stage in the vault</FailureText>
              </ComparisonRow>
              <ComparisonRow label="Honest payee afterwards">
                <FailureText>Cannot be paid</FailureText>
              </ComparisonRow>
            </ComparisonColumn>
          </div>
        </ComparisonGrid>
      </ComparisonSection>
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
  margin: 0 0 16px 0;
`;

const Description = styled.p`
  font-size: 1rem;
  color: #999;
  text-align: center;
  margin: 0 0 60px 0;
  font-style: italic;
`;

const AttackCardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto 60px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`;

const AttackCard = styled.div`
  background: linear-gradient(135deg, rgba(11, 20, 35, 0.75), rgba(26, 63, 117, 0.2));
  border: 2px solid ${props => (props.isActive ? '#90B0C7' : 'rgba(78, 106, 156, 0.3)')};
  border-radius: 12px;
  padding: 28px;
  position: relative;
  transition: all 0.3s ease;

  &:hover {
    border-color: #C9DBE9;
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(26, 63, 117, 0.3);
  }
`;

const AttackTitle = styled.h3`
  font-family: 'Anton', Impact, sans-serif;
  font-size: 1.3rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #C9DBE9;
  margin: 0 0 20px 0;
`;

const AttackContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 20px;
`;

const AttackWhat = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const AttackResult = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.span`
  font-size: 0.8rem;
  text-transform: uppercase;
  color: #666;
  letter-spacing: 0.08em;
  font-weight: 600;
`;

const Value = styled.span`
  font-size: 0.95rem;
  color: #d0d0d0;
  line-height: 1.5;
`;

const RunButton = styled.button`
  width: 100%;
  padding: 12px 16px;
  background: #1A3F75;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    background: #255598;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(78, 106, 156, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const BlockedBadge = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  background: #4E6A9C;
  color: #ffffff;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  animation: slideIn 0.3s ease;

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const GuaranteeSection = styled.div`
  max-width: 1200px;
  margin: 0 auto 60px;
  padding: 40px;
  background: rgba(26, 63, 117, 0.15);
  border: 1px solid rgba(78, 106, 156, 0.35);
  border-radius: 12px;
`;

const GuaranteeTitle = styled.h3`
  font-family: 'Anton', Impact, sans-serif;
  font-size: 1.2rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #C9DBE9;
  margin: 0 0 24px 0;
  text-align: center;
`;

const BadgeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
`;

const Badge = styled.div`
  padding: 12px 16px;
  background: rgba(26, 63, 117, 0.3);
  border: 1px solid rgba(78, 106, 156, 0.4);
  border-radius: 6px;
  color: #C9DBE9;
  font-size: 0.9rem;
  font-weight: 600;
  text-align: center;
`;

const ComparisonSection = styled.div`
  max-width: 1000px;
  margin: 0 auto;
`;

const ComparisonTitle = styled.h3`
  font-size: 1.2rem;
  color: #d0d0d0;
  text-align: center;
  margin: 0 0 40px 0;
  font-style: italic;
  font-weight: 500;
`;

const ComparisonGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 32px;
  }
`;

const ComparisonColumn = styled.div`
  background: rgba(11, 20, 35, 0.6);
  border: 1px solid rgba(78, 106, 156, 0.25);
  border-radius: 12px;
  overflow: hidden;
`;

const ComparisonHeader = styled.div`
  background: linear-gradient(90deg, rgba(26, 63, 117, 0.3), rgba(78, 106, 156, 0.15));
  padding: 16px;
  color: #C9DBE9;
  font-weight: 700;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid rgba(78, 106, 156, 0.25);
`;

const ComparisonRowWrapper = styled.div`
  padding: 16px;
  border-bottom: 1px solid rgba(78, 106, 156, 0.15);
  display: flex;
  flex-direction: column;
  gap: 8px;

  &:last-child {
    border-bottom: none;
  }
`;

const ComparisonRowLabel = styled.span`
  font-size: 0.8rem;
  text-transform: uppercase;
  color: #666;
  letter-spacing: 0.08em;
  font-weight: 600;
`;

const ComparisonRow = ({ label, children }) => (
  <ComparisonRowWrapper>
    <ComparisonRowLabel>{label}</ComparisonRowLabel>
    {children}
  </ComparisonRowWrapper>
);

const Highlight = styled.span`
  color: #00d98e;
  font-weight: 600;
`;

const SuccessText = styled.span`
  color: #00d98e;
  font-weight: 600;
`;

const FailureText = styled.span`
  color: #ff3333;
  font-weight: 600;
`;

export default AttackLab;
