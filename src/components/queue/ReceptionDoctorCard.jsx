import React from 'react';
import { Card, CardContent } from '../ui/Card';
import { DoctorStatusBadge } from './DoctorStatusBadge';

export const ReceptionDoctorCard = ({ doctor, className }) => {
  if (!doctor) return null;
  return (
    <Card className={`shadow-sm ${className || ''}`}>
      <CardContent className="p-4 flex flex-col gap-2">
        <div className="flex justify-between items-start">
          <div className="font-bold text-navy truncate">{doctor.name}</div>
          <DoctorStatusBadge doctor={doctor} className="shrink-0 ml-2" />
        </div>
        <div className="text-sm text-slate-500">{doctor.department}</div>
      </CardContent>
    </Card>
  );
};
