import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { StatCard } from "../../components/ui/StatCard";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { waitTimeData, throughputData } from "../../data/analytics";
import { Users, Clock, TrendingUp, Activity } from "lucide-react";

export const ReceptionAnalytics = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Hospital Analytics</h1>
        <p className="text-muted">Overview of wait times and patient throughput</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Avg Wait Time" value="32m" icon={<Clock size={20} className="text-primary" />} />
        <StatCard title="Peak Wait Time" value="80m" icon={<TrendingUp size={20} className="text-status-danger" />} />
        <StatCard title="Daily Avg Patients" value="133" icon={<Users size={20} className="text-status-info" />} />
        <StatCard title="Efficiency Score" value="94%" icon={<Activity size={20} className="text-status-success" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Wait Time Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Wait Time Trends (Today)</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={waitTimeData}
                margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} label={{ value: 'Minutes', angle: -90, position: 'insideLeft', fill: '#64748B' }} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <Legend iconType="circle" />
                <Line type="monotone" dataKey="avgWait" name="Average Wait" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="peakWait" name="Peak Wait" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Patient Throughput */}
        <Card>
          <CardHeader>
            <CardTitle>Patient Throughput (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={throughputData}
                margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} />
                <RechartsTooltip 
                  cursor={{ fill: '#F1F5F9' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <Bar dataKey="patients" name="Patients Served" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
