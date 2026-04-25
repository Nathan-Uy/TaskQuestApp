import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserProfile } from '../shared/shared-types.types'

export const useGamificationStore = defineStore('gamification', () => {
  const profile = ref<UserProfile>({
    displayName:    'You',
    level:          1,
    currentXP:      0,
    xpToNextLevel:  100,
    totalXP:        0,
    streakDays:     0,
    tasksCompleted: 0,
    pomodorosDone:  0,
  })

  const progressPct = computed(() =>
    Math.min((profile.value.currentXP / profile.value.xpToNextLevel) * 100, 100)
  )

  function awardXP(amount: number) {
    profile.value.currentXP  += amount
    profile.value.totalXP    += amount

    while (profile.value.currentXP >= profile.value.xpToNextLevel) {
      profile.value.currentXP      -= profile.value.xpToNextLevel
      profile.value.level          += 1
      profile.value.xpToNextLevel   = Math.floor(profile.value.xpToNextLevel * 1.5)
    }
  }

  function recordTaskComplete()   { profile.value.tasksCompleted++; awardXP(20) }
  function recordPomodoro()       { profile.value.pomodorosDone++;  awardXP(25) }
  function recordStreakDay()       { profile.value.streakDays++ }

  return { profile, progressPct, awardXP, recordTaskComplete, recordPomodoro, recordStreakDay }
})