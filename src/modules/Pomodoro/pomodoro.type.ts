export type PomodoroPhase = 'work' | 'short-break' | 'long-break'

export type PomodoroStatus = 'idle' | 'running' | 'paused' | 'completed'

export interface PomodoroSettings {
  workMins: number
  shortBreakMins: number
  longBreakMins: number
  sessionsUntilLongBreak: number
}

export interface PomodoroSession {
  id: number
  phase: PomodoroPhase
  durationMins: number
  completedAt: Date
  linkedTaskId: string | null
}

export interface PomodoroState {
  phase: PomodoroPhase
  status: PomodoroStatus
  remainingSeconds: number
  sessionsCompleted: number
  currentSessionStart: Date | null
  linkedTaskId: number | null
  settings: PomodoroSettings
  history: PomodoroSession[]
}