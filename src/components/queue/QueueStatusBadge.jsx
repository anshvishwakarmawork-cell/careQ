import React from 'react';
import { Badge } from '../ui/Badge';

export const QueueStatusBadge = ({ status, className }) => {
  if (!status) return null;
  const map = { WAITING: "warning", CALLED: "success", IN_CONSULTATION: "default", SKIPPED: "danger", COMPLETED: "success", CANCELLED: "default" };
  const variant = map[status] || "default";
  
  return (
    <Badge variant={variant} className={className}>
      {status}
    </Badge>
  );
};
