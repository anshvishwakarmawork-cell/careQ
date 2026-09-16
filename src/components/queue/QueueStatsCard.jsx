import React from 'react';
import { Card, CardContent } from '../ui/Card';

export const QueueStatsCard = ({ title, value, className }) => {
  return (
    <Card className={`shadow-sm ${className || ''}`}>
      <CardContent className="p-4 flex flex-col justify-center text-center">
        <div className="text-sm font-medium text-slate-500 mb-1">{title}</div>
        <div className="text-2xl font-bold text-navy">{value}</div>
      </CardContent>
    </Card>
  );
};
