import pool from '../config/db.js'

// 获取成绩列表
export async function getGrades(req, res) {
  try {
    const { keyword, courseId, classId, semester } = req.query
    const { role, id: userId } = req.user

    let sql = `
      SELECT
        g.id, g.score, g.semester, g.created_at,
        s.id as student_id, s.student_id as student_code,
        u.name as student_name,
        c.id as course_id, c.name as course_name, c.code as course_code,
        cl.id as class_id, cl.name as class_name
      FROM grades g
      JOIN students s ON g.student_id = s.id
      JOIN users u ON s.user_id = u.id
      JOIN courses c ON g.course_id = c.id
      LEFT JOIN classes cl ON s.class_id = cl.id
      WHERE 1=1
    `
    const params = []

    // 学生只能查看自己的成绩
    if (role === 'student') {
      sql += ' AND s.user_id = ?'
      params.push(userId)
    }

    if (keyword) {
      sql += ' AND (u.name LIKE ? OR s.student_id LIKE ?)'
      params.push(`%${keyword}%`, `%${keyword}%`)
    }

    if (courseId) {
      sql += ' AND g.course_id = ?'
      params.push(courseId)
    }

    if (classId) {
      sql += ' AND s.class_id = ?'
      params.push(classId)
    }

    if (semester) {
      sql += ' AND g.semester = ?'
      params.push(semester)
    }

    sql += ' ORDER BY g.created_at DESC'

    const [rows] = await pool.execute(sql, params)

    res.json({
      code: 200,
      data: rows
    })
  } catch (error) {
    console.error('获取成绩列表错误:', error)
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    })
  }
}

// 批量录入成绩（如果已存在则更新）
export async function createGrades(req, res) {
  try {
    const { courseId, semester, grades } = req.body

    if (!grades || grades.length === 0) {
      return res.status(400).json({
        code: 400,
        message: '成绩数据不能为空'
      })
    }

    const connection = await pool.getConnection()
    await connection.beginTransaction()

    try {
      let insertCount = 0
      let updateCount = 0

      for (const grade of grades) {
        // 检查是否已存在该学生在该课程该学期的成绩
        const [existing] = await connection.execute(
          'SELECT id FROM grades WHERE student_id = ? AND course_id = ? AND semester = ?',
          [grade.studentId, courseId, semester]
        )

        if (existing.length > 0) {
          // 已存在，更新成绩
          await connection.execute('UPDATE grades SET score = ? WHERE id = ?', [
            grade.score,
            existing[0].id
          ])
          updateCount++
        } else {
          // 不存在，插入新记录
          await connection.execute(
            'INSERT INTO grades (student_id, course_id, score, semester) VALUES (?, ?, ?, ?)',
            [grade.studentId, courseId, grade.score, semester]
          )
          insertCount++
        }
      }

      await connection.commit()
      connection.release()

      res.json({
        code: 200,
        message: `成功录入 ${insertCount} 条新成绩，更新 ${updateCount} 条已有成绩`
      })
    } catch (error) {
      await connection.rollback()
      connection.release()
      throw error
    }
  } catch (error) {
    console.error('录入成绩错误:', error)
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    })
  }
}

// 更新成绩
export async function updateGrade(req, res) {
  try {
    const { id } = req.params
    const { score } = req.body

    const [result] = await pool.execute('UPDATE grades SET score = ? WHERE id = ?', [score, id])

    if (result.affectedRows === 0) {
      return res.status(404).json({
        code: 404,
        message: '成绩记录不存在'
      })
    }

    res.json({
      code: 200,
      message: '成绩更新成功'
    })
  } catch (error) {
    console.error('更新成绩错误:', error)
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    })
  }
}

// 删除成绩
export async function deleteGrade(req, res) {
  try {
    const { id } = req.params

    const [result] = await pool.execute('DELETE FROM grades WHERE id = ?', [id])

    if (result.affectedRows === 0) {
      return res.status(404).json({
        code: 404,
        message: '成绩记录不存在'
      })
    }

    res.json({
      code: 200,
      message: '成绩删除成功'
    })
  } catch (error) {
    console.error('删除成绩错误:', error)
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    })
  }
}

// 获取课程成绩统计
export async function getCourseStats(req, res) {
  try {
    const { courseId } = req.params

    const [rows] = await pool.execute(
      `SELECT
        COUNT(*) as total,
        AVG(score) as average,
        MAX(score) as max_score,
        MIN(score) as min_score,
        SUM(CASE WHEN score >= 60 THEN 1 ELSE 0 END) as pass_count,
        SUM(CASE WHEN score < 60 THEN 1 ELSE 0 END) as fail_count
      FROM grades WHERE course_id = ?`,
      [courseId]
    )

    const stats = rows[0]
    const passRate = stats.total > 0 ? ((stats.pass_count / stats.total) * 100).toFixed(1) : 0

    res.json({
      code: 200,
      data: {
        total: stats.total,
        average: stats.average ? parseFloat(stats.average).toFixed(1) : 0,
        max: stats.max_score || 0,
        min: stats.min_score || 0,
        passCount: stats.pass_count || 0,
        failCount: stats.fail_count || 0,
        passRate
      }
    })
  } catch (error) {
    console.error('获取成绩统计错误:', error)
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    })
  }
}

// 获取不及格学生列表
export async function getFailedStudents(req, res) {
  try {
    const { courseId, passScore = 60 } = req.query

    let sql = `
      SELECT
        g.id, g.score, g.semester,
        s.student_id as student_code,
        u.name as student_name,
        c.name as course_name,
        cl.name as class_name
      FROM grades g
      JOIN students s ON g.student_id = s.id
      JOIN users u ON s.user_id = u.id
      JOIN courses c ON g.course_id = c.id
      LEFT JOIN classes cl ON s.class_id = cl.id
      WHERE g.score < ?
    `
    const params = [passScore]

    if (courseId) {
      sql += ' AND g.course_id = ?'
      params.push(courseId)
    }

    sql += ' ORDER BY g.score ASC'

    const [rows] = await pool.execute(sql, params)

    res.json({
      code: 200,
      data: rows
    })
  } catch (error) {
    console.error('获取不及格学生错误:', error)
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    })
  }
}
