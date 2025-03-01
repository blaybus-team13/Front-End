import React from 'react';

interface CheckIconProps {
  selected: boolean;
}

const GreenCheckIcon: React.FC<CheckIconProps> = ({ selected }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect 
      x="0.5" 
      y="0.5" 
      width="23" 
      height="23" 
      rx="3.5" 
      fill="white" 
      stroke={selected ? "#22C55E" : "#CBCBD1"}
    />
    <path 
      d="M7 11.6L10.6 15.2L16.6 8" 
      stroke={selected ? "#22C55E" : "#CBCBD1"} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

export default GreenCheckIcon;