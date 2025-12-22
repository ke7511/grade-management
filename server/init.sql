-- 成绩管理系统数据库初始化脚本
-- 请在 MySQL 中执行此脚本

-- 创建数据库
CREATE DATABASE IF NOT EXISTS grade_management DEFAULT CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE grade_management;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(50) NOT NULL,
  role ENUM('admin', 'teacher', 'student') NOT NULL,
  class_id INT DEFAULT NULL,   -- 教师负责的班级
  course_id INT DEFAULT NULL,  -- 教师负责的课程
  status TINYINT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 班级表
CREATE TABLE IF NOT EXISTS classes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL,
  major VARCHAR(100)
);

-- 学生表
CREATE TABLE IF NOT EXISTS students (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id VARCHAR(20) UNIQUE NOT NULL,
  user_id INT,
  class_id INT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL
);

-- 课程表
CREATE TABLE IF NOT EXISTS courses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  credit DECIMAL(2,1)
);

-- 成绩表
CREATE TABLE IF NOT EXISTS grades (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  course_id INT NOT NULL,
  score DECIMAL(5,2),
  semester VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- ========================================
-- 插入测试数据
-- ========================================

-- 插入管理员账户 (密码: 123456)
INSERT INTO users (username, password, name, role) VALUES 
('admin', '$2b$10$7//PJkCZdNriNaboKMzT6uZd7heuMbnJxzc8xlqTwfz7CUy8As1TC', '管理员', 'admin');

-- 插入教师账户 (密码: 123456)
-- 张老师负责: 计算机2301班(1) + 高等数学(1)
-- 李老师负责: 计算机2302班(2) + 大学英语(2)
INSERT INTO users (username, password, name, role, class_id, course_id) VALUES 
('teacher', '$2b$10$7//PJkCZdNriNaboKMzT6uZd7heuMbnJxzc8xlqTwfz7CUy8As1TC', '张老师', 'teacher', 1, 1),
('teacher02', '$2b$10$7//PJkCZdNriNaboKMzT6uZd7heuMbnJxzc8xlqTwfz7CUy8As1TC', '李老师', 'teacher', 2, 2);

-- 插入班级
INSERT INTO classes (name, major) VALUES 
('计算机2301班', '计算机科学与技术'),
('计算机2302班', '计算机科学与技术'),
('软件工程2301班', '软件工程');

-- 插入学生账户 (密码: 123456)
INSERT INTO users (username, password, name, role) VALUES 
('student', '$2b$10$7//PJkCZdNriNaboKMzT6uZd7heuMbnJxzc8xlqTwfz7CUy8As1TC', '张三', 'student'),
('2023002', '$2b$10$7//PJkCZdNriNaboKMzT6uZd7heuMbnJxzc8xlqTwfz7CUy8As1TC', '李四', 'student'),
('2023003', '$2b$10$7//PJkCZdNriNaboKMzT6uZd7heuMbnJxzc8xlqTwfz7CUy8As1TC', '王五', 'student'),
('2023004', '$2b$10$7//PJkCZdNriNaboKMzT6uZd7heuMbnJxzc8xlqTwfz7CUy8As1TC', '赵六', 'student'),
('2023005', '$2b$10$7//PJkCZdNriNaboKMzT6uZd7heuMbnJxzc8xlqTwfz7CUy8As1TC', '钱七', 'student'),
('2023006', '$2b$10$7//PJkCZdNriNaboKMzT6uZd7heuMbnJxzc8xlqTwfz7CUy8As1TC', '孙八', 'student');

-- 插入学生信息
INSERT INTO students (student_id, user_id, class_id) VALUES 
('2023001', 4, 1),
('2023002', 5, 1),
('2023003', 6, 1),
('2023004', 7, 2),
('2023005', 8, 2),
('2023006', 9, 3);

-- 插入课程
INSERT INTO courses (code, name, credit) VALUES 
('MATH101', '高等数学', 4.0),
('ENG101', '大学英语', 3.0),
('CS101', '程序设计', 4.0),
('CS201', '数据结构', 3.0),
('CS301', '计算机网络', 3.0);

-- 插入成绩
INSERT INTO grades (student_id, course_id, score, semester) VALUES 
(1, 1, 85, '2025-1'),
(1, 2, 78, '2025-1'),
(1, 3, 92, '2025-1'),
(2, 1, 55, '2025-1'),
(2, 2, 88, '2025-1'),
(2, 3, 45, '2025-1'),
(3, 1, 72, '2025-1'),
(3, 2, 68, '2025-1'),
(4, 1, 90, '2025-1'),
(5, 1, 58, '2025-1');

-- ========================================
-- 完成
-- ========================================
SELECT '数据库初始化完成！' AS message;
SELECT '默认账户密码均为: 123456' AS message;

