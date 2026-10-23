const WINTER_ARC_START_MONTH = 9; // October
const WINTER_ARC_START_DAY = 1;

const WINTER_ARC_END_MONTH = 1; // February
const WINTER_ARC_END_DAY = 28;

function getWinterArcDates() {
  const today = new Date();

  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  let startYear;
  let endYear;

  // October, November, December
  if (currentMonth >= WINTER_ARC_START_MONTH) {
    startYear = currentYear;
    endYear = currentYear + 1;
  } else {
    // January through September
    startYear = currentYear - 1;
    endYear = currentYear;
  }

  const startDate = new Date(
    startYear,
    WINTER_ARC_START_MONTH,
    WINTER_ARC_START_DAY,
  );

  const endDate = new Date(endYear, WINTER_ARC_END_MONTH, WINTER_ARC_END_DAY);

  return {
    startDate,
    endDate,
  };
}

function getWinterArcProgress() {
  const today = new Date();

  const { startDate, endDate } = getWinterArcDates();

  const millisecondsPerDay = 1000 * 60 * 60 * 24;

  const totalDays = Math.floor((endDate - startDate) / millisecondsPerDay) + 1;

  const elapsedDays = Math.floor((today - startDate) / millisecondsPerDay);

  let currentDay = elapsedDays + 1;

  if (currentDay < 1) {
    currentDay = 0;
  }

  if (currentDay > totalDays) {
    currentDay = totalDays;
  }

  const daysRemaining = Math.max(totalDays - currentDay, 0);

  return {
    currentDay,
    totalDays,
    daysRemaining,
    startDate,
    endDate,
  };
}

function formatDate(date) {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export { getWinterArcDates, getWinterArcProgress, formatDate };
