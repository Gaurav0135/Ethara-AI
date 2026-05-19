import { useState, useEffect } from 'react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import TaskCard from '../components/TaskCard'
import { FiPlus, FiSearch, FiFilter, FiEdit } from 'react-icons/fi'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import toast from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import MultiSelectDropdown from '../components/MultiSelectDropdown'

const Tasks = () => {
  const [projects, setProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState('')
  const [tasks, setTasks] = useState([])
  const [allUsers, setAllUsers] = useState([])
  const [loading, setLoading] = useState(true)
  
  const [showModal, setShowModal] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  
  // Filtering
  const [searchQuery, setSearchQuery] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('All')

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm()
  const assignedToValue = watch('assignedTo') || []

  const { user } = useAuth()

  useEffect(() => {
    const init = async () => {
      try {
        const res = await api.get('/projects')
        setProjects(res.data)
        if (res.data.length > 0) {
          setSelectedProject(res.data[0]._id)
        }
        
        const usersRes = await api.get('/auth/users').catch(() => null)
        if (usersRes) setAllUsers(usersRes.data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  useEffect(() => {
    if (!selectedProject) return
    const fetchTasks = async () => {
      try {
        const res = await api.get(`/tasks/project/${selectedProject}`)
        setTasks(res.data)
      } catch (error) {
        toast.error('Failed to load tasks')
      }
    }
    fetchTasks()
  }, [selectedProject])

  const openModal = (task = null) => {
    setEditingTask(task)
    if (task) {
      setValue('title', task.title)
      setValue('description', task.description)
      setValue('priority', task.priority)
      setValue('dueDate', task.dueDate ? task.dueDate.split('T')[0] : '')
      setValue('assignedTo', task.assignedTo?._id || '')
      setValue('status', task.status)
    } else {
      reset({ title: '', description: '', priority: 'Medium', dueDate: '', assignedTo: [], status: 'To Do' })
    }
    setShowModal(true)
  }

  const onSubmit = async (data) => {
    try {
      if (editingTask) {
        const payload = { ...data, assignedTo: Array.isArray(data.assignedTo) ? data.assignedTo[0] : data.assignedTo }
        const res = await api.put(`/tasks/${editingTask._id}`, payload)
        const updatedTask = res.data
        // Manually attach populated assignee for UI
        const assignee = allUsers.find(u => u._id === payload.assignedTo)
        if (assignee) updatedTask.assignedTo = { _id: assignee._id, name: assignee.name, email: assignee.email }
        
        setTasks(tasks.map(t => t._id === editingTask._id ? updatedTask : t))
        toast.success('Task updated')
      } else {
        const assignees = Array.isArray(data.assignedTo) ? data.assignedTo : [data.assignedTo]
        
        const newTasks = []
        for (let assigneeId of assignees) {
          if (!assigneeId) continue;
          const payload = { ...data, assignedTo: assigneeId, projectId: selectedProject }
          const res = await api.post('/tasks', payload)
          const createdTask = res.data
          const assignee = allUsers.find(u => u._id === assigneeId)
          if (assignee) createdTask.assignedTo = { _id: assignee._id, name: assignee.name, email: assignee.email }
          newTasks.push(createdTask)
        }
        
        setTasks([...tasks, ...newTasks])
        toast.success(`Created ${newTasks.length} task(s) successfully!`)
      }
      setShowModal(false)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed')
    }
  }

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return
    try {
      await api.delete(`/tasks/${taskId}`)
      setTasks(tasks.filter(t => t._id !== taskId))
      toast.success('Task deleted')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete task')
    }
  }

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result
    if (!destination) return
    if (destination.droppableId === source.droppableId && destination.index === source.index) return

    const newStatus = destination.droppableId
    const previousTasks = [...tasks]
    
    setTasks(tasks.map(t => t._id === draggableId ? { ...t, status: newStatus } : t))

    try {
      await api.put(`/tasks/${draggableId}`, { status: newStatus })
      toast.success('Status updated')
    } catch (error) {
      toast.error('Failed to update status')
      setTasks(previousTasks)
    }
  }

  const handleStatusUpdate = async (taskId, newStatus) => {
    const previousTasks = [...tasks]
    setTasks(tasks.map(t => t._id === taskId ? { ...t, status: newStatus } : t))
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus })
      toast.success(`Task moved to ${newStatus}`)
    } catch (error) {
      toast.error('Failed to update status')
      setTasks(previousTasks)
    }
  }

  if (loading) return <div className="animate-pulse flex space-x-4"><div className="h-4 bg-slate-200 rounded w-3/4"></div></div>

  const currentProject = projects.find((p) => p._id === selectedProject)
  
  // Filter Tasks
  const filteredTasks = tasks.filter(task => {
    const matchSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchPriority = priorityFilter === 'All' || task.priority === priorityFilter
    return matchSearch && matchPriority
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-slate-800">Tasks</h1>
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm font-medium shadow-sm cursor-pointer disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed"
            disabled={projects.length === 0}
          >
            {projects.length === 0 ? (
              <option value="" disabled>No projects available</option>
            ) : (
              projects.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.title}
                </option>
              ))
            )}
          </select>
        </div>
        {projects.length > 0 && (user?.role === 'Admin' || currentProject?.admin?._id === user?._id || currentProject?.admin === user?._id) && (
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30 text-sm font-semibold cursor-pointer"
          >
            <FiPlus /> New Task
          </button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-sm flex flex-col items-center justify-center min-h-[400px]">
          <img src="https://illustrations.popsy.co/amber/keynote-presentation.svg" alt="No Projects" className="w-64 h-64 opacity-60 mb-4 grayscale" />
          <h3 className="text-xl font-bold text-slate-800 mb-2">No Projects Found</h3>
          <p className="text-slate-500 text-sm max-w-md mb-6 leading-relaxed">
            You need to be part of a project to view and manage tasks. Head over to the Projects tab to create your first project or get invited by an administrator.
          </p>
        </div>
      ) : (
        <>
          <div className="flex gap-4 items-center bg-white p-3 rounded-xl shadow-sm border border-slate-100">
            <div className="flex-1 relative">
               <FiSearch className="absolute left-3 top-3 text-slate-400" />
               <input 
                 type="text" 
                 placeholder="Search tasks..." 
                 value={searchQuery}
                 onChange={e => setSearchQuery(e.target.value)}
                 className="w-full pl-10 pr-4 py-2 border-none outline-none focus:ring-0 bg-transparent"
               />
            </div>
            <div className="h-6 w-px bg-slate-200"></div>
            <div className="flex items-center gap-2 px-3">
              <FiFilter className="text-slate-400" />
              <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} className="border-none outline-none text-sm bg-transparent cursor-pointer">
                <option value="All">All Priorities</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          <DragDropContext onDragEnd={onDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {['To Do', 'In Progress', 'Done'].map((status) => {
                const columnTasks = filteredTasks.filter(t => t.status === status)
                return (
                  <div
                    key={status}
                    className="bg-slate-100/50 p-4 rounded-2xl h-[calc(100vh-250px)] flex flex-col"
                  >
                    <h3 className="font-semibold text-slate-700 mb-4 sticky top-0 py-2 z-10 px-2 rounded flex items-center justify-between">
                      {status}
                      <span className="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded-full">
                        {columnTasks.length}
                      </span>
                    </h3>
                    <Droppable droppableId={status}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`flex-1 overflow-y-auto space-y-4 px-2 pb-4 transition-colors rounded-lg ${snapshot.isDraggingOver ? 'bg-slate-200/50' : ''}`}
                        >
                          {columnTasks.map((task, index) => (
                            <Draggable key={task._id} draggableId={task._id} index={index} isDragDisabled={false}>
                              {(provided) => (
                                <TaskCard
                                  task={task}
                                  user={user}
                                  projectAdminId={currentProject?.admin?._id}
                                  onEdit={openModal}
                                  onDelete={handleDeleteTask}
                                  provided={provided}
                                  onStatusUpdate={handleStatusUpdate}
                                />
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                )
              })}
            </div>
          </DragDropContext>
        </>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto border border-slate-100">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg shadow-inner">
                {editingTask ? <FiEdit /> : <FiPlus />}
              </div>
              <h2 className="text-xl font-bold text-slate-800">
                {editingTask ? 'Edit Task' : 'Create New Task'}
              </h2>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4.5">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Task Title</label>
                <input
                  type="text"
                  placeholder="e.g. Design landing page"
                  {...register('title', { required: 'Title is required' })}
                  className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-700 text-sm placeholder:text-slate-400 font-medium shadow-sm"
                />
                {errors.title && <p className="text-red-500 text-xs mt-1 font-medium">{errors.title.message}</p>}
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Description</label>
                <textarea
                  placeholder="Provide details about the task..."
                  {...register('description')}
                  className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-700 text-sm placeholder:text-slate-400 font-medium h-24 shadow-sm resize-none"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Priority</label>
                  <select
                    {...register('priority')}
                    className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-700 text-sm font-medium shadow-sm cursor-pointer"
                  >
                    <option value="Low">Low Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="High">High Priority</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Due Date</label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    {...register('dueDate')}
                    className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-700 text-sm font-medium shadow-sm cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Status</label>
                <select
                  {...register('status')}
                  className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-700 text-sm font-medium shadow-sm cursor-pointer"
                >
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Done">Done</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Assign To</label>
                {editingTask ? (
                  <select
                    {...register('assignedTo', { required: 'Please assign to an employee' })}
                    className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-700 text-sm font-medium shadow-sm cursor-pointer"
                  >
                    <option value="" disabled>Select an employee</option>
                    {allUsers.map((member) => (
                      <option key={member._id} value={member._id}>
                        {member.name} ({member.email})
                      </option>
                    ))}
                  </select>
                ) : (
                  <>
                    <MultiSelectDropdown 
                      options={allUsers.map(member => ({ value: member._id, label: `${member.name} (${member.email})` }))}
                      selectedValues={Array.isArray(assignedToValue) ? assignedToValue : [assignedToValue].filter(Boolean)}
                      onChange={(vals) => setValue('assignedTo', vals, { shouldValidate: true })}
                      placeholder="Select team members"
                    />
                    <input 
                      type="hidden" 
                      {...register('assignedTo', { required: 'Please assign to at least one employee' })} 
                    />
                  </>
                )}
                {errors.assignedTo && <p className="text-red-500 text-xs mt-1 font-medium">{errors.assignedTo.message}</p>}
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
                  {editingTask ? 'Save Changes' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Tasks
