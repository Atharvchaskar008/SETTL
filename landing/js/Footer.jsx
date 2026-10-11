import React, { useEffect, useRef } from 'react';
import styled, { createGlobalStyle } from 'styled-components';

export const FooterGlobalStyle = createGlobalStyle`
  html, body {
    overflow-x: clip;
  }
`;

const Footer = () => {
  const trackRef = useRef(null);
  const streaksRef = useRef(null);
  const linksRef = useRef(null);
  const lettersRef = useRef([]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    // DEV-ONLY CHECK: Detect ancestors that break position: sticky
    if (process.env.NODE_ENV !== 'production' || typeof window !== 'undefined') {
      let curr = track.parentElement;
      while (curr && curr !== document.body && curr !== document.documentElement) {
        const cs = window.getComputedStyle(curr);
        const tag = curr.tagName.toLowerCase();
        const id = curr.id ? `#${curr.id}` : '';
        const cls = curr.className && typeof curr.className === 'string'
          ? `.${curr.className.trim().split(/\s+/)[0]}`
          : '';
        const name = `<${tag}${id}${cls}>`;

        const violations = [];
        if (cs.overflow !== 'visible' && cs.overflow !== 'clip') {
          violations.push(`overflow: "${cs.overflow}"`);
        }
        if (cs.overflowX !== 'visible' && cs.overflowX !== 'clip') {
          violations.push(`overflow-x: "${cs.overflowX}"`);
        }
        if (cs.overflowY !== 'visible' && cs.overflowY !== 'clip') {
          violations.push(`overflow-y: "${cs.overflowY}"`);
        }
        if (cs.transform && cs.transform !== 'none') {
          violations.push(`transform: "${cs.transform}"`);
        }
        if (cs.filter && cs.filter !== 'none') {
          violations.push(`filter: "${cs.filter}"`);
        }
        if (cs.contain && cs.contain !== 'none' && cs.contain !== 'normal') {
          violations.push(`contain: "${cs.contain}"`);
        }

        if (violations.length > 0) {
          console.warn(
            `[Footer Sticky Warning] Ancestor element ${name} has styles that break position: sticky: ${violations.join(', ')}. Set overflow to visible/clip and remove transform/filter/contain.`
          );
        }
        curr = curr.parentElement;
      }
    }

    // Generate ~90 vertical streaks with seeded random
    const host = streaksRef.current;
    if (host) {
      const N = 90;
      let seed = 7;

      function rnd() {
        seed = (seed * 16807) % 2147483647;
        return (seed - 1) / 2147483646;
      }

      host.innerHTML = '';
      for (let k = 0; k < N; k++) {
        const t = k / N + rnd() * 0.01;
        const el = document.createElement('i');
        let h, s, l;

        if (t < 0.55) {
          // Reds / oranges on left 55%
          h = rnd() * 22;
          s = 85 + rnd() * 15;
          l = 35 + rnd() * 35;
        } else {
          // Blues on right 45%
          h = 200 + rnd() * 30;
          s = 80 + rnd() * 20;
          l = 35 + rnd() * 40;
        }

        if (rnd() < 0.18) {
          // Near-black gaps
          l = 6;
          s = 30;
        }
        if (rnd() < 0.08) {
          // Rare yellow flickers
          h = 40 + rnd() * 10;
          l = 55;
        }

        el.style.left = (t * 100) + '%';
        el.style.width = (0.3 + rnd() * rnd() * 3.2) + '%';
        el.style.background = `linear-gradient(90deg, transparent, hsl(${h}, ${s}%, ${l}%), transparent)`;
        el.style.opacity = (0.45 + rnd() * 0.55).toFixed(3);
        host.appendChild(el);
      }
    }

    // Pure easing functions
    const clamp = (x, min = 0, max = 1) => Math.min(Math.max(x, min), max);
    const seg = (p, a, b) => clamp((p - a) / (b - a), 0, 1);
    const easeInOutCubic = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
    const easeOutCubic = (x) => 1 - Math.pow(1 - x, 3);

    // Render state as a pure function of p
    function render(p) {
      // 1. Streaks
      const fade = seg(p, 0, 0.25);
      const collapse = easeInOutCubic(seg(p, 0.25, 0.5));
      const relax = easeInOutCubic(seg(p, 0.72, 0.92));
      const sx = 1 - 0.72 * collapse + 0.72 * relax;
      const op = fade * (1 - 0.5 * collapse * (1 - relax));

      if (streaksRef.current) {
        streaksRef.current.style.transform = `scaleX(${sx.toFixed(4)})`;
        streaksRef.current.style.opacity = op.toFixed(3);
      }

      // 2. Letters (SETTL) staggered by 0.045
      if (lettersRef.current) {
        lettersRef.current.forEach((el, i) => {
          if (!el) return;
          const a = 0.38 + i * 0.045;
          const b = a + 0.28; // 0.66 + i * 0.045
          const q = easeOutCubic(seg(p, a, b));
          el.style.opacity = q.toFixed(3);
          el.style.transform = `scaleY(${(1 + 1.8 * (1 - q)).toFixed(3)}) translateY(${(-30 * (1 - q)).toFixed(1)}px)`;
          el.style.filter = `blur(${(16 * (1 - q)).toFixed(1)}px) drop-shadow(0 .03em .05em rgba(0,0,0,.55))`;
        });
      }

      // 3. Links
      if (linksRef.current) {
        const l = easeOutCubic(seg(p, 0.86, 1));
        linksRef.current.style.opacity = l.toFixed(3);
        linksRef.current.style.transform = `translateY(${(24 * (1 - l)).toFixed(1)}px)`;
        linksRef.current.style.pointerEvents = l > 0.6 ? 'auto' : 'none';
      }
    }

    // Prefers-reduced-motion check
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      render(1);
      return;
    }

    // Scroller container detection (custom scroller vs window)
    const findScrollContainer = (el) => {
      let p = el?.parentElement;
      while (p && p !== document.body && p !== document.documentElement) {
        const cs = window.getComputedStyle(p);
        if (['auto', 'scroll'].includes(cs.overflowY) && p.scrollHeight > p.clientHeight) {
          return p;
        }
        p = p.parentElement;
      }
      return window;
    };

    const scroller = findScrollContainer(track);
    let rafId = null;

    const calculateAndRender = () => {
      if (!trackRef.current) return;
      const currentTrack = trackRef.current;
      const trackRect = currentTrack.getBoundingClientRect();
      const isWindow = scroller === window;
      const viewportHeight = isWindow ? window.innerHeight : scroller.clientHeight;
      const top = isWindow ? trackRect.top : trackRect.top - scroller.getBoundingClientRect().top;
      const maxScroll = currentTrack.offsetHeight - viewportHeight;
      const p = maxScroll > 0 ? clamp(-top / maxScroll, 0, 1) : 0;

      render(p);

      // Console test logger: log p when scrolling
      if (window.__DEBUG_FOOTER__ || window.__LOG_FOOTER_PROGRESS__) {
        console.log(`[Footer Scroll Test] p = ${p.toFixed(3)} | Stage pinned: ${top <= 0 && -top < maxScroll}`);
      }
    };

    const onScroll = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        calculateAndRender();
      });
    };

    // Listeners: passive scroll, resize, window load, fonts ready
    const scrollTarget = scroller;
    scrollTarget.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    window.addEventListener('load', onScroll);

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(calculateAndRender).catch(() => {});
    }

    // Initial render call on mount
    calculateAndRender();

    return () => {
      scrollTarget.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      window.removeEventListener('load', onScroll);
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
    };
  }, []);

  return (
    <FooterTrack ref={trackRef}>
      <Stage>
        <Streaks ref={streaksRef} aria-hidden="true" />
        <Vignette aria-hidden="true" />
        <Word aria-label="SETTL">
          {['S', 'E', 'T', 'T', 'L'].map((letter, i) => (
            <Span
              key={i}
              ref={(el) => {
                if (el && lettersRef.current) {
                  lettersRef.current[i] = el;
                }
              }}
            >
              {letter}
            </Span>
          ))}
        </Word>
        <Links ref={linksRef}>
          <Cols>
            <ColGroup>
              <ColHeading>Company</ColHeading>
              <ColLink href="#about">About</ColLink>
              <ColLink href="#careers">Careers</ColLink>
              <ColLink href="#press">Press</ColLink>
            </ColGroup>
            <ColGroup>
              <ColHeading>Product</ColHeading>
              <ColLink href="#features">Features</ColLink>
              <ColLink href="#pricing">Pricing</ColLink>
              <ColLink href="#changelog">Changelog</ColLink>
            </ColGroup>
            <ColGroup>
              <ColHeading>Support</ColHeading>
              <ColLink href="#help">Help Center</ColLink>
              <ColLink href="#contact">Contact</ColLink>
              <ColLink href="#status">Status</ColLink>
            </ColGroup>
            <ColGroup>
              <ColHeading>Legal</ColHeading>
              <ColLink href="#privacy">Privacy</ColLink>
              <ColLink href="#terms">Terms</ColLink>
              <ColLink href="#cookies">Cookies</ColLink>
            </ColGroup>
          </Cols>
          <Legal>
            <span>© 2026 SETTLE. All rights reserved.</span>
            <span>Made with care.</span>
          </Legal>
        </Links>
      </Stage>
    </FooterTrack>
  );
};

