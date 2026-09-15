import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
  color?: string;
}

export const CrystalTiaraIcon: React.FC<IconProps> = ({ className = '', size = 18, color }) => (
  <svg
    className={`crystal-tiara-icon ${className}`}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M2.5 7.5L5 18H19L21.5 7.5L16 12.5L12 4L8 12.5L2.5 7.5Z"
      fill="url(#crystal-tiara-grad)"
      stroke={color || "rgba(192, 132, 252, 0.95)"}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="4" r="1.5" fill="#FFFFFF" />
    <circle cx="2.5" cy="7.5" r="1.25" fill="#38BDF8" />
    <circle cx="21.5" cy="7.5" r="1.25" fill="#38BDF8" />
    <circle cx="8" cy="12.5" r="1" fill="#C084FC" />
    <circle cx="16" cy="12.5" r="1" fill="#C084FC" />
    <circle cx="12" cy="14.5" r="1.25" fill="#FFFFFF" />
    <defs>
      <linearGradient id="crystal-tiara-grad" x1="2.5" y1="4" x2="21.5" y2="18" gradientUnits="userSpaceOnUse">
        <stop stopColor="rgba(56, 189, 248, 0.45)" />
        <stop offset="0.5" stopColor="rgba(192, 132, 252, 0.35)" />
        <stop offset="1" stopColor="rgba(14, 165, 233, 0.25)" />
      </linearGradient>
    </defs>
  </svg>
);

export const SettingsSlidersIcon: React.FC<IconProps> = ({ className = '', size = 16, color }) => (
  <svg
    className={`settings-sliders-icon ${className}`}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color || "currentColor"}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="4" y1="21" x2="4" y2="14" />
    <line x1="4" y1="10" x2="4" y2="3" />
    <line x1="12" y1="21" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12" y2="3" />
    <line x1="20" y1="21" x2="20" y2="16" />
    <line x1="20" y1="12" x2="20" y2="3" />
    <line x1="1" y1="14" x2="7" y2="14" />
    <line x1="9" y1="8" x2="15" y2="8" />
    <line x1="17" y1="16" x2="23" y2="16" />
  </svg>
);

export const DiamondSparkleIcon: React.FC<IconProps> = ({ className = '', size = 14, color }) => (
  <svg
    className={`diamond-sparkle-icon ${className}`}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 2L14.8 9.2L22 12L14.8 14.8L12 22L9.2 14.8L2 12L9.2 9.2L12 2Z"
      fill={color || "url(#diamond-sparkle-grad)"}
    />
    <defs>
      <linearGradient id="diamond-sparkle-grad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
        <stop stopColor="#38BDF8" />
        <stop offset="0.5" stopColor="#FFFFFF" />
        <stop offset="1" stopColor="#C084FC" />
      </linearGradient>
    </defs>
  </svg>
);
