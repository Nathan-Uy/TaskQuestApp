export type CalendarView = 'day' | 'week' | 'month'

export interface CalendarDay {
  date: Date
  isToday: boolean
  isCurrentMonth: boolean
}