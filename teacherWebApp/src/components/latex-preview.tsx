"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window { MathJax: any }
}

export function LatexPreview({ content, enabled }: { content: string; enabled?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return;

    const ensureMathJax = () => {
      if (typeof window === 'undefined') return Promise.resolve();
      if (window.MathJax) return Promise.resolve();
      return new Promise<void>((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
        script.async = true;
        script.onload = () => resolve();
        document.head.appendChild(script);
      });
    };

    ensureMathJax().then(() => {
      if (window.MathJax && containerRef.current) {
        window.MathJax.typesetPromise?.([containerRef.current]);
      }
    });
  }, [content, enabled]);

  if (!enabled) return null;

  return (
    <div className="prose max-w-none border rounded p-3 bg-muted/30" ref={containerRef}>
      {content}
    </div>
  );
}
