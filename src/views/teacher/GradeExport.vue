<script setup>
import { ref, reactive, computed } from 'vue'
import { useGradeStore } from '@/stores/grade'
import { ElMessage } from 'element-plus'

const gradeStore = useGradeStore()

const form = reactive({
  courseId: null,
  classId: null,
  semester: '2024-1',
  format: 'xlsx'
})

// 课程选项
const courseOptions = computed(() => gradeStore.courses)
// 班级选项
const classOptions = computed(() => gradeStore.classes)

// 预览数据
const previewData = computed(() => {
  let data = gradeStore.grades.map((g) => {
    const student = gradeStore.students.find((s) => s.id === g.studentId)
    const course = gradeStore.courses.find((c) => c.id === g.courseId)
    return {
      ...g,
      studentCode: student?.studentId || '',
      studentName: student?.name || '',
      className: student?.className || '',
      courseName: course?.name || '',
      classId: student?.classId
    }
  })

  // 按筛选条件过滤
  if (form.courseId) {
    data = data.filter((d) => d.courseId === form.courseId)
  }
  if (form.classId) {
    data = data.filter((d) => d.classId === form.classId)
  }
  if (form.semester) {
    data = data.filter((d) => d.semester === form.semester)
  }

  return data
})

const exporting = ref(false)

// 导出成绩
const handleExport = () => {
  if (previewData.value.length === 0) {
    ElMessage.warning('没有可导出的数据')
    return
  }

  exporting.value = true

  // 模拟导出延迟
  setTimeout(() => {
    // 生成 CSV 内容
    const headers = ['学号', '姓名', '班级', '课程', '学期', '成绩']
    const rows = previewData.value.map((d) => [
      d.studentCode,
      d.studentName,
      d.className,
      d.courseName,
      d.semester,
      d.score
    ])

    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n')

    // 创建下载
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `成绩导出_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    exporting.value = false
    ElMessage.success('导出成功！')
  }, 1000)
}
</script>

<template>
  <div class="grade-export">
    <div class="page-card">
      <h3 class="page-title">成绩导出</h3>

      <!-- 筛选条件 -->
      <el-form :model="form" inline class="filter-form">
        <el-form-item label="学期">
          <el-select v-model="form.semester" style="width: 200px">
            <el-option label="2024-2025学年第一学期" value="2024-1" />
            <el-option label="2024-2025学年第二学期" value="2024-2" />
          </el-select>
        </el-form-item>
        <el-form-item label="课程">
          <el-select v-model="form.courseId" placeholder="全部课程" clearable style="width: 150px">
            <el-option v-for="course in courseOptions" :key="course.id" :label="course.name" :value="course.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="班级">
          <el-select v-model="form.classId" placeholder="全部班级" clearable style="width: 150px">
            <el-option v-for="cls in classOptions" :key="cls.id" :label="cls.name" :value="cls.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="导出格式">
          <el-radio-group v-model="form.format">
            <el-radio-button value="xlsx">Excel</el-radio-button>
            <el-radio-button value="csv">CSV</el-radio-button>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <!-- 导出按钮 -->
      <div class="export-actions">
        <el-button type="primary" :loading="exporting" @click="handleExport">
          <el-icon>
            <Download />
          </el-icon>
          {{ exporting ? '导出中...' : '导出成绩' }}
        </el-button>
        <span class="export-tip">共 {{ previewData.length }} 条数据</span>
      </div>
    </div>

    <!-- 预览 -->
    <div class="page-card">
      <h3 class="section-title">数据预览</h3>
      <el-table :data="previewData.slice(0, 20)" stripe style="width: 100%" max-height="400">
        <el-table-column type="index" label="#" width="60" />
        <el-table-column prop="studentCode" label="学号" width="120" />
        <el-table-column prop="studentName" label="姓名" width="100" />
        <el-table-column prop="className" label="班级" width="140" />
        <el-table-column prop="courseName" label="课程" width="120" />
        <el-table-column prop="semester" label="学期" width="100" />
        <el-table-column prop="score" label="成绩" width="80">
          <template #default="{ row }">
            <el-tag :type="row.score >= 60 ? 'success' : 'danger'">
              {{ row.score }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
      <div v-if="previewData.length > 20" class="preview-tip">
        仅显示前 20 条数据，导出将包含全部 {{ previewData.length }} 条数据
      </div>
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

.export-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.export-tip {
  color: #909399;
  font-size: 14px;
}

.preview-tip {
  margin-top: 16px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 4px;
  color: #909399;
  font-size: 14px;
  text-align: center;
}
</style>
