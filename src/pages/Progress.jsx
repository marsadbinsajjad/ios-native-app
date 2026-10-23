import { getStreakData } from "../utils/streak";

import { getWinterArcProgress } from "../utils/winterArc";

function Progress({ history, habits }) {
  const { currentStreak, longestStreak, activeDays, todayActivity } =
    getStreakData(history);

  const { currentDay, totalDays, daysRemaining } = getWinterArcProgress();

  const todayCompleted = todayActivity.length;

  const todayProgress =
    habits.length === 0
      ? 0
      : Math.round((todayCompleted / habits.length) * 100);

  return (
    <div className="progress-page">
      {/* Header */}

      <div className="progress-page-header">
        <span className="habits-eyebrow">YOUR PERFORMANCE</span>

        <h2>Progress</h2>

        <p>See how your Winter Arc is going.</p>
      </div>

      {/* Main streak card */}

      <section className="streak-card">
        <div className="streak-card-top">
          <div>
            <span className="streak-label">CURRENT STREAK</span>

            <div className="streak-number">{currentStreak}</div>

            <p>{currentStreak === 1 ? "day in a row" : "days in a row"}</p>
          </div>

          <div className="streak-icon">🔥</div>
        </div>

        <div className="streak-message">
          {currentStreak === 0 && (
            <span>Complete a habit today to start your streak.</span>
          )}

          {currentStreak > 0 && (
            <span>Keep going. Your consistency is building.</span>
          )}
        </div>
      </section>

      {/* Statistics */}

      <div className="progress-section-title">
        <h3>Statistics</h3>
      </div>

      <div className="progress-stats">
        <div className="progress-stat-card">
          <span>Longest streak</span>

          <strong>{longestStreak}</strong>

          <small>days</small>
        </div>

        <div className="progress-stat-card">
          <span>Active days</span>

          <strong>{activeDays}</strong>

          <small>of {totalDays}</small>
        </div>

        <div className="progress-stat-card">
          <span>Today</span>

          <strong>{todayProgress}%</strong>

          <small>completed</small>
        </div>

        <div className="progress-stat-card">
          <span>Days left</span>

          <strong>{daysRemaining}</strong>

          <small>remaining</small>
        </div>
      </div>

      {/* Winter Arc progress */}

      <div className="progress-section-title">
        <h3>Winter Arc</h3>
      </div>

      <section className="arc-progress-card">
        <div className="arc-progress-header">
          <div>
            <span>OVERALL JOURNEY</span>

            <strong>
              Day {currentDay} of {totalDays}
            </strong>
          </div>

          <b>{Math.round((currentDay / totalDays) * 100)}%</b>
        </div>

        <div className="arc-progress-track">
          <div
            style={{
              width: `${Math.min((currentDay / totalDays) * 100, 100)}%`,
            }}
          />
        </div>

        <div className="arc-progress-footer">
          <span>October 1</span>

          <span>February 28</span>
        </div>
      </section>

      {/* Motivation */}

      <div className="progress-motivation">
        <span>❄️ WINTER ARC</span>

        <strong>Consistency beats intensity.</strong>

        <p>One completed habit is better than waiting for a perfect day.</p>
      </div>
    </div>
  );
}

export default Progress;
