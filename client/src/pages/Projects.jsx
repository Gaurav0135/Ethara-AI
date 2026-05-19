import { useState, useEffect } from 'react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { FiPlus, FiUsers, FiUserMinus, FiFolder, FiShield } from 'react-icons/fi'
import toast from 'react-hot-toast'
import MultiSelectDropdown from '../components/MultiSelectDropdown'

const Projects = () => {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  
  const [showModal, setShowModal] = useState(false)
  const [newProject, setNewProject] = useState({ title: '', description: '', members: [] })
  const [allUsers, setAllUsers] = useState([])
  
  const [manageProject, setManageProject] = useState(null)
  const [newMemberEmail, setNewMemberEmail] = useState('')

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects')
      setProjects(res.data)
    } catch (error) {
      toast.error('Failed to load projects')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
    const fetchUsers = async () => {
      try {
        const res = await api.get('/auth/users')
        setAllUsers(res.data)
      } catch (error) {
        console.error('Failed to load users')
      }
    }
    fetchUsers()
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await api.post('/projects', newProject)
      toast.success('Project created successfully!')
      setShowModal(false)
      setNewProject({ title: '', description: '', members: [] })
      fetchProjects()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create project')
    }
  }

  const handleAddMember = async (e) => {
    e.preventDefault()
    try {
      await api.post(`/projects/${manageProject._id}/members`, { email: newMemberEmail })
      toast.success('Member added successfully')
      setNewMemberEmail('')
      fetchProjects()
      // Refresh modal data
      const updatedProject = await api.get(`/projects/${manageProject._id}`)
      setManageProject(updatedProject.data)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add member')
    }
  }

  const handleRemoveMember = async (userId) => {
    try {
      await api.delete(`/projects/${manageProject._id}/members/${userId}`)
      toast.success('Member removed')
      fetchProjects()
      // Refresh modal data
      const updatedProject = await api.get(`/projects/${manageProject._id}`)
      setManageProject(updatedProject.data)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove member')
    }
  }

  if (loading) return <div className="animate-pulse flex space-x-4"><div className="h-4 bg-slate-200 rounded w-3/4"></div></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Projects</h1>
        {user?.role === 'Admin' && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30"
          >
            <FiPlus /> New Project
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div
            key={project._id}
            onClick={() => setManageProject(project)}
            className="group bg-white rounded-2xl border border-slate-200/80 hover:border-blue-500/50 shadow-sm hover:shadow-xl hover:shadow-slate-200/60 transition-all duration-300 flex flex-col overflow-hidden cursor-pointer"
          >
            {/* Top Gradient Bar */}
            <div className="h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 w-full" />
            
            <div className="p-6 flex flex-col flex-1 gap-4">
              {/* Header: Icon & Admin Tag */}
              <div className="flex justify-between items-center gap-2">
                <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xl shadow-sm border border-blue-100 group-hover:scale-105 transition-transform">
                  <FiFolder />
                </div>
                <span className="px-2.5 py-1 bg-slate-50 border border-slate-200/80 text-slate-600 text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm">
                  <FiShield className="text-blue-600" size={12} />
                  Admin: {project.admin?.name?.split(' ')[0] || 'Unknown'}
                </span>
              </div>

              {/* Title & Description */}
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors mb-1.5">
                  {project.title}
                </h3>
                <p className="text-slate-600 text-xs line-clamp-2 leading-relaxed font-normal">
                  {project.description || <span className="text-slate-400 italic">No description provided</span>}
                </p>
              </div>

              {/* Footer: Member count & Manage button */}
              <div className="flex justify-between items-center pt-4 border-t border-slate-100/80 mt-2">
                <div className="flex items-center gap-1.5">
                  <div className="flex -space-x-2 overflow-hidden">
                    {project.members?.slice(0, 3).map((m, idx) => (
                      <div key={m._id || idx} className="inline-block h-6 w-6 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white shadow-sm">
                        {m.name ? m.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase() : 'U'}
                      </div>
                    ))}
                  </div>
                  <span className="text-xs font-semibold text-slate-600 ml-1">
                    {project.members?.length || 0} {project.members?.length === 1 ? 'Member' : 'Members'}
                  </span>
                </div>

                <button 
                  onClick={(e) => { e.stopPropagation(); setManageProject(project) }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 group-hover:bg-blue-600 text-blue-600 group-hover:text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  <FiUsers size={13} /> Manage
                </button>
              </div>
            </div>
          </div>
        ))}
        {projects.length === 0 && (
          <div className="col-span-full text-center py-10 text-slate-500 flex flex-col items-center justify-center">
            <img src="https://illustrations.popsy.co/amber/graphic-design.svg" alt="Empty" className="w-48 h-48 opacity-50 grayscale" />
            <p>No projects found. Create one to get started!</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-slate-100">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg shadow-inner">
                <FiPlus />
              </div>
              <h2 className="text-xl font-bold text-slate-800">
                Create New Project
              </h2>
            </div>
            <form onSubmit={handleCreate} className="space-y-4.5">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Project Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mobile App Redesign"
                  value={newProject.title}
                  onChange={(e) =>
                    setNewProject({ ...newProject, title: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-700 text-sm placeholder:text-slate-400 font-medium shadow-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  placeholder="What is this project about? Provide a high-level summary..."
                  value={newProject.description}
                  onChange={(e) =>
                    setNewProject({
                      ...newProject,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-700 text-sm placeholder:text-slate-400 font-medium h-24 shadow-sm resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Add Initial Members <span className="text-slate-400 font-normal lowercase">(Optional)</span>
                </label>
                <MultiSelectDropdown 
                  options={allUsers.filter(u => u._id !== user._id).map(u => ({ value: u._id, label: `${u.name} (${u.email})` }))}
                  selectedValues={newProject.members}
                  onChange={(vals) => setNewProject({ ...newProject, members: vals })}
                  placeholder="Select team members"
                />
              </div>
              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all cursor-pointer"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {manageProject && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md max-h-[85vh] flex flex-col border border-slate-100">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg shadow-inner">
                <FiUsers />
              </div>
              <h2 className="text-xl font-bold text-slate-800">
                {(user?.role === 'Admin' || manageProject.admin?._id === user?._id || manageProject.admin === user?._id) ? 'Manage Members' : 'Project Members'}
              </h2>
            </div>
            
            {(user?.role === 'Admin' || manageProject.admin?._id === user?._id || manageProject.admin === user?._id) && (() => {
              const availableUsers = allUsers.filter(u => !manageProject.members.some(m => m._id === u._id))
              return (
                <form onSubmit={handleAddMember} className="mb-6 flex gap-2">
                   <select 
                     value={newMemberEmail} 
                     onChange={(e) => setNewMemberEmail(e.target.value)} 
                     className="flex-1 px-4 py-2.5 bg-slate-50/50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-700 text-sm font-medium shadow-sm cursor-pointer" 
                     required 
                   >
                     <option value="" disabled>{availableUsers.length === 0 ? 'All users are already in this project' : 'Select a team member to add...'}</option>
                     {availableUsers.map(u => (
                       <option key={u._id} value={u.email}>{u.name} ({u.email})</option>
                     ))}
                   </select>
                   <button type="submit" disabled={availableUsers.length === 0 || !newMemberEmail} className="px-5 py-2.5 text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">Add</button>
                </form>
              )
            })()}
            
            <div className="space-y-3 flex-1 overflow-y-auto pr-2">
               <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider sticky top-0 bg-white/90 backdrop-blur py-2 z-10 flex items-center justify-between">
                 <span>Current Team Members</span>
                 <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-[10px] font-bold">{manageProject.members.length}</span>
               </h3>
               {manageProject.members.map(member => (
                 <div key={member._id} className="flex justify-between items-center p-3.5 bg-slate-50/50 hover:bg-slate-50 rounded-xl border border-slate-100 transition-colors group">
                   <div>
                     <p className="text-sm font-bold text-slate-800">{member.name}</p>
                     <p className="text-xs text-slate-500 mt-0.5">{member.email}</p>
                   </div>
                   {(user?.role === 'Admin' || manageProject.admin?._id === user?._id || manageProject.admin === user?._id) && manageProject.admin?._id !== member._id && manageProject.admin !== member._id && (
                     <button 
                       onClick={() => handleRemoveMember(member._id)} 
                       className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-80 group-hover:opacity-100 cursor-pointer" 
                       title="Remove member"
                     >
                       <FiUserMinus size={16} />
                     </button>
                   )}
                 </div>
               ))}
            </div>
            
            <div className="mt-6 pt-4 border-t border-slate-100 text-right">
              <button 
                onClick={() => setManageProject(null)} 
                className="px-5 py-2.5 text-sm font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Projects
