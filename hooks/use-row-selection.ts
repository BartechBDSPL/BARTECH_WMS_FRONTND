import { useState } from 'react';

export function useRowSelection<T>(data: T[]) {
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());

  const handleRowSelection = (index: number) => {
    setSelectedRows(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(index)) {
        newSelection.delete(index);
      } else {
        newSelection.add(index);
      }
      return newSelection;
    });
  };

  const handleSelectAll = () => {
    setSelectedRows(prev => {
      return prev.size === data.length ? new Set() : new Set(data.map((_, i) => i));
    });
  };

  return {
    selectedRows,
    handleRowSelection,
    handleSelectAll,
  };
}
