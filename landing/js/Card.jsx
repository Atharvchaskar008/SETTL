import React from 'react';
import styled from 'styled-components';
import GlareHover from './GlareHover';

// Barcode SVG Component
const BarcodeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width={64} height={150} viewBox="0 0 64 150" fill="black">
    <path d="M44 138V136.967H20V138H44Z" />
    <path d="M44 13.0328V12H20V13.0328H44Z" />
    <path d="M44 14.0656V13.5492H20V14.0656H44Z" />
    <path d="M44 15.6148V15.0984H20V15.6148H44Z" />
    <path d="M44 18.1967V17.6803H20V18.1967H44Z" />
    <path d="M44 20.2623V19.2295H20V20.2623H44Z" />
    <path d="M44 22.8443V22.3279H20V22.8443H44Z" />
    <path d="M44 23.877V23.3607H20V23.877H44Z" />
    <path d="M44 26.9754V24.9098H20V26.9754H44Z" />
    <path d="M44 28.0082V27.4918H20V28.0082H44Z" />
    <path d="M44 29.5574V29.041H20V29.5574H44Z" />
    <path d="M44 32.6557V30.5902H20V32.6557H44Z" />
    <path d="M44 33.6885V33.1721H20V33.6885H44Z" />
    <path d="M44 35.2376V34.7213H20V35.2376H44Z" />
    <path d="M44 36.2705V35.7541H20V36.2705H44Z" />
    <path d="M44 39.3689V37.3033H20V39.3689H44Z" />
    <path d="M44 40.918V40.4015H20V40.918H44Z" />
    <path d="M44 43.5001V41.4345H20V43.5001H44Z" />
    <path d="M44 45.0492V44.5327H20V45.0492H44Z" />
    <path d="M44 47.631V46.0819H20V47.631H44Z" />
    <path d="M44 49.1804V48.664H20V49.1804H44Z" />
    <path d="M44 51.2458V50.2131H20V51.2458H44Z" />
    <path d="M44 52.2787V51.7622H20V52.2787H44Z" />
    <path d="M44 54.3443V52.7952H20V54.3443H44Z" />
    <path d="M44 56.4099V55.377H20V56.4099H44Z" />
    <path d="M44 57.959V57.4426H20V57.959H44Z" />
    <path d="M44 60.0247V58.4753H20V60.0247H44Z" />
    <path d="M44 62.09V61.0573H20V62.09H44Z" />
    <path d="M44 63.6394V63.123H20V63.6394H44Z" />
    <path d="M44 66.7377V64.6721H20V66.7377H44Z" />
    <path d="M44 68.2868V67.7704H20V68.2868H44Z" />
    <path d="M44 69.3198V68.8033H20V69.3198H44Z" />
    <path d="M44 72.4181V71.3851H20V72.4181H44Z" />
    <path d="M44 73.4508V72.9345H20V73.4508H44Z" />
    <path d="M44 76.5493V74.4837H20V76.5493H44Z" />
    <path d="M44 77.5819V77.0655H20V77.5819H44Z" />
    <path d="M44 79.1311V78.6146H20V79.1311H44Z" />
    <path d="M44 80.6802V80.164H20V80.6802H44Z" />
    <path d="M44 82.2294V81.1967H20V82.2294H44Z" />
    <path d="M44 83.7788V83.2623H20V83.7788H44Z" />
    <path d="M44 86.3606V85.8441H20V86.3606H44Z" />
    <path d="M44 87.9097V87.3935H20V87.9097H44Z" />
    <path d="M44 91.0083V88.9427H20V91.0083H44Z" />
    <path d="M44 92.041V91.5245H20V92.041H44Z" />
    <path d="M44 94.623V92.5574H20V94.623H44Z" />
    <path d="M44 96.1722V95.6557H20V96.1722H44Z" />
    <path d="M44 97.7213V97.2048H20V97.7213H44Z" />
    <path d="M44 99.2704V98.2378H20V99.2704H44Z" />
    <path d="M44 100.82V100.303H20V100.82H44Z" />
    <path d="M44 103.402V102.885H20V103.402H44Z" />
    <path d="M44 105.467V104.434H20V105.467H44Z" />
    <path d="M44 108.049V106.5H20V108.049H44Z" />
    <path d="M44 109.082V108.566H20V109.082H44Z" />
    <path d="M44 112.18V111.148H20V112.18H44Z" />
    <path d="M44 113.213V112.697H20V113.213H44Z" />
    <path d="M44 114.762V114.246H20V114.762H44Z" />
    <path d="M44 118.377V116.311H20V118.377H44Z" />
    <path d="M44 119.41V118.893H20V119.41H44Z" />
    <path d="M44 120.442V119.926H20V120.442H44Z" />
    <path d="M44 122.508V120.959H20V122.508H44Z" />
    <path d="M44 124.574V123.541H20V124.574H44Z" />
    <path d="M44 127.672V125.607H20V127.672H44Z" />
    <path d="M44 128.705V128.188H20V128.705H44Z" />
    <path d="M44 130.254V129.738H20V130.254H44Z" />
    <path d="M44 132.32V131.287H20V132.32H44Z" />
    <path d="M44 135.418V133.869H20V135.418H44Z" />
    <path d="M44 136.451V135.934H20V136.451H44Z" />
  </svg>
);

