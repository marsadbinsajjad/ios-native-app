import { useEffect, useState } from "react";
import { getWinterArcDates, formatDate } from "../utils/winterArc";
import {
  scheduleDailyReminder,
  cancelDailyReminder,
} from "../utils/notifications";

const SETTINGS_KEY = "winter_arc_settings";

function Settings() {
  const { startDate, endDate } = getWinterArcDates();

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem(SETTINGS_KEY);

    if (!saved) {
      return {
        reminders: true,
        darkMode: false,
      };
    }

    try {
      const parsed = JSON.parse(saved);

      return {
        reminders: true,
        darkMode: false,
        ...parsed,
      };
    } catch {
      return {
        reminders: true,
        darkMode: false,
      };
    }
  });

  useEffect(() => {
    document.documentElement.classList.toggle(
      "dark-theme",
      settings.darkMode,
    );
  }, [settings.darkMode]);

  useEffect(() => {
    async function syncReminder() {
      try {
        if (settings.reminders) {
          await scheduleDailyReminder(20, 0);
        } else {
          await cancelDailyReminder();
        }
      } catch (error) {
        console.error("Notification setup failed:", error);
      }
    }

    syncReminder();
  }, [settings.reminders]);

  async function toggleReminders() {
    const newReminderState = !settings.reminders;

    try {
      if (newReminderState) {
        const scheduled = await scheduleDailyReminder(20, 0);

        if (!scheduled) {
          window.alert(
            "Please allow notifications for Winter Arc to enable daily reminders.",
          );
          return;
        }
      } else {
        await cancelDailyReminder();
      }

      const updatedSettings = {
        ...settings,
        reminders: newReminderState,
      };

      setSettings(updatedSettings);

      localStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify(updatedSettings),
      );
    } catch (error) {
      console.error("Failed to update reminders:", error);

      window.alert(
        "Could not update reminders. Please check your notification permission.",
      );
    }
  }

  function toggleDarkMode() {
    const updatedSettings = {
      ...settings,
      darkMode: !settings.darkMode,
    };

    setSettings(updatedSettings);

    localStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify(updatedSettings),
    );
  }

  function exportData() {
    const data = {
      habits: localStorage.getItem("winter_arc_habits"),
      dailyProgress: localStorage.getItem("winter_arc_daily_progress"),
      journal: localStorage.getItem("winter_arc_journal"),
      settings: localStorage.getItem(SETTINGS_KEY),
    };

    const file = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(file);

    const link = document.createElement("a");
    link.href = url;
    link.download = "winter-arc-backup.json";

    link.click();

    URL.revokeObjectURL(url);
  }

  function resetAppData() {
    const confirmed = window.confirm(
      "This will delete your habits, progress, journal entries, and settings. This cannot be undone. Continue?",
    );

    if (!confirmed) {
      return;
    }

    localStorage.removeItem("winter_arc_habits");
    localStorage.removeItem("winter_arc_daily_progress");
    localStorage.removeItem("winter_arc_journal");
    localStorage.removeItem(SETTINGS_KEY);

    window.location.reload();
  }

  return (
    <div className="settings-page">
      <div className="settings-header">
        <span className="settings-eyebrow">APP PREFERENCES</span>

        <h2>Settings</h2>

        <p>Customize your Winter Arc experience.</p>
      </div>

      <section className="settings-card">
        <div className="settings-card-title">
          <div className="settings-title-icon">❄️</div>

          <div>
            <h3>Winter Arc</h3>
            <p>Your current challenge</p>
          </div>
        </div>

        <div className="settings-info-row">
          <span>Start date</span>
          <strong>{formatDate(startDate)}</strong>
        </div>

        <div className="settings-info-row">
          <span>End date</span>
          <strong>{formatDate(endDate)}</strong>
        </div>

        <div className="settings-info-row">
          <span>Status</span>
          <strong className="status-active">Active</strong>
        </div>
      </section>

      <section className="settings-card">
        <div className="settings-card-title">
          <div className="settings-title-icon">🔔</div>

          <div>
            <h3>Reminders</h3>
            <p>Keep yourself accountable</p>
          </div>
        </div>

        <div className="settings-toggle-row">
          <div>
            <strong>Daily reminders</strong>
            <p>Receive reminders to complete your habits.</p>
          </div>

          <button
            type="button"
            className={
              settings.reminders
                ? "settings-switch on"
                : "settings-switch"
            }
            onClick={toggleReminders}
            aria-label="Toggle daily reminders"
          >
            <span />
          </button>
        </div>
      </section>

      <section className="settings-card">
        <div className="settings-card-title">
          <div className="settings-title-icon">🎨</div>

          <div>
            <h3>Appearance</h3>
            <p>Choose your preferred theme</p>
          </div>
        </div>

        <div
          className={
            settings.darkMode
              ? "appearance-option"
              : "appearance-option selected"
          }
          onClick={() => {
            if (settings.darkMode) {
              toggleDarkMode();
            }
          }}
        >
          <div className="appearance-preview">☀️</div>

          <div>
            <strong>Winter Light</strong>
            <p>Clean blue winter theme</p>
          </div>

          {!settings.darkMode && (
            <span className="appearance-check">✓</span>
          )}
        </div>

        <div
          className={
            settings.darkMode
              ? "appearance-option selected"
              : "appearance-option"
          }
          onClick={() => {
            if (!settings.darkMode) {
              toggleDarkMode();
            }
          }}
        >
          <div className="appearance-preview dark-preview">🌙</div>

          <div>
            <strong>Winter Dark</strong>
            <p>Dark theme for a comfortable night experience</p>
          </div>

          {settings.darkMode && (
            <span className="appearance-check">✓</span>
          )}
        </div>
      </section>

      <section className="settings-card">
        <div className="settings-card-title">
          <div className="settings-title-icon">💾</div>

          <div>
            <h3>Your data</h3>
            <p>Manage your Winter Arc information</p>
          </div>
        </div>

        <button
          type="button"
          className="settings-action"
          onClick={exportData}
        >
          <span>📤</span>

          <div>
            <strong>Export data</strong>
            <small>
              Save a backup of your habits, progress and journal.
            </small>
          </div>

          <b>›</b>
        </button>

        <button
          type="button"
          className="settings-action danger"
          onClick={resetAppData}
        >
          <span>🗑️</span>

          <div>
            <strong>Reset all data</strong>
            <small>
              Delete all Winter Arc data from this device.
            </small>
          </div>

          <b>›</b>
        </button>
      </section>

      <section className="settings-about">
        <div className="about-icon">❄️</div>

        <h3>Winter Arc</h3>

        <p>
          Build discipline. Stay consistent. Become your best self.
        </p>

        <span>Version 1.0.0</span>
      </section>
    </div>
  );
}

export default Settings;