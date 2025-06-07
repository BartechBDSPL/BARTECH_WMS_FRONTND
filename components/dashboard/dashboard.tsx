"use client"
import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import MainDashboard from './main-dashboard'
import KpiDashboard from './kpi-dashboard'

function Dashboard() {
  return (
    <div className="w-full">
      <Tabs defaultValue="main" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="main">Main Dashboard</TabsTrigger>
          <TabsTrigger value="kpi">KPI's Dashboard</TabsTrigger>
        </TabsList>
        <TabsContent value="main" className="space-y-4">
          <MainDashboard />
        </TabsContent>
        <TabsContent value="kpi" className="space-y-4">
          <KpiDashboard />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Dashboard