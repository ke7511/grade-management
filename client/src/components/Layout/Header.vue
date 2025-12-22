<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage, ElMessageBox } from 'element-plus'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const userInfo = computed(() => userStore.userInfo)
const pageTitle = computed(() => route.meta.title || '首页')

const roleLabels = {
  admin: '系统管理员',
  teacher: '教师',
  student: '学生'
}

const roleLabel = computed(() => roleLabels[userInfo.value.role] || '')

const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    userStore.logout()
    router.push('/login')
    ElMessage.success('已退出登录')
  } catch {
    // 用户取消
  }
}
</script>

<template>
  <header class="header">
    <div class="header-left">
      <h2 class="page-title">{{ pageTitle }}</h2>
    </div>

    <div class="header-right">
      <el-dropdown trigger="click">
        <div class="user-info">
          <el-avatar :size="36" class="avatar">
            {{ userInfo.name?.[0] || 'U' }}
          </el-avatar>
          <div class="user-detail">
            <span class="user-name">{{ userInfo.name }}</span>
            <span class="user-role">{{ roleLabel }}</span>
          </div>
          <el-icon>
            <ArrowDown />
          </el-icon>
        </div>

        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="router.push('/student/profile')">
              <el-icon>
                <User />
              </el-icon>
              个人信息
            </el-dropdown-item>
            <el-dropdown-item divided @click="handleLogout">
              <el-icon>
                <SwitchButton />
              </el-icon>
              退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </header>
</template>

<style scoped>
.header {
  height: var(--header-height);
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
}

.page-title {
  font-size: 18px;
  font-weight: 500;
  color: #303133;
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.user-info:hover {
  background-color: #f5f7fa;
}

.avatar {
  background: linear-gradient(135deg, var(--primary-color) 0%, #79bbff 100%);
  color: #fff;
}

.user-detail {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.user-role {
  font-size: 12px;
  color: #909399;
}
</style>
