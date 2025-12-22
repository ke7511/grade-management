<script setup>
import { ref, computed, onMounted } from 'vue'
import { useGradeStore } from '@/stores/grade'

const gradeStore = useGradeStore()

const selectedCourse = ref(null)

// 课程选项
const courseOptions = computed(() => gradeStore.courses)

// 当前课程统计数据
const stats = computed(() => {
  if (!selectedCourse.value) return null
  return gradeStore.getCourseStats(selectedCourse.value)
})

// 分数分布数据
const scoreDistribution = computed(() => {
  if (!selectedCourse.value) return []

  const courseGrades = gradeStore.grades.filter((g) => g.courseId === selectedCourse.value)

  const ranges = [
    { label: '90-100分', min: 90, max: 100, count: 0, color: '#67c23a' },
    { label: '80-89分', min: 80, max: 89, count: 0, color: '#409eff' },
    { label: '70-79分', min: 70, max: 79, count: 0, color: '#e6a23c' },
    { label: '60-69分', min: 60, max: 69, count: 0, color: '#909399' },
    { label: '60分以下', min: 0, max: 59, count: 0, color: '#f56c6c' }
  ]

  courseGrades.forEach((g) => {
    for (const range of ranges) {
      if (g.score >= range.min && g.score <= range.max) {
        range.count++
        break
      }
    }
  })

  return ranges
})

// 所有课程统计概览
const allCoursesStats = computed(() => {
  return gradeStore.courses.map((course) => {
    const stats = gradeStore.getCourseStats(course.id)
    return {
      ...course,
      ...stats
    }
  }).filter((c) => c.average)
})

onMounted(() => {
  if (courseOptions.value.length > 0) {
    selectedCourse.value = courseOptions.value[0].id
  }
})
</script>

<template>
  <div class="grade-stats">
    <!-- 课程选择 -->
    <div class="page-card">
      <div class="course-selector">
        <span class="label">选择课程：</span>
        <el-select v-model="selectedCourse" placeholder="请选择课程" style="width: 200px">
          <el-option v-for="course in courseOptions" :key="course.id" :label="course.name" :value="course.id" />
        </el-select>
      </div>
    </div>

    <!-- 统计卡片 -->
    <el-row v-if="stats" :gutter="20" class="stats-row">
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-value">{{ stats.average }}</div>
          <div class="stat-label">平均分</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card success">
          <div class="stat-value">{{ stats.max }}</div>
          <div class="stat-label">最高分</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card warning">
          <div class="stat-value">{{ stats.min }}</div>
          <div class="stat-label">最低分</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card" :class="{ danger: Number(stats.passRate) < 60 }">
          <div class="stat-value">{{ stats.passRate }}%</div>
          <div class="stat-label">及格率</div>
        </div>
      </el-col>
    </el-row>

    <!-- 分数分布 -->
    <div v-if="stats" class="page-card">
      <h3 class="section-title">成绩分布</h3>
      <div class="distribution-chart">
        <div v-for="range in scoreDistribution" :key="range.label" class="bar-item">
          <div class="bar-label">{{ range.label }}</div>
          <div class="bar-wrapper">
            <div class="bar" :style="{
              width: `${(range.count / stats.total) * 100}%`,
              backgroundColor: range.color
            }"></div>
            <span class="bar-count">{{ range.count }}人</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 所有课程概览 -->
    <div class="page-card">
      <h3 class="section-title">各课程成绩概览</h3>
      <el-table :data="allCoursesStats" stripe style="width: 100%">
        <el-table-column prop="name" label="课程名称" />
        <el-table-column prop="code" label="课程代码" width="120" />
        <el-table-column prop="total" label="参考人数" width="100" />
        <el-table-column prop="average" label="平均分" width="100">
          <template #default="{ row }">
            <span :class="{ 'text-danger': Number(row.average) < 60 }">
              {{ row.average }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="max" label="最高分" width="80" />
        <el-table-column prop="min" label="最低分" width="80" />
        <el-table-column prop="passRate" label="及格率" width="100">
          <template #default="{ row }">
            <el-tag :type="Number(row.passRate) >= 60 ? 'success' : 'danger'">
              {{ row.passRate }}%
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<style scoped>
.course-selector {
  display: flex;
  align-items: center;
  gap: 12px;
}

.course-selector .label {
  font-weight: 500;
  color: #606266;
}

.stats-row {
  margin-bottom: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 20px;
}

.distribution-chart {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.bar-item {
  display: flex;
  align-items: center;
  gap: 16px;
}

.bar-label {
  width: 100px;
  font-size: 14px;
  color: #606266;
  text-align: right;
}

.bar-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
}

.bar {
  height: 24px;
  border-radius: 4px;
  min-width: 4px;
  transition: width 0.3s ease;
}

.bar-count {
  font-size: 14px;
  color: #909399;
  min-width: 50px;
}

.text-danger {
  color: var(--danger-color);
}
</style>
