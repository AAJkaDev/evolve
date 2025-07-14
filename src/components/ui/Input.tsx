import React from 'react';
import { clsx } from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  fullWidth = false,
  className,
  ...props
}) => {
  const inputClasses = clsx(
    "p-3 border-2 border-dashed border-[var(--evolve-charcoal)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--evolve-primary)] focus:border-[var(--evolve-primary)] transition-all duration-200 bg-[var(--evolve-paper)] text-[var(--evolve-charcoal)] placeholder-[var(--evolve-dark-gray)]",
    {
      "w-full": fullWidth,
      "border-[var(--evolve-warning)] focus:ring-[var(--evolve-warning)] focus:border-[var(--evolve-warning)]": error,
    },
    className
  );

  return (
    <div className={fullWidth ? "w-full" : ""}>
      {label && (
        <label className="block text-sm font-medium text-[var(--evolve-charcoal)] mb-1">
          {label}
        </label>
      )}
      <input
        className={inputClasses}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-[var(--evolve-warning)] font-medium">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
