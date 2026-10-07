const statusStyles = {
  New: 'bg-gray-100 text-gray-700',
  Interested: 'bg-blue-100 text-blue-700',
  Won: 'bg-blue-500 text-white',
  Lost: 'bg-gray-200 text-gray-600',
  Active: 'bg-blue-100 text-blue-700',
  Inactive: 'bg-gray-200 text-gray-500',
  Pending: 'bg-blue-100 text-blue-700',
  Done: 'bg-gray-100 text-gray-600',
  High: 'bg-blue-500 text-white',
  Medium: 'bg-blue-100 text-blue-700',
  Low: 'bg-gray-100 text-gray-600',
};

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status] || 'bg-gray-100 text-gray-700'}`}>
      {status}
    </span>
  );
}
