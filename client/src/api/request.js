import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'

// API 地址：开发环境使用代理，生产环境使用环境变量
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

// 创建 axios 实例
const request = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    // 直接从 localStorage 读取 token，避免 Pinia 初始化问题
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    const res = response.data
    // 如果返回的 code 不是 200，则认为是错误
    if (res.code && res.code !== 200) {
      ElMessage.error(res.message || '请求失败')
      return Promise.reject(new Error(res.message || '请求失败'))
    }
    return res
  },
  error => {
    // 处理 HTTP 错误
    if (error.response) {
      const { status, data, config } = error.response

      // 登录请求的 401 是用户名密码错误，不是登录过期
      const isLoginRequest = config.url && config.url.includes('/auth/login')

      if (status === 401) {
        if (isLoginRequest) {
          // 登录请求失败，显示实际错误信息
          ElMessage.error(data?.message || '用户名或密码错误')
        } else {
          // 其他请求的 401 是登录过期
          ElMessage.error('登录已过期，请重新登录')
          localStorage.removeItem('token')
          localStorage.removeItem('userInfo')
          router.push('/login')
        }
      } else if (status === 403) {
        ElMessage.error(data?.message || '没有权限访问')
      } else {
        ElMessage.error(data?.message || '请求失败')
      }
    } else {
      ElMessage.error('网络错误，请稀后重试')
    }
    return Promise.reject(error)
  }
)

export default request
