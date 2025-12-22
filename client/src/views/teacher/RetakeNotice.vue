<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useGradeStore } from '@/stores/grade'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

const gradeStore = useGradeStore()
const userStore = useUserStore()

// 是否为教师角色
const isTeacher = computed(() => userStore.role === 'teacher')

const loading = ref(false)
const selectedCourse = ref(null)
const passScore = ref(60)
const failedList = ref([])

// 加载数据
const loadData = async () => {
  await gradeStore.loadCourses()

  // 教师自动设置课程
  if (isTeacher.value && gradeStore.courses.length > 0) {
    selectedCourse.value = gradeStore.courses[0].id
  }

  await loadFailedStudents()
}

// 加载不及格学生
const loadFailedStudents = async () => {
  loading.value = true
  try {
    const data = await gradeStore.getFailedStudents({
      courseId: selectedCourse.value,
      passScore: passScore.value
    })
    failedList.value = data
  } finally {
    loading.value = false
  }
}

// 监听筛选条件
watch([selectedCourse, passScore], () => {
  loadFailedStudents()
})

// 初始化
onMounted(() => {
  loadData()
})
// 批量导出
const handleExport = () => {
  if (failedList.value.length === 0) {
    ElMessage.warning('没有可导出的数据')
    return
  }

  const headers = ['学号', '姓名', '班级', '课程', '成绩', '学期']
  const rows = failedList.value.map(d => [
    d.student_code,
    d.student_name,
    d.class_name,
    d.course_name,
    d.score,
    d.semester
  ])

  const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `补考名单_${new Date().toISOString().split('T')[0]}.csv`
  link.click()

  ElMessage.success('导出成功')
}
</script>

<template>
  <div class="retake-notice">
    <div class="page-card">
      <h3 class="page-title">补考通知单生成</h3>

      <!-- 筛选 -->
      <el-form inline class="filter-form">
        <!-- 管理员：显示下拉框 -->
        <el-form-item v-if="!isTeacher" label="课程">
          <el-select v-model="selectedCourse" placeholder="全部课程" clearable style="width: 180px">
            <el-option
              v-for="course in gradeStore.courses"
              :key="course.id"
              :label="course.name"
              :value="course.id"
            />
          </el-select>
        </el-form-item>
        <!-- 教师：直接显示文本 -->
        <el-form-item v-else label="课程">
          <span class="teacher-info">{{ gradeStore.courses[0]?.name || '未分配' }}</span>
        </el-form-item>
        <el-form-item label="及格分数线">
          <el-input-number v-model="passScore" :min="0" :max="100" />
        </el-form-item>
      </el-form>

      <!-- 统计信息 -->
      <el-alert
        v-if="failedList.length > 0"
        :title="`共有 ${failedList.length} 名学生需要补考`"
        type="warning"
        show-icon
        :closable="false"
        style="margin-bottom: 20px"
      />

      <!-- 操作按钮 -->
      <div class="action-btns">
        <el-button @click="handleExport">
          <el-icon>
            <Download />
          </el-icon>
          导出补考名单
        </el-button>
      </div>
    </div>

    <!-- 不及格学生列表 -->
    <div class="page-card">
      <h3 class="section-title">补考学生名单</h3>
      <el-table :data="failedList" stripe style="width: 100%" v-loading="loading">
        <el-table-column type="index" label="#" width="60" />
        <el-table-column prop="student_code" label="学号" min-width="120" />
        <el-table-column prop="student_name" label="姓名" min-width="100" />
        <el-table-column prop="class_name" label="班级" min-width="140" />
        <el-table-column prop="course_name" label="课程" min-width="120" />
        <el-table-column prop="semester" label="学期" min-width="100" />
        <el-table-column prop="score" label="成绩" min-width="80">
          <template #default="{ row }">
            <el-tag type="danger">{{ row.score }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="差分" min-width="80">
          <template #default="{ row }">
            <span class="text-danger">{{ passScore - row.score }}分</span>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="failedList.length === 0" description="暂无需要补考的学生" />
    </div>
  </div>
</template>

<style scoped>
.filter-form {
  margin-bottom: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 20px;
}

.action-btns {
  display: flex;
  gap: 12px;
}

.text-danger {
  color: var(--danger-color);
  font-weight: 500;
}

.teacher-info {
  font-weight: 500;
  color: #409eff;
}
</style>
