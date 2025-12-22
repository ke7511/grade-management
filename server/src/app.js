import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

// 加载环境变量
dotenv.config({ path: './server/.env' })

// 导入路由
import authRoutes from './routes/auth.js'
import userRoutes from './routes/users.js'
import gradeRoutes from './routes/grades.js'
import baseRoutes from './routes/base.js'

// 导入数据库
import { testConnection } from './config/db.js'

const app = express()
const PORT = process.env.PORT || 3000

// 中间件
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 请求日志
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`)
  next()
})

// 路由
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/grades', gradeRoutes)
app.use('/api', baseRoutes)

// 根路由
app.get('/', (req, res) => {
  res.json({
    message: '成绩管理系统 API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      grades: '/api/grades',
      courses: '/api/courses',
      classes: '/api/classes',
      students: '/api/students'
    }
  })
})

// 404 处理
app.use((req, res) => {
  res.status(404).json({
    code: 404,
    message: '接口不存在'
  })
})

// 错误处理
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('服务器错误:', err)
  res.status(500).json({
    code: 500,
    message: '服务器内部错误'
  })
})

// 启动服务器
async function startServer() {
  // 测试数据库连接
  const dbConnected = await testConnection()
  if (!dbConnected) {
    console.error('数据库连接失败，请检查配置')
    process.exit(1)
  }

  app.listen(PORT, () => {
    console.log(`
    服务器已启动
    地址: http://localhost:${PORT}
    API 文档: http://localhost:${PORT}/
    `)
  })
}

startServer()