// Individual Card Component
const TeamCard = ({ name, role, roleCode, id, owns, shipped, badgeColor, photoPath, glareColor = '#C9DBE9' }) => (
  <GlareHover
    width="380px"
    height="160px"
    borderRadius="1rem"
    mode="hover"
    variant="streak"
    glareColor={glareColor}
    glareOpacity={0.5}
    glareSize={30}
    softness={0.6}
    glareAngle={-45}
    blendMode="screen"
    rimGlint={true}
    transitionDuration={650}
  >
    <CardTicket>
      <BarcodeIcon />
      <Separator>
        <SpanLines />
      </Separator>

      <ContentTicket>
        <ContentData>
          <Destination>
            <Dest>
              <Country>SETTLE</Country>
              <Acronym>{name}</Acronym>
            </Dest>
            <svg style={{flexShrink: 0}} xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24">
              <path fill="none" stroke="#90B0C7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="m18 8l4 4l-4 4M2 12h20" />
            </svg>
            <Dest>
              <Country>{role}</Country>
              <Acronym>{roleCode}</Acronym>
            </Dest>
          </Destination>

          <DividerLine />

          <DataFlexCol>
            <DataFlex>
              <Data>
                <Title>ID</Title>
                <Subtitle>{id}</Subtitle>
              </Data>
              <Data>
                <Title>Owns</Title>
                <Subtitle>{owns}</Subtitle>
              </Data>
            </DataFlex>

            <DataFlex>
              <Data>
                <Title>Shipped</Title>
                <Subtitle>{shipped}</Subtitle>
              </Data>
            </DataFlex>
          </DataFlexCol>
        </ContentData>

        <ContainerIcons badgeColor={badgeColor}>
          <ProfileImage src={photoPath} alt={name} />
        </ContainerIcons>
      </ContentTicket>
    </CardTicket>
  </GlareHover>
);

// Export individual team members
export const SaeeCard = () => (
  <ContainerCardsTicket>
    <a href="https://www.linkedin.com/in/saeeekumbhar/" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
      <TeamCard
        name="SAEE"
        role="TEAM LEAD"
        roleCode="TL"
        id="762001"
        owns="API & Chain"
        shipped="62 tests"
        photoPath="/images/SAEE.jpg"
        badgeColor="#4E6A9C"
      />
    </a>
  </ContainerCardsTicket>
);

export const AtharvCard = () => (
  <ContainerCardsTicket>
    <a href="https://www.linkedin.com/in/atharv-chaskar-75711936b/" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
      <TeamCard
        name="ATHARV"
        role="BACKEND"
        roleCode="BE"
        id="762002"
        owns="Smart Contracts"
        shipped="4 Attacks"
        photoPath="/images/CHASKAR.jpg"
        badgeColor="#1A3F75"
      />
    </a>
  </ContainerCardsTicket>
);

