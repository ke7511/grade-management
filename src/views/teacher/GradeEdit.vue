<script setup>
import { ref, reactive, computed } from 'vue'
import { useGradeStore } from '@/stores/grade'
import { ElMessage, ElMessageBox } from 'element-plus'

const gradeStore = useGradeStore()

const searchForm = reactive({
  keyword: '',
  courseId: null,
  classId: null
})

// 课程选项
const courseOptions = computed(() => gradeStore.courses)
// 班级选项
const classOptions = computed(() => gradeStore.classes)

// 成绩列表
const gradeList = computed(() => {
  return gradeStore.grades.map((g) => {
    const student = gradeStore.students.find((s) => s.id === g.studentId)
    const course = gradeStore.courses.find((c) => c.id === g.courseId)
    return {
      ...g,
      studentCode: student?.studentId || '',
      studentName: student?.name || '',
      className: student?.className || '',
      courseName: course?.name || ''
    }
  }).filter((g) => {
    // 关键词搜索
    if (searchForm.keyword) {
      const keyword = searchForm.keyword.toLowerCase()
      if (!g.studentName.toLowerCase().includes(keyword) &&
        !g.studentCode.toLowerCase().includes(keyword)) {
        return false
      }
    }
    // 课程筛选
    if (searchForm.courseId && g.courseId !== searchForm.courseId) {
      return false
    }
    // 班级筛选
    if (searchForm.classId) {
      const student = gradeStore.students.find((s) => s.id === g.studentId)
      if (student?.classId !== searchForm.classId) {
        return false
      }
    }
    return true
  })
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
const handleEdit = (row) => {
  editForm.id = row.id
  editForm.studentName = row.studentName
  editForm.courseName = row.courseName
  editForm.score = row.score
  editForm.oldScore = row.score
  dialogVisible.value = true
}

// 保存修改
const handleSave = () => {
  if (editForm.score < 0 || editForm.score > 100) {
    ElMessage.error('成绩必须在 0-100 之间')
    return
  }

  gradeStore.updateGrade(editForm.id, editForm.score)
  ElMessage.success('成绩修改成功')
  dialogVisible.value = false
}

// 删除成绩
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除 ${row.studentName} 的 ${row.courseName} 成绩吗？`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const index = gradeStore.grades.findIndex((g) => g.id === row.id)
    if (index !== -1) {
      gradeStore.grades.splice(index, 1)
    }
    ElMessage.success('删除成功')
  } catch {
    // 取消删除
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
          <el-input v-model="searchForm.keyword" placeholder="学号/姓名" clearable style="width: 150px" />
        </el-form-item>
        <el-form-item label="课程">
          <el-select v-model="searchForm.courseId" placeholder="全部课程" clearable style="width: 150px">
            <el-option v-for="course in courseOptions" :key="course.id" :label="course.name" :value="course.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="班级">
          <el-select v-model="searchForm.classId" placeholder="全部班级" clearable style="width: 150px">
            <el-option v-for="cls in classOptions" :key="cls.id" :label="cls.name" :value="cls.id" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 成绩表格 -->
      <el-table :data="gradeList" stripe style="width: 100%">
        <el-table-column type="index" label="#" width="60" />
        <el-table-column prop="studentCode" label="学号" width="120" />
        <el-table-column prop="studentName" label="姓名" width="100" />
        <el-table-column prop="className" label="班级" width="140" />
        <el-table-column prop="courseName" label="课程" width="120" />
        <el-table-column prop="semester" label="学期" width="100" />
        <el-table-column prop="score" label="成绩" width="100">
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
        <el-pagination background layout="total, prev, pager, next" :total="gradeList.length" :page-size="10" />
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
          <el-input-number v-model="editForm.score" :min="0" :max="100" :precision="0" style="width: 100%" />
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
</style>
