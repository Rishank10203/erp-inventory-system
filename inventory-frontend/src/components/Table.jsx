import { useState } from "react";

const Table = ({ columns = [], data = [], onEdit, onDelete, onView }) => {
  const [sortConfig, setSortConfig] = useState(null);

  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;
    if (a[key] < b[key]) return direction === "ascending" ? -1 : 1;
    if (a[key] > b[key]) return direction === "ascending" ? 1 : -1;
    return 0;
  });

  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  return (
    <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
            {columns.map((col) => {
              return (
                <th
                  key={col}
                  className="p-4 text-sm font-semibold text-gray-600 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => requestSort(col)}
                >
                  <div className="flex items-center space-x-1">
                    <span className="capitalize">{col.replace(/_/g, " ")}</span>
                    {sortConfig?.key === col && (
                      <span className="text-xs">
                        {sortConfig.direction === "ascending" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
              );
            })}
            <th className="p-4 text-sm font-semibold text-gray-600 text-center">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-50">
          {sortedData.map((row) => (
            <tr key={row.id} className="hover:bg-blue-50/30 transition-colors group">
              {columns.map((col) => (
                <td key={col} className="p-4 text-sm text-gray-700">
                  {row[col]}
                </td>
              ))}
              <td className="p-4 text-sm flex justify-center space-x-3">
                <button
                  onClick={() => onView(row)}
                  className="px-3 py-1 text-blue-600 hover:bg-blue-100 rounded-md transition-colors"
                >
                  View
                </button>
                <button
                  onClick={() => onEdit(row)}
                  className="px-3 py-1 text-green-600 hover:bg-green-100 rounded-md transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(row)}
                  className="px-3 py-1 text-red-600 hover:bg-red-100 rounded-md transition-colors"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan={columns.length + 1} className="p-8 text-center text-gray-400 italic">
                No records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      </div>
    </div>
  );
};

export default Table;