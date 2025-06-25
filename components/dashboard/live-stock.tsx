"use client"
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BACKEND_URL } from '@/lib/constants';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Filter, Package, MapPin, Archive, Hash, FileSpreadsheet, Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectLabel, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import CustomDropdown from '@/components/CustomDropdown';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface LiveStockItem {
  MATERIAL: string;
  MATERIAL_TEXT: string;
  BATCH: string;
  STORAGE_LOCATION: string;
  Location: string;
  PackUnitPerPallet: number | null;
  PcsPerPackunit: number | null;
  Available_Stock: number;
  Total_Box: number | null;
  Total_Pallet: number | null;
  cleanMaterial?: string;
}

interface DropdownOption {
  value: string;
  label: string;
}

const LiveStock: React.FC = () => {
  const [stockData, setStockData] = useState<LiveStockItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filteredData, setFilteredData] = useState<LiveStockItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOption, setFilterOption] = useState("all");
  const [filterValue, setFilterValue] = useState("");
  const [uniqueOptions, setUniqueOptions] = useState<{
    materials: DropdownOption[];
    batches: string[];
    storageLocations: string[];
  }>({
    materials: [],
    batches: [],
    storageLocations: [],
  });
  useEffect(() => {
    fetchLiveStockData();
  }, []);

  useEffect(() => {
    // Extract unique values for filtering
    if (stockData.length > 0) {
      const materials = Array.from(new Set(stockData.map(item => item.MATERIAL)));
      const batches = Array.from(new Set(stockData.map(item => item.BATCH)));
      const storageLocations = Array.from(new Set(stockData.map(item => item.STORAGE_LOCATION)));
      
      setUniqueOptions({
        materials: materials.map(material => {
          // Get the material without leading zeros
          const cleanMaterial = material.replace(/^0+/, '');
          // Find the corresponding material text
          const materialText = stockData.find(item => item.MATERIAL === material)?.MATERIAL_TEXT || '';
          return { 
            value: material, 
            label: `${cleanMaterial} - ${materialText}`
          };
        }),
        batches,
        storageLocations,
      });
    }
  }, [stockData]);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, filterOption, filterValue, stockData]);
  const fetchLiveStockData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/dashboard/live-stock`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch live stock data');
      }
      
      const data = await response.json();
      // Process data to ensure clean format
      const processedData = data.map((item: LiveStockItem) => ({
        ...item,
        // Store original MATERIAL but use clean version for display
        MATERIAL: item.MATERIAL,
        cleanMaterial: item.MATERIAL.replace(/^0+/, '')
      }));
      
      setStockData(processedData);
      setFilteredData(processedData);
    } catch (error) {
      console.error('Error fetching live stock data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let results = [...stockData];
    
    // Apply search term filter
    if (searchTerm) {
      results = results.filter(item => 
        item.MATERIAL_TEXT.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.MATERIAL.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply specific filters
    if (filterOption !== "all" && filterValue) {
      switch (filterOption) {
        case "material":
          results = results.filter(item => item.MATERIAL === filterValue);
          break;
        case "batch":
          results = results.filter(item => item.BATCH === filterValue);
          break;
        case "storageLocation":
          results = results.filter(item => item.STORAGE_LOCATION === filterValue);
          break;
      }
    }
    
    setFilteredData(results);
  };

  // Group data by storage location
  const groupedByStorageLocation = filteredData.reduce((acc, item) => {
    if (!acc[item.STORAGE_LOCATION]) {
      acc[item.STORAGE_LOCATION] = [];
    }
    acc[item.STORAGE_LOCATION].push(item);
    return acc;
  }, {} as Record<string, LiveStockItem[]>);

  // Calculate stats for each storage location
  const getStorageLocationStats = (items: LiveStockItem[]) => {
    const totalStock = items.reduce((sum, item) => sum + item.Available_Stock, 0);
    const uniqueMaterials = new Set(items.map(item => item.MATERIAL)).size;
    const uniqueBatches = new Set(items.map(item => item.BATCH)).size;
    const uniqueLocations = new Set(items.map(item => item.Location)).size;
    
    return {
      totalStock,
      uniqueMaterials,
      uniqueBatches,
      uniqueLocations,
      itemCount: items.length
    };
  };

  // Calculate overall stats
  const getTotalStats = () => {
    const totalStock = filteredData.reduce((sum, item) => sum + item.Available_Stock, 0);
    const uniqueMaterials = new Set(filteredData.map(item => item.MATERIAL)).size;
    const uniqueBatches = new Set(filteredData.map(item => item.BATCH)).size;
    const uniqueStorageLocations = new Set(filteredData.map(item => item.STORAGE_LOCATION)).size;
    const uniqueLocations = new Set(filteredData.map(item => item.Location)).size;
    
    return {
      totalStock,
      uniqueMaterials,
      uniqueBatches,
      uniqueStorageLocations,
      uniqueLocations,
      itemCount: filteredData.length
    };
  };

  const exportToExcel = () => {
    // Create CSV content
    const headers = [
      'Material', 
      'Description', 
      'Batch Number', 
      'Warehouse Code', 
      'Bin Number', 
      'Available Quantity',
      'Box / Tray per Pallet',
      'Pack size per Box/Tray',
      'Total Box',
      'Total Pallet'
    ];
    const csvContent = [
      headers.join(','),
      ...filteredData.map(item => [
        item.MATERIAL.replace(/^0+/, ''),
        `"${item.MATERIAL_TEXT.replace(/"/g, '""')}"`,
        item.BATCH,
        item.STORAGE_LOCATION,
        item.Location,
        item.Available_Stock,
        item.PackUnitPerPallet ?? 'NA',
        item.PcsPerPackunit ?? 'NA',
        item.Total_Box ?? 'NA',
        item.Total_Pallet ?? 'NA'
      ].join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `live-stock-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper function to format numbers in Indian style
  const formatIndianNumber = (num: number): string => {
    return num.toLocaleString('en-IN');
  };

  // Helper function to get readable format (lakhs/crores)
  const getReadableFormat = (num: number): string => {
    if (num >= 10000000) { // 1 crore
      return `${(num / 10000000).toFixed(2)} Cr`;
    } else if (num >= 100000) { // 1 lakh
      return `${(num / 100000).toFixed(2)} L`;
    } else if (num >= 1000) { // 1 thousand
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  if (isLoading) {
    return (
      <div className="space-y-6 sm:space-y-8 p-4 sm:p-6">
        <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:space-x-4 sm:items-center mb-6">
          <Skeleton className="h-12 w-full sm:w-64" />
          <Skeleton className="h-12 w-full sm:w-48" />
          <Skeleton className="h-12 w-full sm:w-48" />
        </div>
        
        <Skeleton className="h-24 w-full mb-6" />
        
        <div className="grid gap-6 sm:gap-8 grid-cols-1 md:grid-cols-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="space-y-5">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-80 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const totalStats = getTotalStats();
  return (
    <TooltipProvider>
      <div className="space-y-6 max-w-full">
        {/* Search and Filter Section */}
        <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search materials..."
              className="pl-10 h-10 border-slate-200 dark:border-slate-700 focus:border-red-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <Select value={filterOption} onValueChange={(value) => {
              setFilterOption(value);
              setFilterValue("");
            }}>
              <SelectTrigger className="w-full sm:w-44 h-10 border-slate-200 dark:border-slate-700">
                <SelectValue placeholder="Filter by" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Filter Options</SelectLabel>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="material">Material</SelectItem>
                  <SelectItem value="batch">Batch</SelectItem>
                  <SelectItem value="storageLocation">Storage Location</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            
            {filterOption === "material" && (
              <CustomDropdown
                options={uniqueOptions.materials}
                value={filterValue}
                onValueChange={setFilterValue}
                placeholder="Select Material"
                searchPlaceholder="Search materials..."
                emptyText="No materials available"
                disabled={false}
              />
            )}
            
            {filterOption === "batch" && (
              <CustomDropdown
                options={uniqueOptions.batches.map(batch => ({
                  value: batch,
                  label: batch
                }))}
                value={filterValue}
                onValueChange={setFilterValue}
                placeholder="Select Batch"
                searchPlaceholder="Search batches..."
                emptyText="No batches available"
                disabled={false}
              />
            )}
            
            {filterOption === "storageLocation" && (
              <CustomDropdown
                options={uniqueOptions.storageLocations.map(location => ({
                  value: location,
                  label: location
                }))}
                value={filterValue}
                onValueChange={setFilterValue}
                placeholder="Select Storage Location"
                searchPlaceholder="Search storage locations..."
                emptyText="No storage locations available"
                disabled={false}
              />
            )}
          </div>
        </div>

        {/* Summary Card */}
        <Card className="bg-gradient-to-r from-white to-red-50 dark:from-slate-800 dark:to-slate-700 border-slate-200 dark:border-slate-600 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Package className="h-5 w-5 text-red-500" />
                Live Stock Summary
              </CardTitle>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-full border border-red-200 dark:border-red-800">
                <Info className="h-3 w-3 text-red-500" />
                <span>K = Thousand, L = Lakh, Cr = Crore • Hover for exact values</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex flex-col items-center p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all min-w-0 cursor-help">
                    <Package className="h-5 w-5 text-red-500 mb-2 flex-shrink-0" />
                    <span className="text-xs text-slate-500 dark:text-slate-400 text-center mb-1">Total Stock</span>
                    <span className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 text-center break-all leading-tight">
                      {getReadableFormat(totalStats.totalStock)}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-center">
                    <p className="font-semibold">{formatIndianNumber(totalStats.totalStock)}</p>
                    <p className="text-xs text-slate-400 mt-1">Exact stock count</p>
                  </div>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex flex-col items-center p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all min-w-0 cursor-help">
                    <Archive className="h-5 w-5 text-red-500 mb-2 flex-shrink-0" />
                    <span className="text-xs text-slate-500 dark:text-slate-400 text-center mb-1">Materials</span>
                    <span className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 text-center break-all leading-tight">
                      {getReadableFormat(totalStats.uniqueMaterials)}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-center">
                    <p className="font-semibold">{formatIndianNumber(totalStats.uniqueMaterials)} Materials</p>
                    <p className="text-xs text-slate-400 mt-1">Total unique materials</p>
                  </div>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex flex-col items-center p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all min-w-0 cursor-help">
                    <Hash className="h-5 w-5 text-red-500 mb-2 flex-shrink-0" />
                    <span className="text-xs text-slate-500 dark:text-slate-400 text-center mb-1">Batches</span>
                    <span className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 text-center break-all leading-tight">
                      {getReadableFormat(totalStats.uniqueBatches)}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-center">
                    <p className="font-semibold">{formatIndianNumber(totalStats.uniqueBatches)} Batches</p>
                    <p className="text-xs text-slate-400 mt-1">Total unique batches</p>
                  </div>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex flex-col items-center p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all min-w-0 cursor-help">
                    <MapPin className="h-5 w-5 text-red-500 mb-2 flex-shrink-0" />
                    <span className="text-xs text-slate-500 dark:text-slate-400 text-center mb-1">Storage Locations</span>
                    <span className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 text-center break-all leading-tight">
                      {getReadableFormat(totalStats.uniqueStorageLocations)}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-center">
                    <p className="font-semibold">{formatIndianNumber(totalStats.uniqueStorageLocations)} Storage Locations</p>
                    <p className="text-xs text-slate-400 mt-1">Total storage areas</p>
                  </div>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex flex-col items-center p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all min-w-0 cursor-help">
                    <MapPin className="h-5 w-5 text-red-500 mb-2 flex-shrink-0" />
                    <span className="text-xs text-slate-500 dark:text-slate-400 text-center mb-1">Bin Locations</span>
                    <span className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 text-center break-all leading-tight">
                      {getReadableFormat(totalStats.uniqueLocations)}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-center">
                    <p className="font-semibold">{formatIndianNumber(totalStats.uniqueLocations)} Bin Locations</p>
                    <p className="text-xs text-slate-400 mt-1">Total bin positions</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </div>
          </CardContent>
        </Card>

        {/* Storage Location Cards */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          {Object.entries(groupedByStorageLocation).map(([location, items]) => {
            const stats = getStorageLocationStats(items);
            
            return (
              <Card key={location} className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg transition-all duration-200">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 pb-4">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-base font-semibold text-slate-800 dark:text-slate-100 truncate">
                      {location}
                    </CardTitle>
                    <span className="text-xs font-medium px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100 rounded-full flex-shrink-0">
                      {stats.itemCount} items
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 mt-3">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="text-center p-2 bg-white dark:bg-slate-800 rounded border min-w-0 cursor-help">
                          <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Stock</div>
                          <div className="text-xs font-bold text-slate-800 dark:text-slate-100 break-all leading-tight">
                            {getReadableFormat(stats.totalStock)}
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-center">
                          <p className="font-semibold">{formatIndianNumber(stats.totalStock)}</p>
                          <p className="text-xs text-slate-400 mt-1">Exact stock count</p>
                        </div>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="text-center p-2 bg-white dark:bg-slate-800 rounded border min-w-0 cursor-help">
                          <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Materials</div>
                          <div className="text-xs font-bold text-slate-800 dark:text-slate-100 break-all leading-tight">
                            {getReadableFormat(stats.uniqueMaterials)}
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-center">
                          <p className="font-semibold">{formatIndianNumber(stats.uniqueMaterials)} Materials</p>
                          <p className="text-xs text-slate-400 mt-1">Unique materials</p>
                        </div>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="text-center p-2 bg-white dark:bg-slate-800 rounded border min-w-0 cursor-help">
                          <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Batches</div>
                          <div className="text-xs font-bold text-slate-800 dark:text-slate-100 break-all leading-tight">
                            {getReadableFormat(stats.uniqueBatches)}
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-center">
                          <p className="font-semibold">{formatIndianNumber(stats.uniqueBatches)} Batches</p>
                          <p className="text-xs text-slate-400 mt-1">Unique batches</p>
                        </div>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="text-center p-2 bg-white dark:bg-slate-800 rounded border min-w-0 cursor-help">
                          <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Locations</div>
                          <div className="text-xs font-bold text-slate-800 dark:text-slate-100 break-all leading-tight">
                            {getReadableFormat(stats.uniqueLocations)}
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-center">
                          <p className="font-semibold">{formatIndianNumber(stats.uniqueLocations)} Locations</p>
                          <p className="text-xs text-slate-400 mt-1">Bin positions</p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="max-h-72 overflow-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-600 hover:scrollbar-thumb-slate-300 dark:hover:scrollbar-thumb-slate-500">
                    <Table>
                      <TableHeader className="sticky top-0 bg-white dark:bg-slate-800 border-b">
                        <TableRow>
                          <TableHead className="py-2 px-3 text-xs font-medium">Material</TableHead>
                          <TableHead className="py-2 px-3 text-xs font-medium">Batch</TableHead>
                          <TableHead className="py-2 px-3 text-xs font-medium">Location</TableHead>
                          <TableHead className="py-2 px-3 text-xs font-medium text-right">Stock</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {items.map((item, idx) => (
                          <TableRow key={`${item.MATERIAL}-${item.BATCH}-${item.Location}-${idx}`} 
                                    className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                            <TableCell className="py-2 px-3 text-sm font-medium" title={item.MATERIAL_TEXT}>
                              {item.MATERIAL.replace(/^0+/, '')}
                            </TableCell>
                            <TableCell className="py-2 px-3 text-sm">{item.BATCH}</TableCell>
                            <TableCell className="py-2 px-3 text-sm">{item.Location}</TableCell>
                            <TableCell className="py-2 px-3 text-sm font-semibold text-right text-red-600 dark:text-red-400">
                              {item.Available_Stock.toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Material Details Table */}
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-green-500" />
                Material Details
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-2 text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700 transition-colors"
                onClick={exportToExcel}
              >
                <FileSpreadsheet className="h-4 w-4" />
                Export to Excel
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-96 overflow-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-600 hover:scrollbar-thumb-slate-300 dark:hover:scrollbar-thumb-slate-500">
              <Table>
                <TableHeader className="sticky top-0 bg-white dark:bg-slate-800 border-b">
                  <TableRow>
                    <TableHead className="py-3 px-4 text-sm font-medium">Material</TableHead>
                    <TableHead className="py-3 px-4 text-sm font-medium">Description</TableHead>
                    <TableHead className="py-3 px-4 text-sm font-medium">Batch</TableHead>
                    <TableHead className="py-3 px-4 text-sm font-medium">Storage Location</TableHead>
                    <TableHead className="py-3 px-4 text-sm font-medium">Bin Location</TableHead>
                    <TableHead className="py-3 px-4 text-sm font-medium text-right">Available Stock</TableHead>
                    <TableHead className="py-3 px-4 text-sm font-medium text-right">Pack Unit/Pallet</TableHead>
                    <TableHead className="py-3 px-4 text-sm font-medium text-right">Pcs/Pack Unit</TableHead>
                    <TableHead className="py-3 px-4 text-sm font-medium text-right">Total Box</TableHead>
                    <TableHead className="py-3 px-4 text-sm font-medium text-right">Total Pallet</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((item, idx) => (
                    <TableRow key={`${item.MATERIAL}-${item.BATCH}-${item.Location}-${idx}`}
                              className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                      <TableCell className="py-2.5 px-4 text-sm font-medium">{item.MATERIAL.replace(/^0+/, '')}</TableCell>
                      <TableCell className="py-2.5 px-4 text-sm max-w-xs truncate" title={item.MATERIAL_TEXT}>
                        {item.MATERIAL_TEXT}
                      </TableCell>
                      <TableCell className="py-2.5 px-4 text-sm">{item.BATCH}</TableCell>
                      <TableCell className="py-2.5 px-4 text-sm">{item.STORAGE_LOCATION}</TableCell>
                      <TableCell className="py-2.5 px-4 text-sm">{item.Location}</TableCell>
                      <TableCell className="py-2.5 px-4 text-sm font-semibold text-right text-red-600 dark:text-red-400">
                        {item.Available_Stock.toLocaleString()}
                      </TableCell>
                      <TableCell className="py-2.5 px-4 text-sm text-right">
                        {item.PackUnitPerPallet !== null ? item.PackUnitPerPallet.toLocaleString() : 'NA'}
                      </TableCell>
                      <TableCell className="py-2.5 px-4 text-sm text-right">
                        {item.PcsPerPackunit !== null ? item.PcsPerPackunit.toLocaleString() : 'NA'}
                      </TableCell>
                      <TableCell className="py-2.5 px-4 text-sm text-right">
                        {item.Total_Box !== null ? item.Total_Box.toLocaleString() : 'NA'}
                      </TableCell>
                      <TableCell className="py-2.5 px-4 text-sm text-right">
                        {item.Total_Pallet !== null ? item.Total_Pallet.toLocaleString() : 'NA'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
};

export default LiveStock;
