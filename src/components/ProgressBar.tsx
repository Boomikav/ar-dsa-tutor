import React from 'react';

interface ProgressBarProps {
  progressPercentage: number; // 0 to 100
  color?: 'cyan' | 'purple' | 'emerald';
  height?: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progressPercentage,
  color = 'cyan',
  height = 6
}) => {
  const bounded = Math.max(0, Math.min(100, progressPercentage));

  return (
    <div className="progress-container" style={{ height: `${height}px` }}>
      <div
        className={`progress-fill progress-${color}`}
        style={{ width: `${bounded}%` }}
      />
    </div>
  );
};
