import { Router } from 'express'
import { body, validationResult } from 'express-validator'
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  changePassword
} from '../controllers/userController.js'
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

// 用户创建/更新验证规则
const userValidation = [
  body('username').notEmpty().withMessage('用户名不能为空'),
  body('name').notEmpty().withMessage('姓名不能为空'),
  body('role').isIn(['admin', 'teacher', 'student']).withMessage('角色无效')
]

// 修改密码验证规则
const passwordValidation = [
  body('oldPassword').notEmpty().withMessage('原密码不能为空'),
  body('newPassword').isLength({ min: 6 }).withMessage('新密码长度不能少于6位')
]

// 修改密码（仅需登录，不需要管理员权限）
router.put('/password', authMiddleware, passwordValidation, validate, changePassword)

// 以下路由需要管理员权限
router.use(authMiddleware, roleMiddleware('admin'))

// 获取用户列表
router.get('/', getUsers)

// 创建用户
router.post(
  '/',
  [...userValidation, body('password').notEmpty().withMessage('密码不能为空')],
  validate,
  createUser
)

// 更新用户
router.put('/:id', userValidation, validate, updateUser)

// 删除用户
router.delete('/:id', deleteUser)

export default router
