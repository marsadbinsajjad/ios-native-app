import { useEffect, useRef, useState } from "react";

import {
  scheduleTimerFinishedNotification,
  cancelTimerFinishedNotification,
} from "../utils/notifications";

function formatTime(totalSeconds) {
  const safeSeconds = Math.max(
    0,
    totalSeconds,
  );

  const hours = Math.floor(
    safeSeconds / 3600,
  );

  const minutes = Math.floor(
    (safeSeconds % 3600) / 60,
  );

  const seconds = safeSeconds % 60;

  return {
    hours: String(hours).padStart(2, "0"),
    minutes: String(minutes).padStart(2, "0"),
    seconds: String(seconds).padStart(2, "0"),
  };
}

/* =========================================================
   PREPARE BELL AUDIO
   ========================================================= */

function createAudioContext() {
  const AudioContext =
    window.AudioContext ||
    window.webkitAudioContext;

  if (!AudioContext) {
    return null;
  }

  return new AudioContext();
}

function playTimerBell(audioContext) {
  if (!audioContext) {
    return;
  }

  try {
    const now = audioContext.currentTime;

    const oscillator =
      audioContext.createOscillator();

    const gain =
      audioContext.createGain();

    oscillator.type = "sine";

    oscillator.frequency.setValueAtTime(
      880,
      now,
    );

    oscillator.frequency.setValueAtTime(
      660,
      now + 0.25,
    );

    oscillator.frequency.setValueAtTime(
      880,
      now + 0.5,
    );

    gain.gain.setValueAtTime(
      0.0001,
      now,
    );

    gain.gain.exponentialRampToValueAtTime(
      0.45,
      now + 0.03,
    );

    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      now + 0.9,
    );

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.start(now);
    oscillator.stop(now + 0.9);
  } catch (error) {
    console.error(
      "Timer bell failed:",
      error,
    );
  }
}

/* =========================================================
   VIBRATION
   ========================================================= */

function vibrateTimer() {
  if ("vibrate" in navigator) {
    navigator.vibrate([
      250,
      120,
      250,
      120,
      500,
    ]);
  }
}

/* =========================================================
   TIMER
   ========================================================= */

