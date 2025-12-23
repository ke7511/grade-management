import { Router } from 'express'
import pool from '../config/db.js'

const router = Router()

// 初始化数据库表（仅用于首次部署）
router.post('/init-db', async (req, res) => {
  const { secret } = req.body

  // 简单的安全检查
  if (secret !== 'init_db_2024') {
    return res.status(403).json({ code: 403, message: '无效的密钥' })
  }

  try {
    const connection = await pool.getConnection()

    // 创建用户表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(50) NOT NULL,
        role ENUM('admin', 'teacher', 'student') NOT NULL,
        class_id INT DEFAULT NULL,
        course_id INT DEFAULT NULL,
        status TINYINT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // 创建班级表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS classes (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(50) NOT NULL,
        major VARCHAR(100)
      )
    `)

    // 创建学生表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS students (
        id INT PRIMARY KEY AUTO_INCREMENT,
        student_id VARCHAR(20) UNIQUE NOT NULL,
        user_id INT NOT NULL,
        class_id INT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL
      )
    `)

    // 创建课程表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS courses (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        credit DECIMAL(3,1) DEFAULT 0
      )
    `)

    // 创建成绩表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS grades (
        id INT PRIMARY KEY AUTO_INCREMENT,
        student_id INT NOT NULL,
        course_id INT NOT NULL,
        score DECIMAL(5,2),
        semester VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
      )
    `)

    // 插入管理员账户 (密码: 123456)
    await connection.execute(`
      INSERT IGNORE INTO users (username, password, name, role) VALUES
      ('admin', '$2b$10$7//PJkCZdNriNaboKMzT6uZd7heuMbnJxzc8xlqTwfz7CUy8As1TC', '管理员', 'admin')
    `)

    // 插入班级
    await connection.execute(`
      INSERT IGNORE INTO classes (id, name, major) VALUES
      (1, '计算机2301班', '计算机科学与技术'),
      (2, '计算机2302班', '计算机科学与技术'),
      (3, '软件2301班', '软件工程')
    `)

    // 插入课程
    await connection.execute(`
      INSERT IGNORE INTO courses (id, name, credit) VALUES
      (1, '高等数学', 4.0),
      (2, '大学英语', 3.0),
      (3, '程序设计', 3.5),
      (4, '数据结构', 4.0),
      (5, '计算机网络', 3.0)
    `)

    // 插入教师账户
    await connection.execute(`
      INSERT IGNORE INTO users (username, password, name, role, class_id, course_id) VALUES
      ('teacher', '$2b$10$7//PJkCZdNriNaboKMzT6uZd7heuMbnJxzc8xlqTwfz7CUy8As1TC', '张老师', 'teacher', 1, 1),
      ('teacher02', '$2b$10$7//PJkCZdNriNaboKMzT6uZd7heuMbnJxzc8xlqTwfz7CUy8As1TC', '李老师', 'teacher', 2, 2)
    `)

    // 插入学生账户
    await connection.execute(`
      INSERT IGNORE INTO users (id, username, password, name, role) VALUES
      (10, 'student01', '$2b$10$7//PJkCZdNriNaboKMzT6uZd7heuMbnJxzc8xlqTwfz7CUy8As1TC', '张三', 'student'),
      (11, 'student02', '$2b$10$7//PJkCZdNriNaboKMzT6uZd7heuMbnJxzc8xlqTwfz7CUy8As1TC', '李四', 'student'),
      (12, 'student03', '$2b$10$7//PJkCZdNriNaboKMzT6uZd7heuMbnJxzc8xlqTwfz7CUy8As1TC', '王五', 'student'),
      (13, 'student04', '$2b$10$7//PJkCZdNriNaboKMzT6uZd7heuMbnJxzc8xlqTwfz7CUy8As1TC', '赵六', 'student'),
      (14, 'student05', '$2b$10$7//PJkCZdNriNaboKMzT6uZd7heuMbnJxzc8xlqTwfz7CUy8As1TC', '钱七', 'student')
    `)

    // 插入学生信息
    await connection.execute(`
      INSERT IGNORE INTO students (id, student_id, user_id, class_id) VALUES
      (1, '2023001', 10, 1),
      (2, '2023002', 11, 1),
      (3, '2023003', 12, 1),
      (4, '2023004', 13, 2),
      (5, '2023005', 14, 2)
    `)

    // 插入成绩数据
    await connection.execute(`
      INSERT IGNORE INTO grades (id, student_id, course_id, score, semester) VALUES
      (1, 1, 1, 85.5, '2025-2026-1'),
      (2, 1, 2, 78.0, '2025-2026-1'),
      (3, 2, 1, 92.0, '2025-2026-1'),
      (4, 2, 2, 88.5, '2025-2026-1'),
      (5, 3, 1, 55.0, '2025-2026-1'),
      (6, 3, 2, 62.0, '2025-2026-1'),
      (7, 4, 2, 95.0, '2025-2026-1'),
      (8, 4, 3, 89.0, '2025-2026-1'),
      (9, 5, 2, 45.0, '2025-2026-1'),
      (10, 5, 3, 58.0, '2025-2026-1')
    `)

    connection.release()

    res.json({
      code: 200,
      message: '数据库初始化成功！默认账户密码均为 123456'
    })
  } catch (error) {
    console.error('初始化数据库错误:', error)
    res.status(500).json({
      code: 500,
      message: '初始化失败: ' + error.message
    })
  }
})

export default router
