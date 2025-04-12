import React, { useState, useCallback } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TableSearchProps {
  onSearch: (term: string) => void;
}

function TableSearch({ onSearch }: TableSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newTerm = event.target.value;
    setSearchTerm(newTerm);
    onSearch(newTerm);
  }, [onSearch]);

  return (
    <div className="flex items-center space-x-2">
      <Label htmlFor="search">Search:</Label>
      <Input
        id="search"
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={handleSearch}
      />
    </div>
  );
}

export default TableSearch;