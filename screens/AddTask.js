import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Pressable, Alert } from 'react-native'; 
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSQLiteContext } from 'expo-sqlite';
import { useFocusEffect } from '@react-navigation/native';

export default function AddTask() {
  const db = useSQLiteContext();
  
  const [task, setTask] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(null);
  const [dueTime, setDueTime] = useState(null); 
  const [subtask, setSubtask] = useState('');
  const [subtasks, setSubtasks] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Reset fields when the screen is focused
  useFocusEffect(
    React.useCallback(() => {
      setTask('');
      setDescription('');
      setDueDate(null);
      setDueTime(null);
      setSubtask('');
      setSubtasks([]);
    }, [])
  );

  const addTaskToDb = async (taskText, descriptionText, dueDate) => {
    if (!taskText) {
      Alert.alert('Please enter a task.');
      return;
    }

    try {
      const dueDateTime = dueDate ? dueDate.toISOString() : null;

      await db.runAsync(
        'INSERT INTO tasks (title, description, status, date_created, due_date) VALUES (?, ?, ?, ?, ?)', 
        [taskText, descriptionText, 'pending', new Date().toISOString(), dueDateTime]
      );

      const taskResult = await db.getFirstAsync('SELECT last_insert_rowid() AS task_id');
      const taskId = taskResult.task_id;

      for (let i = 0; i < subtasks.length; i++) {
        await db.runAsync(
          'INSERT INTO subtasks (task_id, subtask_title, status, due_date) VALUES (?, ?, ?, ?)', 
          [taskId, subtasks[i], 'pending', dueDateTime]
        );
      }

      // Reset fields after adding the task
      setTask('');
      setDescription('');
      setDueDate(null);
      setDueTime(null);
      setSubtask('');
      setSubtasks([]);
    } catch (error) {
      console.log('Error inserting task:', error);
    }
  };

  const handleAddTask = () => {
    addTaskToDb(task, description, dueDate);
  };

  const handleAddSubtask = () => {
    if (subtask.length > 0) {
      setSubtasks([...subtasks, subtask]);
      setSubtask('');
    }
  };

  const onDateChange = (event, selectedDate) => {
    if (event.type === 'set' && selectedDate) {
      setDueDate(selectedDate);
    }
    setShowDatePicker(false);
  };

  const onTimeChange = (event, selectedTime) => {
    if (event.type === 'set' && selectedTime) {
      setDueTime(selectedTime);
      const newDateTime = new Date(dueDate);
      newDateTime.setHours(selectedTime.getHours(), selectedTime.getMinutes());
      setDueDate(newDateTime);
    }
    setShowTimePicker(false);
  };

  const clearDueDate = () => {
    setDueDate(null);
    setDueTime(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>New Quest</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter a Quest"
        value={task}
        onChangeText={(text) => setTask(text)}
        placeholderTextColor="#aaa"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Enter a Description"
        value={description}
        onChangeText={(text) => setDescription(text)}
        placeholderTextColor="#aaa"
      />

      <Text style={styles.label}>Select Due Date</Text>
      <Pressable onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
        <Text style={styles.dateText}>
          {dueDate ? dueDate.toLocaleDateString() : 'Date Not Set'}
        </Text>
      </Pressable>
      
      {showDatePicker && (
        <DateTimePicker
          value={dueDate || new Date()}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}

      {dueDate && (
        <>
          <Text style={styles.label}>Select Due Time</Text>
          <Pressable onPress={() => setShowTimePicker(true)} style={styles.dateButton}>
            <Text style={styles.dateText}>
              {dueTime ? dueTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Time Not Set'}
            </Text>
          </Pressable>
        </>
      )}

      {showTimePicker && (
        <DateTimePicker
          value={dueTime || new Date()}
          mode="time"
          display="default"
          onChange={onTimeChange}
        />
      )}

      {dueDate && (
        <Pressable onPress={clearDueDate} style={styles.clearDateButton}>
          <Text style={styles.buttonText}>Clear Due Date and Time</Text>
        </Pressable>
      )}

      <TextInput
        style={styles.input}
        placeholder="Enter a Subtask (Optional)"
        value={subtask}
        onChangeText={(text) => setSubtask(text)}
        placeholderTextColor="#aaa"
      />
      <Pressable style={styles.addButton} onPress={handleAddSubtask}>
        <Text style={styles.buttonText}>Add Subtask</Text>
      </Pressable>

      <View style={styles.subtasksContainer}>
        {subtasks.map((sub, index) => (
          <Text key={index} style={styles.subtask}>{sub}</Text>
        ))}
      </View>

      <Pressable style={styles.addButton} onPress={handleAddTask}>
        <Text style={styles.buttonText}>Add Quest</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: '#f0f4f7',
    padding: 20,
    alignItems: 'center',
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#4a90e2', 
    marginBottom: 20,
    textAlign: 'center',
  },
  input: { 
    width: '100%', 
    padding: 15, 
    borderWidth: 1, 
    borderColor: '#ccc', 
    borderRadius: 12, 
    backgroundColor: '#fff', 
    marginBottom: 15,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  label: {
    fontSize: 16,
    color: '#4a90e2',
    marginBottom: 5,
    fontWeight: '500',
  },
  dateButton: {
    padding: 12,
    backgroundColor: '#4a90e2',
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  dateText: {
    fontSize: 18,
    color: 'white',
  },
  clearDateButton: {
    padding: 12,
    backgroundColor: '#e74c3c',
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  addButton: {
    width: '100%', 
    height: 50, 
    backgroundColor: '#4a90e2', 
    padding: 10, 
    borderRadius: 12, 
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: { 
    color: 'white', 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
  subtasksContainer: {
    width: '100%',
    marginTop: 15,
    marginBottom: 20,
  },
  subtask: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
    backgroundColor: '#e1e7ed',
    padding: 8,
    borderRadius: 8,
  },
});
