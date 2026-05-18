import express from 'express'
import {
  createTask,
  getTasksByProject,
  updateTask,
  deleteTask,
} from '../controllers/taskController.js'
import { protect } from '../middleware/authMiddleware.js'
import { admin } from '../middleware/roleMiddleware.js'

const router = express.Router()

router.post('/', protect, createTask)
router.get('/project/:projectId', protect, getTasksByProject)
router.put('/:id', protect, updateTask)
router.delete('/:id', protect, deleteTask)

export default router
