import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

// 加载环境变量（本地开发时需要）
dotenv.config()

// 创建数据库连接池
// 支持 Railway 的 MYSQL_URL 格式，也支持单独的环境变量
let pool

if (process.env.MYSQL_URL) {
  // Railway 提供的连接字符串格式
  console.log('使用 MYSQL_URL 连接数据库')
  pool = mysql.createPool(process.env.MYSQL_URL)
} else {
  // 本地开发使用单独的环境变量
  console.log('使用本地环境变量连接数据库')
  pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'grade_management',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  })
}

// 测试数据库连接
export async function testConnection() {
  try {
    const connection = await pool.getConnection()
    console.log('✅ 数据库连接成功')
    connection.release()
    return true
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message)
    return false
  }
}

export default pool
