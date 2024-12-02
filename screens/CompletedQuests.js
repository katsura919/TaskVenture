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
      const result = await db.getAllAsync('SELECT * FROM tasks WHERE status = ?', ['completed']);
      
      // Separate tasks into categories based on difficulty
      const easy = result.filter(task => task.difficulty === 'Easy');
      const medium = result.filter(task => task.difficulty === 'Medium');
      const hard = result.filter(task => task.difficulty === 'Hard');

      setEasyTasks(easy);
      setMediumTasks(medium);
      setHardTasks(hard);
    } catch (error) {
      console.log('Error fetching tasks:', error);
    }
  };

  const calculateRemainingDays = (dueDate) => {
    if (!dueDate) return "Due Date not set";

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
      // Update task status to 'completed' in the database
      await db.getFirstAsync(
        `UPDATE tasks SET status = ? WHERE task_id = ?`,
        ['pending', taskId]
      );
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
      
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
    
        </TouchableOpacity>

      {/* Easy Tasks */}
      <View style={styles.taskListContainer}>
        <Text style={styles.categoryHeader}>Easy Tasks</Text>
        <FlatList
          data={easyTasks}
          keyExtractor={(item) => item.task_id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => navigation.navigate('TaskDetails', { taskId: item.task_id })}
            >
              <View style={[styles.taskContainerEasy, item.status === 'completed' && styles.taskCompleted]}>
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
        <Text style={styles.categoryHeader}>Medium Tasks</Text>
        <FlatList
          data={mediumTasks}
          keyExtractor={(item) => item.task_id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => navigation.navigate('TaskDetails', { taskId: item.task_id })}
            >
              <View style={[styles.taskContainerMedium, item.status === 'completed' && styles.taskCompleted]}>
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
        <Text style={styles.categoryHeader}>Hard Tasks</Text>
        <FlatList
          data={hardTasks}
          keyExtractor={(item) => item.task_id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => navigation.navigate('TaskDetails', { taskId: item.task_id })}
            >
              <View style={[styles.taskContainerHard, item.status === 'completed' && styles.taskCompleted]}>
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
  container: { 
    flex: 1, 
    backgroundColor: '#121212', 
    padding: 16 
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 20,
    
  },
  headerText: { 
    fontSize: 24, 
    fontWeight: 'bold',
    color: '#FFFFFF'
  },
  taskListContainer: { 
    marginBottom: 20 
  },
  categoryHeader: { fontSize: 20, 
    fontWeight: 'bold', 
    marginVertical: 10, 
    color: '#FFFFFF'
  },
  taskContainerEasy: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#6dc34b', 
    padding: 15, 
    borderRadius: 10,
    marginVertical: 5 
  },
  taskContainerMedium: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#e1e13d', 
    padding: 15, 
    borderRadius: 10,
    marginVertical: 5 
  },
  taskContainerHard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#f6b531', 
    padding: 15, 
    borderRadius: 10,
   
    marginVertical: 5 },
  taskIcon: { 
    marginRight: 10 
  },
  taskText: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    flex: 1 
  },
  completedTaskText: { 
    textDecorationLine: 'line-through', 
    color: 'gray' 
  },
  taskCompleted: { 
    backgroundColor: '#d3f8e2' 
  },
  dueDateText: { 
    fontSize: 14, 
    color: '#6c757d' 
  },
});