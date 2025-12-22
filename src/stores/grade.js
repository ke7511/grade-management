import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useGradeStore = defineStore('grade', () => {
  // 模拟课程数据
  const courses = ref([
    { id: 1, name: '高等数学', code: 'MATH101', credit: 4 },
    { id: 2, name: '大学英语', code: 'ENG101', credit: 3 },
    { id: 3, name: '程序设计', code: 'CS101', credit: 4 },
    { id: 4, name: '数据结构', code: 'CS201', credit: 3 },
    { id: 5, name: '计算机网络', code: 'CS301', credit: 3 },
  ])

  // 模拟班级数据
  const classes = ref([
    { id: 1, name: '计算机2301班', studentCount: 35 },
    { id: 2, name: '计算机2302班', studentCount: 32 },
    { id: 3, name: '软件工程2301班', studentCount: 40 },
  ])

  // 模拟学生数据
  const students = ref([
    { id: 1, studentId: '2023001', name: '张三', classId: 1, className: '计算机2301班' },
    { id: 2, studentId: '2023002', name: '李四', classId: 1, className: '计算机2301班' },
    { id: 3, studentId: '2023003', name: '王五', classId: 1, className: '计算机2301班' },
    { id: 4, studentId: '2023004', name: '赵六', classId: 2, className: '计算机2302班' },
    { id: 5, studentId: '2023005', name: '钱七', classId: 2, className: '计算机2302班' },
    { id: 6, studentId: '2023006', name: '孙八', classId: 3, className: '软件工程2301班' },
  ])

  // 成绩数据
  const grades = ref([
    { id: 1, studentId: 1, courseId: 1, score: 85, semester: '2024-1' },
    { id: 2, studentId: 1, courseId: 2, score: 78, semester: '2024-1' },
    { id: 3, studentId: 1, courseId: 3, score: 92, semester: '2024-1' },
    { id: 4, studentId: 2, courseId: 1, score: 55, semester: '2024-1' },
    { id: 5, studentId: 2, courseId: 2, score: 88, semester: '2024-1' },
    { id: 6, studentId: 2, courseId: 3, score: 45, semester: '2024-1' },
    { id: 7, studentId: 3, courseId: 1, score: 72, semester: '2024-1' },
    { id: 8, studentId: 3, courseId: 2, score: 68, semester: '2024-1' },
    { id: 9, studentId: 4, courseId: 1, score: 90, semester: '2024-1' },
    { id: 10, studentId: 5, courseId: 1, score: 58, semester: '2024-1' },
  ])

  // 获取不及格学生
  const failedStudents = computed(() => {
    return grades.value.filter((g) => g.score < 60)
  })

  // 添加成绩
  function addGrade(grade) {
    const newId = Math.max(...grades.value.map((g) => g.id), 0) + 1
    grades.value.push({ ...grade, id: newId })
  }

  // 更新成绩
  function updateGrade(id, score) {
    const grade = grades.value.find((g) => g.id === id)
    if (grade) {
      grade.score = score
    }
  }

  // 获取学生成绩
  function getStudentGrades(studentId) {
    return grades.value
      .filter((g) => g.studentId === studentId)
      .map((g) => {
        const course = courses.value.find((c) => c.id === g.courseId)
        return {
          ...g,
          courseName: course?.name || '',
          courseCode: course?.code || '',
        }
      })
  }

  // 获取课程成绩统计
  function getCourseStats(courseId) {
    const courseGrades = grades.value.filter((g) => g.courseId === courseId)
    if (courseGrades.length === 0) return null

    const scores = courseGrades.map((g) => g.score)
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length
    const max = Math.max(...scores)
    const min = Math.min(...scores)
    const passCount = scores.filter((s) => s >= 60).length
    const passRate = (passCount / scores.length) * 100

    return {
      average: avg.toFixed(1),
      max,
      min,
      passRate: passRate.toFixed(1),
      total: scores.length,
      passCount,
      failCount: scores.length - passCount,
    }
  }

  return {
    courses,
    classes,
    students,
    grades,
    failedStudents,
    addGrade,
    updateGrade,
    getStudentGrades,
    getCourseStats,
  }
})
