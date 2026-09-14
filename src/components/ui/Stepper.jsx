import React from "react";

export const Stepper = ({ currentStep, steps }) => {
  return (
    <div className="w-full mb-8">
      <div className="flex justify-between relative">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-10 -translate-y-1/2"></div>
        <div 
          className="absolute top-1/2 left-0 h-1 bg-primary -z-10 -translate-y-1/2 transition-all duration-300"
          style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
        ></div>
        
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center">
            <div 
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                index <= currentStep ? "bg-primary text-white" : "bg-gray-200 text-muted"
              }`}
            >
              {index + 1}
            </div>
            <span className="text-xs text-muted mt-2 hidden sm:block">{step}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
