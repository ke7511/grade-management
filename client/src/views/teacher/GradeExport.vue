<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useGradeStore } from '@/stores/grade'
import { ElMessage } from 'element-plus'

const gradeStore = useGradeStore()

const loading = ref(false)
const gradeList = ref([])

const form = reactive({
  courseId: null,
  classId: null,
  semester: '2025-1'
})

// 课程选项
const courseOptions = computed(() => gradeStore.courses)
// 班级选项
const classOptions = computed(() => gradeStore.classes)

// 加载数据
const loadData = async () => {
  await gradeStore.loadCourses()
  await gradeStore.loadClasses()
  await loadGrades()
}

// 加载成绩
const loadGrades = async () => {
  loading.value = true
  try {
    const data = await gradeStore.loadGrades({
      courseId: form.courseId,
      classId: form.classId,
      semester: form.semester
    })
    gradeList.value = data
  } finally {
    loading.value = false
  }
}

// 监听筛选条件
watch(
  form,
  () => {
    loadGrades()
  },
  { deep: true }
)

// 初始化
onMounted(() => {
  loadData()
})

const exporting = ref(false)

// 导出成绩 (Excel 格式)
const handleExport = () => {
  if (gradeList.value.length === 0) {
    ElMessage.warning('没有可导出的数据')
    return
  }

  exporting.value = true

  setTimeout(() => {
    const headers = ['学号', '姓名', '班级', '课程', '学期', '成绩']
    const rows = gradeList.value.map(d => [
      d.student_code,
      d.student_name,
      d.class_name,
      d.course_name,
      d.semester,
      d.score
    ])

    // 生成 Excel 格式 (TSV with BOM for Excel compatibility)
    const content = [headers, ...rows].map(row => row.join('\t')).join('\n')
    const blob = new Blob(['\ufeff' + content], {
      type: 'application/vnd.ms-excel;charset=utf-8;'
    })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `成绩导出_${new Date().toISOString().split('T')[0]}.xls`
    link.click()

    exporting.value = false
    ElMessage.success('导出成功！')
  }, 500)
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
            <el-option label="2025-2026学年第一学期" value="2025-1" />
            <el-option label="2025-2026学年第二学期" value="2025-2" />
          </el-select>
        </el-form-item>
        <el-form-item label="课程">
          <el-select v-model="form.courseId" placeholder="全部课程" clearable style="width: 150px">
            <el-option
              v-for="course in courseOptions"
              :key="course.id"
              :label="course.name"
              :value="course.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="班级">
          <el-select v-model="form.classId" placeholder="全部班级" clearable style="width: 150px">
            <el-option
              v-for="cls in classOptions"
              :key="cls.id"
              :label="cls.name"
              :value="cls.id"
            />
          </el-select>
        </el-form-item>
      </el-form>

      <!-- 导出按钮 -->
      <div class="export-actions">
        <el-button type="primary" :loading="exporting" @click="handleExport">
          <el-icon>
            <Download />
          </el-icon>
          {{ exporting ? '导出中...' : '导出 Excel' }}
        </el-button>
        <span class="export-tip">共 {{ gradeList.length }} 条数据</span>
      </div>
    </div>

    <!-- 预览 -->
    <div class="page-card">
      <h3 class="section-title">数据预览</h3>
      <el-table
        :data="gradeList.slice(0, 20)"
        stripe
        style="width: 100%"
        max-height="400"
        v-loading="loading"
      >
        <el-table-column type="index" label="#" width="60" />
        <el-table-column prop="student_code" label="学号" width="120" />
        <el-table-column prop="student_name" label="姓名" width="100" />
        <el-table-column prop="class_name" label="班级" width="140" />
        <el-table-column prop="course_name" label="课程" width="120" />
        <el-table-column prop="semester" label="学期" width="100" />
        <el-table-column prop="score" label="成绩" width="80">
          <template #default="{ row }">
            <el-tag :type="row.score >= 60 ? 'success' : 'danger'">
              {{ row.score }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
      <div v-if="gradeList.length > 20" class="preview-tip">
        仅显示前 20 条数据，导出将包含全部 {{ gradeList.length }} 条数据
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
