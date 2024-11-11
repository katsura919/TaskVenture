import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Pressable, Alert, FlatList, TouchableOpacity, Image, Modal } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native'; // Import useFocusEffect



export default function MyTasks() {

  const db = useSQLiteContext();
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  
  const fetchTasks = async () => {
    try {
      const result = await db.getAllAsync('SELECT * FROM tasks WHERE status = ?', ['pending']);
      setTasks(result);
    } catch (error) {
      console.log('Error fetching tasks:', error);
    }
  };

 
  const countPendingTasks = async () => {
    try {
      const result = await db.getAllAsync('SELECT COUNT(*) as count FROM tasks WHERE status = ?', ['pending']);
      setPendingCount(result[0].count); // Update pending count state
    } catch (error) {
      console.log('Error counting pending tasks:', error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchTasks();
      countPendingTasks();
    }, [])
  );


  const addTaskToDb = async (taskText) => {
    if (!taskText) {
      Alert.alert('Please enter a task.');
      return;
    }
    try {
      await db.runAsync('INSERT INTO tasks (task, status) VALUES (?, ?)', [taskText, 'pending']);
      fetchTasks();
      setTask('');
    } catch (error) {
      console.log('Error inserting task:', error);
    }
  };

  const handleAddTask = () => {
    if (task.length > 0) {
      addTaskToDb(task);
      setModalVisible(false); // Close modal after adding task
    }
  };

  const markTaskAsCompleted = async (id) => {
    try {
      await db.runAsync('UPDATE tasks SET status = ? WHERE id = ?', ['completed', id]);
      fetchTasks();
    } catch (error) {
      console.log('Error updating task:', error);
    }
  };

  return (
    <View style={styles.container}>
 
      <View style={styles.header}>
        <Text style={styles.headerText}>My Quests</Text>
      </View>


    {/* Task List */}
    <FlatList
      data={tasks}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <View style={[styles.taskContainer, item.status === 'completed' && styles.taskCompleted]}>
          <Ionicons name="calendar" size={24} color="#6c757d" style={styles.taskIcon} />
          <Text style={[styles.taskText, item.status === 'completed' && styles.completedTaskText]}>
            {item.task}
          </Text>
          <TouchableOpacity
            style={[styles.circleButton, item.status === 'completed' && styles.circleButtonCompleted]}
            onPress={() => markTaskAsCompleted(item.id)}
          />
        </View>
      )}
    />

   
  </View>
  );
}


const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
    marginTop:25 
  
  },
  
  header: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
      marginTop: 10
    },
  headerText: {
      fontSize: 24,
      fontWeight: 'bold',
    },

  contentWrapper: { flexDirection: 'row',  marginVertical: 5,},
  progressPending: {backgroundColor: '#fedf66', alignItems: 'center', justifyContent: 'center', height: 120, width: '49%' , padding: 15, borderRadius: 10, marginRight: 8 },
  progressComplete: {backgroundColor: '#fedf66', alignItems: 'center', justifyContent: 'center', height: 120, width: '49%' , padding: 15, borderRadius: 10, },
  progress: {flexDirection: 'row', alignItems: 'center',},
  progressText:{fontSize: 45, color: 'white', fontWeight: 'bold', marginRight: 10},

  input: { width: '100%', padding: 10, borderWidth: 1, marginVertical: 5, height: 50, borderColor: '#e3eaf2', borderRadius: 7, backgroundColor: '#fff' },
  btnContainer: {flexDirection: 'row'},
  addButton: {width: '100%', height: 45, backgroundColor: '#4f6266', padding: 10, borderRadius: 10, alignItems: 'center',marginVertical: 5, },
  cancelButton: { backgroundColor: 'gray', padding: 10, marginVertical: 10, borderRadius: 10, alignItems: 'center', marginRight: 120 },
  buttonText: { color: 'white', fontSize: 18 },
  taskContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e1e7ed', padding: 15, borderRadius: 10, marginVertical: 5 },
  taskIcon: { marginRight: 10 },
  taskText: { fontSize: 16, fontWeight: 'bold', flex: 1 },
  completedTaskText: { textDecorationLine: 'line-through', color: 'gray' },
  circleButton: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: 'white', marginRight: 15 },
  circleButtonCompleted: { backgroundColor: '#6c64fe' },
  taskCompleted: { backgroundColor: '#d3f8e2' },
  modalBackground: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  modalContainer: { width: '80%', padding: 20, backgroundColor: 'white', borderRadius: 10, alignItems: 'center' },
});