import React from 'react';
import { Card, CardContent } from '../ui/Card';

export const CurrentPatientCard = ({ patientName, token, className }) => {
  return (
    <Card className={`border-l-4 border-green-500 shadow-sm ${className || ''}`}>
      <CardContent className="p-4 flex justify-between items-center">
        <div>
          <div className="text-sm text-slate-500 uppercase tracking-wider font-medium mb-1">Currently Consulting</div>
          <div className="font-bold text-xl text-navy">{patientName || 'No active patient'}</div>
        </div>
        {token && <div className="text-3xl font-bold text-blue-600">{token}</div>}
      </CardContent>
    </Card>
  );
};
