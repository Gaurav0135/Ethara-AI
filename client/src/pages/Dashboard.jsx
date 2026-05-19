import { useEffect, useState } from 'react'
import api from '../services/api'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts'
import { FiCheckCircle, FiClock, FiTrendingUp, FiAlertTriangle } from 'react-icons/fi'

const Dashboard = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await api.get('/dashboard/stats')
        setStats(res.data)
      } catch (error) {
        console.error(error)
        setError('Could not connect to the server. Did you restart the backend?')
      } finally {
        setLoading(false)
      }
    }
    fetchDashboardData()
  }, [])

  if (loading) return <div className="animate-pulse flex space-x-4"><div className="h-4 bg-slate-200 rounded w-3/4"></div></div>
  if (error) return <div className="p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>
  if (!stats) return <div className="p-4 bg-slate-100 text-slate-700 rounded-lg">No stats available.</div>

  const statusData = [
    { name: 'To Do', count: stats.todo },
    { name: 'In Progress', count: stats.inProgress },
    { name: 'Done', count: stats.done },
  ]

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <h1 className="text-2xl font-bold text-slate-800">Dashboard Overview</h1>
        <div className="text-right">
          <p className="text-sm text-slate-500">Completion Rate</p>
          <p className="text-2xl font-bold text-emerald-600">{stats.completionPercentage}%</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="glass-panel p-6 flex flex-col items-center justify-center text-center gap-2 hover:-translate-y-1 transition-transform">
           <div className="p-3 bg-indigo-50 rounded-full text-indigo-500 mb-2">
             <FiTrendingUp className="w-6 h-6" />
           </div>
           <p className="text-sm font-medium text-slate-500">Total Tasks</p>
           <h3 className="text-3xl font-bold text-slate-800">{stats.totalTasks}</h3>
        </div>
        
        <div className="glass-panel p-6 flex flex-col items-center justify-center text-center gap-2 hover:-translate-y-1 transition-transform">
           <div className="p-3 bg-rose-50 rounded-full text-rose-500 mb-2">
             <FiAlertTriangle className="w-6 h-6" />
           </div>
           <p className="text-sm font-medium text-slate-500">Overdue</p>
           <h3 className="text-3xl font-bold text-slate-800">{stats.overdue}</h3>
        </div>

        <div className="glass-panel p-6 flex flex-col items-center justify-center text-center gap-2 hover:-translate-y-1 transition-transform">
           <div className="p-3 bg-blue-50 rounded-full text-blue-500 mb-2">
             <FiClock className="w-6 h-6" />
           </div>
           <p className="text-sm font-medium text-slate-500">In Progress</p>
           <h3 className="text-3xl font-bold text-slate-800">{stats.inProgress}</h3>
        </div>

        <div className="glass-panel p-6 flex flex-col items-center justify-center text-center gap-2 hover:-translate-y-1 transition-transform">
           <div className="p-3 bg-emerald-50 rounded-full text-emerald-500 mb-2">
             <FiCheckCircle className="w-6 h-6" />
           </div>
           <p className="text-sm font-medium text-slate-500">Done</p>
           <h3 className="text-3xl font-bold text-slate-800">{stats.done}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="glass-panel p-6 h-96">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">Tasks by Status</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={statusData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-panel p-6 h-96">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">Tasks per User</h3>
          {stats.tasksPerUser.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats.tasksPerUser} cx="50%" cy="50%" outerRadius={100} fill="#8884d8" dataKey="count" label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {stats.tasksPerUser.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
             <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <img src="https://illustrations.popsy.co/amber/freelancer.svg" alt="Empty" className="w-48 h-48 opacity-50 grayscale" />
                <p>No tasks assigned yet.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
