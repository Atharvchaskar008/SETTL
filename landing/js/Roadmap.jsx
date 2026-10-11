import React from 'react';
import styled from 'styled-components';

const Roadmap = () => {
  const levels = [
    {
      level: '1',
      title: 'Small group',
      description: 'A few payers, payees, one judge',
      note: 'This project',
    },
    {
      level: '2',
      title: 'Small business',
      description: 'One firm, many deals',
      note: 'A new vault per deal',
    },
    {
      level: '3',
      title: 'Company',
      description: 'Teams instead of people',
      note: 'Multi-manager approval, panel of judges',
    },
    {
      level: '4',
      title: 'Large enterprise',
      description: 'Contractor with subcontractors',
      note: 'Vaults that pay into vaults, inspector sign-off',
    },
  ];

  const ideas = [
    'Walk-away stake',
    'Penalty deposits',
    'Real rupee payments',
    'Licensed partner integration',
  ];

  return (
    <Container id="roadmap">
      <Heading>Roadmap</Heading>

      <LadderGrid>
        {levels.map((level, idx) => (
          <LadderCard key={idx} delay={idx * 0.1}>
            <LevelBadge>{level.level}</LevelBadge>
            <LevelTitle>{level.title}</LevelTitle>
            <LevelDescription>{level.description}</LevelDescription>
            <LevelNote>{level.note}</LevelNote>
          </LadderCard>
        ))}
      </LadderGrid>

      <IdeasSection>
        <IdeasTitle>Later ideas</IdeasTitle>
        <IdeasGrid>
          {ideas.map((idea, idx) => (
            <IdeaChip key={idx}>{idea}</IdeaChip>
          ))}
        </IdeasGrid>
      </IdeasSection>
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

const LadderGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto 60px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const LadderCard = styled.div`
  background: linear-gradient(135deg, rgba(11, 20, 35, 0.8), rgba(26, 63, 117, 0.2));
  border: 2px solid rgba(78, 106, 156, 0.3);
  border-radius: 12px;
  padding: 32px 24px;
  text-align: center;
  transition: all 0.3s ease;
  animation: slideUp 0.5s ease ${props => props.delay}s both;

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  &:hover {
    border-color: #90B0C7;
    transform: translateY(-8px);
    box-shadow: 0 16px 40px rgba(26, 63, 117, 0.3);
  }
`;

const LevelBadge = styled.div`
  font-family: 'Anton', Impact, sans-serif;
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(90deg, #90B0C7, #C9DBE9);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin-bottom: 16px;
`;

const LevelTitle = styled.h3`
  font-family: 'Anton', Impact, sans-serif;
  font-size: 1.2rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #ffffff;
  margin: 0 0 12px 0;
`;

const LevelDescription = styled.p`
  font-size: 0.9rem;
  color: #b0b0b0;
  line-height: 1.6;
  margin: 0 0 16px 0;
`;

const LevelNote = styled.p`
  font-size: 0.8rem;
  color: #90B0C7;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0;
`;

const IdeasSection = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 40px;
  background: rgba(26, 63, 117, 0.15);
  border: 1px solid rgba(78, 106, 156, 0.35);
  border-radius: 12px;
`;

const IdeasTitle = styled.h3`
  font-family: 'Anton', Impact, sans-serif;
  font-size: 1rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #C9DBE9;
  margin: 0 0 24px 0;
  text-align: center;
`;

const IdeasGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
`;

const IdeaChip = styled.span`
  background: rgba(26, 63, 117, 0.3);
  border: 1px solid rgba(78, 106, 156, 0.4);
  border-radius: 20px;
  padding: 8px 16px;
  font-size: 0.85rem;
  color: #C9DBE9;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

export default Roadmap;
