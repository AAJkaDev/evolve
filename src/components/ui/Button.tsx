import React from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  isLoading = false,
  className,
  disabled,
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-[#4285F4] text-black hover:bg-[#34C9A3] hover:text-black focus:ring-[#4285F4]",
    secondary: "bg-[#34C9A3] text-black hover:bg-white hover:text-[#34C9A3] focus:ring-[#34C9A3]",
    danger: "bg-[#E5533C] text-black hover:bg-[#FFB623] hover:text-black focus:ring-[#E5533C]",
    outline: "border-2 border-[#4285F4] text-[#4285F4] hover:bg-[#4285F4] hover:text-white focus:ring-[#4285F4]",
    ghost: "text-[#363636] hover:bg-gray-100 focus:ring-gray-300"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm rounded-md",
    md: "px-4 py-2 text-base rounded-lg",
    lg: "px-6 py-3 text-lg rounded-lg"
  };

  const classes = clsx(
    baseStyles,
    variants[variant],
    sizes[size],
    "sketch-btn",
    className
  );

  return (
    <button
      className={classes}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-dashed border-current mr-2"></div>
      )}
      {children}
    </button>
  );
};

export default Button;
