import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Column<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  render?: (value: any, row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  title?: string;
  searchable?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  exportable?: boolean;
  pagination?: boolean;
  pageSize?: number;
  className?: string;
  onRowClick?: (row: T) => void;
  onSelectionChange?: (selectedRows: T[]) => void;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  title = 'Data Table',
  searchable = true,
  sortable = true,
  filterable = true,
  exportable = true,
  pagination = true,
  pageSize = 10,
  className = '',
  onRowClick,
  onSelectionChange,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [showFilters, setShowFilters] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);

  // Fuzzy search function
  const fuzzySearch = (text: string, search: string): boolean => {
    const searchLower = search.toLowerCase();
    const textLower = text.toLowerCase();
    
    if (searchLower === '') return true;
    
    let searchIndex = 0;
    for (let i = 0; i < textLower.length && searchIndex < searchLower.length; i++) {
      if (textLower[i] === searchLower[searchIndex]) {
        searchIndex++;
      }
    }
    
    return searchIndex === searchLower.length;
  };

  // Filter and sort data
  const processedData = useMemo(() => {
    let filtered = data.filter(row => {
      // Global search
      if (searchTerm) {
        const searchableText = columns
          .filter(col => col.filterable !== false)
          .map(col => String(row[col.key]))
          .join(' ');
        
        if (!fuzzySearch(searchableText, searchTerm)) {
          return false;
        }
      }

      // Column filters
      for (const [columnKey, filterValue] of Object.entries(filters)) {
        if (filterValue && !fuzzySearch(String(row[columnKey]), filterValue)) {
          return false;
        }
      }

      return true;
    });

    // Sort data
    if (sortColumn && sortable) {
      filtered.sort((a, b) => {
        const aVal = a[sortColumn];
        const bVal = b[sortColumn];
        
        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [data, searchTerm, sortColumn, sortDirection, filters, columns, sortable]);

  // Pagination
  const totalPages = Math.ceil(processedData.length / pageSize);
  const paginatedData = pagination 
    ? processedData.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : processedData;

  // Handle sorting
  const handleSort = (column: keyof T) => {
    if (!sortable) return;
    
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Handle row selection
  const handleRowSelect = (rowId: string) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(rowId)) {
      newSelected.delete(rowId);
    } else {
      newSelected.add(rowId);
    }
    setSelectedRows(newSelected);
    
    if (onSelectionChange) {
      const selectedData = data.filter(row => newSelected.has(String(row.id || row.key || row.name)));
      onSelectionChange(selectedData);
    }
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedRows.size === paginatedData.length) {
      setSelectedRows(new Set());
      if (onSelectionChange) onSelectionChange([]);
    } else {
      const allIds = new Set(paginatedData.map(row => String(row.id || row.key || row.name)));
      setSelectedRows(allIds);
      if (onSelectionChange) onSelectionChange(paginatedData);
    }
  };

  // Export to Excel (CSV)
  const exportToExcel = () => {
    const headers = columns.map(col => col.label).join(',');
    const rows = processedData.map(row => 
      columns.map(col => {
        const value = row[col.key];
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
      }).join(',')
    ).join('\n');
    
    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'f') {
          e.preventDefault();
          const searchInput = document.getElementById('table-search') as HTMLInputElement;
          searchInput?.focus();
        } else if (e.key === 'a') {
          e.preventDefault();
          handleSelectAll();
        }
      } else if (e.key === 'Escape') {
        setSearchTerm('');
        setFilters({});
      }
    };

    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, [handleSelectAll]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters, sortColumn, sortDirection]);

  return (
    <motion.div
      ref={tableRef}
      className={`bg-white rounded-xl shadow-lg overflow-hidden ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          <div className="flex items-center space-x-2">
            {exportable && (
              <motion.button
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={exportToExcel}
              >
                📊 Export
              </motion.button>
            )}
            {filterable && (
              <motion.button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowFilters(!showFilters)}
              >
                🔍 Filters
              </motion.button>
            )}
          </div>
        </div>

        {/* Search */}
        {searchable && (
          <div className="relative">
            <input
              id="table-search"
              type="text"
              placeholder="Search... (Ctrl+F)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
          </div>
        )}

        {/* Filters */}
        <AnimatePresence>
          {showFilters && filterable && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              {columns
                .filter(col => col.filterable !== false)
                .map(col => (
                  <div key={String(col.key)}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {col.label}
                    </label>
                    <input
                      type="text"
                      placeholder={`Filter ${col.label}...`}
                      value={filters[String(col.key)] || ''}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        [String(col.key)]: e.target.value
                      }))}
                      className="w-full px-3 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedRows.size === paginatedData.length && paginatedData.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              {columns.map(col => (
                <th
                  key={String(col.key)}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    col.sortable !== false && sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                  }`}
                  style={{ width: col.width }}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{col.label}</span>
                    {col.sortable !== false && sortable && sortColumn === col.key && (
                      <span className="text-blue-600">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <AnimatePresence>
              {paginatedData.map((row, index) => (
                <motion.tr
                  key={String(row.id || row.key || index)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className={`hover:bg-gray-50 ${
                    selectedRows.has(String(row.id || row.key || row.name)) ? 'bg-blue-50' : ''
                  } ${onRowClick ? 'cursor-pointer' : ''}`}
                  onClick={() => onRowClick?.(row)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedRows.has(String(row.id || row.key || row.name))}
                      onChange={() => handleRowSelect(String(row.id || row.key || row.name))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>
                  {columns.map(col => (
                    <td key={String(col.key)} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {col.render ? col.render(row[col.key], row) : String(row[col.key] || '')}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, processedData.length)} of {processedData.length} results
            </div>
            <div className="flex items-center space-x-2">
              <motion.button
                className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Previous
              </motion.button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <motion.button
                    key={page}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </motion.button>
                );
              })}
              
              <motion.button
                className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </motion.button>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {processedData.length === 0 && (
        <div className="p-12 text-center">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No data found</h3>
          <p className="text-gray-500">
            {searchTerm || Object.values(filters).some(f => f) 
              ? 'Try adjusting your search or filters'
              : 'No data available for this table'
            }
          </p>
        </div>
      )}
    </motion.div>
  );
} 