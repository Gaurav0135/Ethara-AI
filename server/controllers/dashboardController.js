import Project from '../models/Project.js'
import Task from '../models/Task.js'

// @desc    Get dashboard stats
// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user._id

    // Get all projects user is a part of
    const projects = await Project.find({ members: userId })
    const projectIds = projects.map(p => p._id)

    // Get all tasks in those projects
    const filter = { project: { $in: projectIds } }
    const isAdmin = req.user.role === 'Admin' || projects.some(p => p.admin.equals(userId))
    if (!isAdmin) {
      filter.assignedTo = userId
    }

    const tasks = await Task.find(filter).populate('assignedTo', 'name')

    const totalTasks = tasks.length
    
    // Status breakdown
    let todo = 0, inProgress = 0, done = 0
    let overdue = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const tasksPerUserMap = {}

    tasks.forEach(task => {
      if (task.status === 'To Do') todo++
      if (task.status === 'In Progress') inProgress++
      if (task.status === 'Done') done++

      // Overdue check
      if (task.status !== 'Done' && task.dueDate && new Date(task.dueDate) < today) {
        overdue++
      }

      // Tasks per user
      if (task.assignedTo) {
        const name = task.assignedTo.name
        tasksPerUserMap[name] = (tasksPerUserMap[name] || 0) + 1
      }
    })

    const completionPercentage = totalTasks === 0 ? 0 : Math.round((done / totalTasks) * 100)

    const tasksPerUser = Object.keys(tasksPerUserMap).map(name => ({
      name,
      count: tasksPerUserMap[name]
    }))

    res.status(200).json({
      totalTasks,
      todo,
      inProgress,
      done,
      overdue,
      completionPercentage,
      tasksPerUser
    })
  } catch (error) {
    next(error)
  }
}

export { getDashboardStats }
