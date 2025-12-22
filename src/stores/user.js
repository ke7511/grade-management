import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
  // 用户信息
  const userInfo = ref({
    id: null,
    username: '',
    name: '',
    role: '', // admin, teacher, student
    avatar: '',
  })

  // 是否已登录
  const isLoggedIn = computed(() => !!userInfo.value.id)

  // 用户角色
  const role = computed(() => userInfo.value.role)

  // 登录
  function login(user) {
    userInfo.value = { ...user }
    localStorage.setItem('userInfo', JSON.stringify(user))
  }

  // 登出
  function logout() {
    userInfo.value = {
      id: null,
      username: '',
      name: '',
      role: '',
      avatar: '',
    }
    localStorage.removeItem('userInfo')
  }

  // 初始化 - 从 localStorage 恢复登录状态
  function init() {
    const saved = localStorage.getItem('userInfo')
    if (saved) {
      try {
        userInfo.value = JSON.parse(saved)
      } catch (e) {
        localStorage.removeItem('userInfo')
      }
    }
  }

  return {
    userInfo,
    isLoggedIn,
    role,
    login,
    logout,
    init,
  }
})
