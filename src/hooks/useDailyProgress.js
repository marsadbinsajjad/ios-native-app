import { useEffect, useState } from "react";

const STORAGE_KEY = "winter_arc_daily_progress";

const HABITS_STORAGE_KEY = "winter_arc_habits";

function getDateKey(date = new Date()) {
  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function useDailyProgress() {
  const todayKey = getDateKey();

  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      try {
        const parsed = JSON.parse(saved);

        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          return parsed;
        }
      } catch {
        // Use empty history below.
      }
    }

    /*
      Migrate the old completed state once.
      This prevents your current checked habits
      from disappearing when we switch systems.
    */

    const oldHabits = localStorage.getItem(HABITS_STORAGE_KEY);

    if (oldHabits) {
      try {
        const parsed = JSON.parse(oldHabits);

        if (Array.isArray(parsed)) {
          const completedIds = parsed
            .filter((habit) => habit.completed)
            .map((habit) => habit.id);

          if (completedIds.length > 0) {
            return {
              [todayKey]: completedIds,
            };
          }
        }
      } catch {
        // Ignore migration errors.
      }
    }

    return {};
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }, [history]);

  const completedIds = history[todayKey] || [];

  function toggleHabit(id) {
    setHistory((current) => {
      const today = current[todayKey] || [];

      const alreadyCompleted = today.includes(id);

      const updatedToday = alreadyCompleted
        ? today.filter((habitId) => habitId !== id)
        : [...today, id];

      return {
        ...current,
        [todayKey]: updatedToday,
      };
    });
  }

  function isCompleted(id) {
    return completedIds.includes(id);
  }

  function getCompletedForDate(dateKey) {
    return history[dateKey] || [];
  }

  return {
    history,
    completedIds,
    toggleHabit,
    isCompleted,
    getCompletedForDate,
    todayKey,
  };
}

export { getDateKey };

export default useDailyProgress;
