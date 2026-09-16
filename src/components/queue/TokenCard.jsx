import React from 'react';
import { Card, CardContent } from '../ui/Card';

export const TokenCard = ({ token, patientName, waitTime, className }) => {
  return (
    <Card className={`text-center shadow-sm ${className || ''}`}>
      <CardContent className="p-6">
        <div className="text-sm text-slate-500 mb-2 uppercase tracking-wide">Token Number</div>
        <div className="text-5xl font-bold text-blue-600 mb-4">{token || '--'}</div>
        <div className="font-medium text-navy text-lg">{patientName || 'Unknown Patient'}</div>
        {waitTime && <div className="text-sm text-amber-600 mt-2 font-medium">Est Wait: {waitTime}</div>}
      </CardContent>
    </Card>
  );
};
