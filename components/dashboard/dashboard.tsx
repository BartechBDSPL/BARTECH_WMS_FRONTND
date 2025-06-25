"use client"
import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import MainDashboard from './main-dashboard'
import KpiDashboard from './kpi-dashboard'
import LocationWiseStock from './location-wise-stock'
import LiveStock from './live-stock'

function Dashboard() {
  return (
    <div className="w-full">
      <Tabs defaultValue="main" className="w-full">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-4 gap-2 sm:mb-0 mb-20 mt-5">
          <TabsTrigger value="main" className="text-sm sm:text-base">
            Main Dashboard
          </TabsTrigger>
          <TabsTrigger value="kpi" className="text-sm sm:text-base">
            KPI&apos;s Dashboard
          </TabsTrigger>
          <TabsTrigger value="location-wise-stock" className="text-sm sm:text-base">
            Location Wise Stock
          </TabsTrigger>
            <TabsTrigger value="live-stock" className="text-sm sm:text-base">
            Live Stock
          </TabsTrigger>
        </TabsList>
        <TabsContent value="main" className="space-y-4">
          <MainDashboard />
        </TabsContent>
        <TabsContent value="kpi" className="space-y-4">
          <KpiDashboard />
        </TabsContent>
        <TabsContent value="location-wise-stock" className="space-y-4">
          <LocationWiseStock />
        </TabsContent>
        <TabsContent value="live-stock" className="space-y-4">
          <LiveStock />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Dashboard