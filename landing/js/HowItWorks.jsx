import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import blockchainBlocksSvg from '../assets/blockchain-blocks.svg';

const HowItWorks = () => {
  const [activeStep, setActiveStep] = useState(null);
  const containerRef = useRef(null);

  const steps = [
    {
      number: 1,
      title: 'Describe',
      description: 'Type the deal in normal language.',
    },
    {
      number: 2,
      title: 'Check',
      description: 'The deal checker builds a checklist and flags every unclear line.',
    },
    {
      number: 3,
      title: 'Join',
      description: 'Everyone agrees. Payers deposit. The deal locks.',
    },
    {
      number: 4,
      title: 'Do and approve',
      description: 'Payee marks a stage done. Payers approve, or the judge decides a dispute.',
    },
    {
      number: 5,
      title: 'Finish',
      description: 'Every stage settled. The money adds up exactly.',
    },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const stepNumber = parseInt(entry.target.dataset.step, 10);
            setActiveStep(stepNumber);
          }
        });
      },
      { threshold: 0.5 }
    );

    const stepElements = containerRef.current?.querySelectorAll('[data-step]');
    stepElements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <Container ref={containerRef} id="how-it-works">
      <Heading>How it works</Heading>
      <Description>Five steps from plain words to locked deal.</Description>

      <StepsGrid>
        {steps.map((step) => (
          <StepCard
            key={step.number}
            data-step={step.number}
            isActive={activeStep === step.number}
          >
            <StepNumber isActive={activeStep === step.number}>
              {step.number}
            </StepNumber>
            <StepTitle>{step.title}</StepTitle>
            <StepDescription>{step.description}</StepDescription>
          </StepCard>
        ))}
      </StepsGrid>

      <DiagramSection>
        <DiagramTitle>Blocks linked in a chain</DiagramTitle>
        <Diagram>
          <img
            src={blockchainBlocksSvg}
            alt="Blocks linked in a chain"
            style={{ width: '100%', maxWidth: '1000px', height: 'auto', display: 'block', margin: '0 auto', borderRadius: '10px' }}
          />
        </Diagram>
      </DiagramSection>
    </Container>
  );
};

const Container = styled.section`
  position: relative;
  z-index: 5;
  padding: 80px 20px;
  background: rgba(0, 0, 42, 0.3);
  border-top: 1px solid rgba(78, 106, 156, 0.2);
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
  font-size: 1.1rem;
  color: #b0b0b0;
  text-align: center;
  margin: 0 0 60px 0;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
`;

const StepsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto 60px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`;

const StepCard = styled.div`
  background: linear-gradient(135deg, rgba(11, 20, 35, 0.6), rgba(26, 63, 117, 0.15));
  border: 2px solid ${props => (props.isActive ? '#90B0C7' : 'rgba(78, 106, 156, 0.25)')};
  border-radius: 12px;
  padding: 32px 24px;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    border-color: #C9DBE9;
    transform: translateY(-4px);
    background: linear-gradient(135deg, rgba(11, 20, 35, 0.8), rgba(26, 63, 117, 0.3));
  }
`;

const StepNumber = styled.div`
  font-family: 'Anton', Impact, sans-serif;
  font-size: 3.5rem;
  font-weight: 700;
  background: ${props =>
    props.isActive
      ? 'linear-gradient(90deg, #90B0C7, #C9DBE9)'
      : 'linear-gradient(90deg, #24416B, #4E6A9C)'};
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  line-height: 1;
  margin-bottom: 16px;
  transition: all 0.3s ease;
`;

const StepTitle = styled.h3`
  font-family: 'Anton', Impact, sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #ffffff;
  margin: 0 0 12px 0;
`;

const StepDescription = styled.p`
  font-size: 0.95rem;
  color: #b0b0b0;
  line-height: 1.6;
  margin: 0;
`;

const DiagramSection = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  text-align: center;
  padding: 40px 20px;
  background: rgba(11, 20, 35, 0.4);
  border: 1px solid rgba(78, 106, 156, 0.2);
  border-radius: 12px;
`;

const DiagramTitle = styled.h3`
  font-family: 'Anton', Impact, sans-serif;
  font-size: 1.2rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #999;
  margin: 0 0 32px 0;
  text-align: center;
`;

const Diagram = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;

  svg, img {
    max-width: 100%;
    height: auto;
    display: block;
  }
`;

export default HowItWorks;
