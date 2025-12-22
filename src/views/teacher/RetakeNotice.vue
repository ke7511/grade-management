<script setup>
import { ref, computed } from 'vue'
import { useGradeStore } from '@/stores/grade'
import { ElMessage } from 'element-plus'

const gradeStore = useGradeStore()

const selectedCourse = ref(null)
const passScore = ref(60)

// 课程选项
const courseOptions = computed(() => gradeStore.courses)

// 不及格学生列表
const failedList = computed(() => {
  let list = gradeStore.grades.filter((g) => g.score < passScore.value)

  if (selectedCourse.value) {
    list = list.filter((g) => g.courseId === selectedCourse.value)
  }

  return list.map((g) => {
    const student = gradeStore.students.find((s) => s.id === g.studentId)
    const course = gradeStore.courses.find((c) => c.id === g.courseId)
    return {
      ...g,
      studentCode: student?.studentId || '',
      studentName: student?.name || '',
      className: student?.className || '',
      courseName: course?.name || ''
    }
  })
})

// 打印通知单
const handlePrint = () => {
  if (failedList.value.length === 0) {
    ElMessage.warning('没有需要打印的补考通知单')
    return
  }

  // 创建打印内容
  const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>补考通知单</title>
      <style>
        body { font-family: 'Microsoft YaHei', sans-serif; padding: 20px; }
        .notice { page-break-after: always; padding: 40px; border: 2px solid #333; margin-bottom: 20px; }
        .notice:last-child { page-break-after: auto; }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { margin: 0; font-size: 24px; }
        .header p { margin: 10px 0 0; color: #666; }
        .info { margin: 20px 0; }
        .info-row { display: flex; margin: 12px 0; }
        .info-label { width: 80px; color: #666; }
        .info-value { font-weight: bold; }
        .content { margin: 30px 0; line-height: 2; }
        .footer { margin-top: 40px; text-align: right; }
        .stamp { margin-top: 20px; color: #666; }
      </style>
    </head>
    <body>
      ${failedList.value.map(item => `
        <div class="notice">
          <div class="header">
            <h1>补考通知单</h1>
            <p>学年学期：${item.semester}</p>
          </div>
          <div class="info">
            <div class="info-row">
              <span class="info-label">学号：</span>
              <span class="info-value">${item.studentCode}</span>
            </div>
            <div class="info-row">
              <span class="info-label">姓名：</span>
              <span class="info-value">${item.studentName}</span>
            </div>
            <div class="info-row">
              <span class="info-label">班级：</span>
              <span class="info-value">${item.className}</span>
            </div>
          </div>
          <div class="content">
            <p>同学你好：</p>
            <p>你在本学期《<strong>${item.courseName}</strong>》课程考试中，成绩为 <strong style="color: red;">${item.score}</strong> 分，未达到及格标准（${passScore.value}分）。</p>
            <p>请于下学期开学第一周参加补考，具体时间地点另行通知。请认真复习，做好准备。</p>
          </div>
          <div class="footer">
            <p>教务处</p>
            <p class="stamp">${new Date().toLocaleDateString()}</p>
          </div>
        </div>
      `).join('')}
    </body>
    </html>
  `

  // 打开新窗口打印
  const printWindow = window.open('', '_blank')
  printWindow.document.write(printContent)
  printWindow.document.close()
  printWindow.print()

  ElMessage.success('打印窗口已打开')
}

// 批量导出
const handleExport = () => {
  if (failedList.value.length === 0) {
    ElMessage.warning('没有可导出的数据')
    return
  }

  const headers = ['学号', '姓名', '班级', '课程', '成绩', '学期']
  const rows = failedList.value.map((d) => [
    d.studentCode,
    d.studentName,
    d.className,
    d.courseName,
    d.score,
    d.semester
  ])

  const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n')
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
        <el-form-item label="课程">
          <el-select v-model="selectedCourse" placeholder="全部课程" clearable style="width: 180px">
            <el-option v-for="course in courseOptions" :key="course.id" :label="course.name" :value="course.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="及格分数线">
          <el-input-number v-model="passScore" :min="0" :max="100" />
        </el-form-item>
      </el-form>

      <!-- 统计信息 -->
      <el-alert v-if="failedList.length > 0" :title="`共有 ${failedList.length} 名学生需要补考`" type="warning" show-icon
        :closable="false" style="margin-bottom: 20px" />

      <!-- 操作按钮 -->
      <div class="action-btns">
        <el-button type="primary" @click="handlePrint">
          <el-icon>
            <Printer />
          </el-icon>
          打印通知单
        </el-button>
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
      <el-table :data="failedList" stripe style="width: 100%">
        <el-table-column type="index" label="#" width="60" />
        <el-table-column prop="studentCode" label="学号" width="120" />
        <el-table-column prop="studentName" label="姓名" width="100" />
        <el-table-column prop="className" label="班级" width="140" />
        <el-table-column prop="courseName" label="课程" width="120" />
        <el-table-column prop="semester" label="学期" width="100" />
        <el-table-column prop="score" label="成绩" width="80">
          <template #default="{ row }">
            <el-tag type="danger">{{ row.score }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="差分" width="80">
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
</style>
