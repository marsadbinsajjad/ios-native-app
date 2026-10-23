import { useEffect, useState } from "react";
import { getDateKey } from "../utils/streak";

const STORAGE_KEY = "winter_arc_journal";

function useJournal() {
  const [entries, setEntries] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return {};
    }

    try {
      const parsed = JSON.parse(saved);

      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  });

  const todayKey = getDateKey(new Date());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  function saveEntry(mood, text) {
    setEntries((current) => ({
      ...current,
      [todayKey]: {
        mood,
        text,
        updatedAt: new Date().toISOString(),
      },
    }));
  }

  function deleteEntry(dateKey) {
    setEntries((current) => {
      const updated = {
        ...current,
      };

      delete updated[dateKey];

      return updated;
    });
  }

  return {
    entries,
    todayEntry: entries[todayKey] || null,
    saveEntry,
    deleteEntry,
  };
}

export default useJournal;
