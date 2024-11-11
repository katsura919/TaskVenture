import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Pressable, Alert, FlatList, TouchableOpacity, Image, Modal } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { Ionicons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { useFocusEffect } from '@react-navigation/native'; // Import useFocusEffect





export default function App() {

  const db = useSQLiteContext();
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  
  const fetchTasksCompleted = async () => {
    try {
        const result = await db.getAllAsync('SELECT * FROM tasks WHERE status = ?', ['completed']);
      setTasks(result);
    } catch (error) {
      console.log('Error fetching tasks:', error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchTasksCompleted();
    }, [])
  );


  const markTaskAsPending = async (id) => {
    try {
      await db.runAsync('UPDATE tasks SET status = ? WHERE id = ?', ['pending', id]);
      fetchTasksCompleted();
    } catch (error) {
      console.log('Error updating task:', error);
    }
  };

  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <Text style={styles.headerText}>Completed Quests</Text>
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
            onPress={() => markTaskAsPending(item.id)}
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
    marginTop:25  },
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

  taskContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 15, borderRadius: 10, marginVertical: 5 },
  taskIcon: { marginRight: 10 },
  taskText: { fontSize: 16,  flex: 1 },
  completedTaskText: { textDecorationLine: 'line-through' },
  circleButton: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: 'white', marginRight: 15 },
  circleButtonCompleted: { backgroundColor: '#6c757d' },
  taskCompleted: { backgroundColor: '#e1e7ed' },
  modalBackground: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  modalContainer: { width: '80%', padding: 20, backgroundColor: 'white', borderRadius: 10, alignItems: 'center' },
});