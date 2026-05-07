You are given a task to integrate an existing React component in the codebase

The codebase should support:
- shadcn project structure  
- Tailwind CSS
- Typescript

If it doesn't, provide instructions on how to setup project via shadcn CLI, install Tailwind or Typescript.

Determine the default path for components and styles. 
If default path for components is not /components/ui, provide instructions on why it's important to create this folder
Copy-paste this component to /components/ui folder:
```tsx
magnetic-cursor.tsx
import React, { useRef, useEffect, FC, ReactNode, useState } from 'react';
import gsap from 'gsap';
import { vec2, Vec2 } from 'vecteur';

interface MagneticCursorProps {
  children: ReactNode;
  magneticFactor?: number;
  lerpAmount?: number;
  hoverPadding?: number;
  hoverAttribute?: string;
  cursorSize?: number;
  cursorColor?: string;
  blendMode?: 'difference' | 'exclusion' | 'normal' | 'screen' | 'overlay';
  cursorClassName?: string;
  shape?: 'circle' | 'square' | 'rounded-square';
  disableOnTouch?: boolean;
  speedMultiplier?: number;
  maxScaleX?: number;
  maxScaleY?: number;
  /** 
   * Boosts background contrast before blending. 
   * Higher values (1.5 - 2.0) fix visibility on low-contrast/dim backgrounds.
   * Default: 1.5 (150%)
   */
  contrastBoost?: number;
}

interface CursorState {
  el: HTMLDivElement | null;
  pos: {
    current: Vec2;
    target: Vec2;
    previous: Vec2;
  };
  hover: { isHovered: boolean };
  isDetaching: boolean;
}

export const MagneticCursor: FC<MagneticCursorProps> = ({
  children,
  lerpAmount = 0.1,
  magneticFactor = 0.2,
  hoverPadding = 12,
  hoverAttribute = 'data-magnetic',
  cursorSize = 24,
  cursorColor = 'white', // Pure white works best for exclusion/difference
  blendMode = 'exclusion', // Exclusion is safer than difference for text
  cursorClassName = '',
  shape = 'circle',
  disableOnTouch = true,
  speedMultiplier = 0.02,
  maxScaleX = 1,
  maxScaleY = 0.3,
  contrastBoost = 1.5, // 1.5x contrast boost by default
}) => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorStateRef = useRef<CursorState | null>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const configRef = useRef({
    magneticFactor,
    speedMultiplier,
    maxScaleX,
    maxScaleY,
    cursorSize,
    lerpAmount,
    hoverPadding,
  });

  useEffect(() => {
    configRef.current = {
      magneticFactor,
      speedMultiplier,
      maxScaleX,
      maxScaleY,
      cursorSize,
      lerpAmount,
      hoverPadding,
    };
  }, [magneticFactor, speedMultiplier, maxScaleX, maxScaleY, cursorSize, lerpAmount, hoverPadding]);

  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  useEffect(() => {
    if (disableOnTouch && isTouchDevice) return;
    const cursorEl = cursorRef.current;
    if (!cursorEl) return;

    gsap.set(cursorEl, { xPercent: -50, yPercent: -50 });

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const detachDuration = prefersReducedMotion ? 0.1 : 0.35;

    if (!cursorStateRef.current) {
      cursorStateRef.current = {
        el: cursorEl,
        pos: {
          current: vec2(-100, -100),
          target: vec2(-100, -100),
          previous: vec2(-100, -100),
        },
        hover: { isHovered: false },
        isDetaching: false,
      };
    }

    const update = () => {
      const state = cursorStateRef.current;
      if (!state || state.hover.isHovered) return;

      const { speedMultiplier, maxScaleX, maxScaleY, lerpAmount } = configRef.current;
      const effectiveLerp = prefersReducedMotion ? 1 : lerpAmount;

      state.pos.current.lerp(state.pos.target, effectiveLerp);
      const delta = state.pos.current.clone().sub(state.pos.previous);
      state.pos.previous.copy(state.pos.current);

      if (state.isDetaching) {
        gsap.set(state.el, {
          x: state.pos.current.x,
          y: state.pos.current.y,
          scaleX: 1,
          scaleY: 1,
          rotate: 0,
          overwrite: 'auto'
        });
      } else {
        const speed = Math.sqrt(delta.x * delta.x + delta.y * delta.y) * speedMultiplier;
        gsap.set(state.el, {
          x: state.pos.current.x,
          y: state.pos.current.y,
          rotate: Math.atan2(delta.y, delta.x) * (180 / Math.PI),
          scaleX: 1 + Math.min(speed, maxScaleX),
          scaleY: 1 - Math.min(speed, maxScaleY),
          overwrite: 'auto'
        });
      }
    };

    const initializePosition = (event: MouseEvent) => {
      const state = cursorStateRef.current;
      if (!state) return;
      const x = event.clientX;
      const y = event.clientY;
      state.pos.current.x = x;
      state.pos.current.y = y;
      state.pos.target.x = x;
      state.pos.target.y = y;
      state.pos.previous.x = x;
      state.pos.previous.y = y;
      gsap.set(cursorEl, { x, y, opacity: 1 });
    };

    const onMouseMove = (event: PointerEvent) => {
      const state = cursorStateRef.current;
      if (!state) return;
      
      state.pos.target.x = event.clientX;
      state.pos.target.y = event.clientY;

      const isInViewport =
        event.clientX >= 0 &&
        event.clientX <= window.innerWidth &&
        event.clientY >= 0 &&
        event.clientY <= window.innerHeight;

      gsap.to(cursorEl, { opacity: isInViewport ? 1 : 0, duration: 0.2, overwrite: 'auto' });

      const target = event.target as HTMLElement;
      const isTextContent =
        ['P', 'SPAN', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(target.tagName) ||
        window.getComputedStyle(target).cursor === 'text';

      if (isTextContent && !state.hover.isHovered && !state.isDetaching) {
        gsap.to(cursorEl, { scaleX: 0.5, scaleY: 1.5, duration: 0.3, overwrite: 'auto' });
      }
    };

    const handleMouseLeave = () => gsap.to(cursorEl, { opacity: 0, duration: 0.3 });
    const handleMouseEnter = () => gsap.to(cursorEl, { opacity: 1, duration: 0.3 });
    const handleClick = (event: MouseEvent) => {};

    gsap.ticker.add(update);
    window.addEventListener('pointermove', onMouseMove);
    window.addEventListener('pointermove', initializePosition, { once: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);
    window.addEventListener('click', handleClick);

    const cleanupFunctions: (() => void)[] = [];

    const magneticElements = gsap.utils.toArray<HTMLElement>(`[${hoverAttribute}]`);
    magneticElements.forEach((el) => {
      const xTo = gsap.quickTo(el, 'x', { duration: 1, ease: 'elastic.out(1, 0.3)' });
      const yTo = gsap.quickTo(el, 'y', { duration: 1, ease: 'elastic.out(1, 0.3)' });

      const handlePointerEnter = () => {
        const state = cursorStateRef.current;
        if (!state) return;
        const { magneticFactor, hoverPadding } = configRef.current;

        state.hover.isHovered = true;
        state.isDetaching = false;

        const bounds = el.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(el);
        const magneticColor = el.getAttribute('data-magnetic-color') || cursorColor;
        const dynamicPadding = hoverPadding * (1 + magneticFactor);
        const centerX = bounds.left + bounds.width / 2;
        const centerY = bounds.top + bounds.height / 2;

        gsap.killTweensOf(cursorEl);
        gsap.to(cursorEl, {
          x: centerX,
          y: centerY,
          width: bounds.width + dynamicPadding * 2,
          height: bounds.height + dynamicPadding * 2,
          borderRadius: computedStyle.borderRadius,
          backgroundColor: magneticColor,
          scaleX: 1,
          scaleY: 1,
          rotate: 0,
          duration: 0.3, 
          ease: 'power3.out',
          overwrite: 'all'
        });
      };

      const handlePointerLeave = () => {
        const state = cursorStateRef.current;
        if (!state) return;
        const currentX = gsap.getProperty(cursorEl, "x") as number;
        const currentY = gsap.getProperty(cursorEl, "y") as number;

        state.pos.current.x = currentX;
        state.pos.current.y = currentY;
        state.pos.previous.x = currentX;
        state.pos.previous.y = currentY;

        state.hover.isHovered = false;
        state.isDetaching = true;

        const { cursorSize } = configRef.current;
        const shapeBorderRadius = shape === 'circle' ? '50%' : shape === 'square' ? '0' : '8px';

        gsap.killTweensOf(cursorEl);
        gsap.to(cursorEl, {
          width: cursorSize,
          height: cursorSize,
          borderRadius: shapeBorderRadius,
          backgroundColor: cursorColor,
          scaleX: 1,
          scaleY: 1,
          duration: detachDuration,
          ease: 'power3.out',
          overwrite: 'all',
          onComplete: () => { state.isDetaching = false; }
        });
      };

      let rafId: number | null = null;
      const handlePointerMove = (event: PointerEvent) => {
        if (rafId) return;
        rafId = requestAnimationFrame(() => {
          const { clientX, clientY } = event;
          const { height, width, left, top } = el.getBoundingClientRect();
          const { magneticFactor } = configRef.current;
          xTo((clientX - (left + width / 2)) * magneticFactor);
          yTo((clientY - (top + height / 2)) * magneticFactor);
          rafId = null;
        });
      };

      const handlePointerOut = () => { xTo(0); yTo(0); };

      el.addEventListener('pointerenter', handlePointerEnter);
      el.addEventListener('pointerleave', handlePointerLeave);
      el.addEventListener('pointermove', handlePointerMove);
      el.addEventListener('pointerout', handlePointerOut);

      cleanupFunctions.push(() => {
        el.removeEventListener('pointerenter', handlePointerEnter);
        el.removeEventListener('pointerleave', handlePointerLeave);
        el.removeEventListener('pointermove', handlePointerMove);
        el.removeEventListener('pointerout', handlePointerOut);
      });
    });

    return () => {
      gsap.ticker.remove(update);
      window.removeEventListener('pointermove', onMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      window.removeEventListener('click', handleClick);
      cleanupFunctions.forEach((cleanup) => cleanup());
    };
  }, [disableOnTouch, isTouchDevice, hoverPadding, hoverAttribute, cursorColor, shape]);

  if (disableOnTouch && isTouchDevice) return <>{children}</>;

  const styles: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 9999,
    pointerEvents: 'none',
    willChange: 'transform, width, height, border-radius',
    backgroundColor: cursorColor,
    mixBlendMode: blendMode as any,
    width: cursorSize,
    height: cursorSize,
    borderRadius: shape === 'circle' ? '50%' : shape === 'square' ? '0' : '8px',
    // KEY FIX: Contrast Boost using backdrop-filter
    backdropFilter: contrastBoost !== 1 ? `contrast(${contrastBoost})` : 'none',
    WebkitBackdropFilter: contrastBoost !== 1 ? `contrast(${contrastBoost})` : 'none',
  };

  return (
    <>
      <div ref={cursorRef} className={`magnetic-cursor ${cursorClassName}`} style={styles} />
      {children}
    </>
  );
};

demo.tsx
import React from "react";
import { MagneticCursor } from "@/components/ui/magnetic-cursor";
import { ArrowUpRight, Menu } from "lucide-react";

export default function MagneticCursorDemo() {
  return (
    <MagneticCursor
      magneticFactor={0.55}
      blendMode="exclusion"
      cursorSize={40}
    >
      <div className="relative w-full h-screen bg-background text-foreground overflow-hidden font-sans selection:bg-primary selection:text-background flex flex-col">
        
        {/* Subtle Grid Background using CSS Variables from your config */}
        <div 
            className="absolute inset-0 z-0 opacity-80 pointer-events-none" 
            style={{ 
                backgroundImage: `linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)`, 
                backgroundSize: '40px 40px' 
            }} 
        />

        {/* Header */}
        <header className="relative z-10 flex items-center justify-between p-8 md:p-12">
          <div data-magnetic className="text-xl font-bold tracking-tighter mix-blend-difference">
            21st.dev
          </div>
          
          <button
            data-magnetic
            className="group relative flex h-14 w-14 items-center justify-center rounded-full border border-2 border-border bg-secondary backdrop-blur-sm transition-colors hover:bg-secondary"
          >
            <Menu className="h-6 w-6 stroke-1 pointer-events-none text-foreground" />
          </button>
        </header>

        {/* Main Content */}
        <main className="relative z-10 flex flex-1 flex-col items-center justify-center gap-12 p-6">
          
          {/* Typography Section */}
          <div className="text-center space-y-4">
            <h1 className="text-6xl md:text-8xl font-medium tracking-tighter leading-[0.9]">
              Fluid <br />
              <span className="text-muted-foreground">Interaction</span>
            </h1>
          </div>

          {/* The "Killer Feature" Demo Block: High Contrast Test */}
          {/* Using bg-primary (White in dark mode) to contrast against bg-background (Black in dark mode) */}
          <div 
            data-magnetic
            className="relative flex h-32 w-full max-w-sm items-center justify-between overflow-hidden rounded-2xl bg-primary px-8 text-primary-foreground shadow-2xl transition-transform hover:scale-[1.02]"
          >
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium uppercase tracking-widest opacity-60">
                Try Hovering
              </span>
              <span className="text-2xl font-bold tracking-tight">
                Smart Contrast
              </span>
            </div>
            {/* Inverted icon circle */}
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-foreground text-primary">
               <ArrowUpRight className="h-5 w-5 pointer-events-none" />
            </div>
          </div>

          <p className="max-w-md text-center text-sm text-muted-foreground leading-relaxed">
            A physics-based cursor wrapper that handles velocity, magnetic snapping, and auto-contrast inversion.
          </p>

        </main>

        {/* Footer */}
        <footer className="relative z-10 flex w-full justify-between p-8 text-xs text-muted-foreground md:p-12 uppercase tracking-widest">
          <span>GSAP Power</span>
          <span>React Three Fiber</span>
        </footer>
      </div>
    </MagneticCursor>
  );
}
```