function Timer() {
  const [hours, setHours] =
    useState("00");

  const [minutes, setMinutes] =
    useState("30");

  const [seconds, setSeconds] =
    useState("00");

  const [remainingSeconds, setRemainingSeconds] =
    useState(30 * 60);

  const [isRunning, setIsRunning] =
    useState(false);

  const [hasStarted, setHasStarted] =
    useState(false);

  const endTimeRef =
    useRef(null);

  const audioContextRef =
    useRef(null);

  const finishHandledRef =
    useRef(false);

  /* =======================================================
     TIMER COUNTDOWN
     ======================================================= */

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const interval = setInterval(() => {
      if (!endTimeRef.current) {
        return;
      }

      const difference =
        endTimeRef.current -
        Date.now();

      const newRemainingSeconds =
        Math.max(
          0,
          Math.ceil(
            difference / 1000,
          ),
        );

      setRemainingSeconds(
        newRemainingSeconds,
      );

      if (newRemainingSeconds <= 0) {
        endTimeRef.current = null;
        setIsRunning(false);
      }
    }, 250);

    return () =>
      clearInterval(interval);
  }, [isRunning]);

  /* =======================================================
     TIMER FINISHED
     ======================================================= */

  useEffect(() => {
    if (
      !hasStarted ||
      isRunning ||
      remainingSeconds !== 0 ||
      finishHandledRef.current
    ) {
      return;
    }

    finishHandledRef.current = true;

    // Stop the scheduled Android notification
    // because the timer finished while app code was active.
    cancelTimerFinishedNotification().catch(
      (error) => {
        console.error(
          "Could not cancel timer notification:",
          error,
        );
      },
    );

    // Play bell
    playTimerBell(
      audioContextRef.current,
    );

    // Vibrate phone
    vibrateTimer();
  }, [
    hasStarted,
    isRunning,
    remainingSeconds,
  ]);

  /* =======================================================
     CUSTOM TIME
     ======================================================= */

  function getCustomSeconds() {
    const safeHours = Math.max(
      0,
      Math.min(
        23,
        Number(hours) || 0,
      ),
    );

    const safeMinutes = Math.max(
      0,
      Math.min(
        59,
        Number(minutes) || 0,
      ),
    );

    const safeSeconds = Math.max(
      0,
      Math.min(
        59,
        Number(seconds) || 0,
      ),
    );

    return (
      safeHours * 3600 +
      safeMinutes * 60 +
      safeSeconds
    );
  }

  /* =======================================================
     START
     ======================================================= */

  async function startTimer() {
    let secondsToRun =
      remainingSeconds;

    if (!hasStarted) {
      const customSeconds =
        getCustomSeconds();

      if (customSeconds > 0) {
        secondsToRun =
          customSeconds;

        setRemainingSeconds(
          customSeconds,
        );
      }
    }

    if (secondsToRun <= 0) {
      return;
    }

    finishHandledRef.current =
      false;

    endTimeRef.current =
      Date.now() +
      secondsToRun * 1000;

    /* Prepare audio during the
       user's button press so Android/WebView
       is more likely to allow playback later. */
    try {
      if (!audioContextRef.current) {
        audioContextRef.current =
          createAudioContext();
      }

      if (
        audioContextRef.current &&
        audioContextRef.current.state ===
          "suspended"
      ) {
        await audioContextRef.current.resume();
      }
    } catch (error) {
      console.error(
        "Could not prepare timer sound:",
        error,
      );
    }

    setHasStarted(true);
    setIsRunning(true);

    try {
      await scheduleTimerFinishedNotification(
        secondsToRun,
      );
    } catch (error) {
      console.error(
        "Could not schedule timer notification:",
        error,
      );
    }
  }

  /* =======================================================
     PAUSE
     ======================================================= */

  async function pauseTimer() {
    setIsRunning(false);

    endTimeRef.current = null;

    try {
      await cancelTimerFinishedNotification();
    } catch (error) {
      console.error(
        "Could not cancel timer notification:",
        error,
      );
    }
  }

  /* =======================================================
     RESET
     ======================================================= */

  async function resetTimer() {
    const customSeconds =
      getCustomSeconds();

    endTimeRef.current = null;

    finishHandledRef.current =
      false;

    setRemainingSeconds(
      customSeconds,
    );

    setIsRunning(false);
    setHasStarted(false);

    try {
      await cancelTimerFinishedNotification();
    } catch (error) {
      console.error(
        "Could not cancel timer notification:",
        error,
      );
    }
  }

  /* =======================================================
     PRESETS
     ======================================================= */

  function setPreset(totalMinutes) {
    const totalSeconds =
      totalMinutes * 60;

    const presetHours =
      Math.floor(
        totalSeconds / 3600,
      );

    const presetMinutes =
      Math.floor(
        (totalSeconds % 3600) / 60,
      );

    setHours(
      String(
        presetHours,
      ).padStart(2, "0"),
    );

    setMinutes(
      String(
        presetMinutes,
      ).padStart(2, "0"),
    );

    setSeconds("00");

    setRemainingSeconds(
      totalSeconds,
    );

    endTimeRef.current = null;

    finishHandledRef.current =
      false;

    setIsRunning(false);
    setHasStarted(false);

    cancelTimerFinishedNotification().catch(
      (error) => {
        console.error(
          "Could not cancel timer notification:",
          error,
        );
      },
    );
  }

  /* =======================================================
     INPUT HANDLERS
     ======================================================= */

  function handleHoursChange(event) {
    const value =
      event.target.value.replace(
        /\D/g,
        "",
      );

    setHours(
      value.slice(0, 2),
    );
  }

  function handleMinutesChange(event) {
    const value =
      event.target.value.replace(
        /\D/g,
        "",
      );

    setMinutes(
      value.slice(0, 2),
    );
  }

  function handleSecondsChange(event) {
    const value =
      event.target.value.replace(
        /\D/g,
        "",
      );

    setSeconds(
      value.slice(0, 2),
    );
  }

  /* =======================================================
     DISPLAY
     ======================================================= */

  const displayedTime =
    formatTime(
      remainingSeconds,
    );

  const timerFinished =
    hasStarted &&
    remainingSeconds === 0 &&
    !isRunning;

  return (
    <div className="timer-page">

      {/* ===================================================
          HEADER
      =================================================== */}

      <section className="timer-header">
        <div>
          <span className="timer-eyebrow">
            FOCUS & ACTIVITY
          </span>

          <h2>Custom Timer</h2>

          <p>
            Set a duration and stay focused on
            what you're doing.
          </p>
        </div>
      </section>

      {/* ===================================================
          TIMER DISPLAY
      =================================================== */}

      <section className="timer-card">
        <div
          className={
            timerFinished
              ? "timer-display finished"
              : "timer-display"
          }
        >
          <span>
            {displayedTime.hours}
          </span>

          <b>:</b>

          <span>
            {displayedTime.minutes}
          </span>

          <b>:</b>

          <span>
            {displayedTime.seconds}
          </span>
        </div>

        <div className="timer-status">
          {timerFinished
            ? "Time's up!"
            : isRunning
            ? "Timer running"
            : hasStarted
            ? "Timer paused"
            : "Ready to start"}
        </div>

        <div className="timer-controls">

          {!isRunning ? (
            <button
              type="button"
              className="timer-start-button"
              onClick={startTimer}
            >
              ▶ Start
            </button>
          ) : (
            <button
              type="button"
              className="timer-pause-button"
              onClick={pauseTimer}
            >
              ❚❚ Pause
            </button>
          )}

          <button
            type="button"
            className="timer-reset-button"
            onClick={resetTimer}
          >
            ↻ Reset
          </button>

        </div>
      </section>

      {/* ===================================================
          CUSTOM DURATION
      =================================================== */}

      <section className="timer-section">

        <div className="timer-section-heading">
          <div>
            <span>SET DURATION</span>

            <h3>
              Custom time
            </h3>
          </div>
        </div>

        <div className="timer-inputs">

          <label>
            <span>Hours</span>

            <input
              type="text"
              inputMode="numeric"
              value={hours}
              onChange={
                handleHoursChange
              }
              maxLength={2}
              placeholder="00"
            />
          </label>

          <div className="timer-colon">
            :
          </div>

          <label>
            <span>Minutes</span>

            <input
              type="text"
              inputMode="numeric"
              value={minutes}
              onChange={
                handleMinutesChange
              }
              maxLength={2}
              placeholder="30"
            />
          </label>

          <div className="timer-colon">
            :
          </div>

          <label>
            <span>Seconds</span>

            <input
              type="text"
              inputMode="numeric"
              value={seconds}
              onChange={
                handleSecondsChange
              }
              maxLength={2}
              placeholder="00"
            />
          </label>

        </div>

        <button
          type="button"
          className="timer-apply-button"
          onClick={resetTimer}
        >
          Apply custom time
        </button>

      </section>

      {/* ===================================================
          PRESETS
      =================================================== */}

      <section className="timer-section">

        <div className="timer-section-heading">
          <div>
            <span>QUICK START</span>

            <h3>
              Popular durations
            </h3>
          </div>
        </div>

        <div className="timer-presets">

          <button
            type="button"
            onClick={() =>
              setPreset(5)
            }
          >
            5 min
          </button>

          <button
            type="button"
            onClick={() =>
              setPreset(10)
            }
          >
            10 min
          </button>

          <button
            type="button"
            onClick={() =>
              setPreset(15)
            }
          >
            15 min
          </button>

          <button
            type="button"
            onClick={() =>
              setPreset(20)
            }
          >
            20 min
          </button>

          <button
            type="button"
            onClick={() =>
              setPreset(30)
            }
          >
            30 min
          </button>

          <button
            type="button"
            onClick={() =>
              setPreset(60)
            }
          >
            60 min
          </button>

        </div>
      </section>

      {/* ===================================================
          TIP
      =================================================== */}

      <section className="timer-tip">

        <div className="timer-tip-icon">
          ⏱️
        </div>

        <div>
          <strong>
            Use it for anything
          </strong>

          <p>
            Workout, study, reading,
            meditation, breaks, or any
            other activity you want to
            time.
          </p>
        </div>

      </section>

    </div>
  );
}

export default Timer;