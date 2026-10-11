import React from 'react';
import styled from 'styled-components';

const Hero = () => {
  return (
    <HeroContainer id="home">
      <Scrim />
      <HeroContent>
        <MainContent>
          <Headline>Write the deal in plain words. Settl locks it.</Headline>
          <SubLine>Money moves only when the work is approved. No middleman. No vague terms.</SubLine>

          <ButtonGroup>
            <PrimaryButton href="#demo">Try a live deal</PrimaryButton>
            <SecondaryButton href="#security">Watch the attacks fail</SecondaryButton>
          </ButtonGroup>

          <SimulationBanner>All funds are simulated.</SimulationBanner>
        </MainContent>
      </HeroContent>
    </HeroContainer>
  );
};

const HeroContainer = styled.section`
  position: relative;
  z-index: 5;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  overflow: hidden;
`;

const Scrim = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 42, 0.7) 0%,
    rgba(11, 20, 35, 0.45) 50%,
    rgba(0, 0, 42, 0.75) 100%
  );
  pointer-events: none;
  z-index: -1;
`;

const HeroContent = styled.div`
  max-width: 860px;
  width: 100%;
  margin: 0 auto;
  text-align: center;
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
`;

const Headline = styled.h1`
  font-family: 'Anton', Impact, sans-serif;
  font-size: clamp(2.4rem, 6vw, 4.2rem);
  font-weight: 700;
  color: #ffffff;
  line-height: 1.15;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.02em;
`;

const SubLine = styled.p`
  font-size: clamp(1rem, 2.2vw, 1.35rem);
  color: #d0d0d0;
  line-height: 1.6;
  margin: 0;
  font-weight: 300;
  max-width: 680px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 16px;

  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

const BaseButton = styled.a`
  padding: 14px 32px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  text-decoration: none;
  transition: all 0.3s ease;
  cursor: pointer;
  border: none;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const PrimaryButton = styled(BaseButton)`
  background: #1A3F75;
  color: #ffffff;

  &:hover {
    background: #255598;
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(78, 106, 156, 0.4);
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

const SimulationBanner = styled.div`
  font-size: 0.875rem;
  color: #90B0C7;
  background: rgba(26, 63, 117, 0.25);
  padding: 10px 20px;
  border-radius: 6px;
  border: 1px solid rgba(78, 106, 156, 0.4);
  margin-top: 12px;
  display: inline-block;
`;

export default Hero;
