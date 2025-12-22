<script setup>
import { computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { useGradeStore } from '@/stores/grade'

const userStore = useUserStore()
const gradeStore = useGradeStore()

const role = computed(() => userStore.role)
const userName = computed(() => userStore.userInfo.name)

// 统计数据
const stats = computed(() => {
  const courses = gradeStore.courses.length
  const students = gradeStore.students.length
  const classes = gradeStore.classes.length
  const failedCount = gradeStore.failedStudents.length

  return { courses, students, classes, failedCount }
})

// 快捷操作
const quickActions = {
  admin: [
    { title: '用户管理', icon: 'User', path: '/admin/users', color: '#409eff' },
    { title: '成绩统计', icon: 'DataAnalysis', path: '/teacher/stats', color: '#67c23a' },
    { title: '系统设置', icon: 'Setting', path: '/admin/settings', color: '#e6a23c' }
  ],
  teacher: [
    { title: '成绩录入', icon: 'EditPen', path: '/teacher/input', color: '#409eff' },
    { title: '成绩统计', icon: 'DataAnalysis', path: '/teacher/stats', color: '#67c23a' },
    { title: '补考通知', icon: 'Bell', path: '/teacher/retake', color: '#f56c6c' }
  ],
  student: [
    { title: '成绩查询', icon: 'Search', path: '/student/grades', color: '#409eff' },
    { title: '个人信息', icon: 'User', path: '/student/profile', color: '#67c23a' }
  ]
}

const actions = computed(() => quickActions[role.value] || [])

// 获取当前时间段问候语
const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 6) return '凌晨好'
  if (hour < 9) return '早上好'
  if (hour < 12) return '上午好'
  if (hour < 14) return '中午好'
  if (hour < 17) return '下午好'
  if (hour < 19) return '傍晚好'
  return '晚上好'
})
</script>

<template>
  <div class="dashboard">
    <!-- 欢迎区域 -->
    <div class="welcome-card">
      <div class="welcome-content">
        <h1 class="welcome-title">{{ greeting }}，{{ userName }}！</h1>
        <p class="welcome-desc">欢迎使用成绩管理系统，祝您工作愉快。</p>
      </div>
      <div class="welcome-illustration">
        <el-icon size="80" color="rgba(255,255,255,0.3)">
          <DataBoard />
        </el-icon>
      </div>
    </div>

    <!-- 统计卡片 - 仅管理员和教师可见 -->
    <el-row v-if="role !== 'student'" :gutter="20" class="stats-row">
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-value">{{ stats.courses }}</div>
          <div class="stat-label">课程数量</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card success">
          <div class="stat-value">{{ stats.classes }}</div>
          <div class="stat-label">班级数量</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card warning">
          <div class="stat-value">{{ stats.students }}</div>
          <div class="stat-label">学生人数</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card danger">
          <div class="stat-value">{{ stats.failedCount }}</div>
          <div class="stat-label">不及格人次</div>
        </div>
      </el-col>
    </el-row>

    <!-- 快捷操作 -->
    <div class="page-card">
      <h3 class="section-title">快捷操作</h3>
      <div class="quick-actions">
        <router-link v-for="action in actions" :key="action.path" :to="action.path" class="action-item">
          <div class="action-icon" :style="{ backgroundColor: action.color + '20' }">
            <el-icon :size="28" :color="action.color">
              <component :is="action.icon" />
            </el-icon>
          </div>
          <span class="action-title">{{ action.title }}</span>
        </router-link>
      </div>
    </div>

    <!-- 最近动态 -->
    <div class="page-card">
      <h3 class="section-title">系统公告</h3>
      <el-timeline>
        <el-timeline-item timestamp="2024-01-15" placement="top">
          <el-card shadow="never">
            <h4>2023-2024学年第一学期期末成绩已开放查询</h4>
            <p>各位同学可以登录系统查看本学期的期末考试成绩。</p>
          </el-card>
        </el-timeline-item>
        <el-timeline-item timestamp="2024-01-10" placement="top">
          <el-card shadow="never">
            <h4>补考安排通知</h4>
            <p>不及格科目的补考将于下学期开学第一周进行，请同学们做好准备。</p>
          </el-card>
        </el-timeline-item>
        <el-timeline-item timestamp="2024-01-05" placement="top">
          <el-card shadow="never">
            <h4>系统升级完成</h4>
            <p>成绩管理系统已完成升级，新增成绩统计图表功能。</p>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  max-width: 1400px;
  margin: 0 auto;
}

.welcome-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 32px 40px;
  color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.welcome-title {
  font-size: 28px;
  font-weight: 600;
  margin: 0 0 8px;
}

.welcome-desc {
  font-size: 15px;
  opacity: 0.85;
  margin: 0;
}

.stats-row {
  margin-bottom: 24px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 20px;
}

.quick-actions {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  padding: 20px 32px;
  border-radius: 12px;
  transition: all 0.3s;
  cursor: pointer;
}

.action-item:hover {
  background-color: #f5f7fa;
  transform: translateY(-2px);
}

.action-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-title {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

:deep(.el-timeline-item__content h4) {
  margin: 0 0 8px;
  font-size: 15px;
}

:deep(.el-timeline-item__content p) {
  margin: 0;
  font-size: 14px;
  color: #909399;
}

:deep(.el-card) {
  border: none;
  background: #f5f7fa;
}
</style>
