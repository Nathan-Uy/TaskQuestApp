import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { CalendarView } from "./calendar.type";

export const useCalendarStore = defineStore("calendar", () => {
  const currentView = ref<CalendarView>("day");
  const cursor = ref(new Date());

  const weekDays = computed(() => {
    const start = new Date(cursor.value);
    start.setDate(start.getDate() - start.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  });

  const monthGrid = computed(() => {
    const year = cursor.value.getFullYear();
    const month = cursor.value.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const grid: (Date | null)[] = Array(firstDay).fill(null);
    for (let i = 1; i <= daysInMonth; i++) grid.push(new Date(year, month, i));
    while (grid.length % 7 !== 0) grid.push(null);
    return grid;
  });

  const navigate = (dir: number) => {
    const d = new Date(cursor.value);
    if (currentView.value === "day") d.setDate(d.getDate() + dir);
    else if (currentView.value === "week") d.setDate(d.getDate() + dir * 7);
    else d.setMonth(d.getMonth() + dir);
    cursor.value = d;
  };

  const goToToday = () => {
    cursor.value = new Date();
  };
  const setView = (view: CalendarView) => {
    currentView.value = view;
  };
  const setCursor = (date: Date) => {
    cursor.value = new Date(date);
  };

  return {
    currentView,
    cursor,
    weekDays,
    monthGrid,
    navigate,
    goToToday,
    setView,
    setCursor,
  };
});
