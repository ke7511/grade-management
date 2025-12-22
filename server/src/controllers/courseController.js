import pool from '../config/db.js'

// 获取课程列表（教师只返回分配的课程，管理员返回全部）
export async function getCourses(req, res) {
  try {
    const { role, id: userId } = req.user

    let sql
    let params = []

    if (role === 'teacher') {
      // 教师只能看到自己负责的课程（从 users 表读取 course_id）
      sql = `
        SELECT c.* FROM courses c
        WHERE c.id = (SELECT course_id FROM users WHERE id = ?)
      `
      params = [userId]
    } else {
      // 管理员和其他角色可以看到所有课程
      sql = 'SELECT * FROM courses ORDER BY id'
    }

    const [rows] = await pool.execute(sql, params)
    res.json({
      code: 200,
      data: rows
    })
  } catch (error) {
    console.error('获取课程列表错误:', error)
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    })
  }
}

// 获取班级列表（教师只返回分配的班级，管理员返回全部）
export async function getClasses(req, res) {
  try {
    const { role, id: userId } = req.user

    let sql
    let params = []

    if (role === 'teacher') {
      // 教师只能看到自己负责的班级
      sql = `
        SELECT c.*, COUNT(s.id) as student_count
        FROM classes c
        LEFT JOIN students s ON c.id = s.class_id
        WHERE c.id = (SELECT class_id FROM users WHERE id = ?)
        GROUP BY c.id
      `
      params = [userId]
    } else {
      sql = `
        SELECT c.*, COUNT(s.id) as student_count
        FROM classes c
        LEFT JOIN students s ON c.id = s.class_id
        GROUP BY c.id
        ORDER BY c.id
      `
    }

    const [rows] = await pool.execute(sql, params)
    res.json({
      code: 200,
      data: rows
    })
  } catch (error) {
    console.error('获取班级列表错误:', error)
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    })
  }
}

// 获取学生列表
export async function getStudents(req, res) {
  try {
    const { classId } = req.query

    let sql = `
      SELECT s.id, s.student_id as studentCode, u.name as studentName,
             s.class_id as classId, c.name as className
      FROM students s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN classes c ON s.class_id = c.id
      WHERE 1=1
    `
    const params = []

    if (classId) {
      sql += ' AND s.class_id = ?'
      params.push(classId)
    }

    sql += ' ORDER BY s.student_id'

    const [rows] = await pool.execute(sql, params)
    res.json({
      code: 200,
      data: rows
    })
  } catch (error) {
    console.error('获取学生列表错误:', error)
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    })
  }
}
