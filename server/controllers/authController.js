import User from '../models/User.js'
import Project from '../models/Project.js'
import Task from '../models/Task.js'
import generateToken from '../utils/generateToken.js'

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })

    if (user && (await user.matchPassword(password))) {
      generateToken(res, user._id)
      res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      })
    } else {
      res.status(401)
      throw new Error('Invalid email or password')
    }
  } catch (error) {
    next(error)
  }
}

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body

    const userExists = await User.findOne({ email })

    if (userExists) {
      res.status(400)
      throw new Error('User already exists')
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'Member',
    })

    if (user) {
      generateToken(res, user._id)
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      })
    } else {
      res.status(400)
      throw new Error('Invalid user data')
    }
  } catch (error) {
    next(error)
  }
}

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Public
const logoutUser = (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
    sameSite: process.env.NODE_ENV === 'development' ? 'lax' : 'none',
    expires: new Date(0),
  })
  res.status(200).json({ message: 'Logged out successfully' })
}

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)

    if (user) {
      res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      })
    } else {
      res.status(404)
      throw new Error('User not found')
    }
  } catch (error) {
    next(error)
  }
}

// @desc    Get all users
// @route   GET /api/auth/users
// @access  Private/Admin
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).select('-password')
    res.status(200).json(users)
  } catch (error) {
    next(error)
  }
}

// @desc    Get all users with their projects and tasks details
// @route   GET /api/auth/users/details
// @access  Private/Admin
const getUsersWithDetails = async (req, res, next) => {
  try {
    const users = await User.find({}).select('-password')
    const projects = await Project.find({})
    const tasks = await Task.find({}).populate('project', 'title')

    const usersWithDetails = users.map(user => {
      // Find projects where the user is a member or admin
      const userProjects = projects.filter(p => 
        (p.admin && p.admin.equals(user._id)) || (p.members && p.members.some(m => m && m.equals(user._id)))
      )
      
      // Find tasks assigned to the user
      const userTasks = tasks.filter(t => t.assignedTo && t.assignedTo.equals(user._id))

      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        projects: userProjects.map(p => ({ _id: p._id, title: p.title })),
        tasks: userTasks.map(t => ({ 
          _id: t._id, 
          title: t.title, 
          status: t.status, 
          priority: t.priority,
          projectName: t.project?.title || 'Unknown'
        }))
      }
    })

    res.status(200).json(usersWithDetails)
  } catch (error) {
    next(error)
  }
}

export { loginUser, registerUser, logoutUser, getUserProfile, getUsers, getUsersWithDetails }
