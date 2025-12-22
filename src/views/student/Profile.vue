<script setup>
import { ref, reactive, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

const userStore = useUserStore()

const formRef = ref(null)
const loading = ref(false)

// 个人信息表单
const form = reactive({
  username: computed(() => userStore.userInfo.username),
  name: computed(() => userStore.userInfo.name),
  email: 'example@school.edu.cn',
  phone: '138****8888',
  studentId: '2023001',
  className: '计算机2301班',
  major: '计算机科学与技术',
  grade: '2023级'
})

// 密码修改
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const passwordRules = {
  oldPassword: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

const passwordFormRef = ref(null)

// 保存修改
const handleSave = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success('个人信息保存成功')
  }, 500)
}

// 修改密码
const handleChangePassword = async () => {
  if (!passwordFormRef.value) return

  try {
    await passwordFormRef.value.validate()
    loading.value = true

    setTimeout(() => {
      loading.value = false
      ElMessage.success('密码修改成功')
      passwordForm.oldPassword = ''
      passwordForm.newPassword = ''
      passwordForm.confirmPassword = ''
    }, 500)
  } catch {
    // 验证失败
  }
}
</script>

<template>
  <div class="profile">
    <el-row :gutter="20">
      <!-- 个人信息卡片 -->
      <el-col :span="14">
        <div class="page-card">
          <h3 class="page-title">个人信息</h3>

          <el-form ref="formRef" :model="form" label-width="100px">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="用户名">
                  <el-input v-model="form.username" disabled />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="姓名">
                  <el-input v-model="form.name" disabled />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="学号">
                  <el-input v-model="form.studentId" disabled />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="班级">
                  <el-input v-model="form.className" disabled />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="专业">
                  <el-input v-model="form.major" disabled />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="年级">
                  <el-input v-model="form.grade" disabled />
                </el-form-item>
              </el-col>
            </el-row>

            <el-divider />

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="邮箱">
                  <el-input v-model="form.email" placeholder="请输入邮箱" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="手机号">
                  <el-input v-model="form.phone" placeholder="请输入手机号" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item>
              <el-button type="primary" :loading="loading" @click="handleSave">
                保存修改
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-col>

      <!-- 修改密码卡片 -->
      <el-col :span="10">
        <div class="page-card">
          <h3 class="page-title">修改密码</h3>

          <el-form ref="passwordFormRef" :model="passwordForm" :rules="passwordRules" label-width="100px">
            <el-form-item label="原密码" prop="oldPassword">
              <el-input v-model="passwordForm.oldPassword" type="password" placeholder="请输入原密码" show-password />
            </el-form-item>
            <el-form-item label="新密码" prop="newPassword">
              <el-input v-model="passwordForm.newPassword" type="password" placeholder="请输入新密码" show-password />
            </el-form-item>
            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input v-model="passwordForm.confirmPassword" type="password" placeholder="请再次输入新密码" show-password />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="loading" @click="handleChangePassword">
                修改密码
              </el-button>
            </el-form-item>
          </el-form>
        </div>

        <!-- 头像卡片 -->
        <div class="page-card avatar-card">
          <div class="avatar-container">
            <el-avatar :size="100" class="user-avatar">
              {{ form.name?.[0] || 'U' }}
            </el-avatar>
            <div class="avatar-info">
              <h4>{{ form.name }}</h4>
              <p>{{ form.className }}</p>
              <el-button size="small">更换头像</el-button>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.avatar-card {
  margin-top: 20px;
}

.avatar-container {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-avatar {
  background: linear-gradient(135deg, var(--primary-color) 0%, #79bbff 100%);
  color: #fff;
  font-size: 36px;
}

.avatar-info h4 {
  margin: 0 0 8px;
  font-size: 18px;
  color: #303133;
}

.avatar-info p {
  margin: 0 0 12px;
  color: #909399;
  font-size: 14px;
}
</style>
