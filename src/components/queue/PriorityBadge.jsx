import React from 'react';
import { Badge } from '../ui/Badge';

export const PriorityBadge = ({ priority, className }) => {
  if (!priority) return null;
  const map = { EMERGENCY: "danger", URGENT: "warning", PRIORITY: "default", NORMAL: "success" };
  const variant = map[priority] || "default";
  
  return (
    <Badge variant={variant} className={className}>
      {priority}
    </Badge>
  );
};
