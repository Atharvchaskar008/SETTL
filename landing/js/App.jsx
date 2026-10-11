import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import Card from './Card';
import Footer, { FooterGlobalStyle } from './Footer';
import Hero from './Hero';
import HowItWorks from './HowItWorks';
import AttackLab from './AttackLab';
import Problem from './Problem';
import AIGuardrails from './AIGuardrails';
import UseCases from './UseCases';
import Roles from './Roles';
import TechDepth from './TechDepth';
import Limits from './Limits';
import Roadmap from './Roadmap';
import ClosingCTA from './ClosingCTA';
import RunDemoButton from './RunDemoButton';

const App = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const MAX_DPR = 2;

    const VERT_SRC = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

    const FRAG_SRC = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2  uRes;
uniform float uTime;
uniform vec2  uMouse;
uniform float uHover;
uniform vec3  uBg;
uniform vec3  uBase;
uniform vec3  uAccent;
uniform vec3  uHigh;
uniform float uSlats;
uniform float uFrost;
uniform float uRefract;
uniform float uEdge;
uniform float uGrain;

float sat(float x) { return clamp(x, 0.0, 1.0); }

float h21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 34.56);
    return fract(p.x * p.y);
}

float vnoise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = h21(i), b = h21(i + vec2(1.0, 0.0));
    float c = h21(i + vec2(0.0, 1.0)), d = h21(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm5(vec2 p) {
    float s = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) { s += a * vnoise(p); p = p * 2.03 + vec2(1.7, 9.2); a *= 0.5; }
    return s;
}

float fbm3(vec2 p) {
    float s = 0.0, a = 0.5;
    for (int i = 0; i < 3; i++) { s += a * vnoise(p); p = p * 2.07 + vec2(4.1, 2.3); a *= 0.5; }
    return s;
}

vec3 behind(vec2 uv, float t) {
    float a = fbm5(vec2(uv.x * 3.2, t * 0.05));
    float b = fbm3(vec2(uv.x * 9.0 + 4.1, t * 0.07));
    float prof = exp(-pow((uv.y - 0.52) / 0.42, 2.0));
    float amber = sat((b - 0.62) * 4.0) * sat(a * 1.5 - 0.30);
    vec3 c = mix(uBase, uAccent, sat(a * 1.5 - 0.20));
    c = mix(c, uHigh, amber * 0.85);
    return c * prof * (0.35 + 1.25 * pow(sat(a * 1.2 + b * 0.5 - 0.32), 1.4));
}

