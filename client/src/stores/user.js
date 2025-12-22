import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { login as loginApi, getUserInfo as getUserInfoApi } from '@/api/auth'

export const useUserStore = defineStore('user', () => {
  // Token
  const token = ref(localStorage.getItem('token') || '')

  // 用户信息
  const userInfo = ref({
    id: null,
    username: '',
    name: '',
    role: '' // admin, teacher, student
  })

  // 是否已登录
  const isLoggedIn = computed(() => !!token.value && !!userInfo.value.id)

  // 用户角色
  const role = computed(() => userInfo.value.role)

  // 登录
  async function login(credentials) {
    const res = await loginApi(credentials)
    token.value = res.data.token
    userInfo.value = res.data.user
    localStorage.setItem('token', res.data.token)
    localStorage.setItem('userInfo', JSON.stringify(res.data.user))
    return res
  }

  // 登出
  function logout() {
    token.value = ''
    userInfo.value = {
      id: null,
      username: '',
      name: '',
      role: ''
    }
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  }

  // 初始化 - 从 localStorage 恢复登录状态
  function init() {
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('userInfo')
    if (savedToken && savedUser) {
      try {
        token.value = savedToken
        userInfo.value = JSON.parse(savedUser)
      } catch {
        logout()
      }
    }
  }

  // 获取用户信息
  async function fetchUserInfo() {
    try {
      const res = await getUserInfoApi()
      userInfo.value = res.data
      localStorage.setItem('userInfo', JSON.stringify(res.data))
      return res.data
    } catch {
      logout()
      throw new Error('获取用户信息失败')
    }
  }

  return {
    token,
    userInfo,
    isLoggedIn,
    role,
    login,
    logout,
    init,
    fetchUserInfo
  }
})
