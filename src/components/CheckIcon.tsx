import React from 'react';

interface CheckIconProps {
  selected: boolean;
}

const CheckIcon: React.FC<CheckIconProps> = ({ selected }) => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect 
      x="0.75" 
      y="0.75" 
      width="30.5" 
      height="30.5" 
      rx="15.25" 
      fill="white" 
      stroke={selected ? "#FF8B14" : "#CBCBD1"}
      strokeWidth="1.5"
    />
    <path 
      d="M9.6001 16.0002L14.4001 20.8002L22.4001 11.2002" 
      stroke={selected ? "#FF8B14" : "#CBCBD1"} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

export default CheckIcon;
