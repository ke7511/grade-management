<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useGradeStore } from '@/stores/grade'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

const gradeStore = useGradeStore()
const userStore = useUserStore()

// 是否为教师角色
const isTeacher = computed(() => userStore.role === 'teacher')

const loading = ref(false)
const submitting = ref(false)

const form = reactive({
  courseId: null,
  classId: null,
  semester: '2025-2026-1'
})

// 选中的学生成绩
const gradeList = ref([])

// 获取课程选项
const courseOptions = computed(() => gradeStore.courses)

// 获取班级选项
const classOptions = computed(() => gradeStore.classes)

// 初始化加载
onMounted(async () => {
  await gradeStore.loadCourses()
  await gradeStore.loadClasses()

  // 教师自动设置唯一的课程和班级，并自动加载学生数据
  if (isTeacher.value && gradeStore.courses.length > 0) {
    form.courseId = gradeStore.courses[0].id
  }
  if (isTeacher.value && gradeStore.classes.length > 0) {
    form.classId = gradeStore.classes[0].id
  }

  // 教师自动加载学生列表
  if (isTeacher.value && form.courseId && form.classId) {
    await loadStudentsQuiet()
  }
})

// 加载学生列表（静默模式，不弹窗）
const loadStudentsQuiet = async () => {
  loading.value = true
  try {
    const students = await gradeStore.loadStudents(form.classId)
    gradeList.value = students.map(s => ({
      studentId: s.id,
      studentCode: s.studentCode,
      studentName: s.studentName,
      score: null
    }))
  } finally {
    loading.value = false
  }
}

// 加载学生列表
const loadStudents = async () => {
  if (!form.courseId || !form.classId) {
    ElMessage.warning('请先选择课程和班级')
    return
  }

  loading.value = true
  try {
    const students = await gradeStore.loadStudents(form.classId)

    gradeList.value = students.map(s => ({
      studentId: s.id,
      studentCode: s.studentCode,
      studentName: s.studentName,
      score: null
    }))

    ElMessage.success(`已加载 ${students.length} 名学生`)
  } catch {
    // 错误已处理
  } finally {
    loading.value = false
  }
}

// 提交成绩
const handleSubmit = async () => {
  // 检查是否有未填写的成绩
  const emptyCount = gradeList.value.filter(g => g.score === null || g.score === '').length
  if (emptyCount > 0) {
    ElMessage.warning(`还有 ${emptyCount} 名学生未录入成绩`)
    return
  }

  // 验证成绩范围
  const invalidScores = gradeList.value.filter(g => g.score < 0 || g.score > 100)
  if (invalidScores.length > 0) {
    ElMessage.error('成绩必须在 0-100 之间')
    return
  }

  submitting.value = true
  try {
    await gradeStore.addGrades({
      courseId: form.courseId,
      semester: form.semester,
      grades: gradeList.value.map(g => ({
        studentId: g.studentId,
        score: Number(g.score)
      }))
    })

    ElMessage.success('成绩录入成功！')
    gradeList.value = []
  } catch {
    // 错误已处理
  } finally {
    submitting.value = false
  }
}

// 清空表单
const handleClear = () => {
  gradeList.value = []
  form.courseId = null
  form.classId = null
}
</script>

<template>
  <div class="grade-input">
    <div class="page-card">
      <h3 class="page-title">成绩录入</h3>

      <!-- 选择区域 -->
      <el-form :model="form" inline class="filter-form">
        <el-form-item label="学期">
          <el-select v-model="form.semester" style="width: 200px">
            <el-option label="2025-2026学年第一学期" value="2025-1" />
            <el-option label="2025-2026学年第二学期" value="2025-2" />
          </el-select>
        </el-form-item>

        <!-- 管理员：显示下拉框 -->
        <template v-if="!isTeacher">
          <el-form-item label="课程">
            <el-select v-model="form.courseId" placeholder="请选择课程" style="width: 180px">
              <el-option
                v-for="course in courseOptions"
                :key="course.id"
                :label="course.name"
                :value="course.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="班级">
            <el-select v-model="form.classId" placeholder="请选择班级" style="width: 180px">
              <el-option
                v-for="cls in classOptions"
                :key="cls.id"
                :label="cls.name"
                :value="cls.id"
              />
            </el-select>
          </el-form-item>
        </template>

        <!-- 教师：直接显示文本 -->
        <template v-else>
          <el-form-item label="课程">
            <span class="teacher-info">{{ courseOptions[0]?.name || '未分配' }}</span>
          </el-form-item>
          <el-form-item label="班级">
            <span class="teacher-info">{{ classOptions[0]?.name || '未分配' }}</span>
          </el-form-item>
        </template>

        <!-- 管理员才需要加载按钮 -->
        <el-form-item v-if="!isTeacher">
          <el-button type="primary" :loading="loading" @click="loadStudents">
            <el-icon>
              <Search />
            </el-icon>
            加载学生
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 成绩录入表格 -->
      <el-table v-if="gradeList.length > 0" :data="gradeList" stripe style="width: 100%">
        <el-table-column type="index" label="#" width="60" />
        <el-table-column prop="studentCode" label="学号" min-width="120" />
        <el-table-column prop="studentName" label="姓名" min-width="120" />
        <el-table-column label="成绩" min-width="200">
          <template #default="{ row }">
            <el-input-number
              v-model="row.score"
              :min="0"
              :max="100"
              :precision="0"
              style="width: 140px"
            />
          </template>
        </el-table-column>
        <el-table-column label="等级">
          <template #default="{ row }">
            <el-tag v-if="row.score >= 90" type="success">优秀</el-tag>
            <el-tag v-else-if="row.score >= 80" type="">良好</el-tag>
            <el-tag v-else-if="row.score >= 70" type="warning">中等</el-tag>
            <el-tag v-else-if="row.score >= 60" type="info">及格</el-tag>
            <el-tag v-else-if="row.score !== null && row.score !== ''" type="danger">不及格</el-tag>
            <span v-else class="text-muted">--</span>
          </template>
        </el-table-column>
      </el-table>

      <!-- 空状态 -->
      <el-empty v-else description="请选择课程和班级后加载学生列表" />

      <!-- 操作按钮 -->
      <div v-if="gradeList.length > 0" class="action-btns">
        <el-button @click="handleClear">清空</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">
          <el-icon>
            <Check />
          </el-icon>
          提交成绩
        </el-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.filter-form {
  margin-bottom: 20px;
}

.action-btns {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.text-muted {
  color: #c0c4cc;
}

.teacher-info {
  font-weight: 500;
  color: #409eff;
}
</style>
