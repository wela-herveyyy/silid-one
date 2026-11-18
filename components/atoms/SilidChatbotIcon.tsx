"use client";

import { useId } from "react";

export function SilidChatbotIcon({ className = "h-8 w-8" }: { className?: string }) {
  const uid = useId().replace(/:/g, "");
  const capId = `${uid}-cap`;
  const faceId = `${uid}-face`;
  const screenId = `${uid}-screen`;
  const glowId = `${uid}-glow`;

  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <linearGradient id={capId} x1="10" y1="10" x2="110" y2="110" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FF8A00" />
          <stop offset="100%" stopColor="#E54D00" />
        </linearGradient>
        <linearGradient id={faceId} x1="20" y1="35" x2="100" y2="105" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FF9E2C" />
          <stop offset="100%" stopColor="#D93B00" />
        </linearGradient>
        <linearGradient
          id={screenId}
          x1="30"
          y1="50"
          x2="90"
          y2="95"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#1E293B" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>
        <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      <rect x="22" y="42" width="76" height="58" rx="20" fill={`url(#${faceId})`} />
      <rect
        x="28"
        y="48"
        width="64"
        height="46"
        rx="14"
        fill={`url(#${screenId})`}
        stroke="#FFA24D"
        strokeWidth="2"
      />
      <ellipse cx="44" cy="67" rx="6" ry="8" fill="#38BDF8" filter={`url(#${glowId})`} />
      <ellipse cx="76" cy="67" rx="6" ry="8" fill="#38BDF8" filter={`url(#${glowId})`} />
      <circle cx="46" cy="64" r="2.5" fill="#FFFFFF" />
      <circle cx="78" cy="64" r="2.5" fill="#FFFFFF" />
      <path
        d="M50 79C54 83 66 83 70 79"
        stroke="#38BDF8"
        strokeWidth="3.5"
        strokeLinecap="round"
        filter={`url(#${glowId})`}
      />
      <path d="M60 12L108 30L60 48L12 30L60 12Z" fill={`url(#${capId})`} />
      <path
        d="M60 12L108 30L60 48L12 30L60 12Z"
        stroke="#FFE6D5"
        strokeWidth="2"
        strokeLinejoin="round"
        opacity="0.6"
      />
      <path d="M32 37.5V44C32 48 44 51 60 51C76 51 88 48 88 44V37.5" fill="#C23B00" />
      <path d="M92 31.5V52" stroke="#FFD1B3" strokeWidth="3" strokeLinecap="round" />
      <circle cx="92" cy="54" r="3.5" fill="#FFD1B3" />
    </svg>
  );
}
