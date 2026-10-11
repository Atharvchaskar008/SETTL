import React from 'react';
import styled from 'styled-components';

const TechDepth = () => {
  const techs = ['Solidity 0.8.28', 'OpenZeppelin', 'Hardhat', 'ethers.js', 'Node.js', 'Express', 'Claude'];

  return (
    <Container id="tech-depth">
      <Heading>Built with depth</Heading>

      <ContentGrid>
        <DiagramSection>
          <DiagramTitle>Architecture</DiagramTitle>
          <Diagram>
            <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid meet">
              {/* Client */}
              <rect x="20" y="20" width="80" height="40" fill="rgba(26, 63, 117, 0.25)" stroke="#4E6A9C" strokeWidth="2" rx="4" />
              <text x="60" y="45" textAnchor="middle" fill="#C9DBE9" fontSize="12" fontWeight="bold">
                Client
              </text>

              {/* Arrow down */}
              <line x1="60" y1="60" x2="60" y2="100" stroke="#4E6A9C" strokeWidth="2" markerEnd="url(#arrowBlue)" />

              {/* Express Server */}
              <rect x="20" y="100" width="80" height="40" fill="rgba(26, 63, 117, 0.25)" stroke="#4E6A9C" strokeWidth="2" rx="4" />
              <text x="60" y="125" textAnchor="middle" fill="#C9DBE9" fontSize="12" fontWeight="bold">
                Express
              </text>

              {/* Arrow right */}
              <line x1="100" y1="120" x2="160" y2="120" stroke="#4E6A9C" strokeWidth="2" markerEnd="url(#arrowBlue)" />

              {/* Deal Checker */}
              <rect x="160" y="100" width="80" height="40" fill="rgba(26, 63, 117, 0.25)" stroke="#4E6A9C" strokeWidth="2" rx="4" />
              <text x="200" y="125" textAnchor="middle" fill="#C9DBE9" fontSize="11" fontWeight="bold">
                Deal Checker
              </text>

              {/* Arrow right */}
              <line x1="240" y1="120" x2="300" y2="120" stroke="#4E6A9C" strokeWidth="2" markerEnd="url(#arrowBlue)" />

              {/* JSON Store */}
              <rect x="300" y="100" width="80" height="40" fill="rgba(26, 63, 117, 0.25)" stroke="#4E6A9C" strokeWidth="2" rx="4" />
              <text x="340" y="125" textAnchor="middle" fill="#C9DBE9" fontSize="12" fontWeight="bold">
                JSON
              </text>

              {/* Arrow down from Express */}
              <line x1="60" y1="140" x2="60" y2="180" stroke="#90B0C7" strokeWidth="2" markerEnd="url(#arrowIce)" />

              {/* Hardhat Chain */}
              <rect x="20" y="180" width="80" height="40" fill="rgba(78, 106, 156, 0.2)" stroke="#90B0C7" strokeWidth="2" rx="4" />
              <text x="60" y="205" textAnchor="middle" fill="#90B0C7" fontSize="12" fontWeight="bold">
                Hardhat
              </text>

              {/* Arrow right */}
              <line x1="100" y1="200" x2="160" y2="200" stroke="#90B0C7" strokeWidth="2" markerEnd="url(#arrowIce)" />

              {/* MilestoneVault */}
              <rect x="160" y="180" width="80" height="40" fill="rgba(78, 106, 156, 0.2)" stroke="#90B0C7" strokeWidth="2" rx="4" />
              <text x="200" y="205" textAnchor="middle" fill="#90B0C7" fontSize="11" fontWeight="bold">
                MilestoneVault
              </text>

              {/* Arrow markers */}
              <defs>
                <marker id="arrowBlue" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
                  <path d="M0,0 L0,6 L9,3 z" fill="#4E6A9C" />
                </marker>
                <marker id="arrowIce" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
                  <path d="M0,0 L0,6 L9,3 z" fill="#90B0C7" />
                </marker>
              </defs>
            </svg>
          </Diagram>
        </DiagramSection>

        <TechStackSection>
          <TechStackTitle>Tech Stack</TechStackTitle>
          <TechChips>
            {techs.map((tech, idx) => (
              <TechChip key={idx}>{tech}</TechChip>
            ))}
          </TechChips>

          <QuickStartTitle>Quickstart</QuickStartTitle>
          <CodeBlock>
            <CodeLine>npm install</CodeLine>
            <CodeLine>npm test</CodeLine>
            <CodeLine>npm run demo</CodeLine>
            <CodeLine>npm start</CodeLine>
          </CodeBlock>

          <ButtonGroup>
            <Button as="a" href="https://github.com/Atharvchaskar008/Vortexa-3.0.git" target="_blank" rel="noopener noreferrer">
              View on GitHub
            </Button>
            <Button secondary>
              Read the README
            </Button>
          </ButtonGroup>
        </TechStackSection>
      </ContentGrid>
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

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  max-width: 1200px;
  margin: 0 auto;
  align-items: start;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 40px;
  }
`;

const DiagramSection = styled.div`
  background: rgba(11, 20, 35, 0.6);
  border: 1px solid rgba(78, 106, 156, 0.25);
  border-radius: 12px;
  padding: 32px;
`;

const DiagramTitle = styled.h3`
  font-family: 'Anton', Impact, sans-serif;
  font-size: 1.1rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #999;
  margin: 0 0 24px 0;
  text-align: center;
`;

const Diagram = styled.div`
  svg {
    max-width: 100%;
    height: auto;
  }
`;

const TechStackSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const TechStackTitle = styled.h3`
  font-family: 'Anton', Impact, sans-serif;
  font-size: 1.1rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #999;
  margin: 0;
`;

const TechChips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
`;

const TechChip = styled.span`
  background: linear-gradient(135deg, rgba(26, 63, 117, 0.35), rgba(78, 106, 156, 0.15));
  border: 1px solid rgba(78, 106, 156, 0.35);
  border-radius: 20px;
  padding: 8px 16px;
  font-size: 0.85rem;
  color: #C9DBE9;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const QuickStartTitle = styled.h4`
  font-family: 'Anton', Impact, sans-serif;
  font-size: 0.95rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #999;
  margin: 0;
`;

const CodeBlock = styled.div`
  background: rgba(11, 20, 35, 0.85);
  border: 1px solid rgba(78, 106, 156, 0.25);
  border-radius: 8px;
  padding: 16px;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  color: #90B0C7;
`;

const CodeLine = styled.div`
  padding: 4px 0;
  
  &::before {
    content: '$ ';
    color: #666;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const Button = styled.a`
  padding: 12px 24px;
  background: ${props => props.secondary ? 'transparent' : '#1A3F75'};
  color: ${props => props.secondary ? '#C9DBE9' : '#ffffff'};
  border: ${props => props.secondary ? '2px solid #4E6A9C' : 'none'};
  border-radius: 6px;
  font-weight: 700;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &:hover {
    ${props => props.secondary 
      ? 'background: rgba(78, 106, 156, 0.2); border-color: #90B0C7;' 
      : 'background: #255598; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(78, 106, 156, 0.4);'}
  }
`;

export default TechDepth;
