"use client";
import { useEffect, useRef } from "react";
export function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (element.getBoundingClientRect().top < window.innerHeight) return;
    element.dataset.reveal = "waiting";
    const observer = new IntersectionObserver(entries => { if (entries[0].isIntersecting) { element.dataset.reveal = "visible"; observer.disconnect(); } }, { threshold: 0.07 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return <div ref={ref} className={`reveal ${className}`}>{children}</div>;
}
