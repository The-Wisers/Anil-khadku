import type { SVGProps } from 'react';

export const BaseballBatIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M14.5 14.5L19 19" />
    <path d="M12.5 6.5C12.5 6.5 16.5 2.5 21 7C21 7 17 10.5 12.5 6.5z" />
    <path d="M6 18L10 14" />
    <path d="M9 21L5 17" />
  </svg>
);

export const FeatherDusterIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M17 2H7C4.23858 2 2 4.23858 2 7C2 9.76142 4.23858 12 7 12H9" />
    <path d="M15 12H17C19.7614 12 22 9.76142 22 7C22 4.23858 19.7614 2 17 2" />
    <path d="M9 12C9 14.7614 11.2386 17 14 17H15" />
    <path d="M5 12C5 14.7614 2.76142 17 0 17" transform="translate(7 0)" />
    <path d="M12 17V22" />
    <path d="M10 22H14" />
  </svg>
);

export const WaterBalloonIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 2C7.03 2 3 6.03 3 11C3 16.52 7.71 22 12 22C16.29 22 21 16.52 21 11C21 6.03 16.97 2 12 2Z" />
    <path d="M12 2L10 6" />
    <path d="M13 4S12 7 10 7" />
  </svg>
);

// A generic "Stickman" icon for use if needed in UI elements (not the game character itself)
export const StickmanFigureIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
  >
    <circle cx="12" cy="5" r="2" />
    <line x1="12" y1="7" x2="12" y2="14" />
    <line x1="12" y1="14" x2="9" y2="19" />
    <line x1="12" y1="14" x2="15" y2="19" />
    <line x1="12" y1="9" x2="7" y2="11" />
    <line x1="12" y1="9" x2="17" y2="11" />
  </svg>
);
