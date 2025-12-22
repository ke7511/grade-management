<script setup>
import { reactive } from 'vue'
import { ElMessage } from 'element-plus'

const settings = reactive({
  siteName: '成绩管理系统',
  logo: '',
  passScore: 60,
  excellentScore: 90,
  allowStudentView: true,
  allowExport: true,
  semester: '2025-1',
  emailNotify: true,
  retakeDeadline: 7
})

const handleSave = () => {
  ElMessage.success('设置保存成功')
}

const handleReset = () => {
  ElMessage.info('已恢复默认设置')
}
</script>

<template>
  <div class="system-settings">
    <div class="page-card">
      <el-form :model="settings" label-width="140px" style="max-width: 600px">
        <h3 class="form-title">基础设置</h3>

        <el-form-item label="系统名称">
          <el-input v-model="settings.siteName" />
        </el-form-item>

        <el-form-item label="当前学期">
          <el-select v-model="settings.semester" style="width: 100%">
            <el-option label="2025-2026学年第一学期" value="2025-1" />
            <el-option label="2025-2026学年第二学期" value="2025-2" />
          </el-select>
        </el-form-item>

        <el-divider />
        <h3 class="form-title">成绩设置</h3>

        <el-form-item label="及格分数线">
          <el-input-number v-model="settings.passScore" :min="0" :max="100" />
          <span class="form-tip">分</span>
        </el-form-item>

        <el-form-item label="优秀分数线">
          <el-input-number v-model="settings.excellentScore" :min="0" :max="100" />
          <span class="form-tip">分</span>
        </el-form-item>

        <el-form-item label="补考截止天数">
          <el-input-number v-model="settings.retakeDeadline" :min="1" :max="30" />
          <span class="form-tip">天（成绩公布后）</span>
        </el-form-item>

        <el-divider />
        <h3 class="form-title">功能开关</h3>

        <el-form-item label="学生查看成绩">
          <el-switch v-model="settings.allowStudentView" />
          <span class="form-tip">{{ settings.allowStudentView ? '已开启' : '已关闭' }}</span>
        </el-form-item>

        <el-form-item label="允许导出成绩">
          <el-switch v-model="settings.allowExport" />
          <span class="form-tip">{{ settings.allowExport ? '已开启' : '已关闭' }}</span>
        </el-form-item>

        <el-form-item label="邮件通知">
          <el-switch v-model="settings.emailNotify" />
          <span class="form-tip">{{ settings.emailNotify ? '已开启' : '已关闭' }}</span>
        </el-form-item>

        <el-divider />

        <el-form-item>
          <el-button type="primary" @click="handleSave">保存设置</el-button>
          <el-button @click="handleReset">恢复默认</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<style scoped>
.form-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 20px;
}

.form-tip {
  margin-left: 12px;
  color: #909399;
  font-size: 13px;
}

:deep(.el-divider) {
  margin: 24px 0;
}
</style>
