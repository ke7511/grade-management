import pool from '../config/db.js'
import bcrypt from 'bcryptjs'

// 获取用户列表
export async function getUsers(req, res) {
  try {
    const { keyword, role } = req.query

    let sql = 'SELECT id, username, name, role, class_id, course_id, status, created_at FROM users WHERE 1=1'
    const params = []

    if (keyword) {
      sql += ' AND (username LIKE ? OR name LIKE ?)'
      params.push(`%${keyword}%`, `%${keyword}%`)
    }

    if (role) {
      sql += ' AND role = ?'
      params.push(role)
    }

    sql += ' ORDER BY created_at DESC'

    const [rows] = await pool.execute(sql, params)

    res.json({
      code: 200,
      data: rows
    })
  } catch (error) {
    console.error('获取用户列表错误:', error)
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    })
  }
}

// 创建用户
export async function createUser(req, res) {
  try {
    const { username, password, name, role, class_id, course_id, status = 1 } = req.body

    // 检查用户名是否已存在
    const [existing] = await pool.execute('SELECT id FROM users WHERE username = ?', [username])

    if (existing.length > 0) {
      return res.status(400).json({
        code: 400,
        message: '用户名已存在'
      })
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10)

    // 插入用户
    const [result] = await pool.execute(
      'INSERT INTO users (username, password, name, role, class_id, course_id, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [username, hashedPassword, name, role, class_id || null, course_id || null, status]
    )

    // 如果是学生角色，同步创建 students 表记录
    if (role === 'student' && class_id) {
      await pool.execute(
        'INSERT INTO students (student_id, user_id, class_id) VALUES (?, ?, ?)',
        [username, result.insertId, class_id]
      )
    }

    res.json({
      code: 200,
      message: '用户创建成功',
      data: { id: result.insertId }
    })
  } catch (error) {
    console.error('创建用户错误:', error)
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    })
  }
}

// 更新用户
export async function updateUser(req, res) {
  try {
    const { id } = req.params
    const { username, password, name, role, class_id, course_id, status } = req.body

    // 检查用户是否存在
    const [existing] = await pool.execute('SELECT id FROM users WHERE id = ?', [id])
    if (existing.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在'
      })
    }

    // 构建更新语句
    let sql = 'UPDATE users SET username = ?, name = ?, role = ?, class_id = ?, course_id = ?, status = ?'
    const params = [username, name, role, class_id || null, course_id || null, status]

    // 如果提供了新密码，则更新密码
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10)
      sql += ', password = ?'
      params.push(hashedPassword)
    }

    sql += ' WHERE id = ?'
    params.push(id)

    await pool.execute(sql, params)

    // 如果是学生角色，同步更新 students 表的 class_id
    if (role === 'student') {
      // 检查是否已有 students 记录
      const [studentRecord] = await pool.execute('SELECT id FROM students WHERE user_id = ?', [id])
      if (studentRecord.length > 0) {
        // 更新现有记录
        await pool.execute('UPDATE students SET class_id = ? WHERE user_id = ?', [class_id || null, id])
      } else if (class_id) {
        // 创建新记录
        const [user] = await pool.execute('SELECT username FROM users WHERE id = ?', [id])
        if (user.length > 0) {
          await pool.execute(
            'INSERT INTO students (student_id, user_id, class_id) VALUES (?, ?, ?)',
            [user[0].username, id, class_id]
          )
        }
      }
    }

    res.json({
      code: 200,
      message: '用户更新成功'
    })
  } catch (error) {
    console.error('更新用户错误:', error)
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    })
  }
}

// 删除用户
export async function deleteUser(req, res) {
  try {
    const { id } = req.params

    // 不能删除自己
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({
        code: 400,
        message: '不能删除自己的账户'
      })
    }

    const [result] = await pool.execute('DELETE FROM users WHERE id = ?', [id])

    if (result.affectedRows === 0) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在'
      })
    }

    res.json({
      code: 200,
      message: '用户删除成功'
    })
  } catch (error) {
    console.error('删除用户错误:', error)
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    })
  }
}

// 修改密码（用户自己修改）
export async function changePassword(req, res) {
  try {
    const { oldPassword, newPassword } = req.body
    const userId = req.user.id

    // 获取用户当前密码
    const [users] = await pool.execute('SELECT password FROM users WHERE id = ?', [userId])
    if (users.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在'
      })
    }

    // 验证原密码
    const isValid = await bcrypt.compare(oldPassword, users[0].password)
    if (!isValid) {
      return res.status(400).json({
        code: 400,
        message: '原密码错误'
      })
    }

    // 加密新密码并更新
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    await pool.execute('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId])

    res.json({
      code: 200,
      message: '密码修改成功'
    })
  } catch (error) {
    console.error('修改密码错误:', error)
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    })
  }
}
