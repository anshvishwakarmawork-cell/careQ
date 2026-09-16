import React from 'react';
import { Badge } from '../ui/Badge';

export const DoctorStatusBadge = ({ doctor, className }) => {
  if (!doctor) return null;

  switch (doctor.status) {
    case 'AVAILABLE':
      return <Badge variant="success" className={className}>Available</Badge>;
    case 'DELAYED':
      return <Badge variant="warning" className={className}>Delayed {doctor.delayMinutes ? `${doctor.delayMinutes} min` : ''}</Badge>;
    case 'ON_BREAK':
      return <Badge variant="default" className={className}>On break</Badge>;
    case 'UNAVAILABLE':
      return <Badge variant="danger" className={className}>Unavailable</Badge>;
    default:
      return <Badge className={className}>{doctor.status}</Badge>;
  }
};
