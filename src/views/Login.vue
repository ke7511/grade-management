<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const formRef = ref(null)

const form = reactive({
  username: '',
  password: '',
  role: 'student'
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }]
}

// 模拟用户数据
const mockUsers = {
  admin: { id: 1, username: 'admin', name: '管理员', role: 'admin' },
  teacher: { id: 2, username: 'teacher', name: '张老师', role: 'teacher' },
  student: { id: 3, username: 'student', name: '李同学', role: 'student' }
}

const handleLogin = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    loading.value = true

    // 模拟登录延迟
    await new Promise((resolve) => setTimeout(resolve, 500))

    // 模拟登录验证 - 根据选择的角色登录
    const user = mockUsers[form.role]
    if (user) {
      userStore.login(user)
      ElMessage.success(`欢迎回来，${user.name}！`)
      router.push('/dashboard')
    } else {
      ElMessage.error('登录失败')
    }
  } catch {
    // 验证失败
  } finally {
    loading.value = false
  }
}

// 快速登录
const quickLogin = (role) => {
  form.role = role
  form.username = role
  form.password = '123456'
  handleLogin()
}
</script>

<template>
  <div class="login-container">
    <div class="login-bg">
      <div class="bg-shape shape-1"></div>
      <div class="bg-shape shape-2"></div>
      <div class="bg-shape shape-3"></div>
    </div>

    <div class="login-card">
      <div class="login-header">
        <div class="logo-icon">
          <el-icon size="40">
            <DataBoard />
          </el-icon>
        </div>
        <h1 class="title">成绩管理系统</h1>
        <p class="subtitle">Grade Management System</p>
      </div>

      <el-form ref="formRef" :model="form" :rules="rules" class="login-form" @keyup.enter="handleLogin">
        <el-form-item prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" size="large" :prefix-icon="User" />
        </el-form-item>

        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" size="large" :prefix-icon="Lock"
            show-password />
        </el-form-item>

        <el-form-item prop="role">
          <el-select v-model="form.role" placeholder="请选择角色" size="large" style="width: 100%">
            <el-option label="系统管理员" value="admin">
              <el-icon>
                <Setting />
              </el-icon>
              <span style="margin-left: 8px">系统管理员</span>
            </el-option>
            <el-option label="教师" value="teacher">
              <el-icon>
                <Avatar />
              </el-icon>
              <span style="margin-left: 8px">教师</span>
            </el-option>
            <el-option label="学生" value="student">
              <el-icon>
                <User />
              </el-icon>
              <span style="margin-left: 8px">学生</span>
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" size="large" class="login-btn" :loading="loading" @click="handleLogin">
            {{ loading ? '登录中...' : '登 录' }}
          </el-button>
        </el-form-item>
      </el-form>

      <div class="quick-login">
        <p class="quick-title">快速登录体验</p>
        <div class="quick-btns">
          <el-button size="small" @click="quickLogin('admin')">
            <el-icon>
              <Setting />
            </el-icon>
            管理员
          </el-button>
          <el-button size="small" @click="quickLogin('teacher')">
            <el-icon>
              <Avatar />
            </el-icon>
            教师
          </el-button>
          <el-button size="small" @click="quickLogin('student')">
            <el-icon>
              <User />
            </el-icon>
            学生
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

.login-bg {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
}

.bg-shape {
  position: absolute;
  border-radius: 50%;
  opacity: 0.1;
}

.shape-1 {
  width: 500px;
  height: 500px;
  background: #fff;
  top: -150px;
  left: -100px;
  animation: float 8s ease-in-out infinite;
}

.shape-2 {
  width: 300px;
  height: 300px;
  background: #fff;
  bottom: -50px;
  right: -50px;
  animation: float 6s ease-in-out infinite reverse;
}

.shape-3 {
  width: 200px;
  height: 200px;
  background: #fff;
  top: 50%;
  right: 20%;
  animation: float 10s ease-in-out infinite;
}

@keyframes float {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-30px);
  }
}

.login-card {
  width: 420px;
  padding: 40px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  position: relative;
  z-index: 1;
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.logo-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  color: #fff;
}

.title {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
  margin: 0 0 8px;
}

.subtitle {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.login-form {
  margin-bottom: 20px;
}

.login-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
  border-radius: 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

.login-btn:hover {
  opacity: 0.9;
}

.quick-login {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.quick-title {
  font-size: 13px;
  color: #909399;
  margin: 0 0 12px;
}

.quick-btns {
  display: flex;
  justify-content: center;
  gap: 10px;
}

:deep(.el-input__wrapper) {
  border-radius: 10px;
}

:deep(.el-select__wrapper) {
  border-radius: 10px;
}
</style>
