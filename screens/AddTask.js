import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Pressable, Alert } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';

export default function AddTask() {
  const db = useSQLiteContext();
  const [task, setTask] = useState('');

  const addTaskToDb = async (taskText) => {
    if (!taskText) {
      Alert.alert('Please enter a task.');
      return;
    }
    try {
      await db.runAsync('INSERT INTO tasks (task, status) VALUES (?, ?)', [taskText, 'pending']);
      setTask(''); // Clear task input after adding
    } catch (error) {
      console.log('Error inserting task:', error);
    }
  };

  const handleAddTask = () => {
    if (task.length > 0) {
      addTaskToDb(task);
    }
  };

  return (
    <View style={styles.container}>
      {/* Task input and Add Task button */}
      <Text style={styles.title}>New Quest</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter a Quest"
        value={task}
        onChangeText={(text) => setTask(text)}
        placeholderTextColor="#aaa"
      />
      <Pressable style={styles.addButton} onPress={handleAddTask}>
        <Text style={styles.buttonText}>Add Quest</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
    marginTop:25,
    alignItems: 'center'},
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: { 
    width: '100%', 
    padding: 10, 
    borderWidth: 1, 
    height: 50, 
    borderColor: '#4a90e2', 
    borderRadius: 7, 
    backgroundColor: '#e1e7ed', 
    marginBottom: 20,
    fontWeight: 'bold',
  },
  addButton: {
    width: '100%', 
    height: 45, 
    backgroundColor: '#4a90e2', 
   
    padding: 10, 
    borderRadius: 10, 
    alignItems: 'center',
  },
  buttonText: { color: 'white', fontSize: 18,  fontWeight: 'bold', },
});
