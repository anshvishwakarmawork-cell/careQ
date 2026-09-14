import React from 'react';
import { twMerge } from 'tailwind-merge';

export const CareQueueWordmark = ({ className, dark = false }) => {
  return (
    <svg 
      viewBox="0 0 500 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={twMerge('w-full h-full', className)}
    >
      <text 
        x="0" 
        y="75" 
        fontFamily="Inter, Montserrat, Avenir, sans-serif" 
        fontSize="68" 
        fontWeight="800" 
        letterSpacing="0.05em"
      >
        <tspan fill={dark ? "#F7F1E3" : "#0a2a35"}>CARE</tspan>
        <tspan fill="#00D9FF" dx="15">QUEUE</tspan>
      </text>
      <text
        x="5"
        y="105"
        fontFamily="Inter, Montserrat, Avenir, sans-serif"
        fontSize="14"
        fontWeight="500"
        letterSpacing="0.3em"
        fill={dark ? "#A0AAB2" : "#4A626E"}
      >
        SMART QUEUES <tspan fill="#00D9FF">●</tspan> BETTER CARE
      </text>
    </svg>
  );
};