void main() {
    vec2 uv = gl_FragCoord.xy / uRes;
    float t = uTime;
    float warp = 0.05 * fbm3(vec2(uv.x * 2.2, 7.0));
    float sx = (uv.x + warp) * uSlats;
    float si = floor(sx), sf = fract(sx);
    float rnd = h21(vec2(si * 0.317, 1.0));
    float rnd2 = h21(vec2(si * 0.713, 5.0));
    float shift = (rnd - 0.5) * uRefract * 0.10;
    vec3 lit = behind(vec2(uv.x + shift, uv.y), t);
    vec3 soft = vec3(0.0);
    for (int k = 0; k < 5; k++) {
        float o = (float(k) - 2.0) * uFrost * 0.020;
        soft += behind(vec2(uv.x + shift + o, uv.y + o * 0.4), t);
    }
    soft *= 0.2;
    vec2 wd = uv - uMouse;
    wd.x *= uRes.x / uRes.y;
    float wipe = uHover * exp(-dot(wd, wd) * 8.0);
    vec3 col = uBg + mix(lit, soft, clamp(0.80 - wipe, 0.0, 0.80)) * (0.55 + 0.85 * rnd2);
    col *= 1.0 + wipe * 0.22;
    float edge = min(sf, 1.0 - sf);
    col += mix(uAccent, vec3(1.0), 0.35) * exp(-edge / 0.030) * 0.30 * uEdge;
    col *= 0.86 + 0.28 * smoothstep(0.0, 0.20, edge);
    col *= 1.0 - 0.40 * pow(sat(abs(uv.y - 0.5) * 2.0), 2.4);
    col += (h21(gl_FragCoord.xy + fract(uTime) * 37.0) - 0.5) * uGrain;
    gl_FragColor = vec4(max(col, 0.0), 1.0);
}
`;

    const parseColor = (input, fallback) => {
      if (!input) return fallback;
      const str = String(input).trim();
      if (str.charAt(0) === "#") {
        let hex = str.slice(1);
        if (hex.length === 3 || hex.length === 4) {
          hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        }
        if (hex.length >= 6) {
          const r = parseInt(hex.slice(0, 2), 16);
          const g = parseInt(hex.slice(2, 4), 16);
          const b = parseInt(hex.slice(4, 6), 16);
          if (!isNaN(r) && !isNaN(g) && !isNaN(b)) return [r / 255, g / 255, b / 255];
        }
      }
      return fallback;
    };

    const compile = (gl, type, src) => {
      const sh = gl.createShader(type);
      if (!sh) return null;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        console.error("FrostedVeil shader:", gl.getShaderInfoLog(sh));
        gl.deleteShader(sh);
        return null;
      }
      return sh;
    };

    const canvas = canvasRef.current;
    const gl = canvas.getContext('webgl', { antialias: false, alpha: false, depth: false });
    if (!gl) {
      console.error('FrostedVeil: WebGL unavailable');
      return;
    }

    const vs = compile(gl, gl.VERTEX_SHADER, VERT_SRC);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG_SRC);
    if (!vs || !fs) return;

    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);

    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error('FrostedVeil link:', gl.getProgramInfoLog(prog));
      return;
    }

    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(prog, 'a_pos');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const locs = {};
    const u = (name) => {
      if (!(name in locs)) locs[name] = gl.getUniformLocation(prog, name);
      return locs[name];
    };

    let last = performance.now();
    let clock = 0;

    const ptr = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5, on: 0, onTarget: 0 };

    const render = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      clock = (clock + dt * 1) % 3600;

      const k = 1 - Math.exp(-6 * dt);
      ptr.on += (ptr.onTarget - ptr.on) * k;
      ptr.x += ((ptr.onTarget > 0 ? ptr.tx : 0.5) - ptr.x) * k;
      ptr.y += ((ptr.onTarget > 0 ? ptr.ty : 0.5) - ptr.y) * k;

      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      const cw = canvas.clientWidth || 1200;
      const ch = canvas.clientHeight || 800;
      const bw = Math.max(1, Math.round(cw * dpr));
      const bh = Math.max(1, Math.round(ch * dpr));

      if (canvas.width !== bw || canvas.height !== bh) {
        canvas.width = bw;
        canvas.height = bh;
      }

      gl.viewport(0, 0, bw, bh);

      gl.uniform2f(u('uRes'), bw, bh);
      gl.uniform1f(u('uTime'), clock);
      gl.uniform2f(u('uMouse'), ptr.x, 1 - ptr.y);
      gl.uniform1f(u('uHover'), Math.min(1, ptr.on) * 0.99);

      const cg = parseColor('#00002A', [0.0, 0.0, 0.165]);
      const cb = parseColor('#1A3F75', [0.102, 0.247, 0.459]);
      const ca = parseColor('#4E6A9C', [0.306, 0.416, 0.612]);
      const ch2 = parseColor('#C9DBE9', [0.788, 0.859, 0.914]);

      gl.uniform3f(u('uBg'), cg[0], cg[1], cg[2]);
      gl.uniform3f(u('uBase'), cb[0], cb[1], cb[2]);
      gl.uniform3f(u('uAccent'), ca[0], ca[1], ca[2]);
      gl.uniform3f(u('uHigh'), ch2[0], ch2[1], ch2[2]);

      gl.uniform1f(u('uSlats'), 60);
      gl.uniform1f(u('uFrost'), 3);
      gl.uniform1f(u('uRefract'), 3);
      gl.uniform1f(u('uEdge'), 1.5);
      gl.uniform1f(u('uGrain'), 0.05);

      gl.drawArrays(gl.TRIANGLES, 0, 3);

      requestAnimationFrame(render);
    };

    const track = (e) => {
      const r = canvas.getBoundingClientRect();
      if (r.width <= 0 || r.height <= 0) return;
      ptr.tx = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
      ptr.ty = Math.max(0, Math.min(1, (e.clientY - r.top) / r.height));
      ptr.onTarget = 1;
    };

    const onLeave = () => {
      ptr.onTarget = 0;
    };

    canvas.addEventListener('pointermove', track);
    canvas.addEventListener('pointerenter', track);
    canvas.addEventListener('pointerleave', onLeave);

    requestAnimationFrame(render);

    return () => {
      canvas.removeEventListener('pointermove', track);
      canvas.removeEventListener('pointerenter', track);
      canvas.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  const NAV_LINKS = [
    { id: 'home', label: 'Home' },
    { id: 'how-it-works', label: 'How it works' },
    { id: 'security', label: 'Security' },
    { id: 'use-cases', label: 'Use cases' },
    { id: 'team', label: 'Team' },
  ];

  const [activeSection, setActiveSection] = useState('home');
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Eased smooth scrolling animation using requestAnimationFrame
  const smoothScrollToY = (targetY, duration = 800) => {
    const startY = window.pageYOffset || document.documentElement.scrollTop || window.scrollY || 0;
    const diff = targetY - startY;
    if (Math.abs(diff) < 2) return;
    const startTime = performance.now();

    const easeInOutCubic = (t) => {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    };

    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeInOutCubic(progress);
      window.scrollTo(0, startY + diff * eased);

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  };

  const scrollToSection = (e, targetId) => {
    if (e && e.preventDefault) e.preventDefault();
    setMobileMenuOpen(false);

    if (!targetId || targetId === '#' || targetId === '#home') {
      setActiveSection('home');
      smoothScrollToY(0, 750);
      window.history.pushState(null, '', '#home');
      return;
    }

    const id = targetId.startsWith('#') ? targetId.slice(1) : targetId;
    const element = document.getElementById(id);
    if (element) {
      setActiveSection(id);
      const navOffset = 72;
      const currentScroll = window.pageYOffset || document.documentElement.scrollTop || window.scrollY || 0;
      const elementPosition = element.getBoundingClientRect().top + currentScroll;
      const offsetPosition = Math.max(0, elementPosition - navOffset);

      smoothScrollToY(offsetPosition, 800);
      window.history.pushState(null, '', `#${id}`);

      // Visual pulse highlight on target section
      element.classList.remove('section-scroll-highlight');
      void element.offsetWidth; // trigger reflow
      element.classList.add('section-scroll-highlight');
      setTimeout(() => {
        element.classList.remove('section-scroll-highlight');
      }, 1500);
    }
  };

  // ScrollSpy to highlight active navbar element & track navbar background scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.pageYOffset || document.documentElement.scrollTop || window.scrollY || 0;
      setIsScrolled(scrollPos > 25);

      const sectionIds = ['home', 'how-it-works', 'security', 'use-cases', 'team', 'demo'];
      const navOffset = 130;

      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const secId = sectionIds[i];
        const el = document.getElementById(secId);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= navOffset) {
            setActiveSection(secId === 'demo' ? 'demo' : secId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Intercept all internal anchor clicks for smooth scroll navigation
  useEffect(() => {
    const handleDocumentClick = (e) => {
      const anchor = e.target.closest('a[href^="#"]');
      if (anchor) {
        const href = anchor.getAttribute('href');
        if (href && href.startsWith('#') && href.length > 1) {
          e.preventDefault();
          scrollToSection(e, href);
        }
      }
    };

    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
  }, []);

  return (
    <>
      <FooterGlobalStyle />
      <AppContainer>
        {/* Frosted Veil Background */}
        <FrostedVeilCanvas ref={canvasRef} />

      {/* Navbar */}
      <NavbarWrapper>
        <Nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#00002A]/90 backdrop-blur-xl border-b border-[#4E6A9C]/40 shadow-[0_10px_32px_rgba(0,0,25,0.7)]'
            : 'bg-[#00002A]/45 backdrop-blur-md border-b border-slate-800/35'
        }`}>
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            {/* Logo Section */}
            <div className="flex items-center gap-2 ml-0">
              <a
                className="flex items-center gap-2 cursor-pointer group"
                href="#home"
                onClick={(e) => scrollToSection(e, '#home')}
              >
                <span className="text-xl font-bold tracking-tight uppercase transition-colors group-hover:text-white" style={{ color: '#C9DBE9' }}>
                  SETTLE
                </span>
              </a>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex flex-col items-center relative flex-1 justify-center">
              <div className="flex items-center gap-1.5 lg:gap-2.5 bg-black/25 px-2 py-1 rounded-full border border-slate-800/50 backdrop-blur-sm">
                {NAV_LINKS.map((link) => {
                  const isActive = activeSection === link.id;
                  return (
                    <a
                      key={link.id}
                      href={`#${link.id}`}
                      onClick={(e) => scrollToSection(e, `#${link.id}`)}
                      className={`relative px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-200 cursor-pointer flex items-center justify-center ${
                        isActive
                          ? 'text-[#C9DBE9] bg-[#1A3F75]/75 shadow-[0_0_16px_rgba(78,106,156,0.5)] border border-[#4E6A9C]'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/40 border border-transparent'
                      }`}
                    >
                      <span>{link.label}</span>
                      {isActive && (
                        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3.5 h-[2px] bg-[#90B0C7] rounded-full shadow-[0_0_6px_#C9DBE9]" />
                      )}
                    </a>
                  );
                })}

                <a
                  href="https://github.com/Atharvchaskar008/Vortexa-3.0.git"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-1.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/40 rounded-full transition-all duration-200 border border-transparent"
                >
                  Docs
                </a>
              </div>
            </div>

            {/* Run the demo button */}
            <RunDemoButton href="#demo" onClick={(e) => scrollToSection(e, '#demo')}>
              Run the demo
            </RunDemoButton>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(prev => !prev)}
              aria-label="Toggle navigation menu"
              className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                {mobileMenuOpen ? (
                  <>
                    <path d="M18 6L6 18"></path>
                    <path d="M6 6l12 12"></path>
                  </>
                ) : (
                  <>
                    <path d="M4 6h16"></path>
                    <path d="M4 12h16"></path>
                    <path d="M4 18h16"></path>
                  </>
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Drawer Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden bg-[#00002A]/98 backdrop-blur-2xl border-b border-[#4E6A9C]/40 px-6 py-5 flex flex-col gap-2.5 shadow-2xl">
              {NAV_LINKS.map((link) => {
                const isActive = activeSection === link.id;
                return (
                  <a
                    key={link.id}
                    href={`#${link.id}`}
                    onClick={(e) => scrollToSection(e, `#${link.id}`)}
                    className={`px-4 py-2.5 text-base font-medium rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-between ${
                      isActive
                        ? 'text-[#C9DBE9] bg-[#1A3F75]/60 border border-[#4E6A9C]/60 shadow-[0_0_12px_rgba(26,63,117,0.4)]'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                    }`}
                  >
                    <span>{link.label}</span>
                    {isActive && <span className="w-2 h-2 rounded-full bg-[#90B0C7] shadow-[0_0_6px_#C9DBE9]" />}
                  </a>
                );
              })}
              <a
                href="https://github.com/Atharvchaskar008/Vortexa-3.0.git"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800/40 rounded-xl transition-colors"
              >
                Docs
              </a>
              <div className="pt-2">
                <RunDemoButton href="#demo" onClick={(e) => scrollToSection(e, '#demo')}>
                  Run the demo
                </RunDemoButton>
              </div>
            </div>
          )}
        </Nav>
      </NavbarWrapper>

      {/* Hero Section */}
      <Hero />

      {/* How It Works Section */}
      <HowItWorks />

      {/* Problem Section */}
      <Problem />

      {/* Attack Lab Section */}
      <AttackLab />

      {/* AI Guardrails Section */}
      <AIGuardrails />

      {/* Use Cases Section */}
      <UseCases />

      {/* Roles Section */}
      <Roles />

      {/* Tech Depth Section */}
      <TechDepth />

      {/* Limits Section */}
      <Limits />

      {/* Roadmap Section */}
      <Roadmap />

      {/* Closing CTA Section */}
      <ClosingCTA />

      {/* Team Cards Section */}
      <CardsSection id="team">
        <TeamHeading>The people behind the vault</TeamHeading>
        <Card />
      </CardsSection>
    </AppContainer>

    {/* Footer rendered as the LAST child at the root */}
    <Footer />
  </>
  );
};

const AppContainer = styled.div`
  position: relative;
  width: 100%;
  min-height: 100vh;
  background-color: #00002A;
  overflow-x: clip;
`;

const FrostedVeilCanvas = styled.canvas`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  filter: blur(3px);
  display: block;
`;

const NavbarWrapper = styled.div`
  position: relative;
  z-index: 10;
`;

const Nav = styled.nav`
  a, button {
    cursor: pointer;
  }
`;

const CardsSection = styled.div`
  position: relative;
  z-index: 10;
  padding: 100px 20px 60px;
  margin-top: 0;
`;

const TeamHeading = styled.h2`
  font-family: 'Anton', Impact, sans-serif;
  font-size: clamp(1.8rem, 4vw, 2.5rem);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  background: linear-gradient(90deg, #90B0C7, #C9DBE9, #4E6A9C, #90B0C7);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-align: center;
  margin-bottom: 60px;
  margin-top: 0;
`;

const Spacer = styled.div`
  position: relative;
  z-index: 10;
  min-height: 80vh;
  display: grid;
  place-content: center;
  text-align: center;
  padding: 4rem 2rem;
  color: #999;
  font-size: 1.2rem;
`;

export default App;
