import React, { useState, useMemo } from 'react';
import { Button } from '../../../atoms/Button';
import { Icon } from '../../../atoms/Icon';
import { Badge } from '../../../atoms/Badge';
import { Text, Title } from '../../../atoms/Typography';
import { SearchBox } from '../../../molecules/SearchBox';
import { Dropdown } from '../../../molecules/Dropdown';
import { Card, CardHeader, CardContent, CardAction } from '../../../molecules/Card';
import { cn } from '../../../utils/cn';

export interface DataTableColumn<T = any> {
  /**
   * Column identifier
   */
  key: string;
  /**
   * Column header label
   */
  label: string;
  /**
   * Whether the column is sortable
   */
  sortable?: boolean;
  /**
   * Column width
   */
  width?: string | number;
  /**
   * Column alignment
   */
  align?: 'left' | 'center' | 'right';
  /**
   * Custom cell renderer
   */
  render?: (value: any, row: T, index: number) => React.ReactNode;
  /**
   * Custom header renderer
   */
  renderHeader?: () => React.ReactNode;
  /**
   * Whether the column is hidden
   */
  hidden?: boolean;
  /**
   * Column type for formatting
   */
  type?: 'text' | 'number' | 'date' | 'currency' | 'percentage' | 'badge' | 'actions';
  /**
   * Format options for specific types
   */
  formatOptions?: {
    currency?: string;
    locale?: string;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  };
}

export interface DataTableProps<T = any> {
  /**
   * Table data
   */
  data: T[];
  /**
   * Column definitions
   */
  columns: DataTableColumn<T>[];
  /**
   * Loading state
   */
  loading?: boolean;
  /**
   * Empty state message
   */
  emptyMessage?: string;
  /**
   * Whether to show search
   */
  showSearch?: boolean;
  /**
   * Search placeholder
   */
  searchPlaceholder?: string;
  /**
   * Whether to show pagination
   */
  showPagination?: boolean;
  /**
   * Items per page
   */
  pageSize?: number;
  /**
   * Page size options
   */
  pageSizeOptions?: number[];
  /**
   * Whether to show column visibility toggle
   */
  showColumnToggle?: boolean;
  /**
   * Whether to show export options
   */
  showExport?: boolean;
  /**
   * Export formats
   */
  exportFormats?: ('csv' | 'json' | 'pdf')[];
  /**
   * Row selection
   */
  selection?: {
    enabled: boolean;
    selectedRows?: string[];
    onSelectionChange?: (selectedRows: string[]) => void;
    rowKey?: string;
  };
  /**
   * Row actions
   */
  rowActions?: Array<{
    label: string;
    icon?: React.ReactNode;
    onClick: (row: T) => void;
    variant?: 'default' | 'destructive';
    disabled?: (row: T) => boolean;
  }>;
  /**
   * Bulk actions
   */
  bulkActions?: Array<{
    label: string;
    icon?: React.ReactNode;
    onClick: (selectedRows: T[]) => void;
    variant?: 'default' | 'destructive';
  }>;
  /**
   * Custom row className
   */
  rowClassName?: (row: T, index: number) => string;
  /**
   * Click handler for rows
   */
  onRowClick?: (row: T, index: number) => void;
  /**
   * Sort configuration
   */
  sorting?: {
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    onSortChange?: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  };
  /**
   * Additional CSS classes
   */
  className?: string;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  emptyMessage = 'No data available',
  showSearch = true,
  searchPlaceholder = 'Search...',
  showPagination = true,
  pageSize = 10,
  pageSizeOptions = [5, 10, 25, 50, 100],
  showColumnToggle = true,
  showExport = true,
  exportFormats = ['csv', 'json'],
  selection,
  rowActions,
  bulkActions,
  rowClassName,
  onRowClick,
  sorting,
  className,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(pageSize);
  const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState(sorting?.sortBy || '');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(sorting?.sortOrder || 'asc');

  // Filter visible columns
  const visibleColumns = useMemo(() => {
    return columns.filter(col => !col.hidden && !hiddenColumns.includes(col.key));
  }, [columns, hiddenColumns]);

