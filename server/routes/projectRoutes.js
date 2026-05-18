import express from 'express'
import {
  createProject,
  getProjects,
  getProjectById,
  addMemberToProject,
  removeMemberFromProject,
} from '../controllers/projectController.js'
import { protect } from '../middleware/authMiddleware.js'
import { admin } from '../middleware/roleMiddleware.js'

const router = express.Router()

router.post('/', protect, createProject)
router.get('/', protect, getProjects)
router.get('/:id', protect, getProjectById)
router.post('/:id/members', protect, addMemberToProject)
router.delete('/:id/members/:userId', protect, removeMemberFromProject)

export default router
