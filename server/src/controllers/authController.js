import pool from '../config/db.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// 用户登录
export async function login(req, res) {
  try {
    const { username, password, role } = req.body

    // 查询用户
    const [rows] = await pool.execute('SELECT * FROM users WHERE username = ? AND role = ?', [
      username,
      role
    ])

    if (rows.length === 0) {
      return res.status(401).json({
        code: 401,
        message: '用户名或密码错误'
      })
    }

    const user = rows[0]

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return res.status(401).json({
        code: 401,
        message: '用户名或密码错误'
      })
    }

    // 检查用户状态
    if (user.status !== 1) {
      return res.status(403).json({
        code: 403,
        message: '账户已被禁用'
      })
    }

    // 生成 JWT
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )

    res.json({
      code: 200,
      message: '登录成功',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role
        }
      }
    })
  } catch (error) {
    console.error('登录错误:', error)
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    })
  }
}

// 获取当前用户信息
export async function getUserInfo(req, res) {
  try {
    const userId = req.user.id

    // 基本用户信息
    const [users] = await pool.execute(
      'SELECT id, username, name, role, status, created_at FROM users WHERE id = ?',
      [userId]
    )

    if (users.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在'
      })
    }

    const user = users[0]

    // 如果是学生，查询学号、班级、专业等信息
    if (user.role === 'student') {
      const [students] = await pool.execute(
        `SELECT s.student_id as studentCode, c.name as className, c.major
         FROM students s
         LEFT JOIN classes c ON s.class_id = c.id
         WHERE s.user_id = ?`,
        [userId]
      )

      if (students.length > 0) {
        user.studentCode = students[0].studentCode
        user.className = students[0].className
        user.major = students[0].major
      }
    }

    res.json({
      code: 200,
      data: user
    })
  } catch (error) {
    console.error('获取用户信息错误:', error)
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    })
  }
}

// 用户登出（前端清除 token 即可，这里仅作为接口）
export function logout(req, res) {
  res.json({
    code: 200,
    message: '登出成功'
  })
}