Install NPM dependencies:
```bash
gsap, vecteur
```

Extend existing Tailwind 4 index.css with this code (or if project uses Tailwind 3, extend tailwind.config.js or globals.css):
```css
@import "tailwindcss";
@import "tw-animate-css";

@theme inline {
  --radius-full: 999px;
}

```

Implementation Guidelines
 1. Analyze the component structure and identify all required dependencies
 2. Review the component's argumens and state
 3. Identify any required context providers or hooks and install them
 4. Questions to Ask
 - What data/props will be passed to this component?
 - Are there any specific state management requirements?
 - Are there any required assets (images, icons, etc.)?
 - What is the expected responsive behavior?
 - What is the best place to use this component in the app?

Steps to integrate
 0. Copy paste all the code above in the correct directories
 1. Install external dependencies
 2. Fill image assets with Unsplash stock images you know exist
 3. Use lucide-react icons for svgs or logos if component requires them

import React, { useRef, useEffect, FC, ReactNode, useState } from 'react';
import gsap from 'gsap';
import { vec2, Vec2 } from 'vecteur';

interface MagneticCursorProps {
  children: ReactNode;
  magneticFactor?: number;
  lerpAmount?: number;
  hoverPadding?: number;
  hoverAttribute?: string;
  cursorSize?: number;
  cursorColor?: string;
  blendMode?: 'difference' | 'exclusion' | 'normal' | 'screen' | 'overlay';
  cursorClassName?: string;
  shape?: 'circle' | 'square' | 'rounded-square';
  disableOnTouch?: boolean;
  speedMultiplier?: number;
  maxScaleX?: number;
  maxScaleY?: number;
  /** 
   * Boosts background contrast before blending. 
   * Higher values (1.5 - 2.0) fix visibility on low-contrast/dim backgrounds.
   * Default: 1.5 (150%)
   */
  contrastBoost?: number;
}

