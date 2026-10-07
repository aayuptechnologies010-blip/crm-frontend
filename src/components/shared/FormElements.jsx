import { useState } from 'react';

export function Input({ label, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <input
        className={`border border-gray-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 rounded-xl px-3 py-2.5 text-sm outline-none transition-all ${error ? 'border-red-400' : ''} ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}

export function Select({ label, error, children, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <select
        className={`border border-gray-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 rounded-xl px-3 py-2.5 text-sm outline-none transition-all bg-white ${error ? 'border-red-400' : ''} ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}

export function Textarea({ label, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <textarea
        className={`border border-gray-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 rounded-xl px-3 py-2.5 text-sm outline-none transition-all resize-none ${error ? 'border-red-400' : ''} ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}

// Primary — blue solid
export function PrimaryButton({ children, className = '', loading = false, onClick, disabled, ...props }) {
  const [internalLoading, setInternalLoading] = useState(false);
  const isLoading = loading || internalLoading;

  const handleClick = async (e) => {
    if (isLoading || disabled) return;
    if (onClick) {
      const res = onClick(e);
      if (res && typeof res.then === 'function') {
        try {
          setInternalLoading(true);
          await res;
        } finally {
          setInternalLoading(false);
        }
      }
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm hover:shadow-md transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      )}
      {children}
    </button>
  );
}

// Secondary — gray outlined
export function SecondaryButton({ children, className = '', loading = false, onClick, disabled, ...props }) {
  const [internalLoading, setInternalLoading] = useState(false);
  const isLoading = loading || internalLoading;

  const handleClick = async (e) => {
    if (isLoading || disabled) return;
    if (onClick) {
      const res = onClick(e);
      if (res && typeof res.then === 'function') {
        try {
          setInternalLoading(true);
          await res;
        } finally {
          setInternalLoading(false);
        }
      }
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center justify-center gap-1.5 bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-700 border border-gray-300 hover:border-gray-400 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      )}
      {children}
    </button>
  );
}

// Danger — red for destructive actions
export function DangerButton({ children, className = '', loading = false, onClick, disabled, ...props }) {
  const [internalLoading, setInternalLoading] = useState(false);
  const isLoading = loading || internalLoading;

  const handleClick = async (e) => {
    if (isLoading || disabled) return;
    if (onClick) {
      const res = onClick(e);
      if (res && typeof res.then === 'function') {
        try {
          setInternalLoading(true);
          await res;
        } finally {
          setInternalLoading(false);
        }
      }
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center justify-center gap-1.5 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm hover:shadow-md transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      )}
      {children}
    </button>
  );
}

// Ghost — subtle, no border
export function GhostButton({ children, className = '', loading = false, onClick, disabled, ...props }) {
  const [internalLoading, setInternalLoading] = useState(false);
  const isLoading = loading || internalLoading;

  const handleClick = async (e) => {
    if (isLoading || disabled) return;
    if (onClick) {
      const res = onClick(e);
      if (res && typeof res.then === 'function') {
        try {
          setInternalLoading(true);
          await res;
        } finally {
          setInternalLoading(false);
        }
      }
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center justify-center gap-1.5 bg-transparent hover:bg-gray-100 active:bg-gray-200 text-gray-600 hover:text-gray-800 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-150 disabled:opacity-50 ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin w-3.5 h-3.5 text-gray-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      )}
      {children}
    </button>
  );
}

// IconButton — square icon-only button
export function IconButton({ children, className = '', variant = 'ghost', title, loading = false, onClick, disabled, ...props }) {
  const [internalLoading, setInternalLoading] = useState(false);
  const isLoading = loading || internalLoading;

  const variants = {
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-500 hover:text-gray-700',
    blue: 'bg-blue-50 hover:bg-blue-100 text-blue-500 hover:text-blue-700',
    red: 'bg-transparent hover:bg-red-50 text-gray-400 hover:text-red-500',
    green: 'bg-transparent hover:bg-green-50 text-gray-400 hover:text-green-600',
  };

  const handleClick = async (e) => {
    if (isLoading || disabled) return;
    if (onClick) {
      const res = onClick(e);
      if (res && typeof res.then === 'function') {
        try {
          setInternalLoading(true);
          await res;
        } finally {
          setInternalLoading(false);
        }
      }
    }
  };

  return (
    <Tooltip text={title}>
      <button
        onClick={handleClick}
        className={`inline-flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-150 disabled:opacity-50 ${variants[variant]} ${className}`}
        disabled={isLoading || disabled}
        {...props}
      >
        {isLoading ? (
          <svg className="animate-spin w-4 h-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
        ) : children}
      </button>
    </Tooltip>
  );
}

// Tooltip wrapper
export function Tooltip({ text, children }) {
  const [show, setShow] = useState(false);
  if (!text) return children;
  return (
    <div className="relative inline-flex" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 bg-gray-800 text-white text-xs rounded-lg whitespace-nowrap z-50 pointer-events-none shadow-lg">
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
        </div>
      )}
    </div>
  );
}

// Badge Button — small pill style
export function BadgeButton({ children, className = '', color = 'blue', loading = false, onClick, disabled, ...props }) {
  const [internalLoading, setInternalLoading] = useState(false);
  const isLoading = loading || internalLoading;

  const colors = {
    blue: 'bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200',
    green: 'bg-green-50 hover:bg-green-100 text-green-600 border border-green-200',
    red: 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200',
    gray: 'bg-gray-100 hover:bg-gray-200 text-gray-600 border border-gray-200',
  };

  const handleClick = async (e) => {
    if (isLoading || disabled) return;
    if (onClick) {
      const res = onClick(e);
      if (res && typeof res.then === 'function') {
        try {
          setInternalLoading(true);
          await res;
        } finally {
          setInternalLoading(false);
        }
      }
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-150 ${colors[color]} ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin w-3 h-3 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      )}
      {children}
    </button>
  );
}
