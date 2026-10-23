import {
  getWinterArcProgress,
  formatDate,
} from "../utils/winterArc";

function Dashboard({
  habits,
  completedIds,
  toggleHabit,
}) {
  const {
    currentDay,
    totalDays,
    daysRemaining,
  } = getWinterArcProgress();

  const completedHabits =
    habits.filter((habit) =>
      completedIds.includes(habit.id),
    ).length;

  const progress =
    habits.length === 0
      ? 0
      : Math.round(
          (completedHabits /
            habits.length) *
            100,
        );

  return (
    <>
      <div className="page-heading">
        <div>
          <h2>Today's journey</h2>

          <p>
            Day {currentDay} of {totalDays}
          </p>
        </div>

        <span className="date-text">
          {formatDate(new Date())}
        </span>
      </div>

      <section className="progress-card">
        <div className="progress-card-top">
          <div>
            <span className="small-label">
              DAILY PROGRESS
            </span>

            <div className="percentage">
              {progress}%
            </div>
          </div>

          <div className="snowflake">
            ❄️
          </div>
        </div>

        <div className="progress-track">
          <div
            className="progress-fill"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>

        <div className="progress-footer">
          <span>
            {completedHabits} completed
          </span>

          <span>
            {habits.length -
              completedHabits}{" "}
            remaining
          </span>
        </div>
      </section>

      <div className="section-heading">
        <h3>Your habits</h3>

        <span>
          {completedHabits} / {habits.length}
        </span>
      </div>

      <div className="habit-list">
        {habits.map((habit) => {
          const completed =
            completedIds.includes(
              habit.id,
            );

          return (
            <div
              className="habit-card"
              key={habit.id}
            >
              <div className="habit-icon">
                {habit.icon}
              </div>

              <div className="habit-info">
                <h4>{habit.name}</h4>

                <p>
                  {habit.description}
                </p>
              </div>

              <button
                className={`habit-check ${
                  completed
                    ? "completed"
                    : ""
                }`}
                onClick={() =>
                  toggleHabit(habit.id)
                }
              >
                {completed
                  ? "✓"
                  : "○"}
              </button>
            </div>
          );
        })}
      </div>

      <div className="reminder-card">
        <span>
          ✦ TODAY'S REMINDER
        </span>

        <strong>
          {daysRemaining} days left. Keep showing up for yourself.
        </strong>
      </div>
    </>
  );
}

export default Dashboard;