  // Filter and sort data
  const processedData = useMemo(() => {
    let filtered = data;

    // Apply search filter
    if (searchQuery) {
      filtered = data.filter(row =>
        Object.values(row).some(value =>
          String(value).toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // Apply sorting
    if (sortBy) {
      filtered = [...filtered].sort((a, b) => {
        const aValue = a[sortBy];
        const bValue = b[sortBy];
        
        if (aValue === bValue) return 0;
        
        const comparison = aValue < bValue ? -1 : 1;
        return sortOrder === 'asc' ? comparison : -comparison;
      });
    }

    return filtered;
  }, [data, searchQuery, sortBy, sortOrder]);

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!showPagination) return processedData;
    
    const startIndex = (currentPage - 1) * currentPageSize;
    return processedData.slice(startIndex, startIndex + currentPageSize);
  }, [processedData, currentPage, currentPageSize, showPagination]);

  // Calculate pagination info
  const totalPages = Math.ceil(processedData.length / currentPageSize);
  const startItem = (currentPage - 1) * currentPageSize + 1;
  const endItem = Math.min(currentPage * currentPageSize, processedData.length);

  // Handle sorting
  const handleSort = (columnKey: string) => {
    const column = columns.find(col => col.key === columnKey);
    if (!column?.sortable) return;

    let newSortOrder: 'asc' | 'desc' = 'asc';
    if (sortBy === columnKey && sortOrder === 'asc') {
      newSortOrder = 'desc';
    }

    setSortBy(columnKey);
    setSortOrder(newSortOrder);
    sorting?.onSortChange?.(columnKey, newSortOrder);
  };

  // Format cell value based on column type
  const formatCellValue = (value: any, column: DataTableColumn<T>) => {
    if (column.render) {
      return column.render(value, paginatedData[0], 0);
    }

    switch (column.type) {
      case 'number':
        return typeof value === 'number' ? value.toLocaleString() : value;
      case 'currency':
        return new Intl.NumberFormat(column.formatOptions?.locale || 'en-US', {
          style: 'currency',
          currency: column.formatOptions?.currency || 'USD',
          minimumFractionDigits: column.formatOptions?.minimumFractionDigits,
          maximumFractionDigits: column.formatOptions?.maximumFractionDigits,
        }).format(value);
      case 'percentage':
        return `${(value * 100).toFixed(1)}%`;
      case 'date':
        return value instanceof Date ? value.toLocaleDateString() : new Date(value).toLocaleDateString();
      case 'badge':
        return <Badge variant="secondary">{value}</Badge>;
      default:
        return value;
    }
  };

  // Export functionality
  const handleExport = (format: 'csv' | 'json' | 'pdf') => {
    const exportData = processedData.map(row => {
      const exportRow: any = {};
      visibleColumns.forEach(col => {
        exportRow[col.label] = row[col.key];
      });
      return exportRow;
    });

    switch (format) {
      case 'csv':
        const csvContent = [
          visibleColumns.map(col => col.label).join(','),
          ...exportData.map(row => Object.values(row).join(','))
        ].join('\n');
        
        const csvBlob = new Blob([csvContent], { type: 'text/csv' });
        const csvUrl = URL.createObjectURL(csvBlob);
        const csvLink = document.createElement('a');
        csvLink.href = csvUrl;
        csvLink.download = 'data.csv';
        csvLink.click();
        break;
        
      case 'json':
        const jsonContent = JSON.stringify(exportData, null, 2);
        const jsonBlob = new Blob([jsonContent], { type: 'application/json' });
        const jsonUrl = URL.createObjectURL(jsonBlob);
        const jsonLink = document.createElement('a');
        jsonLink.href = jsonUrl;
        jsonLink.download = 'data.json';
        jsonLink.click();
        break;
        
      case 'pdf':
        // PDF export would require a library like jsPDF
        console.log('PDF export not implemented');
        break;
    }
  };

