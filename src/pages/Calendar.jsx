import { useState } from "react";
import {
  getWinterArcProgress,
  getWinterArcDates,
} from "../utils/winterArc";

function getDateKey(date) {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, "0");

  const day = String(
    date.getDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getMonthTitle(date) {
  return date.toLocaleDateString(
    "en-US",
    {
      month: "long",
      year: "numeric",
    },
  );
}

function Calendar({ habits, history }) {
  const today = new Date();

  const [currentMonth, setCurrentMonth] =
    useState(
      new Date(
        today.getFullYear(),
        today.getMonth(),
        1,
      ),
    );

  const [selectedDate, setSelectedDate] =
    useState(today);

  const {
    startDate,
    endDate,
  } = getWinterArcDates();

  const firstDay =
    new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1,
    );

  const lastDay =
    new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0,
    );

  const firstWeekday =
    firstDay.getDay();

  const daysInMonth =
    lastDay.getDate();

  const days = [];

  for (let i = 0; i < firstWeekday; i++) {
    days.push(null);
  }

  for (
    let day = 1;
    day <= daysInMonth;
    day++
  ) {
    days.push(
      new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        day,
      ),
    );
  }

  function isInsideWinterArc(date) {
    return (
      date >= startDate &&
      date <= endDate
    );
  }

  function isToday(date) {
    if (!date) {
      return false;
    }

    return (
      getDateKey(date) ===
      getDateKey(today)
    );
  }

  function getCompletedCount(date) {
    if (!date) {
      return 0;
    }

    const dateKey =
      getDateKey(date);

    return (
      history[dateKey]?.length || 0
    );
  }

  function isFullyCompleted(date) {
    if (!date || habits.length === 0) {
      return false;
    }

    return (
      getCompletedCount(date) ===
      habits.length
    );
  }

  function selectDate(date) {
    if (!date) {
      return;
    }

    if (!isInsideWinterArc(date)) {
      return;
    }

    setSelectedDate(date);
  }

  function changeMonth(amount) {
    const newMonth =
      new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + amount,
        1,
      );

    const newMonthEnd =
      new Date(
        newMonth.getFullYear(),
        newMonth.getMonth() + 1,
        0,
      );

    if (newMonthEnd < startDate) {
      return;
    }

    if (newMonth > endDate) {
      return;
    }

    setCurrentMonth(newMonth);
  }

  const selectedKey =
    getDateKey(selectedDate);

  const selectedCompleted =
    history[selectedKey] || [];

  const selectedCompletedCount =
    selectedCompleted.length;

  const selectedProgress =
    habits.length === 0
      ? 0
      : Math.round(
          (selectedCompletedCount /
            habits.length) *
            100,
        );

  const {
    currentDay,
    totalDays,
    daysRemaining,
  } = getWinterArcProgress();

  return (
    <div className="calendar-page">

      {/* Header */}

      <div className="calendar-header">
        <div>
          <span className="habits-eyebrow">
            YOUR JOURNEY
          </span>

          <h2>Calendar</h2>

          <p>
            Track your Winter Arc day by day.
          </p>
        </div>

        <div className="calendar-arc-info">
          <strong>
            Day {currentDay}
          </strong>

          <span>
            {daysRemaining} days left
          </span>
        </div>
      </div>

      {/* Month controls */}

      <div className="calendar-controls">

        <button
          className="month-button"
          onClick={() =>
            changeMonth(-1)
          }
        >
          ‹
        </button>

        <h3>
          {getMonthTitle(currentMonth)}
        </h3>

        <button
          className="month-button"
          onClick={() =>
            changeMonth(1)
          }
        >
          ›
        </button>

      </div>

      {/* Calendar */}

      <div className="calendar-card">

        <div className="calendar-weekdays">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        <div className="calendar-grid">

          {days.map((date, index) => {

            if (!date) {
              return (
                <div
                  className="calendar-empty"
                  key={`empty-${index}`}
                />
              );
            }

            const inside =
              isInsideWinterArc(date);

            const completedCount =
              getCompletedCount(date);

            const fullyCompleted =
              isFullyCompleted(date);

            const selected =
              selectedKey ===
              getDateKey(date);

            return (
              <button
                key={getDateKey(date)}
                className={[
                  "calendar-day",
                  inside ? "inside" : "outside",
                  isToday(date) ? "today" : "",
                  selected ? "selected" : "",
                  fullyCompleted
                    ? "fully-completed"
                    : "",
                ].join(" ")}
                onClick={() =>
                  selectDate(date)
                }
                disabled={!inside}
              >
                <span className="day-number">
                  {date.getDate()}
                </span>

                {inside && (
                  <span
                    className={
                      completedCount > 0
                        ? "day-dot active"
                        : "day-dot"
                    }
                  />
                )}

                {inside &&
                  completedCount > 0 && (
                    <span className="day-count">
                      {completedCount}
                    </span>
                  )}
              </button>
            );
          })}

        </div>

      </div>

      {/* Legend */}

      <div className="calendar-legend">

        <div>
          <span className="legend-dot completed" />
          Completed habits
        </div>

        <div>
          <span className="legend-dot partial" />
          Partial day
        </div>

        <div>
          <span className="legend-dot empty" />
          No activity
        </div>

      </div>

      {/* Selected day */}

      <section className="selected-day-card">

        <div className="selected-day-top">

          <div>
            <span>
              SELECTED DAY
            </span>

            <h3>
              {selectedDate.toLocaleDateString(
                "en-US",
                {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                },
              )}
            </h3>
          </div>

          <div className="selected-percentage">
            {selectedProgress}%
          </div>

        </div>

        <div className="selected-progress">
          <div
            style={{
              width: `${selectedProgress}%`,
            }}
          />
        </div>

        <p>
          {selectedCompletedCount} of{" "}
          {habits.length} habits completed
        </p>

        <div className="selected-habits">

          {habits.length === 0 && (
            <span>
              No habits created yet.
            </span>
          )}

          {habits.map((habit) => {

            const completed =
              selectedCompleted.includes(
                habit.id,
              );

            return (
              <div
                className={
                  completed
                    ? "selected-habit completed"
                    : "selected-habit"
                }
                key={habit.id}
              >
                <span>
                  {habit.icon}
                </span>

                <strong>
                  {habit.name}
                </strong>

                <b>
                  {completed ? "✓" : "○"}
                </b>
              </div>
            );
          })}

        </div>

      </section>

      <div className="calendar-range">
        ❄️ Winter Arc: October 1 → February 28
      </div>

    </div>
  );
}

export default Calendar;