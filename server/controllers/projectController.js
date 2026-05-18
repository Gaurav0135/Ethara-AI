import Project from '../models/Project.js'
import User from '../models/User.js'

// @desc    Create a project
// @route   POST /api/projects
// @access  Private/Admin
const createProject = async (req, res, next) => {
  try {
    const { title, description, members } = req.body

    const memberIds = [req.user._id]
    if (members && Array.isArray(members)) {
      members.forEach(id => {
        if (id && id !== req.user._id.toString()) memberIds.push(id)
      })
    }

    const project = await Project.create({
      title,
      description,
      admin: req.user._id,
      members: memberIds,
    })

    // Add project to all initial members
    await User.updateMany(
      { _id: { $in: memberIds } },
      { $push: { projects: project._id } }
    )

    res.status(201).json(project)
  } catch (error) {
    next(error)
  }
}

// @desc    Get all projects for logged-in user
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res, next) => {
  try {
    // Return only projects where the logged-in user is a member
    const projects = await Project.find({ members: req.user._id })
      .populate('admin', 'name email')
      .populate('members', 'name email')

    res.status(200).json(projects)
  } catch (error) {
    next(error)
  }
}

// @desc    Get single project by ID
// @route   GET /api/projects/:id
// @access  Private
const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('admin', 'name email')
      .populate('members', 'name email')
      .populate('tasks')

    if (
      project &&
      project.members.some((member) => member._id.equals(req.user._id))
    ) {
      res.status(200).json(project)
    } else {
      res.status(404)
      throw new Error('Project not found or not authorized')
    }
  } catch (error) {
    next(error)
  }
}

// @desc    Add member to project
// @route   POST /api/projects/:id/members
// @access  Private/Admin
const addMemberToProject = async (req, res, next) => {
  try {
    const { email } = req.body
    const project = await Project.findById(req.params.id)

    if (!project) {
      res.status(404)
      throw new Error('Project not found')
    }

    if (!project.admin.equals(req.user._id)) {
      res.status(403)
      throw new Error('Not authorized as project admin')
    }

    const user = await User.findOne({ email })
    if (!user) {
      res.status(404)
      throw new Error('User not found')
    }

    if (project.members.includes(user._id)) {
      res.status(400)
      throw new Error('User is already a member of this project')
    }

    project.members.push(user._id)
    await project.save()

    user.projects.push(project._id)
    await user.save()

    res.status(200).json(project)
  } catch (error) {
    next(error)
  }
}

// @desc    Remove member from project
// @route   DELETE /api/projects/:id/members/:userId
// @access  Private/Admin
const removeMemberFromProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)

    if (!project) {
      res.status(404)
      throw new Error('Project not found')
    }

    if (!project.admin.equals(req.user._id)) {
      res.status(403)
      throw new Error('Not authorized as project admin')
    }

    const userId = req.params.userId
    
    if (project.admin.equals(userId)) {
      res.status(400)
      throw new Error('Cannot remove the project admin')
    }

    project.members = project.members.filter(m => m.toString() !== userId)
    await project.save()

    const user = await User.findById(userId)
    if (user) {
      user.projects = user.projects.filter(p => p.toString() !== project._id.toString())
      await user.save()
    }

    res.status(200).json(project)
  } catch (error) {
    next(error)
  }
}

export { createProject, getProjects, getProjectById, addMemberToProject, removeMemberFromProject }
