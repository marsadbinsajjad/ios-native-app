import { useState } from "react";
import { getDateKey } from "../utils/streak";

function Journal({ entries, todayEntry, saveEntry, deleteEntry }) {
  const [mood, setMood] = useState("Great");
  const [text, setText] = useState("");
  const [savedMessage, setSavedMessage] = useState(false);

  const moods = [
    { name: "Great", icon: "😊" },
    { name: "Good", icon: "🙂" },
    { name: "Okay", icon: "😐" },
    { name: "Low", icon: "😔" },
    { name: "Tough", icon: "😤" },
  ];

  function handleSave() {
    const cleanText = text.trim();

    if (!cleanText) {
      return;
    }

    saveEntry(mood, cleanText);

    // Clear the writing area after saving
    setText("");
    setMood("Great");

    setSavedMessage(true);

    setTimeout(() => {
      setSavedMessage(false);
    }, 2000);
  }

  function handleDeleteToday() {
    const confirmed = window.confirm("Delete today's journal entry?");

    if (!confirmed) {
      return;
    }

    deleteEntry(getDateKey(new Date()));

    // Clear editor too
    setText("");
    setMood("Great");
  }

  const todayKey = getDateKey(new Date());

  const previousEntries = Object.entries(entries)
    .filter(([date]) => date !== todayKey)
    .sort((a, b) => b[0].localeCompare(a[0]));

  function formatEntryDate(dateKey) {
    const date = new Date(`${dateKey}T00:00:00`);

    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }

  function getMoodIcon(moodName) {
    return moods.find((item) => item.name === moodName)?.icon || "📝";
  }

  return (
    <div className="journal-page">
      {/* HEADER */}

      <div className="journal-header">
        <span className="journal-eyebrow">DAILY REFLECTION</span>

        <h2>Journal</h2>

        <p>Take a moment to reflect on your day.</p>
      </div>

      <div className="journal-date">
        {new Date().toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        })}
      </div>

      {/* WRITE JOURNAL */}

      <section className="journal-card">
        <div className="journal-section-heading">
          <h3>How are you feeling?</h3>

          <p>Choose the mood that best describes today.</p>
        </div>

        <div className="mood-list">
          {moods.map((item) => (
            <button
              key={item.name}
              type="button"
              className={
                mood === item.name ? "mood-button selected" : "mood-button"
              }
              onClick={() => setMood(item.name)}
            >
              <span>{item.icon}</span>
              {item.name}
            </button>
          ))}
        </div>

        <div className="journal-section-heading reflection-heading">
          <h3>Today's reflection</h3>
        </div>

        <textarea
          className="journal-textarea"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Write about your day, what you learned, what went well, or what you want to improve..."
          maxLength={1000}
        />

        <div className="journal-bottom">
          <span>{text.length}/1000</span>

          <div className="journal-save-area">
            {savedMessage && <span className="journal-saved">✓ Saved</span>}

            <button
              type="button"
              className="save-entry-button"
              onClick={handleSave}
            >
              Save entry
            </button>
          </div>
        </div>
      </section>

      {/* TODAY'S SAVED NOTE */}

      {todayEntry && (
        <section className="saved-today-card">
          <div className="saved-today-top">
            <div>
              <span className="saved-label">TODAY'S ENTRY</span>

              <h3>
                {getMoodIcon(todayEntry.mood)} {todayEntry.mood}
              </h3>
            </div>

            <div className="saved-today-actions">
              <span className="saved-check">✓</span>

              <button
                type="button"
                className="delete-today-button"
                onClick={handleDeleteToday}
                aria-label="Delete today's journal entry"
              >
                🗑
              </button>
            </div>
          </div>

          <p>{todayEntry.text}</p>
        </section>
      )}

      {/* PREVIOUS ENTRIES */}

      <div className="previous-entries-heading">
        <div>
          <h3>Previous entries</h3>

          <span>{previousEntries.length}</span>
        </div>
      </div>

      {previousEntries.length === 0 ? (
        <div className="empty-journal">
          <div className="empty-journal-icon">📝</div>

          <h3>No previous entries</h3>

          <p>Your older reflections will appear here.</p>
        </div>
      ) : (
        <div className="journal-entries">
          {previousEntries.map(([date, entry]) => (
            <article className="journal-entry" key={date}>
              <div className="journal-entry-top">
                <div>
                  <span className="entry-date">{formatEntryDate(date)}</span>

                  <div className="entry-mood">
                    {getMoodIcon(entry.mood)} {entry.mood}
                  </div>
                </div>

                <button
                  type="button"
                  className="delete-entry-button"
                  onClick={() => {
                    const confirmed = window.confirm(
                      "Delete this journal entry?",
                    );

                    if (confirmed) {
                      deleteEntry(date);
                    }
                  }}
                  aria-label="Delete journal entry"
                >
                  🗑
                </button>
              </div>

              <p className="entry-text">{entry.text}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default Journal;
