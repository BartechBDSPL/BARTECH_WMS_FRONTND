"use client"
import React, { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { Package, Truck, TrendingUp, Archive, Activity, Calendar, Users, Target } from 'lucide-react'

// TypeScript interfaces for API responses
interface DashboardStats {
  total_serial_no: number
  Total_Pallet: number
  Inward_Qty: number
  Put_Away_Qty: number
}

interface PutVsPickData {
  MonthName: string
  TotalPickQty: number
  TotalPutQty: number
}

interface PieChartData {
  name: string
  value: number
  color: string
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [putVsPickData, setPutVsPickData] = useState<PutVsPickData[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch data from APIs
  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        setLoading(true)
        setError(null)

        // Fetch dashboard stats
        const statsResponse = await fetch('http://localhost:4251/api/dashboard/stats')
        if (!statsResponse.ok) {
          throw new Error(`Stats API error: ${statsResponse.status}`)
        }
        const statsData: DashboardStats[] = await statsResponse.json()
        
        // Fetch put vs pick data
        const putPickResponse = await fetch('http://localhost:4251/api/dashboard/put-vs-pick')
        if (!putPickResponse.ok) {
          throw new Error(`Put vs Pick API error: ${putPickResponse.status}`)
        }
        const putPickData: PutVsPickData[] = await putPickResponse.json()

        setStats(statsData[0]) // API returns array, take first element
        setPutVsPickData(putPickData.reverse()) // Reverse for chronological order
        setLoading(false)
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch data')
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Data for pie chart
  const pieData: PieChartData[] = stats ? [
    { 
      name: 'Put Away', 
      value: stats.Put_Away_Qty, 
      color: '#dc2626' 
    },
    { 
      name: 'Remaining', 
      value: Math.max(0, stats.Inward_Qty - stats.Put_Away_Qty), 
      color: '#fca5a5' 
    }
  ] : []

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          <span className="text-red-700 font-medium">Loading Dashboard...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
          <div className="flex items-center space-x-3 text-red-600 mb-4">
            <Activity className="h-6 w-6" />
            <h2 className="text-lg font-semibold">Connection Error</h2>
          </div>
          <p className="text-red-700 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="text-red-700">No data available</div>
      </div>
    )
  }

  const processingPercentage: number = stats.Inward_Qty > 0 
    ? Math.round((stats.Put_Away_Qty / stats.Inward_Qty) * 100) 
    : 0

  return (

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-red-900 mb-2">Warehouse Dashboard</h1>
          <p className="text-red-700">Real-time warehouse management overview</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-600 hover:shadow-xl transition-shadow dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-600 text-sm font-medium">Total Serial Numbers</p>
                <p className="text-3xl font-bold text-red-900">{stats.total_serial_no.toLocaleString()}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <Package className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">Active items</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500 hover:shadow-xl transition-shadow dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-600 text-sm font-medium">Total Pallets</p>
                <p className="text-3xl font-bold text-red-900">{stats.Total_Pallet.toLocaleString()}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <Archive className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <Target className="h-4 w-4 text-blue-500 mr-1" />
              <span className="text-sm text-blue-600">Storage units</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-700 hover:shadow-xl transition-shadow dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-600 text-sm font-medium">Inward Quantity</p>
                <p className="text-3xl font-bold text-red-900">{stats.Inward_Qty ? stats.Inward_Qty.toLocaleString() : '0'}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <Truck className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <Activity className="h-4 w-4 text-orange-500 mr-1" />
              <span className="text-sm text-orange-600">Items received</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-800 hover:shadow-xl transition-shadow dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-600 text-sm font-medium">Put Away Quantity</p>
                <p className="text-3xl font-bold text-red-900">{stats.Put_Away_Qty ? stats.Put_Away_Qty.toLocaleString() : '0'}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <Users className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-green-600">
                  {processingPercentage}% processed
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Bar Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6 dark:bg-slate-900">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-red-900">Put vs Pick Quantities</h3>
              <Calendar className="h-5 w-5 text-red-600" />
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={putVsPickData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#fee2e2" />
                  <XAxis 
                    dataKey="MonthName" 
                    tick={{ fontSize: 12, fill: '#991b1b' }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis tick={{ fontSize: 12, fill: '#991b1b' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '2px solid #dc2626',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value: number, name: string) => [
                      value.toLocaleString(), 
                      name === 'TotalPutQty' ? 'Put Quantity' : 'Pick Quantity'
                    ]}
                  />
                  <Bar dataKey="TotalPutQty" fill="#dc2626" name="TotalPutQty" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="TotalPickQty" fill="#f87171" name="TotalPickQty" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6 dark:bg-slate-900">
            <h3 className="text-xl font-semibold text-red-900 mb-6">Processing Status</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry: PieChartData, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '2px solid #dc2626',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => [value.toLocaleString(), 'Quantity']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {pieData.map((entry: PieChartData, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: entry.color }}
                    ></div>
                    <span className="text-sm text-red-700">{entry.name}</span>
                  </div>
                  <span className="text-sm font-medium text-red-900">{entry.value ? entry.value.toLocaleString() : '0'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Monthly Trend Line Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6 dark:bg-slate-900">
          <h3 className="text-xl font-semibold text-red-900 mb-6">Monthly Trend Analysis</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={putVsPickData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#fee2e2" />
                <XAxis 
                  dataKey="MonthName" 
                  tick={{ fontSize: 12, fill: '#991b1b' }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fontSize: 12, fill: '#991b1b' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '2px solid #dc2626',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value: number, name: string) => [
                    value.toLocaleString(), 
                    name === 'TotalPutQty' ? 'Put Quantity' : 'Pick Quantity'
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey="TotalPutQty" 
                  stroke="#dc2626" 
                  strokeWidth={3}
                  dot={{ fill: '#dc2626', strokeWidth: 2, r: 6 }}
                  name="TotalPutQty"
                />
                <Line 
                  type="monotone" 
                  dataKey="TotalPickQty" 
                  stroke="#f87171" 
                  strokeWidth={3}
                  dot={{ fill: '#f87171', strokeWidth: 2, r: 6 }}
                  name="TotalPickQty"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 dark:bg-slate-900">
            <h4 className="text-lg font-semibold text-red-900 mb-3">Current Month Activity</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-red-600">Put Quantity:</span>
                <span className="font-semibold text-red-900">
                  {putVsPickData.length > 0 ? putVsPickData[putVsPickData.length - 1].TotalPutQty.toLocaleString() : '0'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-red-600">Pick Quantity:</span>
                <span className="font-semibold text-red-900">
                  {putVsPickData.length > 0 ? putVsPickData[putVsPickData.length - 1].TotalPickQty.toLocaleString() : '0'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 dark:bg-slate-900">
            <h4 className="text-lg font-semibold text-red-900 mb-3">Total Activity</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-red-600">Total Put:</span>
                <span className="font-semibold text-red-900">
                  {putVsPickData.reduce((sum: number, item: PutVsPickData) => sum + item.TotalPutQty, 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-red-600">Total Pick:</span>
                <span className="font-semibold text-red-900">
                  {putVsPickData.reduce((sum: number, item: PutVsPickData) => sum + item.TotalPickQty, 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 dark:bg-slate-900">
            <h4 className="text-lg font-semibold text-red-900 mb-3">Efficiency</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-red-600">Processing Rate:</span>
                <span className="font-semibold text-red-900">{processingPercentage}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-red-600">Status:</span>
                <span className={`font-semibold ${processingPercentage === 100 ? 'text-green-600' : 'text-orange-600'}`}>
                  {processingPercentage === 100 ? 'Complete' : 'In Progress'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-red-600 text-sm">
            Last updated: {new Date().toLocaleString()}
          </p>
        </div>
      </div>
    // </div>
  )
}

export default Dashboard