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
  product_code: string;
  product_name: string;
  bin: string;
  Available_Stock: number;
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
    products: DropdownOption[];
    bins: string[];
  }>({
    products: [],
    bins: [],
  });
  useEffect(() => {
    fetchLiveStockData();
  }, []);

  useEffect(() => {
    // Extract unique values for filtering
    if (stockData.length > 0) {
      const products = Array.from(new Set(stockData.map(item => item.product_code)));
      const bins = Array.from(new Set(stockData.map(item => item.bin)));
      
      setUniqueOptions({
        products: products.map(productCode => {
          // Find the corresponding product name
          const productName = stockData.find(item => item.product_code === productCode)?.product_name || '';
          return { 
            value: productCode, 
            label: `${productCode} - ${productName}`
          };
        }),
        bins,
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
      setStockData(data);
      setFilteredData(data);
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
        item.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.product_code.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply specific filters
    if (filterOption !== "all" && filterValue) {
      switch (filterOption) {
        case "product":
          results = results.filter(item => item.product_code === filterValue);
          break;
        case "bin":
          results = results.filter(item => item.bin === filterValue);
          break;
      }
    }
    
    setFilteredData(results);
  };

  // Group data by bin location
  const groupedByBin = filteredData.reduce((acc, item) => {
    if (!acc[item.bin]) {
      acc[item.bin] = [];
    }
    acc[item.bin].push(item);
    return acc;
  }, {} as Record<string, LiveStockItem[]>);

  // Calculate stats for each bin location
  const getBinStats = (items: LiveStockItem[]) => {
    const totalStock = items.reduce((sum, item) => sum + item.Available_Stock, 0);
    const uniqueProducts = new Set(items.map(item => item.product_code)).size;
    
    return {
      totalStock,
      uniqueProducts,
      itemCount: items.length
    };
  };

  // Calculate overall stats
  const getTotalStats = () => {
    const totalStock = filteredData.reduce((sum, item) => sum + item.Available_Stock, 0);
    const uniqueProducts = new Set(filteredData.map(item => item.product_code)).size;
    const uniqueBins = new Set(filteredData.map(item => item.bin)).size;
    
    return {
      totalStock,
      uniqueProducts,
      uniqueBins,
      itemCount: filteredData.length
    };
  };

  const exportToExcel = () => {
    // Create CSV content
    const headers = [
      'Product Code', 
      'Product Name', 
      'Bin Location', 
      'Available Stock'
    ];
    const csvContent = [
      headers.join(','),
      ...filteredData.map(item => [
        item.product_code,
        `"${item.product_name.replace(/"/g, '""')}"`,
        item.bin,
        item.Available_Stock
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
              placeholder="Search products by code or name..."
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
                  <SelectItem value="product">Product</SelectItem>
                  <SelectItem value="bin">Bin Location</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            
            {filterOption === "product" && (
              <CustomDropdown
                options={uniqueOptions.products}
                value={filterValue}
                onValueChange={setFilterValue}
                placeholder="Select Product"
                searchPlaceholder="Search products..."
                emptyText="No products available"
                disabled={false}
              />
            )}
            
            {filterOption === "bin" && (
              <CustomDropdown
                options={uniqueOptions.bins.map(bin => ({
                  value: bin,
                  label: bin
                }))}
                value={filterValue}
                onValueChange={setFilterValue}
                placeholder="Select Bin"
                searchPlaceholder="Search bins..."
                emptyText="No bins available"
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
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
                    <span className="text-xs text-slate-500 dark:text-slate-400 text-center mb-1">Products</span>
                    <span className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 text-center break-all leading-tight">
                      {getReadableFormat(totalStats.uniqueProducts)}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-center">
                    <p className="font-semibold">{formatIndianNumber(totalStats.uniqueProducts)} Products</p>
                    <p className="text-xs text-slate-400 mt-1">Total unique products</p>
                  </div>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex flex-col items-center p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all min-w-0 cursor-help">
                    <MapPin className="h-5 w-5 text-red-500 mb-2 flex-shrink-0" />
                    <span className="text-xs text-slate-500 dark:text-slate-400 text-center mb-1">Bin Locations</span>
                    <span className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 text-center break-all leading-tight">
                      {getReadableFormat(totalStats.uniqueBins)}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-center">
                    <p className="font-semibold">{formatIndianNumber(totalStats.uniqueBins)} Bin Locations</p>
                    <p className="text-xs text-slate-400 mt-1">Total bin positions</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </div>
          </CardContent>
        </Card>

        {/* Bin Location Cards */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          {Object.entries(groupedByBin).map(([bin, items]) => {
            const stats = getBinStats(items);
            
            return (
              <Card key={bin} className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg transition-all duration-200">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 pb-4">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-base font-semibold text-slate-800 dark:text-slate-100 truncate">
                      {bin}
                    </CardTitle>
                    <span className="text-xs font-medium px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100 rounded-full flex-shrink-0">
                      {stats.itemCount} items
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-3">
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
                          <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Products</div>
                          <div className="text-xs font-bold text-slate-800 dark:text-slate-100 break-all leading-tight">
                            {getReadableFormat(stats.uniqueProducts)}
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-center">
                          <p className="font-semibold">{formatIndianNumber(stats.uniqueProducts)} Products</p>
                          <p className="text-xs text-slate-400 mt-1">Unique products</p>
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
                          <TableHead className="py-2 px-3 text-xs font-medium">Product Code</TableHead>
                          <TableHead className="py-2 px-3 text-xs font-medium text-right">Stock</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {items.map((item, idx) => (
                          <TableRow key={`${item.product_code}-${item.bin}-${idx}`} 
                                    className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                            <TableCell className="py-1.5 px-3 text-xs font-medium" title={item.product_name}>
                              {item.product_code}
                            </TableCell>
                            <TableCell className="py-1.5 px-3 text-xs font-semibold text-right text-red-600 dark:text-red-400">
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

        {/* Product Details Table */}
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-green-500" />
                Product Details
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
                    <TableHead className="py-3 px-4 text-sm font-medium">Product Code</TableHead>
                    <TableHead className="py-3 px-4 text-sm font-medium">Product Name</TableHead>
                    <TableHead className="py-3 px-4 text-sm font-medium">Bin Location</TableHead>
                    <TableHead className="py-3 px-4 text-sm font-medium text-right">Available Stock</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((item, idx) => (
                    <TableRow key={`${item.product_code}-${item.bin}-${idx}`}
                              className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                      <TableCell className="py-2.5 px-4 text-sm font-medium">{item.product_code}</TableCell>
                      <TableCell className="py-2.5 px-4 text-sm max-w-xs truncate" title={item.product_name}>
                        {item.product_name}
                      </TableCell>
                      <TableCell className="py-2.5 px-4 text-sm">{item.bin}</TableCell>
                      <TableCell className="py-2.5 px-4 text-sm font-semibold text-right text-red-600 dark:text-red-400">
                        {item.Available_Stock.toLocaleString()}
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
