import express from 'express'
import {
  loginUser,
  registerUser,
  logoutUser,
  getUserProfile,
  getUsers,
  getUsersWithDetails,
} from '../controllers/authController.js'
import { protect } from '../middleware/authMiddleware.js'
import { admin } from '../middleware/roleMiddleware.js'

const router = express.Router()

router.post('/register', registerUser)
router.post('/login', loginUser)
router.post('/logout', logoutUser)
router.get('/me', protect, getUserProfile)
router.get('/users', protect, admin, getUsers)
router.get('/users/details', protect, admin, getUsersWithDetails)

export default router
