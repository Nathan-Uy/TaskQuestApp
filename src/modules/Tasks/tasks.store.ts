import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Task, TaskPriority } from '@/modules/Tasks/tasks.type'
import { useGamificationStore } from '@/components/sidebar.store'

export const useTasksStore = defineStore('tasks', () => {
  const tasks = ref<Task[]>([])
  const gamification = useGamificationStore()

  const activeTasks    = computed(() => tasks.value.filter(t => t.status === 'active'))
  const completedToday = computed(() => {
    const today = new Date().toDateString()
    return tasks.value.filter(t =>
      t.status === 'completed' && t.completedAt?.toDateString() === today
    )
  })

  function addTask(payload: {
    title: string
    priority: TaskPriority
    duration: number
    notes?: string
    goalId?: number
  }) {
    const xpReward = Math.max(10, Math.floor(payload.duration / 60))
    tasks.value.push({
      id:            Date.now(),
      title:         payload.title,
      notes:         payload.notes,
      priority:      payload.priority,
      goalId:        payload.goalId,
      duration:      payload.duration,
      remainingTime: payload.duration,
      isRunning:     false,
      xpReward,
      status:        'active',
      createdAt:     new Date(),
    })
  }

  function completeTask(id: number) {
    const task = tasks.value.find(t => t.id === id)
    if (!task) return
    task.status      = 'completed'
    task.completedAt = new Date()
    task.isRunning   = false
    gamification.recordTaskComplete()
  }

  function deleteTask(id: number) {
    tasks.value = tasks.value.filter(t => t.id !== id)
  }

  function updateTask(id: number, patch: Partial<Task>) {
    const task = tasks.value.find(t => t.id === id)
    if (task) Object.assign(task, patch)
  }

  return { tasks, activeTasks, completedToday, addTask, completeTask, deleteTask, updateTask }
})