import { useEffect, useState } from "react";

const STORAGE_KEY = "winter_arc_habits";

const initialHabits = [
  {
    id: 1,
    name: "Wake up early",
    description: "Before 7:00 AM",
    icon: "☀️",
  },
  {
    id: 2,
    name: "Study",
    description: "60 minute target",
    icon: "📚",
  },
  {
    id: 3,
    name: "Programming",
    description: "90 minute target",
    icon: "💻",
  },
  {
    id: 4,
    name: "Move your body",
    description: "30 minute target",
    icon: "🏃",
  },
  {
    id: 5,
    name: "Read",
    description: "20 minute target",
    icon: "📖",
  },
  {
    id: 6,
    name: "Sleep routine",
    description: "Wind down before bed",
    icon: "🌙",
  },
];

function cleanHabits(habits) {
  return habits.map(({ completed, ...habit }) => habit);
}

function useHabits() {
  const [habits, setHabits] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return initialHabits;
    }

    try {
      const parsed = JSON.parse(saved);

      if (!Array.isArray(parsed)) {
        return initialHabits;
      }

      return cleanHabits(parsed);
    } catch {
      return initialHabits;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
  }, [habits]);

  function addHabit(habit) {
    setHabits((current) => [
      ...current,
      {
        ...habit,
        id: Date.now(),
      },
    ]);
  }

  function updateHabit(updatedHabit) {
    setHabits((current) =>
      current.map((habit) =>
        habit.id === updatedHabit.id ? updatedHabit : habit,
      ),
    );
  }

  function deleteHabit(id) {
    setHabits((current) => current.filter((habit) => habit.id !== id));
  }

  return {
    habits,
    setHabits,
    addHabit,
    updateHabit,
    deleteHabit,
  };
}

export default useHabits;
