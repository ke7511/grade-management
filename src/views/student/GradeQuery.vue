<script setup>
import { computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { useGradeStore } from '@/stores/grade'

const userStore = useUserStore()
const gradeStore = useGradeStore()

// 假设当前登录学生的 ID
const currentStudentId = computed(() => {
  // 根据登录用户信息匹配学生
  const student = gradeStore.students.find((s) => s.name === userStore.userInfo.name)
  return student?.id || 1 // 默认返回第一个学生作为演示
})

// 学生成绩
const grades = computed(() => {
  return gradeStore.getStudentGrades(currentStudentId.value)
})

// 统计信息
const stats = computed(() => {
  if (grades.value.length === 0) return null

  const scores = grades.value.map((g) => g.score)
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length
  const passCount = scores.filter((s) => s >= 60).length

  return {
    total: scores.length,
    average: avg.toFixed(1),
    passCount,
    failCount: scores.length - passCount
  }
})

// 成绩等级
const getLevel = (score) => {
  if (score >= 90) return { label: '优秀', type: 'success' }
  if (score >= 80) return { label: '良好', type: '' }
  if (score >= 70) return { label: '中等', type: 'warning' }
  if (score >= 60) return { label: '及格', type: 'info' }
  return { label: '不及格', type: 'danger' }
}
</script>

<template>
  <div class="grade-query">
    <!-- 统计卡片 -->
    <el-row v-if="stats" :gutter="20" class="stats-row">
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-value">{{ stats.total }}</div>
          <div class="stat-label">已修科目</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card success">
          <div class="stat-value">{{ stats.average }}</div>
          <div class="stat-label">平均分</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card warning">
          <div class="stat-value">{{ stats.passCount }}</div>
          <div class="stat-label">及格科目</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card danger">
          <div class="stat-value">{{ stats.failCount }}</div>
          <div class="stat-label">不及格科目</div>
        </div>
      </el-col>
    </el-row>

    <!-- 成绩列表 -->
    <div class="page-card">
      <h3 class="page-title">我的成绩</h3>

      <el-table :data="grades" stripe style="width: 100%">
        <el-table-column type="index" label="#" width="60" />
        <el-table-column prop="courseCode" label="课程代码" width="120" />
        <el-table-column prop="courseName" label="课程名称" />
        <el-table-column prop="semester" label="学期" width="100" />
        <el-table-column label="成绩" width="100">
          <template #default="{ row }">
            <span class="score" :class="{ 'score-pass': row.score >= 60, 'score-fail': row.score < 60 }">
              {{ row.score }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="等级" width="100">
          <template #default="{ row }">
            <el-tag :type="getLevel(row.score).type">
              {{ getLevel(row.score).label }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="grades.length === 0" description="暂无成绩记录" />
    </div>

    <!-- 成绩说明 -->
    <div class="page-card">
      <h3 class="section-title">成绩等级说明</h3>
      <div class="level-guide">
        <div class="level-item">
          <el-tag type="success">优秀</el-tag>
          <span>90-100分</span>
        </div>
        <div class="level-item">
          <el-tag type="">良好</el-tag>
          <span>80-89分</span>
        </div>
        <div class="level-item">
          <el-tag type="warning">中等</el-tag>
          <span>70-79分</span>
        </div>
        <div class="level-item">
          <el-tag type="info">及格</el-tag>
          <span>60-69分</span>
        </div>
        <div class="level-item">
          <el-tag type="danger">不及格</el-tag>
          <span>60分以下</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stats-row {
  margin-bottom: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 20px;
}

.score {
  font-size: 18px;
  font-weight: 600;
}

.score-pass {
  color: var(--success-color);
}

.score-fail {
  color: var(--danger-color);
}

.level-guide {
  display: flex;
  gap: 32px;
  flex-wrap: wrap;
}

.level-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.level-item span {
  color: #606266;
  font-size: 14px;
}
</style>
