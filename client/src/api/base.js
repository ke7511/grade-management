import request from './request'

// 获取课程列表
export function getCourses() {
  return request.get('/courses')
}

// 获取班级列表
export function getClasses() {
  return request.get('/classes')
}

// 获取学生列表
export function getStudents(params) {
  return request.get('/students', { params })
}
