import Task from '../models/Task.js'
import Project from '../models/Project.js'

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private/Admin
const createTask = async (req, res, next) => {
  try {
    const { title, description, priority, dueDate, assignedTo, projectId } =
      req.body

    const project = await Project.findById(projectId)
    if (!project) {
      res.status(404)
      throw new Error('Project not found')
    }

    if (!project.admin.equals(req.user._id)) {
      res.status(403)
      throw new Error('Not authorized to create tasks for this project')
    }

    const task = await Task.create({
      title,
      description,
      priority,
      dueDate,
      assignedTo,
      project: projectId,
    })

    project.tasks.push(task._id)
    
    // Automatically add assignee to project members if not already
    if (assignedTo && !project.members.includes(assignedTo)) {
      project.members.push(assignedTo)
    }
    
    await project.save()

    res.status(201).json(task)
  } catch (error) {
    next(error)
  }
}

// @desc    Get all tasks for a project
// @route   GET /api/tasks/project/:projectId
// @access  Private
const getTasksByProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId)

    if (!project) {
      res.status(404)
      throw new Error('Project not found')
    }

    if (!project.members.includes(req.user._id)) {
      res.status(403)
      throw new Error('Not authorized to view tasks for this project')
    }

    const isAdmin = project.admin.equals(req.user._id) || req.user.role === 'Admin'

    const filter = { project: req.params.projectId }
    if (!isAdmin) {
      filter.assignedTo = req.user._id
    }

    const tasks = await Task.find(filter).populate(
      'assignedTo',
      'name email'
    )
    res.status(200).json(tasks)
  } catch (error) {
    next(error)
  }
}

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res, next) => {
  try {
    const { title, description, priority, dueDate, status, assignedTo } = req.body

    const task = await Task.findById(req.params.id)

    if (!task) {
      res.status(404)
      throw new Error('Task not found')
    }

    const project = await Project.findById(task.project)
    
    const isAdmin = project.admin.equals(req.user._id) || req.user.role === 'Admin'
    const isAssigned = task.assignedTo && task.assignedTo.equals(req.user._id)
    
    if (!isAdmin && !isAssigned) {
      res.status(403)
      throw new Error('Not authorized to update this task. You can only update your own tasks.')
    }

    if (title) task.title = title
    if (description !== undefined) task.description = description
    if (priority) task.priority = priority
    if (dueDate) task.dueDate = dueDate
    if (status) task.status = status

    if (isAdmin && assignedTo !== undefined) {
      task.assignedTo = assignedTo
    }

    const updatedTask = await task.save()
    await updatedTask.populate('assignedTo', 'name email')
    res.status(200).json(updatedTask)
  } catch (error) {
    next(error)
  }
}

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private/Admin
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)

    if (!task) {
      res.status(404)
      throw new Error('Task not found')
    }

    const project = await Project.findById(task.project)

    if (!project.admin.equals(req.user._id)) {
      res.status(403)
      throw new Error('Not authorized to delete this task')
    }

    await Task.deleteOne({ _id: task._id })

    // Remove task from project
    project.tasks = project.tasks.filter((tId) => !tId.equals(task._id))
    await project.save()

    res.status(200).json({ message: 'Task removed' })
  } catch (error) {
    next(error)
  }
}

export { createTask, getTasksByProject, updateTask, deleteTask }
