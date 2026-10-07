export default function Card({ children, className = '', onClick }) {
  return (
    <div 
      onClick={onClick}
      className={`bg-white border border-slate-200/80 rounded-2xl shadow-card transition-all duration-200 ${
        onClick ? 'hover:border-indigo-300 hover:shadow-card-hover cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}