// 1. FOOTER IS THE TRACK: position: relative; height: 320vh; background: #000;
const FooterTrack = styled.footer`
  position: relative;
  height: 320vh;
  background: #000;
`;

// 2. STAGE: position: sticky; top: 0; height: 100vh; height: 100svh; overflow: hidden; background: #000; isolation: isolate;
const Stage = styled.div`
  position: sticky;
  top: 0;
  height: 100vh;
  height: 100svh;
  overflow: hidden;
  background: #000;
  isolation: isolate;
`;

// 3. STREAKS
const Streaks = styled.div`
  position: absolute;
  inset: 0;
  opacity: 0;
  transform-origin: 50% 50%;
  filter: blur(1.5px) saturate(1.15);
  will-change: transform, opacity;

  i {
    position: absolute;
    top: -5%;
    bottom: -5%;
    display: block;
  }
`;

// 4. VIGNETTE
const Vignette = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: 
    radial-gradient(ellipse at 50% 50%, transparent 35%, rgba(0, 0, 0, 0.75) 100%),
    linear-gradient(to bottom, rgba(0, 0, 0, 0.55), transparent 25%, transparent 70%, rgba(0, 0, 0, 0.85));
`;

// 5. WORD "SETTL"
const Word = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  top: 46%;
  transform: translateY(-50%);
  display: flex;
  justify-content: center;
  gap: 0.01em;
  font: 400 clamp(72px, 21vw, 340px) / 1 'Anton', Impact, sans-serif;
  pointer-events: none;
  letter-spacing: 0.02em;
`;

