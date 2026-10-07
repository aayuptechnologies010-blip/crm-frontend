import { useState } from 'react';

export function Input({ label, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">{label}</label>}
      <input
        className={`border border-slate-200 focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all bg-white text-slate-800 placeholder:text-slate-400 ${error ? 'border-red-400' : ''} ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}

export function Select({ label, error, children, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">{label}</label>}
      <select
        className={`border border-slate-200 focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all bg-white text-slate-800 ${error ? 'border-red-400' : ''} ${className}`}
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
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">{label}</label>}
      <textarea
        className={`border border-slate-200 focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all resize-none bg-white text-slate-800 ${error ? 'border-red-400' : ''} ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}

// Primary — Crisp Emerald Green solid
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
      className={`inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm hover:shadow-emerald-soft transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
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

// Secondary — Clean White Gray outlined
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
      className={`inline-flex items-center justify-center gap-1.5 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 border border-slate-200 hover:border-slate-300 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      )}
      {children}
    </button>
  );
}

export function GhostButton({ children, className = '', onClick, disabled, ...props }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl px-3 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function IconButton({ children, className = '', onClick, disabled, title, variant = 'gray', ...props }) {
  const variants = {
    gray: 'text-slate-500 hover:text-slate-800 hover:bg-slate-100',
    red: 'text-red-500 hover:text-red-700 hover:bg-red-50',
    green: 'text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-2 rounded-xl transition-colors disabled:opacity-50 ${variants[variant] || variants.gray} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function BadgeButton({ children, color = 'blue', onClick, className = '', ...props }) {
  const colorMap = {
    blue: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200',
    green: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200',
    gray: 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200',
  };

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all ${colorMap[color] || colorMap.blue} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
