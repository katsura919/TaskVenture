import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Pressable, Alert } from 'react-native'; 
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSQLiteContext } from 'expo-sqlite';
import { useFocusEffect } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';  // Import Picker component

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
  const [difficulty, setDifficulty] = useState('easy');  // Add state for difficulty
  
  // Reset fields when the screen is focused
  useFocusEffect(
    React.useCallback(() => {
      setTask('');
      setDescription('');
      setDueDate(null);
      setDueTime(null);
      setSubtask('');
      setSubtasks([]);
      setDifficulty('easy');
    }, [])
  );

  const addTaskToDb = async (taskText, descriptionText, dueDate, difficulty) => {
    if (!taskText) {
      Alert.alert('Please enter a task.');
      return;
    }

    try {
      const dueDateTime = dueDate ? dueDate.toISOString() : null;

      // Insert the task with the difficulty value
      await db.runAsync(
        'INSERT INTO tasks (title, description, status, date_created, due_date, difficulty) VALUES (?, ?, ?, ?, ?, ?)', 
        [taskText, descriptionText, 'pending', new Date().toISOString(), dueDateTime, difficulty]
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
      setDifficulty('easy');
    } catch (error) {
      console.log('Error inserting task:', error);
    }
  };

  const handleAddTask = () => {
    addTaskToDb(task, description, dueDate, difficulty);  // Pass the difficulty to the function
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

      {/* Difficulty Picker */}
      <View style={styles.difficultyContainer}>
      <Text style={styles.label}>Difficulty: </Text>
      <View style={styles.pickerContainer}>
      <Picker
        selectedValue={difficulty}
        onValueChange={(itemValue) => setDifficulty(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Easy" value="easy" />
        <Picker.Item label="Medium" value="medium" />
        <Picker.Item label="Hard" value="hard" />
      </Picker>
      </View>
      </View>
      
      
      <Text style={styles.label}>Deadline: </Text>
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
    padding: 10, 
    borderWidth: 1, 
    borderColor: '#ccc', 
    borderRadius: 8, 
    backgroundColor: '#fff', 
    marginBottom: 15,
  },

  difficultyContainer: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center'
  },
  label: {
    fontSize: 16,
    color: '#4a90e2',
    fontWeight: '500',
  },
  pickerContainer:{
    display: 'flex',
    width: 130,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'lightblue',
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius:10,
  },
  picker: {
    width: '100%', 
  },
  dateButton: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: 'lightblue'
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
    padding: 15, 
    borderRadius: 12, 
    alignItems: 'center', 
    marginBottom: 15,
  },
  buttonText: { 
    fontSize: 18, 
    color: '#fff',
    fontWeight: 'bold',
  },
  subtasksContainer: { 
    width: '100%', 
    marginBottom: 20,
  },
  subtask: { 
    fontSize: 16, 
    color: '#333', 
    marginBottom: 5, 
  },
});
