import React from 'react';

interface MasteryBadgeProps {
  percentage: number;
  size?: 'sm' | 'md';
}

export const MasteryBadge: React.FC<MasteryBadgeProps> = ({ percentage, size = 'sm' }) => {
  let badgeClass = 'badge-rose';
  let label = 'Not Started';

  if (percentage >= 80) {
    badgeClass = 'badge-emerald';
    label = 'Mastered';
  } else if (percentage >= 40) {
    badgeClass = 'badge-cyan';
    label = 'In Progress';
  } else if (percentage > 0) {
    badgeClass = 'badge-amber';
    label = 'Exploring';
  }

  const paddingStyle = size === 'md' ? '4px 10px' : '2px 8px';
  const fontSizeStyle = size === 'md' ? '12px' : '10.5px';

  return (
    <span
      className={`badge ${badgeClass}`}
      style={{ padding: paddingStyle, fontSize: fontSizeStyle }}
    >
      {percentage > 0 ? `${percentage}% • ${label}` : label}
    </span>
  );
};
