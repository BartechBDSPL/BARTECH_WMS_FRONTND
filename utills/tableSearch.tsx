import React, { useState, useCallback } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TableSearchProps {
  onSearch: (term: string) => void;
  onItemsPerPageChange?: (value: string) => void;
  totalItems?: number;
  startIndex?: number;
  endIndex?: number;
}

function TableSearch({ 
  onSearch, 
  onItemsPerPageChange, 
  totalItems, 
  startIndex, 
  endIndex 
}: TableSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newTerm = event.target.value;
    setSearchTerm(newTerm);
    onSearch(newTerm);
  }, [onSearch]);

  return (
    <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
      <div className="flex items-center space-x-2">
        <Label htmlFor="search">Search:</Label>
        <Input
          id="search"
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={handleSearch}
          className="w-[250px]"
        />
      </div>
      
      <div className="flex items-center space-x-4">
        {totalItems !== undefined && startIndex !== undefined && endIndex !== undefined && (
          <div className="text-sm text-muted-foreground">
            Showing {startIndex} to {endIndex} of {totalItems} entries
          </div>
        )}
        
        {onItemsPerPageChange && (
          <div className="flex items-center space-x-2">
            <Label htmlFor="itemsPerPage">Show:</Label>
            <Select onValueChange={onItemsPerPageChange} defaultValue="10">
              <SelectTrigger id="itemsPerPage" className="w-[80px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">entries</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default TableSearch;