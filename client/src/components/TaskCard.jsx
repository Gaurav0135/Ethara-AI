import { FiClock, FiCheckCircle, FiAlertCircle, FiEdit2, FiTrash2, FiPlay, FiCheck, FiRefreshCw, FiCalendar, FiUser, FiTag, FiCornerUpLeft } from 'react-icons/fi'

const TaskCard = ({ task, onEdit, onDelete, user, projectAdminId, provided, onStatusUpdate }) => {
  const isAssigned = task.assignedTo?._id === user?._id
  const isAdmin = projectAdminId === user?._id || user?.role === 'Admin'
  const canEdit = isAssigned || isAdmin
  const canUpdateStatus = isAssigned || isAdmin

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'High': return { bg: 'bg-red-50 text-red-700 border-red-200/60', icon: <FiAlertCircle className="text-red-500" />, border: 'border-l-red-500' }
      case 'Medium': return { bg: 'bg-amber-50 text-amber-700 border-amber-200/60', icon: <FiClock className="text-amber-500" />, border: 'border-l-amber-500' }
      case 'Low': return { bg: 'bg-blue-50 text-blue-700 border-blue-200/60', icon: <FiCheckCircle className="text-blue-500" />, border: 'border-l-blue-500' }
      default: return { bg: 'bg-slate-50 text-slate-700 border-slate-200/60', icon: <FiClock className="text-slate-500" />, border: 'border-l-slate-500' }
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'To Do': return 'bg-slate-100 text-slate-700 border-slate-200'
      case 'In Progress': return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'Done': return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      default: return 'bg-slate-100 text-slate-700 border-slate-200'
    }
  }

  const pStyle = getPriorityStyle(task.priority)

  // Calculate days left / overdue
  let timeBadge = null
  if (task.dueDate) {
    const due = new Date(task.dueDate)
    const now = new Date()
    now.setHours(0,0,0,0)
    due.setHours(0,0,0,0)
    const diffTime = due - now
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (task.status === 'Done') {
      timeBadge = <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5"><FiCheckCircle size={12} /> Completed</span>
    } else if (diffDays < 0) {
      timeBadge = <span className="bg-red-50 text-red-700 border border-red-200/60 px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 animate-pulse"><FiAlertCircle size={12} /> Overdue ({Math.abs(diffDays)}d)</span>
    } else if (diffDays === 0) {
      timeBadge = <span className="bg-amber-50 text-amber-700 border border-amber-200/60 px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5"><FiClock size={12} /> Due Today</span>
    } else {
      timeBadge = <span className="bg-slate-50 text-slate-700 border border-slate-200/60 px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5"><FiCalendar size={12} /> {diffDays}d left</span>
    }
  }

  // Get Initials
  const getInitials = (name) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  }

  return (
    <div 
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      className={`group bg-white rounded-2xl border border-slate-200/80 hover:border-blue-500/50 p-5 shadow-sm hover:shadow-xl hover:shadow-slate-200/60 transition-all duration-300 border-l-4 ${pStyle.border} flex flex-col gap-4`}
    >
      {/* Top Header: Priority Badge & Actions */}
      <div className="flex justify-between items-center gap-2">
        <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 shadow-sm ${pStyle.bg}`}>
          {pStyle.icon}
          {task.priority} Priority
        </span>

        {canEdit && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-50 border border-slate-200/80 rounded-xl p-1 shadow-sm">
             <button onClick={() => onEdit(task)} className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-white rounded-lg transition-all cursor-pointer" title="Edit Task">
               <FiEdit2 size={14} />
             </button>
             {isAdmin && (
               <button onClick={() => onDelete(task._id)} className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-white rounded-lg transition-all cursor-pointer" title="Delete Task">
                 <FiTrash2 size={14} />
               </button>
             )}
          </div>
        )}
      </div>

      {/* Title & Description */}
      <div>
        <h4 className="text-base font-bold text-slate-800 group-hover:text-blue-600 transition-colors mb-1.5 pr-2 break-words leading-snug">{task.title}</h4>
        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-normal">
          {task.description || <span className="text-slate-400 italic">No description provided</span>}
        </p>
      </div>
      
      {/* Assignee & Due Date */}
      <div className="flex justify-between items-center gap-2 pt-2 border-t border-slate-100/80">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-sm border border-white">
            {getInitials(task.assignedTo?.name)}
          </div>
          <span className="text-xs font-semibold text-slate-700 max-w-[120px] truncate">
            {task.assignedTo?.name || 'Unassigned'}
          </span>
        </div>
        {timeBadge}
      </div>

      {/* Bottom Footer: Status Badge & Quick Move Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100/80 bg-slate-50/50 -mx-5 -mb-5 p-4 rounded-b-2xl">
        <span className={`text-xs px-3 py-1.5 rounded-xl font-bold border shadow-sm flex items-center gap-1.5 ${getStatusBadge(task.status)}`}>
          <FiTag size={12} />
          {task.status}
        </span>
        
        {canUpdateStatus && onStatusUpdate && (
          <div className="flex items-center gap-2 flex-wrap">
            {task.status === 'To Do' && (
              <>
                <button 
                  onClick={() => onStatusUpdate(task._id, 'In Progress')}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-all shadow-sm shadow-blue-500/20 flex items-center gap-1.5 cursor-pointer"
                  title="Start Task"
                >
                  <FiPlay size={12} /> Start
                </button>
                <button 
                  onClick={() => onStatusUpdate(task._id, 'Done')}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-all shadow-sm shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer"
                  title="Mark as Done"
                >
                  <FiCheck size={12} /> Done
                </button>
              </>
            )}
            {task.status === 'In Progress' && (
              <>
                <button 
                  onClick={() => onStatusUpdate(task._id, 'To Do')}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                  title="Move to To Do"
                >
                  <FiCornerUpLeft size={12} /> To Do
                </button>
                <button 
                  onClick={() => onStatusUpdate(task._id, 'Done')}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-all shadow-sm shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer"
                  title="Mark as Done"
                >
                  <FiCheck size={12} /> Done
                </button>
              </>
            )}
            {task.status === 'Done' && (
              <button 
                onClick={() => onStatusUpdate(task._id, 'In Progress')}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-all shadow-sm shadow-blue-500/20 flex items-center gap-1.5 cursor-pointer"
                title="Reopen Task"
              >
                <FiRefreshCw size={12} /> Reopen
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default TaskCard
