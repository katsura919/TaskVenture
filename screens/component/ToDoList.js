import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Pressable, Alert, FlatList, TouchableOpacity, Image, Modal } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { Ionicons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';

function TodoList() {
  const db = useSQLiteContext();
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState([]);
  const [showInput, setShowInput] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  

  const fetchTasks = async () => {
    try {
      const result = await db.getAllAsync('SELECT * FROM tasks WHERE status = ?', ['pending']);
      setTasks(result);
    } catch (error) {
      console.log('Error fetching tasks:', error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

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
        <Image source={require('../../assets/Profile.png')} style={styles.profileImage} />
        <Text style={styles.welcomeText}>Welcome!</Text>
        <View style={styles.pointsContainer}>
          <Text style={styles.pointsText}>182</Text>
          <Ionicons name="cash" size={25} color="gold" />
        </View>
      </View>

      {/* Modal for adding tasks */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <TextInput

              placeholder="Enter a task"
              value={task}
              onChangeText={(text) => setTask(text)}
            />
            <Pressable style={styles.addButton} onPress={handleAddTask}>
              <Text style={styles.buttonText}>Add Task</Text>
            </Pressable>
            <Pressable style={styles.cancelButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.buttonText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Task List */}
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={[styles.taskContainer, item.status === 'completed' && styles.taskCompleted]}>
            <Ionicons name="calendar" size={24} color="gray" style={styles.taskIcon} />
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

      {/* Button to open modal */}
      <Pressable style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.buttonText}>+ Quest</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#f7f7f7', padding: 20, borderRadius: 10, flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, marginTop: 40 },
  profileImage: { width: 80, height: 80, borderRadius: 40 },
  welcomeText: { fontFamily: 'PressStart2P-Regular', fontSize: 40, fontWeight: 'bold', marginLeft: 10 },
  pointsContainer: { flexDirection: 'row', alignItems: 'center', marginLeft: 'auto', backgroundColor: '#fff', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  pointsText: { fontSize: 20, color: '#333', marginRight: 5 },
  input: { width: '100%', padding: 10, borderWidth: 1, marginVertical: 5, height: 50, borderColor: '#e3eaf2', borderRadius: 7, backgroundColor: '#fff' },
  addButton: { backgroundColor: '#6c64fe', padding: 10, marginVertical: 10, borderRadius: 20, alignItems: 'center' },
  cancelButton: { backgroundColor: 'gray', padding: 10, marginVertical: 10, borderRadius: 20, alignItems: 'center' },
  buttonText: { color: 'white', fontSize: 18 },
  taskContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 15, borderRadius: 10, marginVertical: 5 },
  taskIcon: { marginRight: 10 },
  taskText: { fontSize: 16, color: '#333', flex: 1 },
  completedTaskText: { textDecorationLine: 'line-through', color: 'gray' },
  circleButton: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: 'black', marginRight: 15 },
  circleButtonCompleted: { backgroundColor: '#6c64fe' },
  taskCompleted: { backgroundColor: '#d3f8e2' },
  modalBackground: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  modalContainer: { width: '80%', padding: 20, backgroundColor: 'white', borderRadius: 10, alignItems: 'center' },
});

export default TodoList;
