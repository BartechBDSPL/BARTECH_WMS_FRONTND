import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Package, Clock, CheckCircle, XCircle, CalendarIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, parse } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';

// Define TypeScript interfaces for the dashboard data
interface DashboardData {
  Approve_Percentage: number;
  Reject_Percentage: number;
  Pending_QC_Percentage: number;
  Inward_Done_Percentage: number;
  Inward_Pending_Percentage: number;
  PutAway_Done_Percentage: number;
  PutAway_Pending_Percentage: number;
  Internal_Movement_Percentage: number;
  NotStarted_Products: number;
  NotStarted_Qty: number;
}

// Define types for chart data
interface ChartData {
  name: string;
  percentage: number;
  color?: string;
}

interface PieChartData {
  name: string;
  value: number;
  color?: string;
}

const KpiDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [fromDate, setFromDate] = useState<Date>(parse('2024-01-01', 'yyyy-MM-dd', new Date()));
  const [toDate, setToDate] = useState<Date>(parse('2025-12-31', 'yyyy-MM-dd', new Date()));

  // Fetch data from API
  useEffect(() => {


    fetchData();
  }, []);
      const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:4251/api/dashboard/rmkpi', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            FromDate: format(fromDate, 'yyyy-MM-dd'),
          ToDate: format(toDate, 'yyyy-MM-dd'),
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }

        const data: DashboardData[] = await response.json();
        setDashboardData(data[0]); // Since response is an array with one object
      } catch (err: any) {
        setError(err.message);
        // Fallback to sample data for demonstration
        setDashboardData({
          Approve_Percentage: 33.33,
          Reject_Percentage: 66.67,
          Pending_QC_Percentage: 0,
          Inward_Done_Percentage: 36.67,
          Inward_Pending_Percentage: 63.33,
          PutAway_Done_Percentage: 33.33,
          PutAway_Pending_Percentage: 66.67,
          Internal_Movement_Percentage: 20,
          NotStarted_Products: 0,
          NotStarted_Qty: 0,
        });
      } finally {
        setLoading(false);
      }
    };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="text-center p-6">
          <CardContent>
            <Skeleton className="h-12 w-12 rounded-full mx-auto mb-4" />
            <p className="text-muted-foreground">Loading Dashboard...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="text-center p-6">
          <CardContent>
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-destructive">Failed to load dashboard data</p>
            {error && <p className="text-sm mt-2 text-muted-foreground">{error}</p>}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Prepare data for charts
  const qcData: ChartData[] = [
    { name: 'Approved', percentage: dashboardData.Approve_Percentage, color: '#dc2626' },
    { name: 'Rejected', percentage: dashboardData.Reject_Percentage, color: '#b91c1c' },
    { name: 'Pending QC', percentage: dashboardData.Pending_QC_Percentage, color: '#fca5a5' },
  ];

  const inwardData: PieChartData[] = [
    { name: 'Done', value: dashboardData.Inward_Done_Percentage, color: '#dc2626' },
    { name: 'Pending', value: dashboardData.Inward_Pending_Percentage, color: '#fca5a5' },
  ];

  const putAwayData: PieChartData[] = [
    { name: 'Done', value: dashboardData.PutAway_Done_Percentage, color: '#dc2626' },
    { name: 'Pending', value: dashboardData.PutAway_Pending_Percentage, color: '#fca5a5' },
  ];

  const internalMovementData: ChartData[] = [
    { name: 'Internal Movement', percentage: dashboardData.Internal_Movement_Percentage, color: '#dc2626' },
  ];

  const COLORS = ['#dc2626', '#fca5a5'];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <Card className="mb-8">
  <CardHeader>
    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
      {/* Left Title Section */}
      <div>
        <CardTitle className="text-3xl text-primary">KPI's Dashboard</CardTitle>
        <CardDescription className="text-muted-foreground">
          Warehouse Management Key Performance Indicators
        </CardDescription>
      </div>

      {/* Right Date Range Picker */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
        {/* From Date */}
        <div className="space-y-1">
          <Label htmlFor="fromDate" className="text-primary">From Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-[160px] justify-start text-left font-normal',
                  !fromDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {fromDate ? format(fromDate, 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={fromDate}
                onSelect={(date) => setFromDate(date || new Date())}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* To Date */}
        <div className="space-y-1">
          <Label htmlFor="toDate" className="text-primary">To Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-[160px] justify-start text-left font-normal',
                  !toDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {toDate ? format(toDate, 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={toDate}
                onSelect={(date) => setToDate(date || new Date())}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Search Button */}
        <Button onClick={fetchData} className="self-stretch sm:self-end">
          Find
        </Button>
      </div>
    </div>
  </CardHeader>
</Card>


        {/* Top Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Not Started Products Card */}
          <Card className="border-l-4 border-primary">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-primary mb-1">Not Started Products</p>
                  <p className="text-3xl font-bold text-primary">{dashboardData.NotStarted_Products}</p>
                </div>
                <Package className="h-12 w-12 text-primary" />
              </div>
            </CardContent>
          </Card>

          {/* Not Started Quantity Card */}
          <Card className="border-l-4 border-primary">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-primary mb-1">Not Started Quantity</p>
                  <p className="text-3xl font-bold text-primary">{dashboardData.NotStarted_Qty}</p>
                </div>
                <Clock className="h-12 w-12 text-primary" />
              </div>
            </CardContent>
          </Card>

          {/* Internal Movement Card */}
          <Card className="border-l-4 border-primary">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-primary mb-1">Internal Movement</p>
                  <p className="text-3xl font-bold text-primary">{dashboardData.Internal_Movement_Percentage}%</p>
                </div>
                <CheckCircle className="h-12 w-12 text-primary" />
              </div>
            </CardContent>
          </Card>

          {/* QC Summary Card */}
          <Card className="border-l-4 border-primary">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-primary mb-1">QC Approval Rate</p>
                  <p className="text-3xl font-bold text-primary">{dashboardData.Approve_Percentage}%</p>
                </div>
                <XCircle className="h-12 w-12 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* QC Vertical Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-primary">Quality Control Status</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={qcData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#fca5a5" />
                  <XAxis dataKey="name" tick={{ fill: '#7f1d1d' }} />
                  <YAxis tick={{ fill: '#7f1d1d' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fef2f2',
                      border: '1px solid #dc2626',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="percentage" fill="#dc2626" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Inward Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-primary">Inward Process Status</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={inwardData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {inwardData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fef2f2',
                      border: '1px solid #dc2626',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* PutAway Donut Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-primary">PutAway Process Status</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={putAwayData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {putAwayData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fef2f2',
                      border: '1px solid #dc2626',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Internal Movement Single Bar */}
          <Card className="lg:col-span-2 xl:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg text-primary">Internal Movement Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={internalMovementData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#fca5a5" />
                  <XAxis dataKey="name" tick={{ fill: '#7f1d1d' }} />
                  <YAxis tick={{ fill: '#7f1d1d' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fef2f2',
                      border: '1px solid #dc2626',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="percentage" fill="#dc2626" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Summary Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg text-primary">Performance Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="text-center p-4">
                <p className="text-sm text-primary">QC Efficiency</p>
                <p className="text-xl font-bold text-primary">
                  {(
                    dashboardData.Approve_Percentage /
                    (dashboardData.Approve_Percentage + dashboardData.Reject_Percentage) *
                    100
                  ).toFixed(1)}%
                </p>
              </Card>
              <Card className="text-center p-4">
                <p className="text-sm text-primary">Inward Progress</p>
                <p className="text-xl font-bold text-primary">{dashboardData.Inward_Done_Percentage}%</p>
              </Card>
              <Card className="text-center p-4">
                <p className="text-sm text-primary">PutAway Progress</p>
                <p className="text-xl font-bold text-primary">{dashboardData.PutAway_Done_Percentage}%</p>
              </Card>
              <Card className="text-center p-4">
                <p className="text-sm text-primary">Overall Activity</p>
                <p className="text-xl font-bold text-primary">
                  {(
                    (dashboardData.Inward_Done_Percentage +
                      dashboardData.PutAway_Done_Percentage +
                      dashboardData.Internal_Movement_Percentage) /
                    3
                  ).toFixed(1)}%
                </p>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default KpiDashboard;