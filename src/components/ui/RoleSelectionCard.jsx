import React from "react";
import { Card } from "./Card";

export const RoleSelectionCard = ({ icon: Icon, title, description, buttonText, onClick }) => {
  return (
    <Card className="flex flex-col items-center text-center p-6 space-y-4 hover:shadow-md transition-shadow">
      <div className="w-16 h-16 bg-blue-50 text-primary rounded-full flex items-center justify-center">
        <Icon size={32} />
      </div>
      <h3 className="text-xl font-bold text-navy">{title}</h3>
      <p className="text-sm text-muted">{description}</p>
      <button 
        onClick={onClick}
        className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-opacity-90 transition-colors mt-2"
      >
        {buttonText}
      </button>
    </Card>
  );
};
