"use client"
import React from 'react';
import LocationHeatmaps from '@/components/dashboard/locationWiseStock';

const LocationWiseStock: React.FC = () => {
  return (
    <div className='mt-3 sm:mt-5'>
      <div className='flex flex-col space-y-2 sm:space-y-3'>
        <div className='flex justify-between items-center'>
          <h1 className='text-lg sm:text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100'>
            Location wise Available Quantity
          </h1>
        </div>
      </div>
      <div className="w-full overflow-x-auto">
        <LocationHeatmaps />
      </div>
    </div>
  );
};

export default LocationWiseStock;
