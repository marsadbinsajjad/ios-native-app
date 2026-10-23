function getDateKey(date) {
  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getPreviousDate(date) {
  const previous = new Date(date);

  previous.setDate(previous.getDate() - 1);

  return previous;
}

function hasActivity(history, date) {
  const key = getDateKey(date);

  return Array.isArray(history[key]) && history[key].length > 0;
}

function getCurrentStreak(history) {
  let date = new Date();
  let streak = 0;

  /*
    If today has no activity yet,
    start checking from yesterday.
  */

  if (!hasActivity(history, date)) {
    date = getPreviousDate(date);
  }

  while (hasActivity(history, date)) {
    streak += 1;
    date = getPreviousDate(date);
  }

  return streak;
}

function getLongestStreak(history) {
  const activeDates = Object.keys(history)
    .filter((date) => Array.isArray(history[date]) && history[date].length > 0)
    .sort();

  if (activeDates.length === 0) {
    return 0;
  }

  let longest = 1;
  let current = 1;

  for (let i = 1; i < activeDates.length; i++) {
    const previous = new Date(`${activeDates[i - 1]}T00:00:00`);

    const currentDate = new Date(`${activeDates[i]}T00:00:00`);

    const difference = (currentDate - previous) / (1000 * 60 * 60 * 24);

    if (difference === 1) {
      current += 1;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }

  return longest;
}

function getActiveDays(history) {
  return Object.values(history).filter(
    (habits) => Array.isArray(habits) && habits.length > 0,
  ).length;
}

function getTodayActivity(history) {
  const todayKey = getDateKey(new Date());

  return history[todayKey] || [];
}

function getStreakData(history) {
  return {
    currentStreak: getCurrentStreak(history),

    longestStreak: getLongestStreak(history),

    activeDays: getActiveDays(history),

    todayActivity: getTodayActivity(history),

    todayActive: getTodayActivity(history).length > 0,
  };
}

export {
  getDateKey,
  getCurrentStreak,
  getLongestStreak,
  getActiveDays,
  getTodayActivity,
  getStreakData,
};
