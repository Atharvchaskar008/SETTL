import React from 'react';
import styled from 'styled-components';

const Roles = () => {
  const roles = [
    {
      title: 'Payers',
      does: 'Put money in, approve or dispute',
      cannot: 'Release money alone (needs more than half)',
    },
    {
      title: 'Payees',
      does: 'Mark stages done, get paid',
      cannot: 'Approve their own work',
    },
    {
      title: 'Judge',
      does: 'Settles disputes: pay or refund',
      cannot: 'Ever take the money',
    },
  ];

  return (
    <Container id="roles">
      <RoleGrid>
        {roles.map((role, idx) => (
          <RoleCard key={idx}>
            <RoleTitle>{role.title}</RoleTitle>
            <RoleSection>
              <RoleSectionLabel>Does</RoleSectionLabel>
              <RoleSectionValue>✓ {role.does}</RoleSectionValue>
            </RoleSection>
            <RoleSection>
              <RoleSectionLabel>Cannot</RoleSectionLabel>
              <RoleSectionValue>✗ {role.cannot}</RoleSectionValue>
            </RoleSection>
          </RoleCard>
        ))}
      </RoleGrid>
      <RoleClosing>A judge who cannot be paid with your own funds.</RoleClosing>
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

const RoleGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 32px;
  max-width: 1200px;
  margin: 0 auto 60px;

  @media (max-width: 768px) {
    gap: 24px;
  }
`;

const RoleCard = styled.div`
  background: linear-gradient(135deg, rgba(11, 20, 35, 0.8), rgba(26, 63, 117, 0.2));
  border: 2px solid rgba(78, 106, 156, 0.3);
  border-radius: 12px;
  padding: 32px;
  transition: all 0.3s ease;

  &:hover {
    border-color: #90B0C7;
    transform: translateY(-8px);
    box-shadow: 0 16px 40px rgba(26, 63, 117, 0.3);
  }
`;

const RoleTitle = styled.h3`
  font-family: 'Anton', Impact, sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #C9DBE9;
  margin: 0 0 28px 0;
`;

const RoleSection = styled.div`
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const RoleSectionLabel = styled.span`
  display: block;
  font-size: 0.75rem;
  text-transform: uppercase;
  color: #90B0C7;
  letter-spacing: 0.08em;
  font-weight: 700;
  margin-bottom: 8px;
`;

const RoleSectionValue = styled.p`
  font-size: 0.95rem;
  color: #d0d0d0;
  line-height: 1.6;
  margin: 0;
`;

const RoleClosing = styled.p`
  text-align: center;
  font-size: 1.1rem;
  color: #d0d0d0;
  margin: 0;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
  padding: 0 20px;
  line-height: 1.6;
  font-weight: 500;
`;

export default Roles;
