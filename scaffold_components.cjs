const fs = require('fs');
const path = require('path');

const uiDir = path.join(__dirname, 'src', 'components', 'ui');
const queueDir = path.join(__dirname, 'src', 'components', 'queue');

fs.mkdirSync(uiDir, { recursive: true });
fs.mkdirSync(queueDir, { recursive: true });

const uiComponents = [
  'Button', 'Input', 'Select', 'SearchableSelect', 'Badge', 'Card', 
  'Modal', 'Table', 'Toast', 'StatCard', 'Sidebar', 'Navbar', 
  'BottomTabBar', 'EmptyState', 'ProgressBar'
];

const queueComponents = [
  'TokenCard', 'QueueTable', 'QueueStatusBadge', 'PriorityBadge', 
  'DoctorStatusBadge', 'CurrentPatientCard', 'DoctorQueueCard', 
  'ReceptionDoctorCard', 'NotificationItem', 'QueueStatsCard'
];

const generateTemplate = (name) => `
import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const ${name} = ({ className, children, ...props }) => {
  return (
    <div className={cn("", className)} {...props}>
      {children || '${name}'}
    </div>
  );
};
`;

uiComponents.forEach(comp => {
  fs.writeFileSync(path.join(uiDir, `${comp}.jsx`), generateTemplate(comp));
});

queueComponents.forEach(comp => {
  fs.writeFileSync(path.join(queueDir, `${comp}.jsx`), generateTemplate(comp));
});

console.log("Components scaffolded.");
