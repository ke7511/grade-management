import { Router } from 'express'
import { getCourses, getClasses, getStudents } from '../controllers/courseController.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

// 所有路由都需要认证
router.use(authMiddleware)

// 获取课程列表
router.get('/courses', getCourses)

// 获取班级列表
router.get('/classes', getClasses)

// 获取学生列表
router.get('/students', getStudents)

export default router
