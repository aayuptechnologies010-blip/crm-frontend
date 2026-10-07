import { ChevronUp, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export default function DataTable({ columns, data, selectable = false, onSelectionChange, disabledRows = [] }) {
  const [selected, setSelected] = useState([]);
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const sorted = sortKey
    ? [...data].sort((a, b) => {
        const v = String(a[sortKey]).localeCompare(String(b[sortKey]));
        return sortDir === 'asc' ? v : -v;
      })
    : data;

  const totalPages = Math.ceil(data.length / pageSize);
  const maxPage = Math.max(1, totalPages);
  const activePage = currentPage > maxPage ? maxPage : currentPage;

  const paginatedData = sorted.slice((activePage - 1) * pageSize, activePage * pageSize);

  const selectableData = paginatedData.filter(r => !disabledRows.includes(r.id));

  const toggleRow = (id) => {
    if (disabledRows.includes(id)) return;
    const next = selected.includes(id) ? selected.filter(s => s !== id) : [...selected, id];
    setSelected(next);
    onSelectionChange?.(next);
  };

  const toggleAll = () => {
    const next = selected.length === selectableData.length ? [] : selectableData.map(r => r.id);
    setSelected(next);
    onSelectionChange?.(next);
  };

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-white">
              {selectable && (
                <th className="sm:sticky sm:left-0 bg-white sm:z-20 px-4 py-3 text-left">
                  <input type="checkbox" checked={selectableData.length > 0 && selected.length === selectableData.length}
                    onChange={toggleAll} className="rounded border-gray-300 text-blue-500 focus:ring-blue-200" />
                </th>
              )}
              {columns.map((col, idx) => {
                const isFirstCol = idx === 0;
                const stickyClass = isFirstCol
                  ? `${selectable ? 'sm:sticky sm:left-[48px]' : 'sm:sticky sm:left-0'} bg-white sm:z-20 sm:border-r sm:border-gray-200`
                  : '';
                return (
                  <th key={col.key} className={`${stickyClass} px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap`}>
                    {col.sortable ? (
                      <button onClick={() => toggleSort(col.key)} className="flex items-center gap-1 hover:text-gray-700 transition-colors">
                        {col.label}
                        <span className="flex flex-col">
                          <ChevronUp size={10} className={sortKey === col.key && sortDir === 'asc' ? 'text-blue-500' : 'text-gray-300'} />
                          <ChevronDown size={10} className={sortKey === col.key && sortDir === 'desc' ? 'text-blue-500' : 'text-gray-300'} />
                        </span>
                      </button>
                    ) : col.label}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {paginatedData.map(row => (
              <tr key={row.id} className="group hover:bg-gray-50 transition-colors">
                {selectable && (
                  <td className="sm:sticky sm:left-0 bg-white group-hover:bg-gray-50 transition-colors sm:z-10 px-4 py-3">
                    <input type="checkbox" checked={selected.includes(row.id)} onChange={() => toggleRow(row.id)}
                      disabled={disabledRows.includes(row.id)}
                      className="rounded border-gray-300 text-blue-500 focus:ring-blue-200 disabled:opacity-30 disabled:cursor-not-allowed" />
                  </td>
                )}
                {columns.map((col, idx) => {
                  const isFirstCol = idx === 0;
                  const stickyClass = isFirstCol
                    ? `${selectable ? 'sm:sticky sm:left-[48px]' : 'sm:sticky sm:left-0'} bg-white group-hover:bg-gray-50 transition-colors sm:z-10 sm:border-r sm:border-gray-200`
                    : '';
                  return (
                    <td key={col.key} className={`${stickyClass} px-4 py-3 text-gray-700 whitespace-nowrap`}>
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        {data.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">No records found</div>
        )}
      </div>

      {data.length > 0 && (
        <div className="px-5 py-3.5 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500 font-medium bg-white rounded-b-2xl">
          <div className="flex items-center gap-2">
            <span>Show</span>
            <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
              className="border border-gray-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100">
              {[5, 10, 25, 50, 100].map(size => <option key={size} value={size}>{size}</option>)}
            </select>
            <span>entries</span>
          </div>

          <div>
            Showing {Math.min((activePage - 1) * pageSize + 1, data.length)} to{' '}
            {Math.min(activePage * pageSize, data.length)} of {data.length} entries
          </div>

          <div className="flex items-center gap-1">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={activePage === 1}
              className="px-2.5 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
              Previous
            </button>
            {(() => {
              const pages = [];
              if (totalPages <= 7) {
                for (let i = 1; i <= totalPages; i++) pages.push(i);
              } else {
                pages.push(1);
                const start = Math.max(2, activePage - 1);
                const end = Math.min(totalPages - 1, activePage + 1);
                if (start > 2) pages.push('...');
                for (let i = start; i <= end; i++) pages.push(i);
                if (end < totalPages - 1) pages.push('...');
                pages.push(totalPages);
              }
              return pages.map((p, idx) =>
                typeof p === 'string'
                  ? <span key={idx} className="px-1.5 text-gray-400">{p}</span>
                  : <button key={p} onClick={() => setCurrentPage(p)}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-semibold transition-all ${
                        activePage === p ? 'bg-blue-600 text-white shadow-sm' : 'border border-gray-200 hover:bg-gray-50'
                      }`}>{p}</button>
              );
            })()}
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={activePage === totalPages}
              className="px-2.5 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