export const PrathameshCard = () => (
  <ContainerCardsTicket>
    <a href="https://www.linkedin.com/in/prathamesh-patil-794441385/" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
      <TeamCard
        name="PRATHAMESH"
        role="SMART CONTRACT"
        roleCode="SC"
        id="762003"
        owns="MilestoneVault"
        shipped="29 Checks"
        photoPath="/images/PRATHAMESH.jpg"
        badgeColor="#325E8A"
      />
    </a>
  </ContainerCardsTicket>
);

export const PajiCard = () => (
  <ContainerCardsTicket>
    <a href="https://www.linkedin.com/in/bhavjot-singh-rooprai-a9b861385/" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
      <TeamCard
        name="PAJI"
        role="FRONT-END + BACKEND"
        roleCode="FB"
        id="762004"
        owns="UI & Demo"
        shipped="23 APIs"
        photoPath="/images/PAJI.jpg"
        badgeColor="#204A7D"
      />
    </a>
  </ContainerCardsTicket>
);

// Default export (all cards)
const Card = () => {
  return (
    <AllCardsWrapper>
      <SaeeCard />
      <AtharvCard />
      <PrathameshCard />
      <PajiCard />
    </AllCardsWrapper>
  );
};

// STYLED COMPONENTS
const AllCardsWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  justify-items: center;
  align-items: center;
  gap: 40px;
  padding: 40px 20px;
  max-width: 1000px;
  margin: 0 auto;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 30px;
  }
`;

const ContainerCardsTicket = styled.div`
  perspective: 1000px;
  border-radius: 1rem;
  transition: transform 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.25), box-shadow 0.35s ease;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6), 0 0 25px rgba(78, 106, 156, 0.4);
  }
`;

const CardTicket = styled.div`
  position: relative !important;
  height: 100% !important;
  width: 100% !important;
  display: flex !important;
  color: #C9DBE9 !important;
  background: linear-gradient(135deg, #0B1423 0%, #162C46 100%) !important;
  border: 1px solid rgba(78, 106, 156, 0.35) !important;
  border-radius: inherit !important;
  z-index: 1 !important;
  gap: 0.8rem !important;
  overflow: hidden !important;
  cursor: pointer !important;
`;

const Separator = styled.div`
  position: absolute;
  top: 0;
  left: 50px;
  width: 16px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  z-index: 10;
`;

const SpanLines = styled.span`
  position: relative;
  display: flex;
  height: 100%;
  border-left: 2px dashed #4E6A9C !important;

  &::after {
    content: "";
    position: absolute;
    top: -8px;
    left: 50%;
    transform: translateX(-50%);
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background-color: #00002A !important;
  }

  &::before {
    content: "";
    position: absolute;
    bottom: -8px;
    left: 50%;
    transform: translateX(-50%);
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background-color: #00002A !important;
  }
`;

const ContentTicket = styled.div`
  position: relative;
  justify-content: space-between;
  width: 100%;
  display: flex;
  align-items: stretch;
`;

const ContentData = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
  padding: 0.875rem;
  gap: 0.35rem;
  flex: 1;
`;

const Destination = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
`;

const Dest = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const Country = styled.p`
  font-size: 9px;
  line-height: 1;
  color: #90B0C7 !important;
  font-weight: 500;
  margin: 0;
`;

const Acronym = styled.p`
  font-weight: 800;
  color: #ffffff !important;
  font-size: 12px;
  margin: 2px 0 0 0;
  letter-spacing: 0.5px;
`;

const DividerLine = styled.div`
  border-bottom: 2px solid #4E6A9C !important;
  margin: 0.25rem 0;
`;

const DataFlexCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
`;

const DataFlex = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
`;

const Data = styled.div`
  font-size: 9px;
  line-height: 11px;
  flex: 1;
`;

const Title = styled.p`
  color: #90B0C7 !important;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  margin: 0;
  font-size: 8px;
`;

const Subtitle = styled.p`
  font-weight: 700;
  color: #C9DBE9 !important;
  margin: 2px 0 0 0;
  font-size: 10px;
`;

const ContainerIcons = styled.div`
  width: 70px;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  z-index: 10;
  border-radius: 0 1rem 1rem 0;
  background-color: ${props => props.badgeColor} !important;
  overflow: hidden;
`;

const ProfileImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

export default Card;
