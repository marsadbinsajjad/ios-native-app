import { useState } from "react";
import {
  scheduleHabitReminder,
  cancelHabitReminder,
} from "../utils/notifications";

const habitIcons = [
  "☀️",
  "📚",
  "💻",
  "🏃",
  "📖",
  "🌙",
  "💧",
  "🧘",
  "🎯",
  "📝",
];

function Habits({ habits, setHabits, completedIds, toggleHabit }) {
  const [showForm, setShowForm] = useState(false);

  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "🎯",
    reminderTime: "20:00",
  });

  const completedHabits = habits.filter((habit) =>
    completedIds.includes(habit.id),
  ).length;

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function resetForm() {
    setFormData({
      name: "",
      description: "",
      icon: "🎯",
      reminderTime: "20:00",
    });

    setEditingId(null);
    setShowForm(false);
  }

  async function saveHabit(event) {
    event.preventDefault();

    const name = formData.name.trim();
    const description = formData.description.trim();

    if (!name) {
      return;
    }

    if (editingId !== null) {
      const updatedHabit = {
        ...habits.find((habit) => habit.id === editingId),
        name,
        description: description || "Daily goal",
        icon: formData.icon,
        reminderTime: formData.reminderTime,
      };

      setHabits((currentHabits) =>
        currentHabits.map((habit) =>
          habit.id === editingId
            ? updatedHabit
            : habit,
        ),
      );

      await scheduleHabitReminder(updatedHabit);
    } else {
      const newHabit = {
        id: Date.now(),
        name,
        description: description || "Daily goal",
        icon: formData.icon,
        reminderTime: formData.reminderTime,
      };

      setHabits((currentHabits) => [
        ...currentHabits,
        newHabit,
      ]);

      await scheduleHabitReminder(newHabit);
    }

    resetForm();
  }

  function editHabit(habit) {
    setFormData({
      name: habit.name,
      description: habit.description || "",
      icon: habit.icon || "🎯",
      reminderTime: habit.reminderTime || "20:00",
    });

    setEditingId(habit.id);
    setShowForm(true);
  }

  async function deleteHabit(id) {
    const shouldDelete = window.confirm(
      "Are you sure you want to delete this habit?",
    );

    if (!shouldDelete) {
      return;
    }

    await cancelHabitReminder(id);

    setHabits((currentHabits) =>
      currentHabits.filter((habit) => habit.id !== id),
    );
  }

  function openAddForm() {
    setEditingId(null);

    setFormData({
      name: "",
      description: "",
      icon: "🎯",
      reminderTime: "20:00",
    });

    setShowForm(true);
  }

  return (
    <div className="habits-page">
      {/* =========================
          HEADER
      ========================= */}

      <div className="habits-header">
        <div>
          <span className="habits-eyebrow">YOUR ROUTINE</span>

          <h2>Daily Habits</h2>

          <p>Build small habits that become big results.</p>
        </div>

        <button
          type="button"
          className="add-habit-button"
          onClick={openAddForm}
        >
          +
        </button>
      </div>

      {/* =========================
          SUMMARY
      ========================= */}

      <div className="habit-summary">
        <div>
          <span>Today</span>

          <strong>
            {completedHabits}/{habits.length}
          </strong>
        </div>

        <div>
          <span>Completed</span>

          <strong>{completedHabits}</strong>
        </div>

        <div>
          <span>Remaining</span>

          <strong>
            {habits.length - completedHabits}
          </strong>
        </div>
      </div>

      {/* =========================
          FORM
      ========================= */}

      {showForm && (
        <form className="habit-form" onSubmit={saveHabit}>
          <div className="form-top">
            <div>
              <h3>
                {editingId !== null
                  ? "Edit habit"
                  : "Create habit"}
              </h3>

              <p>
                Add something you want to stay consistent with.
              </p>
            </div>

            <button
              type="button"
              className="form-close"
              onClick={resetForm}
            >
              ×
            </button>
          </div>

          {/* Name */}

          <label>
            Habit name

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Read a book"
              maxLength={40}
              autoFocus
            />
          </label>

          {/* Description */}

          <label>
            Description

            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="e.g. 20 minutes"
              maxLength={60}
            />
          </label>

          {/* Reminder Time */}

          <label>
            Reminder time

            <input
              type="time"
              name="reminderTime"
              value={formData.reminderTime}
              onChange={handleChange}
            />

            <small className="habit-reminder-help">
              You will receive this reminder every day.
            </small>
          </label>

          {/* Icons */}

          <div className="icon-section">
            <span>Choose icon</span>

            <div className="icon-picker">
              {habitIcons.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  className={
                    formData.icon === icon
                      ? "icon-option selected"
                      : "icon-option"
                  }
                  onClick={() =>
                    setFormData((current) => ({
                      ...current,
                      icon,
                    }))
                  }
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Form buttons */}

          <div className="form-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={resetForm}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="save-button"
            >
              {editingId !== null
                ? "Save changes"
                : "Add habit"}
            </button>
          </div>
        </form>
      )}

      {/* =========================
          HABIT LIST HEADER
      ========================= */}

      <div className="habits-section-title">
        <h3>Your habits</h3>

        <span>{habits.length} total</span>
      </div>

      {/* =========================
          HABIT LIST
      ========================= */}

      <div className="managed-habits">
        {habits.map((habit) => {
          const completed = completedIds.includes(habit.id);

          return (
            <div
              className={
                completed
                  ? "managed-habit completed"
                  : "managed-habit"
              }
              key={habit.id}
            >
              <div className="managed-icon">
                {habit.icon}
              </div>

              <div className="managed-info">
                <h4>{habit.name}</h4>

                <p>{habit.description}</p>

                {habit.reminderTime && (
                  <span className="habit-reminder-time">
                    🔔 {habit.reminderTime}
                  </span>
                )}
              </div>

              {/* Complete */}

              <button
                type="button"
                className={
                  completed
                    ? "managed-check completed"
                    : "managed-check"
                }
                onClick={() => toggleHabit(habit.id)}
              >
                {completed ? "✓" : "○"}
              </button>

              {/* Edit / Delete */}

              <div className="habit-actions">
                <button
                  type="button"
                  onClick={() => editHabit(habit)}
                  aria-label="Edit habit"
                >
                  ✎
                </button>

                <button
                  type="button"
                  onClick={() => deleteHabit(habit.id)}
                  aria-label="Delete habit"
                >
                  🗑
                </button>
              </div>
            </div>
          );
        })}

        {/* Empty state */}

        {habits.length === 0 && (
          <div className="empty-habits">
            <div>❄️</div>

            <h3>No habits yet</h3>

            <p>
              Create your first habit and start your Winter Arc.
            </p>

            <button
              type="button"
              onClick={openAddForm}
            >
              Create your first habit
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Habits;