import React from 'react';
import { clsx } from 'clsx';
import { CareQueueIcon } from './CareQueueIcon';
import { CareQueueWordmark } from './CareQueueWordmark';

export const CareQueueLogo = ({ 
  variant = 'horizontal', // horizontal, stacked, icon
  dark = false,
  animated = true,
  className 
}) => {
  if (variant === 'icon') {
    return (
      <div className={clsx("relative inline-flex items-center justify-center", className)}>
        <CareQueueIcon animated={animated} />
      </div>
    );
  }

  if (variant === 'stacked') {
    return (
      <div className={clsx("flex flex-col items-center justify-center gap-6", className)}>
        <div className="w-48 h-48">
          <CareQueueIcon animated={animated} />
        </div>
        <div className="w-80 h-24">
          <CareQueueWordmark dark={dark} />
        </div>
      </div>
    );
  }

  // horizontal (default)
  return (
    <div className={clsx("flex items-center gap-4", className)}>
      <div className="w-16 h-16 shrink-0">
        <CareQueueIcon animated={animated} />
      </div>
      <div className="w-64 h-20 shrink-0">
        <CareQueueWordmark dark={dark} />
      </div>
    </div>
  );
};
