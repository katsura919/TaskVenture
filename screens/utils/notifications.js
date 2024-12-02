import * as Notifications from 'expo-notifications';
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { useSQLiteContext } from 'expo-sqlite';

const TASK_NAME = 'TASK_REMINDER_NOTIFICATION';

// Function to fetch tasks and schedule notifications
async function fetchAndScheduleNotifications() {
  const { getAllAsync } = useSQLiteContext();
  
  try {
    const now = new Date().toISOString();
    const oneHourLater = new Date();
    oneHourLater.setHours(oneHourLater.getHours() + 1);
    const oneHourLaterISO = oneHourLater.toISOString();

    // Fetch tasks due within the next hour
    const tasksDueSoon = await getAllAsync(
      `SELECT * FROM tasks WHERE due_date BETWEEN ? AND ? AND status = ?`,
      [now, oneHourLaterISO, 'pending']
    );

    tasksDueSoon.forEach(async (task) => {
      const { title, due_date } = task;

      const notificationTime = new Date(due_date);
      if (notificationTime > new Date()) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Task Reminder',
            body: `Your task "${title}" is almost due!`,
            sound: true,
          },
          trigger: { date: notificationTime },
        });
      }
    });

    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error('Error fetching or scheduling notifications:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
}

// Background task definition
TaskManager.defineTask(TASK_NAME, fetchAndScheduleNotifications);

// Register the background task
export async function registerBackgroundTask() {
  try {
    await BackgroundFetch.registerTaskAsync(TASK_NAME, {
      minimumInterval: 1 * 60, // Run every 15 minutes
      stopOnTerminate: false,
      startOnBoot: true,
    });
    console.log('Background task registered!');
  } catch (err) {
    console.error('Failed to register background task:', err);
  }
}