  // Loading state
  if (loading) {
    return (
      <Card className={cn('animate-pulse', className)}>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      {/* Header */}
      <CardHeader>
        <div className="flex items-center justify-between space-x-4">
          <div className="flex items-center space-x-4">
            {showSearch && (
              <SearchBox
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder={searchPlaceholder}
                size="sm"
              />
            )}
          </div>
          
          <CardAction>
            <div className="flex items-center space-x-2">
              {showColumnToggle && (
                <Button variant="outline" size="sm">
                  <Icon name="view-columns" size="sm" />
                  Columns
                </Button>
              )}
              
              {showExport && (
                <Button variant="outline" size="sm">
                  <Icon name="arrow-down-tray" size="sm" />
                  Export
                </Button>
              )}
            </div>
          </CardAction>
        </div>
      </CardHeader>

      {/* Table */}
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                {selection?.enabled && (
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      className="rounded border-border"
                      onChange={(e) => {
                        const allKeys = paginatedData.map(row => row[selection.rowKey || 'id']);
                        selection.onSelectionChange?.(e.target.checked ? allKeys : []);
                      }}
                    />
                  </th>
                )}
                
                {visibleColumns.map((column) => (
                  <th
                    key={column.key}
                    className={cn(
                      'px-6 py-3 text-left',
                      column.sortable && 'cursor-pointer hover:bg-muted/70',
                      column.align === 'center' && 'text-center',
                      column.align === 'right' && 'text-right'
                    )}
                    style={{ width: column.width }}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center space-x-1">
                      <Text variant="subTitle2" color="secondary">
                        {column.renderHeader ? column.renderHeader() : column.label}
                      </Text>
                      {column.sortable && (
                        <Icon
                          name={
                            sortBy === column.key
                              ? sortOrder === 'asc'
                                ? 'chevron-up'
                                : 'chevron-down'
                              : 'chevron-up'
                          }
                          size="xs"
                          className={cn(
                            'transition-opacity',
                            sortBy === column.key ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'
                          )}
                        />
                      )}
                    </div>
                  </th>
                ))}
                
                {rowActions && rowActions.length > 0 && (
                  <th className="px-6 py-3 text-right">
                    <Text variant="subTitle2" color="secondary">Actions</Text>
                  </th>
                )}
              </tr>
            </thead>
            
            <tbody className="divide-y divide-border">
              {paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={visibleColumns.length + (selection?.enabled ? 1 : 0) + (rowActions ? 1 : 0)}
                    className="px-6 py-12 text-center"
                  >
                    <Text variant="body2" color="secondary">{emptyMessage}</Text>
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, index) => (
                  <tr
                    key={index}
                    className={cn(
                      'hover:bg-muted/30 transition-colors',
                      onRowClick && 'cursor-pointer',
                      rowClassName?.(row, index)
                    )}
                    onClick={() => onRowClick?.(row, index)}
                  >
                    {selection?.enabled && (
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          className="rounded border-border"
                          checked={selection.selectedRows?.includes(row[selection.rowKey || 'id']) || false}
                          onChange={(e) => {
                            const rowKey = row[selection.rowKey || 'id'];
                            const currentSelection = selection.selectedRows || [];
                            const newSelection = e.target.checked
                              ? [...currentSelection, rowKey]
                              : currentSelection.filter(key => key !== rowKey);
                            selection.onSelectionChange?.(newSelection);
                          }}
                        />
                      </td>
                    )}
                    
                    {visibleColumns.map((column) => (
                      <td
                        key={column.key}
                        className={cn(
                          'px-6 py-4 whitespace-nowrap',
                          column.align === 'center' && 'text-center',
                          column.align === 'right' && 'text-right'
                        )}
                      >
                        {column.render
                          ? column.render(row[column.key], row, index)
                          : <Text variant="body2">{formatCellValue(row[column.key], column)}</Text>
                        }
                      </td>
                    ))}
                    
                    {rowActions && rowActions.length > 0 && (
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {rowActions.map((action, actionIndex) => (
                            <Button
                              key={actionIndex}
                              size="sm"
                              variant={action.variant === 'destructive' ? 'destructive' : 'outline'}
                              onClick={(e) => {
                                e.stopPropagation();
                                action.onClick(row);
                              }}
                              disabled={action.disabled?.(row)}
                            >
                              {action.icon}
                              {action.label}
                            </Button>
                          ))}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>

      {/* Footer */}
      {showPagination && processedData.length > 0 && (
        <div className="px-6 py-4 border-t border-border flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Text variant="body2" color="secondary">
              Showing {startItem} to {endItem} of {processedData.length} results
            </Text>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <Icon name="chevron-left" size="xs" />
              Previous
            </Button>
            
            <Text variant="body2" color="secondary">
              Page {currentPage} of {totalPages}
            </Text>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <Icon name="chevron-right" size="xs" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}