/**
 * Composant Button réutilisable.
 *
 * Supporte les variantes de couleur, taille, et état de chargement.
 *
 * @module components/ui/button
 */

import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost" | "outline";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  asChild?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "text-white focus:ring-indigo-500 shadow-md hover:shadow-lg transition-all duration-200",
  secondary:
    "bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-400",
  danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm",
  ghost: "bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-400",
  outline:
    "bg-white text-indigo-700 border border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50 focus:ring-indigo-500 shadow-sm hover:shadow-md",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  disabled,
  className = "",
  asChild,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2
        font-medium rounded-lg
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `.trim()}
      style={variant === "primary" ? { background: "var(--gradient-primary)" } : undefined}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
