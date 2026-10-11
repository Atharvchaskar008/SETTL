import React from 'react';
import styled from 'styled-components';

const RunDemoButton = ({
  href = '#demo',
  children = 'Run the demo',
  className = '',
  onClick
}) => {
  return (
    <PearlLink href={href} className={className} onClick={onClick}>
      <div className="wrap">
        <p>
          <span className="sparkle-idle">✧</span>
          <span className="sparkle-hover">✦</span>
          {children}
        </p>
      </div>
    </PearlLink>
  );
};

const PearlLink = styled.a`
  --white: #C9DBE9;
  --bg: #091326;
  --radius: 100px;

  /* Hidden on mobile, inline-flex on md+ (matches original hidden md:inline-flex) */
  display: none;
  @media (min-width: 768px) {
    display: inline-flex;
  }

  align-items: center;
  justify-content: center;
  text-decoration: none;
  outline: none;
  cursor: pointer;
  border: 1px solid rgba(78, 106, 156, 0.4);
  position: relative;
  border-radius: var(--radius);
  background-color: var(--bg);
  transition: all 0.2s ease;
  box-shadow:
    inset 0 0.2rem 0.6rem rgba(201, 219, 233, 0.25),
    inset 0 -0.08rem 0.25rem rgba(0, 0, 42, 0.8),
    inset 0 -0.3rem 0.6rem rgba(78, 106, 156, 0.4),
    0 0.8rem 1.8rem rgba(0, 0, 42, 0.6),
    0 0.3rem 0.6rem -0.2rem rgba(26, 63, 117, 0.5);

  .wrap {
    font-size: 13.5px;
    font-weight: 600;
    letter-spacing: 0.02em;
    color: #C9DBE9;
    padding: 9px 24px;
    border-radius: inherit;
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
  }

  .wrap p {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0;
    transition: all 0.2s ease;
    transform: translateY(2%);
    mask-image: linear-gradient(to bottom, white 40%, transparent);
    -webkit-mask-image: linear-gradient(to bottom, white 40%, transparent);
  }

  .wrap p span.sparkle-hover {
    display: none;
  }

  &:hover .wrap p span.sparkle-idle {
    display: none;
  }

  &:hover .wrap p span.sparkle-hover {
    display: inline-block;
  }

  .wrap::before,
  .wrap::after {
    content: '';
    position: absolute;
    transition: all 0.3s ease;
  }

  .wrap::before {
    left: -15%;
    right: -15%;
    bottom: 25%;
    top: -100%;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.12);
  }

  .wrap::after {
    left: 6%;
    right: 6%;
    top: 12%;
    bottom: 40%;
    border-radius: 22px 22px 0 0;
    box-shadow: inset 0 10px 8px -10px rgba(255, 255, 255, 0.8);
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.3) 0%,
      rgba(0, 0, 0, 0) 50%,
      rgba(0, 0, 0, 0) 100%
    );
  }

  &:hover {
    box-shadow:
      inset 0 0.2rem 0.4rem rgba(255, 255, 255, 0.4),
      inset 0 -0.08rem 0.25rem rgba(0, 0, 0, 0.7),
      inset 0 -0.3rem 0.6rem rgba(255, 255, 255, 0.7),
      0 1.2rem 2rem rgba(0, 0, 0, 0.3),
      0 0.5rem 0.8rem -0.3rem rgba(0, 0, 0, 0.8);
  }

  &:hover .wrap::before {
    transform: translateY(-5%);
  }

  &:hover .wrap::after {
    opacity: 0.4;
    transform: translateY(5%);
  }

  &:hover .wrap p {
    transform: translateY(-4%);
    color: #ffffff;
  }

  &:active {
    transform: translateY(2px);
    box-shadow:
      inset 0 0.2rem 0.4rem rgba(255, 255, 255, 0.5),
      inset 0 -0.08rem 0.25rem rgba(0, 0, 0, 0.8),
      inset 0 -0.3rem 0.6rem rgba(255, 255, 255, 0.4),
      0 1.2rem 2rem rgba(0, 0, 0, 0.3),
      0 0.5rem 0.8rem -0.3rem rgba(0, 0, 0, 0.8);
  }
`;

export default RunDemoButton;
