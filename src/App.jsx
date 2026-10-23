import { useEffect, useState } from "react";

import AppSplash from "./components/AppSplash";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";

import Dashboard from "./pages/Dashboard";
import Habits from "./pages/Habits";
import Calendar from "./pages/Calendar";
import Progress from "./pages/Progress";
import Journal from "./pages/Journal";
import Settings from "./pages/Settings";
import Timer from "./pages/Timer";

import useHabits from "./hooks/useHabits";
import useDailyProgress from "./hooks/useDailyProgress";
import useJournal from "./hooks/useJournal";

import "./App.css";

function App() {
  const [activePage, setActivePage] =
    useState("dashboard");

  const [menuOpen, setMenuOpen] =
    useState(false);

  const [showSplash, setShowSplash] =
    useState(true);

  const habitData = useHabits();

  const dailyProgress =
    useDailyProgress();

  const journalData =
    useJournal();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

  function renderPage() {
    switch (activePage) {
      case "dashboard":
        return (
          <Dashboard
            habits={habitData.habits}
            completedIds={
              dailyProgress.completedIds
            }
            toggleHabit={
              dailyProgress.toggleHabit
            }
          />
        );

      case "habits":
        return (
          <Habits
            habits={habitData.habits}
            setHabits={
              habitData.setHabits
            }
            completedIds={
              dailyProgress.completedIds
            }
            toggleHabit={
              dailyProgress.toggleHabit
            }
          />
        );

      case "calendar":
        return (
          <Calendar
            habits={habitData.habits}
            history={dailyProgress.history}
          />
        );

      case "progress":
        return (
          <Progress
            history={dailyProgress.history}
            habits={habitData.habits}
          />
        );

      case "journal":
        return (
          <Journal
            entries={journalData.entries}
            todayEntry={
              journalData.todayEntry
            }
            saveEntry={
              journalData.saveEntry
            }
            deleteEntry={
              journalData.deleteEntry
            }
          />
        );

      case "settings":
        return <Settings />;

      case "timer":
        return <Timer />;

      default:
        return (
          <Dashboard
            habits={habitData.habits}
            completedIds={
              dailyProgress.completedIds
            }
            toggleHabit={
              dailyProgress.toggleHabit
            }
          />
        );
    }
  }

  return (
    <div className="app">
      <div className="phone-screen">

        {showSplash && <AppSplash />}

        <Header
          openMenu={() =>
            setMenuOpen(true)
          }
        />

        <main className="main-content">
          {renderPage()}
        </main>

        <Sidebar
          open={menuOpen}
          close={() =>
            setMenuOpen(false)
          }
          activePage={activePage}
          setPage={setActivePage}
        />

      </div>
    </div>
  );
}

export default App;