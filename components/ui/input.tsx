/**
 * Composant Input réutilisable.
 *
 * @module components/ui/input
 */

import { forwardRef, type InputHTMLAttributes } from "react";

/** Classes partagées pour les inputs, textareas, selects du design system. */
export const INPUT_CLASSES =
  "w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none transition-all duration-200";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = "", id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="space-y-1">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            ${INPUT_CLASSES}
            ${error ? "border-red-300 text-red-900" : ""}
            ${className}
          `.trim()}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className="text-sm text-red-600">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
