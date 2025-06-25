import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, AreaChart, Area } from 'recharts';
import { Package, Clock, CheckCircle, XCircle, Calendar as CalendarIcon, TrendingUp, Activity, Target, Zap, RefreshCw, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, parse } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BACKEND_URL } from '@/lib/constants';

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
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Fetch data from API
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      setError(null);
      
      const response = await fetch(BACKEND_URL+'/api/dashboard/rmkpi', {
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
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: DashboardData[] = await response.json();
      
      if (data && data.length > 0) {
        setDashboardData(data[0]); // Since response is an array with one object
      } else {
        throw new Error('No data received from server');
      }
    } catch (err: any) {
      console.error('API Error:', err);
      setError(err.message);
      
      // Fallback to sample data for demonstration
      const fallbackData: DashboardData = {
        Approve_Percentage: 50,
        Reject_Percentage: 0,
        Pending_QC_Percentage: 50,
        Inward_Done_Percentage: 50,
        Inward_Pending_Percentage: 50,
        PutAway_Done_Percentage: 25,
        PutAway_Pending_Percentage: 75,
        Internal_Movement_Percentage: 5,
        NotStarted_Products: 1,
        NotStarted_Qty: 65,
      };
      setDashboardData(fallbackData);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <Card className="text-center p-8 shadow-lg border-0">
          <CardContent>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg font-medium text-slate-700">Loading Dashboard...</p>
            <p className="text-sm text-slate-500 mt-2">Fetching your KPI data</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <Card className="text-center p-8 shadow-lg border-0">
          <CardContent>
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <p className="text-lg font-medium text-red-600">Failed to load dashboard data</p>
            {error && <p className="text-sm mt-2 text-slate-500">{error}</p>}
            <Button onClick={fetchData} className="mt-4" variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Prepare data for charts
  const qcData: ChartData[] = [
    { name: 'Approved', percentage: dashboardData.Approve_Percentage, color: '#10B981' },
    { name: 'Rejected', percentage: dashboardData.Reject_Percentage, color: '#EF4444' },
    { name: 'Pending QC', percentage: dashboardData.Pending_QC_Percentage, color: '#F59E0B' },
  ];

  const inwardData: PieChartData[] = [
    { name: 'Done', value: dashboardData.Inward_Done_Percentage, color: '#10B981' },
    { name: 'Pending', value: dashboardData.Inward_Pending_Percentage, color: '#F59E0B' },
  ];

  const putAwayData: PieChartData[] = [
    { name: 'Done', value: dashboardData.PutAway_Done_Percentage, color: '#10B981' },
    { name: 'Pending', value: dashboardData.PutAway_Pending_Percentage, color: '#F59E0B' },
  ];

  const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#3B82F6'];

  // Calculate overall efficiency
  const overallEfficiency = (
    (dashboardData.Inward_Done_Percentage +
      dashboardData.PutAway_Done_Percentage +
      dashboardData.Internal_Movement_Percentage) / 3
  ).toFixed(1);

  const qcEfficiency = (
    dashboardData.Approve_Percentage /
    (dashboardData.Approve_Percentage + dashboardData.Reject_Percentage) * 100
  ).toFixed(1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <Card className="mb-8 shadow-lg border-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
              {/* Left Title Section */}
              <div>
                <CardTitle className="text-4xl font-bold mb-2 flex items-center gap-3">
                  <Activity className="h-10 w-10" />
                  KPI Dashboard
                </CardTitle>
                <CardDescription className="text-blue-100 text-lg">
                  Warehouse Management Key Performance Indicators
                </CardDescription>
                <Badge variant="secondary" className="mt-2 bg-white/20 text-white border-white/30">
                  Real-time Analytics
                </Badge>
              </div>

              {/* Right Date Range Picker */}
              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 bg-white/10 p-4 rounded-lg backdrop-blur-sm">
                {/* From Date */}
                <div className="space-y-2">
                  <Label htmlFor="fromDate" className="text-white font-medium">From Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-[160px] justify-start text-left font-normal bg-white/90 border-white/20 hover:bg-white text-slate-700',
                          !fromDate && 'text-slate-400'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {fromDate ? format(fromDate, 'PP') : <span>Pick a date</span>}
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
                <div className="space-y-2">
                  <Label htmlFor="toDate" className="text-white font-medium">To Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-[160px] justify-start text-left font-normal bg-white/90 border-white/20 hover:bg-white text-slate-700',
                          !toDate && 'text-slate-400'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {toDate ? format(toDate, 'PP') : <span>Pick a date</span>}
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

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button 
                    onClick={fetchData} 
                    className="bg-white text-blue-600 hover:bg-blue-50 font-medium"
                    disabled={refreshing}
                  >
                    {refreshing ? (
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <TrendingUp className="mr-2 h-4 w-4" />
                    )}
                    {refreshing ? 'Refreshing...' : 'Refresh Data'}
                  </Button>
                  {/* <Button variant="outline" className="bg-white/20 border-white/30 text-white hover:bg-white/30">
                    <Download className="h-4 w-4" />
                  </Button> */}
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Not Started Products Card */}
          <Card className="shadow-lg border-0 hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-orange-500 to-red-500 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium mb-1 text-orange-100">Not Started Products</p>
                  <p className="text-3xl font-bold">{dashboardData.NotStarted_Products}</p>
                  <p className="text-xs text-orange-200 mt-1">Items pending</p>
                </div>
                <div className="p-3 bg-white/20 rounded-full">
                  <Package className="h-8 w-8" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Not Started Quantity Card */}
          <Card className="shadow-lg border-0 hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-amber-500 to-orange-500 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium mb-1 text-amber-100">Not Started Quantity</p>
                  <p className="text-3xl font-bold">{dashboardData.NotStarted_Qty.toLocaleString()}</p>
                  <p className="text-xs text-amber-200 mt-1">Units pending</p>
                </div>
                <div className="p-3 bg-white/20 rounded-full">
                  <Clock className="h-8 w-8" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Internal Movement Card */}
          <Card className="shadow-lg border-0 hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-blue-500 to-indigo-500 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium mb-1 text-blue-100">Internal Movement</p>
                  <p className="text-3xl font-bold">{dashboardData.Internal_Movement_Percentage}%</p>
                  <Progress value={dashboardData.Internal_Movement_Percentage} className="mt-2 h-2 bg-white/20" />
                </div>
                <div className="p-3 bg-white/20 rounded-full">
                  <Zap className="h-8 w-8" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* QC Approval Rate Card */}
          <Card className="shadow-lg border-0 hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-green-500 to-emerald-500 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium mb-1 text-green-100">QC Approval Rate</p>
                  <p className="text-3xl font-bold">{dashboardData.Approve_Percentage}%</p>
                  <Progress value={dashboardData.Approve_Percentage} className="mt-2 h-2 bg-white/20" />
                </div>
                <div className="p-3 bg-white/20 rounded-full">
                  <Target className="h-8 w-8" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {/* QC Status Chart */}
          <Card className="shadow-lg border-0 hover:shadow-xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
              <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Quality Control Status
              </CardTitle>
              <CardDescription>Approval, rejection, and pending rates</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={qcData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  <Bar dataKey="percentage" fill="#10B981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Inward Process Chart */}
          <Card className="shadow-lg border-0 hover:shadow-xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-600" />
                Inward Process Status
              </CardTitle>
              <CardDescription>Done vs Pending inward operations</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
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
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* PutAway Process Chart */}
          <Card className="shadow-lg border-0 hover:shadow-xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
              <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
                <Activity className="h-5 w-5 text-purple-600" />
                PutAway Process Status
              </CardTitle>
              <CardDescription>Done vs Pending putaway operations</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
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
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Performance Summary */}
        <Card className="shadow-lg border-0 bg-gradient-to-r from-slate-50 to-blue-50">
          <CardHeader>
            <CardTitle className="text-2xl text-slate-800 flex items-center gap-3">
              <TrendingUp className="h-6 w-6 text-blue-600" />
              Performance Summary
            </CardTitle>
            <CardDescription className="text-lg">Key performance indicators overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="text-center p-6 shadow-md border-0 bg-white hover:shadow-lg transition-all duration-300">
                <div className="p-3 bg-green-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-sm font-medium text-slate-600 mb-2">QC Efficiency</p>
                <p className="text-3xl font-bold text-green-600 mb-2">{qcEfficiency}%</p>
                <Progress value={parseFloat(qcEfficiency)} className="h-2" />
              </Card>

              <Card className="text-center p-6 shadow-md border-0 bg-white hover:shadow-lg transition-all duration-300">
                <div className="p-3 bg-blue-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Package className="h-8 w-8 text-blue-600" />
                </div>
                <p className="text-sm font-medium text-slate-600 mb-2">Inward Progress</p>
                <p className="text-3xl font-bold text-blue-600 mb-2">{dashboardData.Inward_Done_Percentage}%</p>
                <Progress value={dashboardData.Inward_Done_Percentage} className="h-2" />
              </Card>

              <Card className="text-center p-6 shadow-md border-0 bg-white hover:shadow-lg transition-all duration-300">
                <div className="p-3 bg-purple-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Activity className="h-8 w-8 text-purple-600" />
                </div>
                <p className="text-sm font-medium text-slate-600 mb-2">PutAway Progress</p>
                <p className="text-3xl font-bold text-purple-600 mb-2">{dashboardData.PutAway_Done_Percentage}%</p>
                <Progress value={dashboardData.PutAway_Done_Percentage} className="h-2" />
              </Card>

              <Card className="text-center p-6 shadow-md border-0 bg-white hover:shadow-lg transition-all duration-300">
                <div className="p-3 bg-indigo-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Target className="h-8 w-8 text-indigo-600" />
                </div>
                <p className="text-sm font-medium text-slate-600 mb-2">Overall Efficiency</p>
                <p className="text-3xl font-bold text-indigo-600 mb-2">{overallEfficiency}%</p>
                <Progress value={parseFloat(overallEfficiency)} className="h-2" />
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default KpiDashboard;