import { Router } from 'express'
import { body, validationResult } from 'express-validator'
import { login, getUserInfo, logout } from '../controllers/authController.js'
import { authMiddleware } from '../middleware/auth.js'

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

// 登录验证规则
const loginValidation = [
  body('username').notEmpty().withMessage('用户名不能为空'),
  body('password').notEmpty().withMessage('密码不能为空'),
  body('role').isIn(['admin', 'teacher', 'student']).withMessage('角色无效')
]

// 登录
router.post('/login', loginValidation, validate, login)

// 获取当前用户信息（需要认证）
router.get('/info', authMiddleware, getUserInfo)

// 登出
router.post('/logout', authMiddleware, logout)

export default router
