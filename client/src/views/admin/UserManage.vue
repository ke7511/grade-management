<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getUsers, createUser, updateUser, deleteUser } from '@/api/user'
import dayjs from 'dayjs'

const users = ref([])
const loading = ref(false)

const roleMap = {
  admin: '管理员',
  teacher: '教师',
  student: '学生'
}

const searchForm = reactive({
  keyword: '',
  role: ''
})

// 分页
const currentPage = ref(1)
const pageSize = ref(10)

// 计算当前页数据
const pagedUsers = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return users.value.slice(start, end)
})

// 加载用户列表
const loadUsers = async () => {
  loading.value = true
  try {
    const res = await getUsers({
      keyword: searchForm.keyword,
      role: searchForm.role
    })
    users.value = res.data
  } catch {
    // 错误已在拦截器处理
  } finally {
    loading.value = false
  }
}

// 监听搜索条件变化
watch(
  searchForm,
  () => {
    loadUsers()
  },
  { deep: true }
)

// 初始化加载
onMounted(() => {
  loadUsers()
})

// 弹窗相关
const dialogVisible = ref(false)
const dialogTitle = ref('添加用户')
const formRef = ref(null)
const userForm = reactive({
  id: null,
  username: '',
  name: '',
  password: '',
  role: 'student',
  status: 1
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }]
}

// 打开添加弹窗
const handleAdd = () => {
  dialogTitle.value = '添加用户'
  Object.assign(userForm, {
    id: null,
    username: '',
    name: '',
    password: '',
    role: 'student',
    status: 1
  })
  dialogVisible.value = true
}

// 打开编辑弹窗
const handleEdit = row => {
  dialogTitle.value = '编辑用户'
  Object.assign(userForm, { ...row, password: '' })
  dialogVisible.value = true
}

// 保存用户
const handleSave = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    if (userForm.id) {
      // 编辑
      await updateUser(userForm.id, userForm)
      ElMessage.success('修改成功')
    } else {
      // 添加
      await createUser(userForm)
      ElMessage.success('添加成功')
    }

    dialogVisible.value = false
    loadUsers()
  } catch {
    // 验证失败或 API 错误
  }
}

// 删除用户
const handleDelete = async row => {
  try {
    await ElMessageBox.confirm(`确定要删除用户"${row.name}"吗？`, '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await deleteUser(row.id)
    ElMessage.success('删除成功')
    loadUsers()
  } catch {
    // 取消删除或 API 错误
  }
}

// 切换状态
const handleStatusChange = async row => {
  try {
    await updateUser(row.id, { ...row })
    const status = row.status === 1 ? '启用' : '禁用'
    ElMessage.success(`已${status}用户"${row.name}"`)
  } catch {
    // 错误时恢复原状态
    row.status = row.status === 1 ? 0 : 1
  }
}
</script>

<template>
  <div class="user-manage">
    <div class="page-card">
      <!-- 搜索区域 -->
      <div class="table-actions">
        <div class="search-area">
          <el-input
            v-model="searchForm.keyword"
            placeholder="搜索用户名/姓名"
            clearable
            style="width: 200px"
          >
            <template #prefix>
              <el-icon>
                <Search />
              </el-icon>
            </template>
          </el-input>
          <el-select
            v-model="searchForm.role"
            placeholder="选择角色"
            clearable
            style="width: 120px"
          >
            <el-option label="管理员" value="admin" />
            <el-option label="教师" value="teacher" />
            <el-option label="学生" value="student" />
          </el-select>
        </div>
        <el-button type="primary" @click="handleAdd">
          <el-icon>
            <Plus />
          </el-icon>
          添加用户
        </el-button>
      </div>

      <!-- 表格 -->
      <el-table :data="pagedUsers" stripe style="width: 100%" v-loading="loading">
        <el-table-column type="index" label="#" width="60" />
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="name" label="姓名" />
        <el-table-column prop="role" label="角色">
          <template #default="{ row }">
            <el-tag
              :type="row.role === 'admin' ? 'danger' : row.role === 'teacher' ? 'warning' : 'info'"
            >
              {{ roleMap[row.role] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="创建时间" min-width="180">
          <template #default="{ row }">
            {{ dayjs(row.created_at).format('YYYY-MM-DD HH:mm') }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
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
          :total="users.length"
          :page-sizes="[10, 20, 50]"
        />
      </div>
    </div>

    <!-- 用户编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500">
      <el-form ref="formRef" :model="userForm" :rules="rules" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="userForm.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="userForm.password"
            type="password"
            :placeholder="userForm.id ? '留空则不修改' : '请输入密码'"
            show-password
          />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="userForm.role" style="width: 100%">
            <el-option label="管理员" value="admin" />
            <el-option label="教师" value="teacher" />
            <el-option label="学生" value="student" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="userForm.status" :active-value="1" :inactive-value="0" />
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
.table-actions {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}

.search-area {
  display: flex;
  gap: 12px;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
