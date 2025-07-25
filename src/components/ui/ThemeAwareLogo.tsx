"use client";

import { useTheme } from '@/contexts/ThemeContext';
import Image from 'next/image';

interface ThemeAwareLogoProps {
  width?: number;
  height?: number;
  className?: string;
  alt?: string;
  priority?: boolean;
}

export const ThemeAwareLogo: React.FC<ThemeAwareLogoProps> = ({
  width = 32,
  height = 32,
  className = "",
  alt = "EVOLVE Logo",
  priority = false
}) => {
  const { theme } = useTheme();
  
  // Use LogoForBlackBG for dark mode (black logo shows well on dark backgrounds)
  // Use LogoForWhiteBG for light mode (white logo shows well on light backgrounds)
  const logoSrc = theme === 'dark' ? '/LogoForBlackBG.png' : '/LogoForWhiteBG.png';
  
  return (
    <Image
      src={logoSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
    />
  );
};

export default ThemeAwareLogo;