const Span = styled.span`
  display: inline-block;
  opacity: 0;
  transform-origin: 50% 100%;
  will-change: transform, opacity, filter;
  background: linear-gradient(90deg, #e50914 0 52%, #a9050e 52% 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  filter: drop-shadow(0 0.03em 0.05em rgba(0, 0, 0, 0.55));
`;

// 6. LINKS
const Links = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 0 clamp(1rem, 5vw, 4rem) calc(2rem + env(safe-area-inset-bottom, 0px));
  opacity: 0;
  transform: translateY(24px);
  will-change: opacity, transform;
`;

const Cols = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 1.5rem;
  max-width: 960px;
  margin: 0 auto 1.5rem;
`;

const ColGroup = styled.div``;

const ColHeading = styled.h4`
  margin: 0 0 0.6rem;
  font-size: 0.75rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #8d8d96;
  font-weight: 600;
`;

const ColLink = styled.a`
  display: block;
  color: #f4f4f5;
  text-decoration: none;
  font-size: 0.95rem;
  padding: 0.25rem 0;
  opacity: 0.85;
  transition: opacity 0.2s, color 0.2s;
  cursor: pointer;

  &:hover {
    opacity: 1;
    color: #ff5560;
  }
`;

const Legal = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1.5rem;
  justify-content: space-between;
  max-width: 960px;
  margin: 0 auto;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.18);
  font-size: 0.8rem;
  color: #b9b9c2;
`;

export default Footer;
