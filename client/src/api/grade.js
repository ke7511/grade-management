import request from './request'

// 获取成绩列表
export function getGrades(params) {
  return request.get('/grades', { params })
}

// 批量录入成绩
export function createGrades(data) {
  return request.post('/grades', data)
}

// 更新成绩
export function updateGrade(id, score) {
  return request.put(`/grades/${id}`, { score })
}

// 删除成绩
export function deleteGrade(id) {
  return request.delete(`/grades/${id}`)
}

// 获取课程成绩统计
export function getCourseStats(courseId) {
  return request.get(`/grades/stats/${courseId}`)
}

// 获取不及格学生
export function getFailedStudents(params) {
  return request.get('/grades/failed', { params })
}
