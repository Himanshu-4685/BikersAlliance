'use client';

import { useState } from 'react';
import { 
  FiSearch, 
  FiChevronLeft, 
  FiChevronRight, 
  FiRefreshCw,
  FiChevronUp,
  FiChevronDown
} from 'react-icons/fi';

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (item: any) => React.ReactNode;
}

interface DataTableProps {
  data: any[];
  columns: Column[];
  loading?: boolean;
  searchTerm?: string;
  onSearchChange?: (search: string) => void;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  onRefresh?: () => void;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (key: string) => void;
}

export default function DataTable({
  data,
  columns,
  loading = false,
  searchTerm = '',
  onSearchChange,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  onRefresh,
  sortBy,
  sortOrder = 'asc',
  onSort
}: DataTableProps) {
  const [localSortBy, setLocalSortBy] = useState<string>('');
  const [localSortOrder, setLocalSortOrder] = useState<'asc' | 'desc'>('asc');

  const handleSort = (key: string) => {
    if (onSort) {
      onSort(key);
    } else {
      // Local sorting
      if (localSortBy === key) {
        setLocalSortOrder(localSortOrder === 'asc' ? 'desc' : 'asc');
      } else {
        setLocalSortBy(key);
        setLocalSortOrder('asc');
      }
    }
  };

  const getSortedData = () => {
    if (!localSortBy && !sortBy) return data;
    
    const currentSortBy = sortBy || localSortBy;
    const currentSortOrder = sortOrder || localSortOrder;
    
    return [...data].sort((a, b) => {
      const aValue = getNestedValue(a, currentSortBy);
      const bValue = getNestedValue(b, currentSortBy);
      
      if (aValue < bValue) return currentSortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return currentSortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const getNestedValue = (obj: any, path: string) => {
    return path.split('.').reduce((value, key) => value?.[key], obj) || '';
  };

  const renderCell = (item: any, column: Column) => {
    if (column.render) {
      return column.render(item);
    }
    
    const value = getNestedValue(item, column.key);
    return value || '-';
  };

  const currentSortBy = sortBy || localSortBy;
  const currentSortOrder = sortOrder || localSortOrder;
  const sortedData = getSortedData();

  return (
    <div className="w-full">
      {/* Header with Search and Actions */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          {/* Search */}
          {onSearchChange && (
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center space-x-2">
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={loading}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md disabled:opacity-50"
                title="Refresh"
              >
                <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                  }`}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.label}</span>
                    {column.sortable && currentSortBy === column.key && (
                      currentSortOrder === 'asc' ? (
                        <FiChevronUp className="h-4 w-4" />
                      ) : (
                        <FiChevronDown className="h-4 w-4" />
                      )
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              // Loading skeleton
              [...Array(5)].map((_, index) => (
                <tr key={index}>
                  {columns.map((column) => (
                    <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                      <div className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded"></div>
                      </div>
                    </td>
                  ))}
                </tr>
              ))
            ) : sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center">
                  <div className="text-gray-500">
                    <p className="text-lg font-medium">No data found</p>
                    <p className="text-sm">Try adjusting your search criteria</p>
                  </div>
                </td>
              </tr>
            ) : (
              sortedData.map((item, index) => (
                <tr key={item.id || index} className="hover:bg-gray-50">
                  {columns.map((column) => (
                    <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {renderCell(item, column)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && onPageChange && (
        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiChevronLeft className="h-4 w-4" />
              </button>
              
              {/* Page numbers */}
              <div className="flex space-x-1">
                {[...Array(Math.min(5, totalPages))].map((_, index) => {
                  const pageNumber = Math.max(1, currentPage - 2) + index;
                  if (pageNumber > totalPages) return null;
                  
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => onPageChange(pageNumber)}
                      className={`px-3 py-1 text-sm rounded-md ${
                        pageNumber === currentPage
                          ? 'bg-indigo-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}