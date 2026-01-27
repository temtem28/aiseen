import React from 'react';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  stepLabel: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, totalSteps, stepLabel }) => {
  const percentage = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full">
      <div className="flex justify-between mb-2">
        <span className="text-sm text-gray-400">{stepLabel}</span>
        <span className="text-sm text-gray-400">{currentStep}/{totalSteps}</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div
          className="bg-gradient-to-r from-[#06B6D4] to-[#10B981] h-2 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
