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
      <Image source={require('../assets/Profile.png')} style={styles.profileImage} />
      <Text style={styles.welcomeText}>Welcome!</Text>
      <View style={styles.pointsContainer}>
        <Text style={styles.pointsText}>182</Text>
        <Ionicons name="cash" size={20} color="gold" />
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
            style={styles.input}
            placeholder="Enter a task"
            value={task}
            onChangeText={(text) => setTask(text)}
          />
          <View style={styles.btnContainer}>
            <Pressable style={styles.cancelButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.buttonText}>Cancel</Text>
            </Pressable>
            <Pressable style={styles.addButton} onPress={handleAddTask}>
              <Text style={styles.buttonText}>Add Task</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>

    <View style={styles.contentWrapper}>
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}> {pendingCount}</Text>
        <Text style={styles.taskText}>Ongoing Quest/s</Text> 
      </View>
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}> {pendingCount}</Text>
        <Text style={styles.taskText}>Completed Quest/s</Text> 
      </View>
    </View>
     
     {/* Button to open modal */}
     <Pressable style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.buttonText}>+ Quest</Text>
      </Pressable>
    {/* Task List */}
    <FlatList
      data={tasks}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <View style={[styles.taskContainer, item.status === 'completed' && styles.taskCompleted]}>
          <Ionicons name="calendar" size={24} color="white" style={styles.taskIcon} />
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
  container: { backgroundColor: '#232430', padding: 20,  flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, marginTop: 20 },
  profileImage: { width: 70, height: 70, borderRadius: 40, borderWidth: 2, borderColor:  'white'},
  welcomeText: { fontSize: 25, fontWeight: 'bold', marginLeft: 10, color: 'white'},
  pointsContainer: { flexDirection: 'row', alignItems: 'center', marginLeft: 'auto', backgroundColor: '#fff', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  pointsText: { fontSize: 15, color: '#333', marginRight: 5, fontWeight: 'bold',},

  contentWrapper: { flexDirection: 'row',  marginVertical: 5,},
  progressContainer: {backgroundColor: '#fedf66', alignItems: 'center', justifyContent: 'center', height: 120, width: '45%' , padding: 15, borderRadius: 10, },
  progress: {flexDirection: 'row', alignItems: 'center',},
  progressText:{fontSize: 45, color: 'white', fontWeight: 'bold', marginRight: 10},

  input: { width: '100%', padding: 10, borderWidth: 1, marginVertical: 5, height: 50, borderColor: '#e3eaf2', borderRadius: 7, backgroundColor: '#fff' },
  btnContainer: {flexDirection: 'row'},
  addButton: {width: '100%', height: 45, backgroundColor: '#4f6266', padding: 10, borderRadius: 10, alignItems: 'center',marginVertical: 5, },
  cancelButton: { backgroundColor: 'gray', padding: 10, marginVertical: 10, borderRadius: 10, alignItems: 'center', marginRight: 120 },
  buttonText: { color: 'white', fontSize: 18 },
  taskContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fd985f', padding: 15, borderRadius: 10, marginVertical: 5 },
  taskIcon: { marginRight: 10 },
  taskText: { fontSize: 16, color: 'white', flex: 1 },
  completedTaskText: { textDecorationLine: 'line-through', color: 'gray' },
  circleButton: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: 'white', marginRight: 15 },
  circleButtonCompleted: { backgroundColor: '#6c64fe' },
  taskCompleted: { backgroundColor: '#d3f8e2' },
  modalBackground: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  modalContainer: { width: '80%', padding: 20, backgroundColor: 'white', borderRadius: 10, alignItems: 'center' },
});