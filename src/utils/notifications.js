import { LocalNotifications } from "@capacitor/local-notifications";

const CHANNEL_ID = "winter-arc-habit-reminders";

/*
  New timer channel ID.
  Using a new ID makes Android create a fresh channel,
  which is important when adding a custom sound.
*/
const TIMER_CHANNEL_ID = "winter-arc-timer-v2";

const NOTIFICATION_PREFIX = 3000;

const DAILY_REMINDER_ID = 1001;

const TIMER_NOTIFICATION_ID = 2001;

/* =========================================================
   BASIC NOTIFICATION SETUP
   ========================================================= */

async function setupNotifications() {
  const permission =
    await LocalNotifications.checkPermissions();

  if (permission.display !== "granted") {
    const result =
      await LocalNotifications.requestPermissions();

    if (result.display !== "granted") {
      return false;
    }
  }

  /* =======================================================
     HABIT REMINDER CHANNEL
     ======================================================= */

  await LocalNotifications.createChannel({
    id: CHANNEL_ID,
    name: "Habit Reminders",
    description:
      "Daily reminders for your Winter Arc habits.",
    importance: 4,
    visibility: 1,
  });

  /* =======================================================
     TIMER CHANNEL
     ======================================================= */

  await LocalNotifications.createChannel({
    id: TIMER_CHANNEL_ID,
    name: "Timer",
    description:
      "Alert when a Winter Arc timer finishes.",
    importance: 4,
    visibility: 1,
    sound: "timer_bell.wav",
    vibration: true,
  });

  return true;
}

/* =========================================================
   HABIT NOTIFICATION ID
   ========================================================= */

function getNotificationId(habitId) {
  const text = String(habitId);

  let hash = 0;

  for (
    let index = 0;
    index < text.length;
    index += 1
  ) {
    hash =
      (hash * 31 +
        text.charCodeAt(index)) %
      100000;
  }

  return NOTIFICATION_PREFIX + hash;
}

/* =========================================================
   TIME HELPER
   ========================================================= */

function getTimeParts(time) {
  if (!time) {
    return null;
  }

  const parts = time.split(":");

  if (parts.length !== 2) {
    return null;
  }

  const hour = Number(parts[0]);
  const minute = Number(parts[1]);

  if (
    !Number.isInteger(hour) ||
    !Number.isInteger(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return null;
  }

  return {
    hour,
    minute,
  };
}

/* =========================================================
   INDIVIDUAL HABIT REMINDER
   ========================================================= */

export async function scheduleHabitReminder(
  habit,
) {
  if (
    !habit?.id ||
    !habit?.reminderTime
  ) {
    return false;
  }

  const time = getTimeParts(
    habit.reminderTime,
  );

  if (!time) {
    return false;
  }

  const ready =
    await setupNotifications();

  if (!ready) {
    return false;
  }

  const notificationId =
    getNotificationId(habit.id);

  await LocalNotifications.cancel({
    notifications: [
      {
        id: notificationId,
      },
    ],
  });

  await LocalNotifications.schedule({
    notifications: [
      {
        id: notificationId,

        title: "Winter Arc ❄️",

        body: `Time for: ${habit.name}`,

        channelId: CHANNEL_ID,

        schedule: {
          on: {
            hour: time.hour,
            minute: time.minute,
          },
        },

        isExactNotification: false,

        autoCancel: true,
      },
    ],
  });

  return true;
}

/* =========================================================
   CANCEL INDIVIDUAL HABIT REMINDER
   ========================================================= */

export async function cancelHabitReminder(
  habitId,
) {
  if (!habitId) {
    return;
  }

  const notificationId =
    getNotificationId(habitId);

  await LocalNotifications.cancel({
    notifications: [
      {
        id: notificationId,
      },
    ],
  });
}

/* =========================================================
   SYNC ALL HABIT REMINDERS
   ========================================================= */

export async function syncHabitReminders(
  habits,
) {
  const ready =
    await setupNotifications();

  if (!ready) {
    return false;
  }

  for (const habit of habits) {
    if (habit?.reminderTime) {
      await scheduleHabitReminder(
        habit,
      );
    }
  }

  return true;
}

/* =========================================================
   DAILY GLOBAL REMINDER
   Used by Settings.jsx
   ========================================================= */

export async function scheduleDailyReminder(
  hour = 20,
  minute = 0,
) {
  const ready =
    await setupNotifications();

  if (!ready) {
    return false;
  }

  await cancelDailyReminder();

  await LocalNotifications.schedule({
    notifications: [
      {
        id: DAILY_REMINDER_ID,

        title: "Winter Arc ❄️",

        body:
          "Keep working on your daily habits.",

        channelId: CHANNEL_ID,

        schedule: {
          on: {
            hour,
            minute,
          },
        },

        isExactNotification: false,

        autoCancel: true,
      },
    ],
  });

  return true;
}

/* =========================================================
   CANCEL DAILY GLOBAL REMINDER
   Used by Settings.jsx
   ========================================================= */

export async function cancelDailyReminder() {
  await LocalNotifications.cancel({
    notifications: [
      {
        id: DAILY_REMINDER_ID,
      },
    ],
  });
}

/* =========================================================
   TIMER FINISH NOTIFICATION
   ========================================================= */

export async function scheduleTimerFinishedNotification(
  remainingSeconds,
) {
  if (
    !Number.isFinite(
      remainingSeconds,
    ) ||
    remainingSeconds <= 0
  ) {
    return false;
  }

  const ready =
    await setupNotifications();

  if (!ready) {
    return false;
  }

  /* Remove any previously scheduled
     timer notification. */
  await cancelTimerFinishedNotification();

  const finishTime = new Date(
    Date.now() +
      remainingSeconds * 1000,
  );

  await LocalNotifications.schedule({
    notifications: [
      {
        id: TIMER_NOTIFICATION_ID,

        title: "Winter Arc ⏱️",

        body:
          "Your timer is finished!",

        channelId:
          TIMER_CHANNEL_ID,

        /*
          This is useful for Android versions
          where notification-level sound is supported.
        */
        sound: "timer_bell.wav",

        schedule: {
          at: finishTime,

          /*
            Helps the notification fire while
            the phone is in Doze mode.
          */
          allowWhileIdle: true,
        },

        /*
          We deliberately do not request an
          exact alarm here.
        */
        isExactNotification: false,

        autoCancel: true,
      },
    ],
  });

  return true;
}

/* =========================================================
   CANCEL TIMER FINISH NOTIFICATION
   ========================================================= */

export async function cancelTimerFinishedNotification() {
  await LocalNotifications.cancel({
    notifications: [
      {
        id: TIMER_NOTIFICATION_ID,
      },
    ],
  });
}