import React from 'react';
import styled from 'styled-components';

const Problem = () => {
  const problems = [
    {
      title: 'The middleman is a black box',
      description: 'Whoever holds the money sets hidden rules and can favour one side.',
    },
    {
      title: 'Agreements are vague',
      description: '"Pay when the work is good" becomes a dispute later.',
    },
    {
      title: 'A program that holds money cannot make mistakes',
      description: 'A double release or a re-entrant call can lose money for good.',
    },
  ];

  return (
    <Container id="problem">
      <ProblemGrid>
        {problems.map((problem, idx) => (
          <ProblemCard key={idx}>
            <ProblemTitle>{problem.title}</ProblemTitle>
            <ProblemDescription>{problem.description}</ProblemDescription>
          </ProblemCard>
        ))}
      </ProblemGrid>
      <ProblemClosing>Everyone is afraid to go first. Settl removes the fear.</ProblemClosing>
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

const ProblemGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 32px;
  max-width: 1200px;
  margin: 0 auto 60px;

  @media (max-width: 768px) {
    gap: 24px;
  }
`;

const ProblemCard = styled.div`
  background: linear-gradient(135deg, rgba(11, 20, 35, 0.6), rgba(26, 63, 117, 0.12));
  border: 2px solid rgba(78, 106, 156, 0.3);
  border-radius: 12px;
  padding: 40px 32px;
  text-align: center;
  transition: all 0.3s ease;

  &:hover {
    border-color: #90B0C7;
    transform: translateY(-8px);
    box-shadow: 0 16px 40px rgba(26, 63, 117, 0.3);
  }
`;

const ProblemTitle = styled.h3`
  font-family: 'Anton', Impact, sans-serif;
  font-size: 1.4rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #C9DBE9;
  margin: 0 0 16px 0;
`;

const ProblemDescription = styled.p`
  font-size: 1rem;
  color: #b0b0b0;
  line-height: 1.6;
  margin: 0;
`;

const ProblemClosing = styled.p`
  text-align: center;
  font-size: 1.2rem;
  color: #d0d0d0;
  margin: 0;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
  padding: 0 20px;
  line-height: 1.6;
`;

export default Problem;
