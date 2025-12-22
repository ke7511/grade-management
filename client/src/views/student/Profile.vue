<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { changePassword } from '@/api/user'
import { ElMessage } from 'element-plus'

const userStore = useUserStore()

const loading = ref(false)

// 个人信息
const form = reactive({
  username: '',
  name: '',
  studentCode: '',
  className: '',
  major: ''
})

// 加载个人信息
onMounted(async () => {
  try {
    await userStore.fetchUserInfo()
    form.username = userStore.userInfo.username || ''
    form.name = userStore.userInfo.name || ''
    form.studentCode = userStore.userInfo.studentCode || ''
    form.className = userStore.userInfo.className || ''
    form.major = userStore.userInfo.major || ''
  } catch {
    // 错误已处理
  }
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

// 修改密码
const handleChangePassword = async () => {
  if (!passwordFormRef.value) return

  try {
    await passwordFormRef.value.validate()
    loading.value = true

    await changePassword({
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword
    })

    ElMessage.success('密码修改成功')
    passwordForm.oldPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
  } catch {
    // 错误已在拦截器处理
  } finally {
    loading.value = false
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

          <el-form :model="form" label-width="100px">
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
                  <el-input v-model="form.studentCode" disabled />
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
            </el-row>
          </el-form>
        </div>
      </el-col>

      <!-- 修改密码卡片 -->
      <el-col :span="10">
        <div class="page-card">
          <h3 class="page-title">修改密码</h3>

          <el-form
            ref="passwordFormRef"
            :model="passwordForm"
            :rules="passwordRules"
            label-width="100px"
          >
            <el-form-item label="原密码" prop="oldPassword">
              <el-input
                v-model="passwordForm.oldPassword"
                type="password"
                placeholder="请输入原密码"
                show-password
              />
            </el-form-item>
            <el-form-item label="新密码" prop="newPassword">
              <el-input
                v-model="passwordForm.newPassword"
                type="password"
                placeholder="请输入新密码"
                show-password
              />
            </el-form-item>
            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input
                v-model="passwordForm.confirmPassword"
                type="password"
                placeholder="请再次输入新密码"
                show-password
              />
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
