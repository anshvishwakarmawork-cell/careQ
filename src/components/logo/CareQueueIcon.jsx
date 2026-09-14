import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const CareQueueIcon = ({ className, animated = true }) => {
  return (
    <svg
      viewBox="0 0 400 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={twMerge('w-full h-full drop-shadow-xl', className)}
    >
      <defs>
        {/* Heart Gradients for 3D appearance */}
        <linearGradient id="heartBase" x1="50%" y1="10%" x2="50%" y2="90%">
          <stop offset="0%" stopColor="#0a2a35" />
          <stop offset="100%" stopColor="#041217" />
        </linearGradient>
        
        <linearGradient id="heartMid" x1="30%" y1="20%" x2="70%" y2="80%">
          <stop offset="0%" stopColor="#15495e" />
          <stop offset="100%" stopColor="#08222c" />
        </linearGradient>

        <linearGradient id="heartHighlight" x1="20%" y1="20%" x2="50%" y2="60%">
          <stop offset="0%" stopColor="#1a6e8f" />
          <stop offset="100%" stopColor="#0b3848" stopOpacity="0" />
        </linearGradient>

        <linearGradient id="aortaGradient" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#13475d" />
          <stop offset="100%" stopColor="#061c26" />
        </linearGradient>

        <linearGradient id="venaCavaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0f3445" />
          <stop offset="100%" stopColor="#041117" />
        </linearGradient>

        {/* Glow Filters */}
        <filter id="ecgGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <filter id="ecgGlowStrong" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="12" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        
        {/* Orbital Path Glow */}
        <filter id="orbitGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        {/* Animations */}
        <style>
          {`
            @media (prefers-reduced-motion: no-preference) {
              .cq-animate-ecg {
                stroke-dasharray: 600;
                stroke-dashoffset: 600;
                animation: drawEcg 2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
              }
              .cq-animate-orbit {
                stroke-dasharray: 1000;
                stroke-dashoffset: 1000;
                animation: drawOrbit 3s ease-out forwards;
                opacity: 0;
              }
              .cq-animate-node {
                opacity: 0;
                transform: scale(0);
                transform-origin: center;
                animation: popNode 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
              }
              .cq-animate-heart {
                opacity: 0;
                transform: translateY(10px);
                animation: fadeUp 1s ease-out forwards;
              }
              
              @keyframes drawEcg {
                to { stroke-dashoffset: 0; }
              }
              @keyframes drawOrbit {
                10% { opacity: 0; }
                20% { opacity: 0.3; }
                to { stroke-dashoffset: 0; opacity: 0.3; }
              }
              @keyframes popNode {
                to { opacity: 1; transform: scale(1); }
              }
              @keyframes fadeUp {
                to { opacity: 1; transform: translateY(0); }
              }
              
              /* Node delays */
              .node-1 { animation-delay: 1.0s; }
              .node-2 { animation-delay: 1.2s; }
              .node-3 { animation-delay: 1.4s; }
              .node-4 { animation-delay: 1.6s; }
              .node-5 { animation-delay: 1.8s; }
              .node-6 { animation-delay: 2.0s; }
              .node-7 { animation-delay: 2.2s; }
            }
          `}
        </style>
      </defs>

      {/* ANATOMICAL HEART GROUP */}
      <g className={animated ? 'cq-animate-heart' : ''}>
        {/* Background shadow/base */}
        <path
          d="M200 320 C140 280 90 220 90 150 C90 100 130 60 170 60 C185 60 200 70 200 70 C200 70 215 60 230 60 C270 60 310 100 310 150 C310 220 260 280 200 320 Z"
          fill="url(#heartBase)"
        />

        {/* Superior Vena Cava */}
        <path
          d="M130 90 L120 40 Q130 30 150 35 L155 80 Z"
          fill="url(#venaCavaGradient)"
        />
        
        {/* Aorta Arch */}
        <path
          d="M160 85 C160 40 190 20 220 25 C240 30 250 50 245 75 L215 70 C220 55 210 45 195 45 C180 45 175 60 175 80 Z"
          fill="url(#aortaGradient)"
        />
        <path
          d="M210 23 L220 5 L235 10 L220 30 Z"
          fill="url(#aortaGradient)"
        />
        <path
          d="M232 30 L242 12 L255 18 L240 38 Z"
          fill="url(#aortaGradient)"
        />

        {/* Pulmonary Artery */}
        <path
          d="M185 95 C195 60 230 50 260 65 L245 90 C225 80 210 85 205 100 Z"
          fill="url(#heartMid)"
        />
        
        {/* Right Atrium */}
        <path
          d="M110 110 C85 130 85 170 100 200 C120 230 150 250 160 260 C165 240 160 210 150 180 C140 150 130 120 110 110 Z"
          fill="url(#heartMid)"
        />

        {/* Left Atrium & Ventricles - Main Body */}
        <path
          d="M140 110 C180 90 240 90 270 130 C300 170 300 220 270 260 C240 300 200 320 200 320 C200 320 150 280 130 220 C120 180 120 140 140 110 Z"
          fill="url(#heartMid)"
        />

        {/* Anterior Interventricular Sulcus (the groove) */}
        <path
          d="M190 120 Q220 170 200 290"
          stroke="#061c26"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
          opacity="0.7"
        />
        <path
          d="M195 120 Q225 170 205 290"
          stroke="#1a6e8f"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          opacity="0.4"
        />

        {/* Veins / Arteries on surface (Coronary) */}
        <path d="M195 150 Q230 180 240 240" stroke="#041217" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.6"/>
        <path d="M210 170 Q240 190 255 220" stroke="#041217" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.5"/>
        <path d="M150 160 Q170 190 175 240" stroke="#041217" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.5"/>

        {/* Heart Highlights for 3D Volume */}
        <path
          d="M150 120 C180 100 220 100 240 130 C220 120 180 120 155 140 C140 150 135 170 130 190 C125 150 130 130 150 120 Z"
          fill="url(#heartHighlight)"
        />
        <path
          d="M170 150 Q190 160 190 210 Q190 170 170 150 Z"
          fill="#238ebf"
          opacity="0.2"
        />
        <path
          d="M230 150 C260 180 260 220 240 250 C265 210 255 170 230 150 Z"
          fill="url(#heartHighlight)"
        />
        
        {/* Subtle rim light */}
        <path
          d="M140 110 C180 90 240 90 270 130 C300 170 300 220 270 260"
          stroke="#26a2db"
          strokeWidth="2"
          fill="none"
          opacity="0.3"
          strokeLinecap="round"
        />
      </g>

      {/* ORBITAL QUEUE SYSTEM */}
      <g stroke="#00D9FF" fill="none">
        {/* Back Orbit */}
        <path
          d="M340 150 C340 60 270 20 190 20 C100 20 50 80 50 170 C50 250 100 330 180 340 C270 350 350 270 340 150"
          strokeWidth="1.5"
          className={animated ? 'cq-animate-orbit' : ''}
          style={{ opacity: 0.2 }}
          strokeDasharray="10 6"
        />
        
        {/* Front Orbit */}
        <path
          d="M40 200 C40 310 130 380 230 370 C310 360 360 290 350 210 C340 130 280 70 200 60 C120 50 60 110 40 200"
          strokeWidth="1.5"
          className={animated ? 'cq-animate-orbit' : ''}
          style={{ opacity: 0.4 }}
        />
        
        {/* Secondary Front Orbit Arc */}
        <path
          d="M90 300 C150 370 260 360 320 290"
          strokeWidth="1"
          className={animated ? 'cq-animate-orbit' : ''}
          style={{ opacity: 0.6 }}
        />

        {/* Queue Nodes */}
        <g fill="#00D9FF">
          <circle cx="50" cy="170" r="4" className={clsx(animated && 'cq-animate-node node-1')} />
          <circle cx="95" cy="80" r="2.5" className={clsx(animated && 'cq-animate-node node-2')} />
          <circle cx="280" cy="40" r="3.5" className={clsx(animated && 'cq-animate-node node-3')} />
          
          <circle cx="350" cy="210" r="5" className={clsx(animated && 'cq-animate-node node-4')} filter="url(#orbitGlow)" />
          <circle cx="310" cy="310" r="3" className={clsx(animated && 'cq-animate-node node-5')} />
          <circle cx="160" cy="373" r="2.5" className={clsx(animated && 'cq-animate-node node-6')} />
          
          <circle cx="70" cy="260" r="4.5" className={clsx(animated && 'cq-animate-node node-7')} filter="url(#orbitGlow)"/>
          <circle cx="120" cy="340" r="2" className={clsx(animated && 'cq-animate-node node-7')} />
        </g>
      </g>

      {/* ECG WAVEFORM */}
      {/* Path values to simulate a strong heartbeat spike across the heart */}
      <path
        d="M20 210 L100 210 L115 190 L135 240 L160 120 L185 270 L210 180 L225 210 L250 210 L260 195 L275 210 L380 210"
        stroke="#00D9FF"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        filter="url(#ecgGlow)"
        className={animated ? 'cq-animate-ecg' : ''}
      />
      {/* Intense center core for ECG to make it super bright */}
      <path
        d="M20 210 L100 210 L115 190 L135 240 L160 120 L185 270 L210 180 L225 210 L250 210 L260 195 L275 210 L380 210"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        className={animated ? 'cq-animate-ecg' : ''}
      />
      
      {/* Faint extended ECG lines to the edges */}
      <path
        d="M-40 210 L20 210 M380 210 L440 210"
        stroke="#00D9FF"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.3"
      />
    </svg>
  );
};
