<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useGradeStore } from '@/stores/grade'
import { useUserStore } from '@/stores/user'
import { ElMessage, ElMessageBox } from 'element-plus'

const gradeStore = useGradeStore()
const userStore = useUserStore()

// 是否为教师角色
const isTeacher = computed(() => userStore.role === 'teacher')

const loading = ref(false)
const gradeList = ref([])

const searchForm = reactive({
  keyword: '',
  courseId: null,
  classId: null
})

// 分页
const currentPage = ref(1)
const pageSize = ref(10)

// 计算当前页数据
const pagedGradeList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return gradeList.value.slice(start, end)
})

// 分页变化时重置到第一页
const resetPage = () => {
  currentPage.value = 1
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    await gradeStore.loadCourses()
    await gradeStore.loadClasses()

    // 教师自动设置课程和班级
    if (isTeacher.value && gradeStore.courses.length > 0) {
      searchForm.courseId = gradeStore.courses[0].id
    }
    if (isTeacher.value && gradeStore.classes.length > 0) {
      searchForm.classId = gradeStore.classes[0].id
    }

    await loadGrades()
  } finally {
    loading.value = false
  }
}

// 加载成绩
const loadGrades = async () => {
  loading.value = true
  try {
    const data = await gradeStore.loadGrades({
      keyword: searchForm.keyword,
      courseId: searchForm.courseId,
      classId: searchForm.classId
    })
    gradeList.value = data
    resetPage()
  } finally {
    loading.value = false
  }
}

// 监听搜索条件
watch(
  searchForm,
  () => {
    loadGrades()
  },
  { deep: true }
)

// 初始化
onMounted(() => {
  loadData()
})

// 编辑弹窗
const dialogVisible = ref(false)
const editForm = reactive({
  id: null,
  studentName: '',
  courseName: '',
  score: 0,
  oldScore: 0
})

// 打开编辑弹窗
const handleEdit = row => {
  editForm.id = row.id
  editForm.studentName = row.student_name
  editForm.courseName = row.course_name
  editForm.score = row.score
  editForm.oldScore = row.score
  dialogVisible.value = true
}

// 保存修改
const handleSave = async () => {
  if (editForm.score < 0 || editForm.score > 100) {
    ElMessage.error('成绩必须在 0-100 之间')
    return
  }

  try {
    await gradeStore.updateGrade(editForm.id, editForm.score)
    ElMessage.success('成绩修改成功')
    dialogVisible.value = false
    loadGrades()
  } catch {
    // 错误已处理
  }
}

// 删除成绩
const handleDelete = async row => {
  try {
    await ElMessageBox.confirm(
      `确定要删除 ${row.student_name} 的 ${row.course_name} 成绩吗？`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await gradeStore.deleteGrade(row.id)
    ElMessage.success('删除成功')
    loadGrades()
  } catch {
    // 取消或错误
  }
}

// 重置搜索
const handleReset = () => {
  searchForm.keyword = ''
  searchForm.courseId = null
  searchForm.classId = null
}
</script>

<template>
  <div class="grade-edit">
    <div class="page-card">
      <h3 class="page-title">成绩修改</h3>

      <!-- 搜索区域 -->
      <el-form :model="searchForm" inline class="filter-form">
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.keyword"
            placeholder="学号/姓名"
            clearable
            style="width: 150px"
          />
        </el-form-item>

        <!-- 管理员：显示下拉框 -->
        <template v-if="!isTeacher">
          <el-form-item label="课程">
            <el-select
              v-model="searchForm.courseId"
              placeholder="全部课程"
              clearable
              style="width: 150px"
            >
              <el-option
                v-for="course in gradeStore.courses"
                :key="course.id"
                :label="course.name"
                :value="course.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="班级">
            <el-select
              v-model="searchForm.classId"
              placeholder="全部班级"
              clearable
              style="width: 150px"
            >
              <el-option
                v-for="cls in gradeStore.classes"
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
            <span class="teacher-info">{{ gradeStore.courses[0]?.name || '未分配' }}</span>
          </el-form-item>
          <el-form-item label="班级">
            <span class="teacher-info">{{ gradeStore.classes[0]?.name || '未分配' }}</span>
          </el-form-item>
        </template>
        <el-form-item>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 成绩表格 -->
      <el-table :data="pagedGradeList" stripe style="width: 100%" v-loading="loading">
        <el-table-column type="index" label="#" width="60" />
        <el-table-column prop="student_code" label="学号" min-width="120" />
        <el-table-column prop="student_name" label="姓名" min-width="100" />
        <el-table-column prop="class_name" label="班级" min-width="140" />
        <el-table-column prop="course_name" label="课程" min-width="120" />
        <el-table-column prop="semester" label="学期" min-width="100" />
        <el-table-column prop="score" label="成绩" min-width="100">
          <template #default="{ row }">
            <el-tag :type="row.score >= 60 ? 'success' : 'danger'">
              {{ row.score }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">修改</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          background
          layout="total, sizes, prev, pager, next"
          :total="gradeList.length"
          :page-sizes="[10, 20, 50]"
        />
      </div>
    </div>

    <!-- 编辑弹窗 -->
    <el-dialog v-model="dialogVisible" title="修改成绩" width="400">
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="学生">
          <el-input v-model="editForm.studentName" disabled />
        </el-form-item>
        <el-form-item label="课程">
          <el-input v-model="editForm.courseName" disabled />
        </el-form-item>
        <el-form-item label="原成绩">
          <el-input :value="editForm.oldScore" disabled />
        </el-form-item>
        <el-form-item label="新成绩">
          <el-input-number
            v-model="editForm.score"
            :min="0"
            :max="100"
            :precision="0"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.filter-form {
  margin-bottom: 20px;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.teacher-info {
  font-weight: 500;
  color: #409eff;
}
</style>
