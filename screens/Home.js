import React, {  useState, useEffect } from 'react';
import { StatusBar, View, Text, StyleSheet } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { useFocusEffect } from '@react-navigation/native';

const Dashboard = () => {
  const db = useSQLiteContext();
  const [tasksDueThisWeek, setTasksDueThisWeek] = useState([]);
  const [taskCounts, setTaskCounts] = useState({
    easy: 0,
    medium: 0,
    hard: 0,
  });

   // Get the start and end of the current week (Sunday to Saturday)
   const getCurrentWeekRange = () => {
    const currentDate = new Date();
    const startOfWeek = new Date(currentDate);
    const endOfWeek = new Date(currentDate);

    // Set start of the week (Sunday)
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay()); // Get previous Sunday
    startOfWeek.setHours(0, 0, 0, 0); // Set to start of day

    // Set end of the week (Saturday)
    endOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + 6); // Get next Saturday
    endOfWeek.setHours(23, 59, 59, 999); // Set to end of day

    return { startOfWeek, endOfWeek };
  };

  // Function to fetch tasks due this week
  const fetchTasksDueThisWeek = async () => {
    const { startOfWeek, endOfWeek } = getCurrentWeekRange();
    const startOfWeekString = startOfWeek.toISOString();
    const endOfWeekString = endOfWeek.toISOString();

    try {
      const result = await db.getAllAsync(`
        SELECT * FROM tasks
        WHERE due_date BETWEEN '${startOfWeekString}' AND '${endOfWeekString}'
        AND status = 'pending'
      `);
      

      if (result.length === 0) {
        // No tasks for the current week
        setTasksDueThisWeek(null);
      } else {
        setTasksDueThisWeek(result);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  // Function to format the due date
  const formatDueDate = (dueDate) => {
  const date = new Date(dueDate);
  const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
};


  // Function to fetch task counts by difficulty
  const countTasksByDifficulty = async () => {
    try {
      const result = await db.getAllAsync(`
        SELECT difficulty, COUNT(*) AS task_count
        FROM tasks
        WHERE status = 'pending'
        GROUP BY difficulty
      `);
      

      // Set the result to state
      const counts = {
        easy: 0,
        medium: 0,
        hard: 0,
      };

      result.forEach((item) => {
        if (item.difficulty === 'easy') counts.easy = item.task_count;
        if (item.difficulty === 'medium') counts.medium = item.task_count;
        if (item.difficulty === 'hard') counts.hard = item.task_count;
      });

      setTaskCounts(counts);
    } catch (error) {
      console.error('Error fetching task counts by difficulty:', error);
    }
  };

  // Fetch data when the component mounts
  useFocusEffect(
    React.useCallback(() => {
      countTasksByDifficulty();
      fetchTasksDueThisWeek();
    }, [])
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2a2a2a" />
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Welcome to TaskVenture!</Text>
      </View>

      {/* Progress Section */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressTitle}>Track your progress</Text>
        <Text style={styles.progressSubtitle}>View your daily task achievements</Text>
        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBarFill, { width: '76%' }]} />
        </View>
        <Text style={styles.progressPercentage}>76%</Text>
      </View>

      <View style={styles.tasksection}>
        <Text style={styles.headerTask}>Weekly Quests</Text>
      

      {/* Display tasks or message */}
      <View style={styles.taskContainer}>
        {tasksDueThisWeek === null ? (
          <View  style={styles.task}>
            <Text style={styles.taskDescription}>No more Quest for this week. Well done, Adventurer!</Text>
          </View>
        ) : (
          tasksDueThisWeek.map((task) => (
            <View key={task.task_id} style={styles.task}>
              <Text style={styles.taskTitle}>{task.title}</Text>
              <Text style={styles.taskDescription}>{task.description}</Text>
              <Text style={styles.taskDueDate}>Due: {formatDueDate(task.due_date)}</Text>
            </View>
          ))
        )}
      </View>
      

      <View >
        <Text style={styles.headerTask}>Quest Difficulties</Text>
      </View>

      {/* Task Categories */}
      <View style={styles.taskCategoryContainer}>
        <TaskCategory title="Easy" newTasks={taskCounts.easy} />
        <TaskCategory title="Medium" newTasks={taskCounts.medium} />
        <TaskCategory title="Hard" newTasks={taskCounts.hard} />
      </View>
    </View>
    </View>
  );
};

// TaskCategory Component
const TaskCategory = ({ title, newTasks }) => {
  return (
    <View style={styles.taskCategory}>
      <Text style={styles.taskTitle}>{title}</Text>
      <Text style={styles.taskCount}>{newTasks} Tasks</Text>
      
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1b181c',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    color: 'white',
    fontSize: 40,
    fontWeight: 'bold',
  },
  progressContainer: {
    backgroundColor: '#232128',
    padding: 16,
    borderRadius: 10,
    marginBottom: 20,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: 'white',
  },
  progressSubtitle: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 10,
  },
  progressBarBackground: {
    height: 10,
    backgroundColor: '#d3d3d3',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#724ab6',
  },
  progressPercentage: {
    textAlign: 'right',
    fontWeight: 'bold',
    fontSize: 16,
    color: 'white',
    marginTop: 5,
  },
  tasksection:{
   
  },
  taskContainer: {
    marginBottom: 10
  },
  message: {
    fontSize: 18,
    color: '#28a745', // Green color for success
    textAlign: 'center',
    marginTop: 20,
  },
  task: {
    backgroundColor: '#232128',
    padding: 16,
    borderRadius: 10,
    marginBottom: 10,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'green',
  },
  taskDescription: {
    fontSize: 14,
    color: 'white',
  },
  taskDueDate: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  headerTask:{
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: 'white',
  },
  taskCategoryContainer: {
    flexDirection: 'column',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  taskCategory: {
    width: '100%',
    flexDirection:'row',
    alignItems: 'center',
    backgroundColor: '#232128',
    padding: 16,
    borderRadius: 10,
    marginBottom: 5,
  },
  taskCount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
   marginLeft: 10
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default Dashboard;
