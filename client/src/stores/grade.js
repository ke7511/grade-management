import { ref } from 'vue'
import { defineStore } from 'pinia'
import { getCourses, getClasses, getStudents } from '@/api/base'
import {
  getGrades as getGradesApi,
  createGrades as createGradesApi,
  updateGrade as updateGradeApi,
  deleteGrade as deleteGradeApi,
  getCourseStats as getCourseStatsApi,
  getFailedStudents as getFailedStudentsApi
} from '@/api/grade'

export const useGradeStore = defineStore('grade', () => {
  // 课程数据
  const courses = ref([])
  // 班级数据
  const classes = ref([])
  // 学生数据
  const students = ref([])
  // 成绩数据
  const grades = ref([])

  // 加载课程列表
  async function loadCourses() {
    try {
      const res = await getCourses()
      courses.value = res.data
      return res.data
    } catch {
      return []
    }
  }

  // 加载班级列表
  async function loadClasses() {
    try {
      const res = await getClasses()
      classes.value = res.data
      return res.data
    } catch {
      return []
    }
  }

  // 加载学生列表
  async function loadStudents(classId) {
    try {
      const res = await getStudents({ classId })
      students.value = res.data
      return res.data
    } catch {
      return []
    }
  }

  // 加载成绩列表
  async function loadGrades(params) {
    try {
      const res = await getGradesApi(params)
      grades.value = res.data
      return res.data
    } catch {
      return []
    }
  }

  // 批量录入成绩
  async function addGrades(data) {
    return await createGradesApi(data)
  }

  // 更新成绩
  async function updateGrade(id, score) {
    return await updateGradeApi(id, score)
  }

  // 删除成绩
  async function deleteGrade(id) {
    return await deleteGradeApi(id)
  }

  // 获取课程成绩统计
  async function getCourseStats(courseId) {
    try {
      const res = await getCourseStatsApi(courseId)
      return res.data
    } catch {
      return null
    }
  }

  // 获取不及格学生
  async function getFailedStudents(params) {
    try {
      const res = await getFailedStudentsApi(params)
      return res.data
    } catch {
      return []
    }
  }

  return {
    courses,
    classes,
    students,
    grades,
    loadCourses,
    loadClasses,
    loadStudents,
    loadGrades,
    addGrades,
    updateGrade,
    deleteGrade,
    getCourseStats,
    getFailedStudents
  }
})
