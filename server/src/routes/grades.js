import { Router } from 'express'
import { body, validationResult } from 'express-validator'
import {
  getGrades,
  createGrades,
  updateGrade,
  deleteGrade,
  getCourseStats,
  getFailedStudents
} from '../controllers/gradeController.js'
import { authMiddleware, roleMiddleware } from '../middleware/auth.js'

const router = Router()

// 参数验证中间件
const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      code: 400,
      message: '参数验证失败',
      errors: errors.array()
    })
  }
  next()
}

// 所有路由都需要认证
router.use(authMiddleware)

// 获取成绩列表（所有角色可访问，但学生只能看自己的）
router.get('/', getGrades)

// 获取不及格学生（教师和管理员）
router.get('/failed', roleMiddleware('admin', 'teacher'), getFailedStudents)

// 获取课程成绩统计（教师和管理员）
router.get('/stats/:courseId', roleMiddleware('admin', 'teacher'), getCourseStats)

// 批量录入成绩（教师和管理员）
router.post(
  '/',
  roleMiddleware('admin', 'teacher'),
  [
    body('courseId').notEmpty().withMessage('课程ID不能为空'),
    body('semester').notEmpty().withMessage('学期不能为空'),
    body('grades').isArray().withMessage('成绩数据必须是数组')
  ],
  validate,
  createGrades
)

// 更新成绩（教师和管理员）
router.put(
  '/:id',
  roleMiddleware('admin', 'teacher'),
  [body('score').isNumeric().withMessage('成绩必须是数字')],
  validate,
  updateGrade
)

// 删除成绩（教师和管理员）
router.delete('/:id', roleMiddleware('admin', 'teacher'), deleteGrade)

export default router
