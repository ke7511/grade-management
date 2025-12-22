import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/Login.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/',
      component: () => import('@/components/Layout/AppLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        // 默认重定向
        {
          path: '',
          redirect: '/dashboard'
        },
        // 仪表盘
        {
          path: 'dashboard',
          name: 'Dashboard',
          component: () => import('@/views/Dashboard.vue'),
          meta: { title: '首页' }
        },
        // 管理员路由
        {
          path: 'admin/users',
          name: 'UserManage',
          component: () => import('@/views/admin/UserManage.vue'),
          meta: { title: '用户管理', roles: ['admin'] }
        },
        // 教师路由
        {
          path: 'teacher/input',
          name: 'GradeInput',
          component: () => import('@/views/teacher/GradeInput.vue'),
          meta: { title: '成绩录入', roles: ['admin', 'teacher'] }
        },
        {
          path: 'teacher/edit',
          name: 'GradeEdit',
          component: () => import('@/views/teacher/GradeEdit.vue'),
          meta: { title: '成绩修改', roles: ['admin', 'teacher'] }
        },
        {
          path: 'teacher/stats',
          name: 'GradeStats',
          component: () => import('@/views/teacher/GradeStats.vue'),
          meta: { title: '成绩统计', roles: ['admin', 'teacher'] }
        },
        {
          path: 'teacher/export',
          name: 'GradeExport',
          component: () => import('@/views/teacher/GradeExport.vue'),
          meta: { title: '成绩导出', roles: ['admin', 'teacher'] }
        },
        {
          path: 'teacher/retake',
          name: 'RetakeNotice',
          component: () => import('@/views/teacher/RetakeNotice.vue'),
          meta: { title: '补考通知单', roles: ['admin', 'teacher'] }
        },
        // 学生路由
        {
          path: 'student/grades',
          name: 'GradeQuery',
          component: () => import('@/views/student/GradeQuery.vue'),
          meta: { title: '成绩查询', roles: ['admin', 'teacher', 'student'] }
        },
        {
          path: 'student/profile',
          name: 'Profile',
          component: () => import('@/views/student/Profile.vue'),
          meta: { title: '个人信息', roles: ['admin', 'teacher', 'student'] }
        }
      ]
    },
    // 404
    {
      path: '/:pathMatch(.*)*',
      redirect: '/login'
    }
  ]
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()

  // 初始化用户状态
  if (!userStore.isLoggedIn) {
    userStore.init()
  }

  // 不需要认证的页面
  if (to.meta.requiresAuth === false) {
    if (userStore.isLoggedIn) {
      next('/dashboard')
    } else {
      next()
    }
    return
  }

  // 需要认证
  if (!userStore.isLoggedIn) {
    next('/login')
    return
  }

  // 检查角色权限
  const requiredRoles = to.meta.roles
  if (requiredRoles && !requiredRoles.includes(userStore.role)) {
    next('/dashboard')
    return
  }

  next()
})

export default router
