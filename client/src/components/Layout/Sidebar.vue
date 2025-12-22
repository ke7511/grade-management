<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const role = computed(() => userStore.role)

// 菜单配置
const menuConfig = {
  admin: [
    {
      title: '首页',
      icon: 'HomeFilled',
      path: '/dashboard'
    },
    {
      title: '用户管理',
      icon: 'User',
      path: '/admin/users'
    },
    {
      title: '成绩管理',
      icon: 'Document',
      children: [
        { title: '成绩录入', path: '/teacher/input' },
        { title: '成绩修改', path: '/teacher/edit' },
        { title: '成绩统计', path: '/teacher/stats' },
        { title: '成绩导出', path: '/teacher/export' },
        { title: '补考通知单', path: '/teacher/retake' }
      ]
    }
  ],
  teacher: [
    {
      title: '首页',
      icon: 'HomeFilled',
      path: '/dashboard'
    },
    {
      title: '成绩录入',
      icon: 'EditPen',
      path: '/teacher/input'
    },
    {
      title: '成绩修改',
      icon: 'Edit',
      path: '/teacher/edit'
    },
    {
      title: '成绩统计',
      icon: 'DataAnalysis',
      path: '/teacher/stats'
    },
    {
      title: '成绩导出',
      icon: 'Download',
      path: '/teacher/export'
    },
    {
      title: '补考通知单',
      icon: 'Bell',
      path: '/teacher/retake'
    }
  ],
  student: [
    {
      title: '首页',
      icon: 'HomeFilled',
      path: '/dashboard'
    },
    {
      title: '成绩查询',
      icon: 'Search',
      path: '/student/grades'
    },
    {
      title: '个人信息',
      icon: 'User',
      path: '/student/profile'
    }
  ]
}

const menus = computed(() => menuConfig[role.value] || [])

const handleSelect = path => {
  router.push(path)
}
</script>

<template>
  <aside class="sidebar">
    <div class="logo">
      <el-icon size="24">
        <DataBoard />
      </el-icon>
      <span class="logo-text">成绩管理系统</span>
    </div>

    <el-menu
      :default-active="route.path"
      class="sidebar-menu"
      background-color="#001529"
      text-color="#ffffffa6"
      active-text-color="#ffffff"
      @select="handleSelect"
    >
      <template v-for="menu in menus" :key="menu.path || menu.title">
        <!-- 有子菜单 -->
        <el-sub-menu v-if="menu.children" :index="menu.title">
          <template #title>
            <el-icon>
              <component :is="menu.icon" />
            </el-icon>
            <span>{{ menu.title }}</span>
          </template>
          <el-menu-item v-for="child in menu.children" :key="child.path" :index="child.path">
            {{ child.title }}
          </el-menu-item>
        </el-sub-menu>

        <!-- 无子菜单 -->
        <el-menu-item v-else :index="menu.path">
          <el-icon>
            <component :is="menu.icon" />
          </el-icon>
          <span>{{ menu.title }}</span>
        </el-menu-item>
      </template>
    </el-menu>
  </aside>
</template>

<style scoped>
.sidebar {
  width: var(--sidebar-width);
  height: 100%;
  background-color: #001529;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.logo {
  height: var(--header-height);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo-text {
  white-space: nowrap;
}

.sidebar-menu {
  flex: 1;
  border-right: none;
  overflow-y: auto;
}

.sidebar-menu:not(.el-menu--collapse) {
  width: var(--sidebar-width);
}

:deep(.el-menu-item.is-active) {
  background-color: var(--primary-color) !important;
}

:deep(.el-menu-item:hover),
:deep(.el-sub-menu__title:hover) {
  background-color: rgba(255, 255, 255, 0.1) !important;
}
</style>
