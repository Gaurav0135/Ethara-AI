import { useState, useEffect } from 'react'
import api from '../services/api'
import { FiMail, FiFolder, FiCheckSquare } from 'react-icons/fi'
import toast from 'react-hot-toast'

const Members = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/auth/users/details')
        setUsers(res.data)
      } catch (error) {
        toast.error('Failed to load members')
        setError('Could not connect to the server. Did you restart the backend?')
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [])

  if (loading) return <div className="animate-pulse flex space-x-4"><div className="h-4 bg-slate-200 rounded w-3/4"></div></div>
  if (error) return <div className="p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Company Members</h1>
        <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200 shadow-sm">
          {users.length} Total Users
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {users.map(u => (
          <div key={u._id} className="glass-panel p-6 flex flex-col gap-4 relative overflow-hidden group hover:shadow-xl transition-shadow bg-white">
            {u.role === 'Admin' && (
              <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs px-3 py-1 font-semibold rounded-bl-lg shadow-sm">
                ADMIN
              </div>
            )}
            
            <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 text-white flex items-center justify-center text-xl font-bold shadow-md">
                {u.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">{u.name}</h3>
                <div className="flex items-center gap-1 text-slate-500 text-sm">
                  <FiMail size={14} /> {u.email}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 flex-1">
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                <div className="flex items-center gap-2 text-slate-600 font-medium mb-2">
                  <FiFolder size={14} className="text-indigo-500" /> Projects ({u.projects.length})
                </div>
                {u.projects.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {u.projects.map(p => (
                      <span key={p._id} className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded font-medium">
                        {p.title}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No projects</p>
                )}
              </div>

              <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 flex-1 flex flex-col">
                <div className="flex items-center gap-2 text-slate-600 font-medium mb-2">
                  <FiCheckSquare size={14} className="text-blue-500" /> Tasks ({u.tasks.length})
                </div>
                {u.tasks.length > 0 ? (
                  <div className="space-y-1.5 flex-1 overflow-y-auto max-h-40 pr-1">
                    {u.tasks.map(t => (
                      <div key={t._id} className="text-xs bg-white border border-slate-200 px-2.5 py-1.5 rounded flex justify-between items-center shadow-sm">
                        <span className="truncate pr-2 font-medium text-slate-700">{t.title}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                           t.status === 'Done' ? 'bg-emerald-100 text-emerald-700' : 
                           t.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 
                           'bg-slate-100 text-slate-600'
                        }`}>
                           {t.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No tasks assigned</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Members
