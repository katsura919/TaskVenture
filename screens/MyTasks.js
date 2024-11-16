import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Import Expo Ionicons
import { useSQLiteContext } from 'expo-sqlite';
import { useFocusEffect } from '@react-navigation/native';

export default function MyTasks({ navigation }) {
  const db = useSQLiteContext();
  const [easyTasks, setEasyTasks] = useState([]);
  const [mediumTasks, setMediumTasks] = useState([]);
  const [hardTasks, setHardTasks] = useState([]);

  const fetchTasks = async () => {
    try {
      const result = await db.getAllAsync('SELECT * FROM tasks WHERE status = ?', ['pending']);
      
      // Separate tasks into categories based on difficulty
      const easy = result.filter(task => task.difficulty === 'easy');
      const medium = result.filter(task => task.difficulty === 'medium');
      const hard = result.filter(task => task.difficulty === 'hard');

      setEasyTasks(easy);
      setMediumTasks(medium);
      setHardTasks(hard);
    } catch (error) {
      console.log('Error fetching tasks:', error);
    }
  };

  const calculateRemainingDays = (dueDate) => {
    if (!dueDate) return "No Deadline";

    const currentDate = new Date();
    const dueDateObj = new Date(dueDate);
    const diffTime = dueDateObj - currentDate;
    const remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Convert time difference to days

    return remainingDays >= 0
      ? `${remainingDays} days remaining`
      : "Overdue";
  };

  const markTaskAsCompleted = async (taskId) => {
    try {
      // Step 1: Retrieve the task's difficulty
      const task = await db.getFirstAsync(
        `SELECT difficulty FROM tasks WHERE task_id = ?`,
        [taskId]
      );
  
      if (!task) {
        console.log('Task not found');
        return;
      }
  
      // Step 2: Determine XP based on difficulty
      const difficulty = task.difficulty;
      let xp = 0;
      if (difficulty === 'easy') xp = 10;
      else if (difficulty === 'medium') xp = 20;
      else if (difficulty === 'hard') xp = 30;

      // Step 3: Update the task status to 'completed'
      await db.getFirstAsync(
        `UPDATE tasks SET status = ? WHERE task_id = ?`,
        ['completed', taskId]
      );
      console.log(`Task Completed`);

      // Step 4: Get current experience
      const currentExperienceResult = await db.getFirstAsync("SELECT experience FROM users WHERE user_id = ?", [1]);
      const currentExperience = currentExperienceResult ? currentExperienceResult.experience : 0; // Handle null if no user found
      console.log("Current XP: ", currentExperience);

      // Step 5: Update the user's experience
      await db.runAsync(
        `UPDATE users SET experience = experience + ? WHERE user_id = ?`,
        [xp, 1]
      );
      console.log(`Gained ${xp} XP!`);


  
      fetchTasks(); // Re-fetch tasks to update the list
    } catch (error) {
      console.log('Error marking task as completed:', error);
    }
  };
  
  
  

  useFocusEffect(
    React.useCallback(() => {
      fetchTasks();
    }, [])
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>My Quests</Text>
      </View>

      {/* Easy Tasks */}
      <View style={styles.taskListContainer}>
        <Text style={styles.categoryHeader}>Easy Quests</Text>
        <FlatList
          data={easyTasks}
          keyExtractor={(item) => item.task_id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => navigation.navigate('TaskDetails', { taskId: item.task_id })}
            >
              <View style={[styles.taskContainer, item.status === 'completed' && styles.taskCompleted]}>
                <TouchableOpacity
                  onPress={() => markTaskAsCompleted(item.task_id)} // Mark task as completed when tapped
                >
                  <Ionicons
                    name={item.status === 'completed' ? 'checkbox' : 'checkbox-outline'} // Change icon based on completion status
                    size={24}
                    color={item.status === 'completed' ? '#28a745' : '#6c757d'}
                    style={styles.taskIcon}
                  />
                </TouchableOpacity>
                <Text style={[styles.taskText, item.status === 'completed' && styles.completedTaskText]}>
                  {item.title}
                </Text>
                <Text style={styles.dueDateText}>{calculateRemainingDays(item.due_date)}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Medium Tasks */}
      <View style={styles.taskListContainer}>
        <Text style={styles.categoryHeader}>Medium Quests</Text>
        <FlatList
          data={mediumTasks}
          keyExtractor={(item) => item.task_id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => navigation.navigate('TaskDetails', { taskId: item.task_id })}
            >
              <View style={[styles.taskContainer, item.status === 'completed' && styles.taskCompleted]}>
                <TouchableOpacity
                  onPress={() => markTaskAsCompleted(item.task_id)} // Mark task as completed when tapped
                >
                  <Ionicons
                    name={item.status === 'completed' ? 'checkbox' : 'checkbox-outline'} // Change icon based on completion status
                    size={24}
                    color={item.status === 'completed' ? '#28a745' : '#6c757d'}
                    style={styles.taskIcon}
                  />
                </TouchableOpacity>
                <Text style={[styles.taskText, item.status === 'completed' && styles.completedTaskText]}>
                  {item.title}
                </Text>
                <Text style={styles.dueDateText}>{calculateRemainingDays(item.due_date)}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Hard Tasks */}
      <View style={styles.taskListContainer}>
        <Text style={styles.categoryHeader}>Hard Quests</Text>
        <FlatList
          data={hardTasks}
          keyExtractor={(item) => item.task_id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => navigation.navigate('TaskDetails', { taskId: item.task_id })}
            >
              <View style={[styles.taskContainer, item.status === 'completed' && styles.taskCompleted]}>
                <TouchableOpacity
                  onPress={() => markTaskAsCompleted(item.task_id)} // Mark task as completed when tapped
                >
                  <Ionicons
                    name={item.status === 'completed' ? 'checkbox' : 'checkbox-outline'} // Change icon based on completion status
                    size={24}
                    color={item.status === 'completed' ? '#28a745' : '#6c757d'}
                    style={styles.taskIcon}
                  />
                </TouchableOpacity>
                <Text style={[styles.taskText, item.status === 'completed' && styles.completedTaskText]}>
                  {item.title}
                </Text>
                <Text style={styles.dueDateText}>{calculateRemainingDays(item.due_date)}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  headerText: { fontSize: 24, fontWeight: 'bold' },
  taskListContainer: { marginBottom: 20 },
  categoryHeader: { fontSize: 20, fontWeight: 'bold', marginVertical: 10 },
  taskContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e1e7ed', padding: 15, borderRadius: 10, marginVertical: 5 },
  taskIcon: { marginRight: 10 },
  taskText: { fontSize: 16, fontWeight: 'bold', flex: 1 },
  completedTaskText: { textDecorationLine: 'line-through', color: 'gray' },
  taskCompleted: { backgroundColor: '#d3f8e2' },
  dueDateText: { fontSize: 14, color: '#6c757d' },
});
