import React from 'react';
import { Card, CardContent } from '../ui/Card';
import { DoctorStatusBadge } from './DoctorStatusBadge';

export const DoctorQueueCard = ({ doctor, queueCount, className }) => {
  if (!doctor) return null;
  return (
    <Card className={`shadow-sm ${className || ''}`}>
      <CardContent className="p-4 flex flex-col justify-between h-full">
        <div>
          <div className="flex justify-between items-start mb-2">
            <div className="font-bold text-navy text-lg">{doctor.name}</div>
            <DoctorStatusBadge doctor={doctor} />
          </div>
          <div className="text-sm text-slate-500">{doctor.department}</div>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-end">
          <div className="text-sm text-slate-500 font-medium">Patients Waiting</div>
          <div className="text-2xl font-bold text-blue-600">{queueCount || 0}</div>
        </div>
      </CardContent>
    </Card>
  );
};
