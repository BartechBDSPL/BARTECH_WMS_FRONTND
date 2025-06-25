"use client"
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BACKEND_URL } from '@/lib/constants';
import { delay } from '@/utills/delay';
import Cookies from 'js-cookie';
import { Skeleton } from "@/components/ui/skeleton";

type LocationData = {
  Location: string;
  WH_Category_Code: string;
  ItemQtyDetails: string | null;
  TotalPutQty: number;
  TotalPickQty: number;
  TotalQty: number;
};

type CellData = {
  id: string;
  label: string;
  value: number;
  customData: LocationData;
};

type HeatmapProps = {
  data: CellData[];
  title: string;
};

const colorScale = (value: number): string => {
  if (value === 0) return 'bg-[#2EB88A]';
  return 'bg-red-500';
};

const Cell: React.FC<{ data: CellData }> = ({ data }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            className={`aspect-square ${colorScale(data.value)} rounded-sm shadow-sm cursor-pointer text-[10px]`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <div className={`h-full w-full flex items-center justify-center font-medium ${data.value === 0 ? 'text-gray-800' : 'text-gray-200'} overflow-hidden`}>
              {data.label}
            </div>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent 
          side="top"
          className="bg-white dark:bg-black p-3 rounded-lg shadow-lg border text-black dark:text-white border-gray-200 dark:border-gray-700"
        >
          <div className="text-sm">
            <h3 className="font-bold mb-1">{data.label}</h3>
            <div className="flex flex-col space-y-1">
              <p>Total Put Qty: {data.customData.TotalPutQty}</p>
              <p>Total Pick Qty: {data.customData.TotalPickQty}</p>
              <p>Total Qty: {data.customData.TotalQty}</p>
            </div>
            {data.customData.ItemQtyDetails && (
              <div className="mt-2">
                <h4 className="font-semibold">Material Qty Details:</h4>
                {data.customData.ItemQtyDetails.split(', ').map((item, index) => (
                  <p key={index}>{item}</p>
                ))}
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const HeatmapSkeleton = () => {
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col space-y-4 pb-2">
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-[200px]" />
          <div className="flex gap-4">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-6 gap-1.5">
          {[...Array(24)].map((_, i) => (
            <Skeleton key={i} className="aspect-square w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export const Heatmap: React.FC<HeatmapProps> = ({ data, title }) => {
  const gridColsClass = () => {
    const length = data.length;
    if (length <= 24) return "grid-cols-6";
    if (length <= 48) return "grid-cols-8";
    return "grid-cols-12";
  };

  return (
    <Card className="w-full relative">
      <CardHeader className="flex flex-col space-y-4 pb-2">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="text-sm sm:text-base lg:text-lg">
            {title.split('(')[0]}
            <span className="block sm:inline text-sm text-muted-foreground">
              ({title.split('(')[1]}
            </span>
          </CardTitle>
          
          <div className="flex flex-row items-center gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#2EB88A] rounded-sm"></div>
              <span>Free</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
              <span>Occupied</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className={`grid ${gridColsClass()} gap-1.5`}>
          {data.map((cell) => (
            <Cell key={cell.id} data={cell} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default function LocationHeatmaps() {
  const [locationData, setLocationData] = useState<LocationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const token = Cookies.get('token');
  useEffect(() => {
    const fetchDataSequentially = async () => {
        await delay(200);
        fetchData();
      };
      fetchDataSequentially();
  }, []);
  
  const fetchData = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/dashboard/loc-wise-item-qty`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setLocationData(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching location data:', error);
    } finally {
      setIsLoading(false);
    }
  };


  const processData = (data: LocationData[], warehouseCode: string): CellData[] => {
    return data
      .filter(item => item.WH_Category_Code === warehouseCode)
      .map(item => ({
        id: item.Location,
        label: item.Location,
        value: item.TotalQty,
        customData: item,
      }));
  };

  // Get unique warehouse codes
  const warehouseCodes = Array.from(new Set(locationData.map(item => item.WH_Category_Code))).sort();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
        {[...Array(4)].map((_, index) => (
          <HeatmapSkeleton key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
      {warehouseCodes.map(warehouseCode => {
        const warehouseLocations = processData(locationData, warehouseCode);
        if (warehouseLocations.length === 0) return null;
        
        return (
          <Heatmap 
            key={warehouseCode}
            data={warehouseLocations}
            title={`Storage Overview (Warehouse ${warehouseCode})`}
          />
        );
      })}
    </div>
  );
}