interface CursorState {
  el: HTMLDivElement | null;
  pos: {
    current: Vec2;
    target: Vec2;
    previous: Vec2;
  };
  hover: { isHovered: boolean };
  isDetaching: boolean;
}

export const MagneticCursor: FC<MagneticCursorProps> = ({
  children,
  lerpAmount = 0.1,
  magneticFactor = 0.2,
  hoverPadding = 12,
  hoverAttribute = 'data-magnetic',
  cursorSize = 24,
  cursorColor = 'white', // Pure white works best for exclusion/difference
  blendMode = 'exclusion', // Exclusion is safer than difference for text
  cursorClassName = '',
  shape = 'circle',
  disableOnTouch = true,
  speedMultiplier = 0.02,
  maxScaleX = 1,
  maxScaleY = 0.3,
  contrastBoost = 1.5, // 1.5x contrast boost by default
}) => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorStateRef = useRef<CursorState | null>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const configRef = useRef({
    magneticFactor,
    speedMultiplier,
    maxScaleX,
    maxScaleY,
    cursorSize,
    lerpAmount,
    hoverPadding,
  });

  useEffect(() => {
    configRef.current = {
      magneticFactor,
      speedMultiplier,
      maxScaleX,
      maxScaleY,
      cursorSize,
      lerpAmount,
      hoverPadding,
    };
  }, [magneticFactor, speedMultiplier, maxScaleX, maxScaleY, cursorSize, lerpAmount, hoverPadding]);

  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  useEffect(() => {
    if (disableOnTouch && isTouchDevice) return;
    const cursorEl = cursorRef.current;
    if (!cursorEl) return;

    gsap.set(cursorEl, { xPercent: -50, yPercent: -50 });

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const detachDuration = prefersReducedMotion ? 0.1 : 0.35;

    if (!cursorStateRef.current) {
      cursorStateRef.current = {
        el: cursorEl,
        pos: {
          current: vec2(-100, -100),
          target: vec2(-100, -100),
          previous: vec2(-100, -100),
        },
        hover: { isHovered: false },
        isDetaching: false,
      };
    }

    const update = () => {
      const state = cursorStateRef.current;
      if (!state || state.hover.isHovered) return;

      const { speedMultiplier, maxScaleX, maxScaleY, lerpAmount } = configRef.current;
      const effectiveLerp = prefersReducedMotion ? 1 : lerpAmount;

      state.pos.current.lerp(state.pos.target, effectiveLerp);
      const delta = state.pos.current.clone().sub(state.pos.previous);
      state.pos.previous.copy(state.pos.current);

      if (state.isDetaching) {
        gsap.set(state.el, {
          x: state.pos.current.x,
          y: state.pos.current.y,
          scaleX: 1,
          scaleY: 1,
          rotate: 0,
          overwrite: 'auto'
        });
      } else {
        const speed = Math.sqrt(delta.x * delta.x + delta.y * delta.y) * speedMultiplier;
        gsap.set(state.el, {
          x: state.pos.current.x,
          y: state.pos.current.y,
          rotate: Math.atan2(delta.y, delta.x) * (180 / Math.PI),
          scaleX: 1 + Math.min(speed, maxScaleX),
          scaleY: 1 - Math.min(speed, maxScaleY),
          overwrite: 'auto'
        });
      }
    };

    const initializePosition = (event: MouseEvent) => {
      const state = cursorStateRef.current;
      if (!state) return;
      const x = event.clientX;
      const y = event.clientY;
      state.pos.current.x = x;
      state.pos.current.y = y;
      state.pos.target.x = x;
      state.pos.target.y = y;
      state.pos.previous.x = x;
      state.pos.previous.y = y;
      gsap.set(cursorEl, { x, y, opacity: 1 });
    };

    const onMouseMove = (event: PointerEvent) => {
      const state = cursorStateRef.current;
      if (!state) return;
      
      state.pos.target.x = event.clientX;
      state.pos.target.y = event.clientY;

      const isInViewport =
        event.clientX >= 0 &&
        event.clientX <= window.innerWidth &&
        event.clientY >= 0 &&
        event.clientY <= window.innerHeight;

      gsap.to(cursorEl, { opacity: isInViewport ? 1 : 0, duration: 0.2, overwrite: 'auto' });

      const target = event.target as HTMLElement;
      const isTextContent =
        ['P', 'SPAN', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(target.tagName) ||
        window.getComputedStyle(target).cursor === 'text';

      if (isTextContent && !state.hover.isHovered && !state.isDetaching) {
        gsap.to(cursorEl, { scaleX: 0.5, scaleY: 1.5, duration: 0.3, overwrite: 'auto' });
      }
    };

    const handleMouseLeave = () => gsap.to(cursorEl, { opacity: 0, duration: 0.3 });
    const handleMouseEnter = () => gsap.to(cursorEl, { opacity: 1, duration: 0.3 });
    const handleClick = (event: MouseEvent) => {};

    gsap.ticker.add(update);
    window.addEventListener('pointermove', onMouseMove);
    window.addEventListener('pointermove', initializePosition, { once: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);
    window.addEventListener('click', handleClick);

    const cleanupFunctions: (() => void)[] = [];

    const magneticElements = gsap.utils.toArray<HTMLElement>(`[${hoverAttribute}]`);
    magneticElements.forEach((el) => {
      const xTo = gsap.quickTo(el, 'x', { duration: 1, ease: 'elastic.out(1, 0.3)' });
      const yTo = gsap.quickTo(el, 'y', { duration: 1, ease: 'elastic.out(1, 0.3)' });

      const handlePointerEnter = () => {
        const state = cursorStateRef.current;
        if (!state) return;
        const { magneticFactor, hoverPadding } = configRef.current;

        state.hover.isHovered = true;
        state.isDetaching = false;

        const bounds = el.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(el);
        const magneticColor = el.getAttribute('data-magnetic-color') || cursorColor;
        const dynamicPadding = hoverPadding * (1 + magneticFactor);
        const centerX = bounds.left + bounds.width / 2;
        const centerY = bounds.top + bounds.height / 2;

        gsap.killTweensOf(cursorEl);
        gsap.to(cursorEl, {
          x: centerX,
          y: centerY,
          width: bounds.width + dynamicPadding * 2,
          height: bounds.height + dynamicPadding * 2,
          borderRadius: computedStyle.borderRadius,
          backgroundColor: magneticColor,
          scaleX: 1,
          scaleY: 1,
          rotate: 0,
          duration: 0.3, 
          ease: 'power3.out',
          overwrite: 'all'
        });
      };

      const handlePointerLeave = () => {
        const state = cursorStateRef.current;
        if (!state) return;
        const currentX = gsap.getProperty(cursorEl, "x") as number;
        const currentY = gsap.getProperty(cursorEl, "y") as number;

        state.pos.current.x = currentX;
        state.pos.current.y = currentY;
        state.pos.previous.x = currentX;
        state.pos.previous.y = currentY;

        state.hover.isHovered = false;
        state.isDetaching = true;

        const { cursorSize } = configRef.current;
        const shapeBorderRadius = shape === 'circle' ? '50%' : shape === 'square' ? '0' : '8px';

        gsap.killTweensOf(cursorEl);
        gsap.to(cursorEl, {
          width: cursorSize,
          height: cursorSize,
          borderRadius: shapeBorderRadius,
          backgroundColor: cursorColor,
          scaleX: 1,
          scaleY: 1,
          duration: detachDuration,
          ease: 'power3.out',
          overwrite: 'all',
          onComplete: () => { state.isDetaching = false; }
        });
      };

      let rafId: number | null = null;
      const handlePointerMove = (event: PointerEvent) => {
        if (rafId) return;
        rafId = requestAnimationFrame(() => {
          const { clientX, clientY } = event;
          const { height, width, left, top } = el.getBoundingClientRect();
          const { magneticFactor } = configRef.current;
          xTo((clientX - (left + width / 2)) * magneticFactor);
          yTo((clientY - (top + height / 2)) * magneticFactor);
          rafId = null;
        });
      };

      const handlePointerOut = () => { xTo(0); yTo(0); };

      el.addEventListener('pointerenter', handlePointerEnter);
      el.addEventListener('pointerleave', handlePointerLeave);
      el.addEventListener('pointermove', handlePointerMove);
      el.addEventListener('pointerout', handlePointerOut);

      cleanupFunctions.push(() => {
        el.removeEventListener('pointerenter', handlePointerEnter);
        el.removeEventListener('pointerleave', handlePointerLeave);
        el.removeEventListener('pointermove', handlePointerMove);
        el.removeEventListener('pointerout', handlePointerOut);
      });
    });

    return () => {
      gsap.ticker.remove(update);
      window.removeEventListener('pointermove', onMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      window.removeEventListener('click', handleClick);
      cleanupFunctions.forEach((cleanup) => cleanup());
    };
  }, [disableOnTouch, isTouchDevice, hoverPadding, hoverAttribute, cursorColor, shape]);

  if (disableOnTouch && isTouchDevice) return <>{children}</>;

  const styles: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 9999,
    pointerEvents: 'none',
    willChange: 'transform, width, height, border-radius',
    backgroundColor: cursorColor,
    mixBlendMode: blendMode as any,
    width: cursorSize,
    height: cursorSize,
    borderRadius: shape === 'circle' ? '50%' : shape === 'square' ? '0' : '8px',
    // KEY FIX: Contrast Boost using backdrop-filter
    backdropFilter: contrastBoost !== 1 ? `contrast(${contrastBoost})` : 'none',
    WebkitBackdropFilter: contrastBoost !== 1 ? `contrast(${contrastBoost})` : 'none',
  };

  return (
    <>
      <div ref={cursorRef} className={`magnetic-cursor ${cursorClassName}`} style={styles} />
      {children}
    </>
  );
};

