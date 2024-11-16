import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSQLiteContext } from 'expo-sqlite';
import { Picker } from '@react-native-picker/picker';

export default function TaskDetails({ route, navigation }) {
  const { taskId } = route.params;
  const db = useSQLiteContext();
  const [task, setTask] = useState(null);
  const [subtasks, setSubtasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState('easy');
  const [dueDate, setDueDate] = useState(null);
  const [dueTime, setDueTime] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [newSubtask, setNewSubtask] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchTaskDetails = async () => {
      try {
        const result = await db.getFirstAsync('SELECT * FROM tasks WHERE task_id = ?', [taskId]);
        setTask(result);
        setTitle(result.title || ''); // Default to empty string if no title
        setDescription(result.description || ''); // Default to empty string if no description
        setDifficulty(result.difficulty || 'easy');
        if (result.due_date) {
          const dueDateTime = new Date(result.due_date);
          setDueDate(dueDateTime);
          setDueTime(dueDateTime);
        }

        const subtaskResult = await db.getAllAsync('SELECT * FROM subtasks WHERE task_id = ?', [taskId]);
        setSubtasks(subtaskResult);
      } catch (error) {
        console.log('Error fetching task details:', error);
      }
    };

    fetchTaskDetails();
  }, [taskId]);

  const updateTaskDetails = async () => {
    try {
      // Only update fields that have new values
      const updatedTask = {
        title: title || task.title, // Use existing title if new title is empty
        description: description || task.description, // Use existing description if new description is empty
        difficulty,
        due_date: dueDate ? new Date(dueDate.setHours(dueTime.getHours(), dueTime.getMinutes(), 0, 0)).toISOString() : task.due_date // Only update due date if a new one is provided
      };

      await db.runAsync(
        'UPDATE tasks SET title = ?, description = ?, due_date = ?, difficulty = ? WHERE task_id = ?',
        [updatedTask.title, updatedTask.description, updatedTask.due_date, updatedTask.difficulty, taskId]
      );
      setIsEditing(false);
    } catch (error) {
      console.log('Error updating task:', error);
    }
  };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || dueDate;
    setShowDatePicker(false);
    setDueDate(currentDate);
  };

  const handleTimeChange = (event, selectedTime) => {
    const currentTime = selectedTime || dueTime;
    setShowTimePicker(false);
    setDueTime(currentTime);
  };

  const toggleSubtaskStatus = async (subtaskId, currentStatus) => {
    const newStatus = currentStatus === 'completed' ? 'incomplete' : 'completed';
    try {
      await db.runAsync('UPDATE subtasks SET status = ? WHERE subtask_id = ?', [newStatus, subtaskId]);
      setSubtasks((prevSubtasks) =>
        prevSubtasks.map((subtask) =>
          subtask.subtask_id === subtaskId ? { ...subtask, status: newStatus } : subtask
        )
      );
    } catch (error) {
      console.log('Error updating subtask status:', error);
    }
  };

  const addSubtask = async () => {
    if (!newSubtask) {
      Alert.alert('Please enter a subtask.');
      return;
    }
    try {
      const result = await db.runAsync('INSERT INTO subtasks (task_id, subtask_title, status) VALUES (?, ?, ?)', [
        taskId,
        newSubtask,
        'incomplete',
      ]);
      setSubtasks((prevSubtasks) => [
        ...prevSubtasks,
        { subtask_id: result.lastInsertRowid, subtask_title: newSubtask, status: 'incomplete' },
      ]);
      setNewSubtask('');
    } catch (error) {
      console.log('Error adding subtask:', error);
    }
  };

  const deleteSubtask = async (subtaskId) => {
    try {
      await db.runAsync('DELETE FROM subtasks WHERE subtask_id = ?', [subtaskId]);
      setSubtasks((prevSubtasks) => prevSubtasks.filter((subtask) => subtask.subtask_id !== subtaskId));
    } catch (error) {
      console.log('Error deleting subtask:', error);
    }
  };

  const formatDueDate = (date) => {
    if (!date) return 'Not Set';
    return date.toLocaleDateString();
  };

  const formatDueTime = (time) => {
    if (!time) return '';
    return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.editSaveButton} onPress={isEditing ? updateTaskDetails : () => setIsEditing(true)}>
          <Text style={styles.buttonText}>{isEditing ? 'Save Changes' : 'Edit Task'}</Text>
        </TouchableOpacity>
      </View>

      {task ? (
        <>
          <Text style={styles.headerText}>Task Details</Text>

          <TextInput
            style={[styles.input, isEditing && styles.editable]}
            value={title}
            onChangeText={setTitle}
            placeholder="Task Title"
            editable={isEditing}
          />

          <TextInput
            style={[styles.input, isEditing && styles.editable]}
            value={description}
            onChangeText={setDescription}
            placeholder="Description"
            editable={isEditing}
          />

          {/* Difficulty Picker */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Difficulty:   </Text>
            {isEditing ? (
              <Picker
                selectedValue={difficulty}
                onValueChange={(itemValue) => setDifficulty(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Easy" value="easy" />
                <Picker.Item label="Medium" value="medium" />
                <Picker.Item label="Hard" value="hard" />
              </Picker>
            ) : (
              <Text style={styles.difficultyText}>{difficulty}</Text>
            )}
          </View>

          <View style={styles.dateTimeContainer}>
            <Text style={styles.dateText}>Due Date: {formatDueDate(dueDate)}</Text>
            {isEditing && (
              <TouchableOpacity style={styles.calendarButton} onPress={() => setShowDatePicker(true)}>
                <Ionicons name="calendar-outline" size={24} color="#4CAF50" />
              </TouchableOpacity>
            )}
          </View>

          {showDatePicker && isEditing && (
            <DateTimePicker value={dueDate || new Date()} mode="date" display="default" onChange={handleDateChange} />
          )}

          {dueDate && (
            <View style={styles.dateTimeContainer}>
              <Text style={styles.dateText}>Due Time: {formatDueTime(dueTime)}</Text>
              {isEditing && (
                <TouchableOpacity style={styles.clockButton} onPress={() => setShowTimePicker(true)}>
                  <Ionicons name="time-outline" size={24} color="#4CAF50" />
                </TouchableOpacity>
              )}
            </View>
          )}

          {showTimePicker && isEditing && (
            <DateTimePicker value={dueTime || new Date()} mode="time" display="default" onChange={handleTimeChange} />
          )}

          <TextInput
            style={styles.input}
            value={newSubtask}
            onChangeText={setNewSubtask}
            placeholder="Add a new subtask"
          />
          <TouchableOpacity style={styles.button} onPress={addSubtask}>
            <Text style={styles.buttonText}>Add Subtask</Text>
          </TouchableOpacity>

          <FlatList
            data={subtasks}
            keyExtractor={(item) => item.subtask_id.toString()}
            renderItem={({ item }) => (
              <View style={styles.subtaskContainer}>
                <TouchableOpacity onPress={() => toggleSubtaskStatus(item.subtask_id, item.status)}>
                  <Text style={[styles.subtaskText, item.status === 'completed' && styles.completed]}>
                    {item.subtask_title}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteSubtask(item.subtask_id)}>
                  <Ionicons name="trash-outline" size={20} color="#f44336" />
                </TouchableOpacity>
              </View>
            )}
          />
        </>
      ) : (
        <Text>Loading...</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  backButton: { flexDirection: 'row', alignItems: 'center' },
  backButtonText: { marginLeft: 8, color: '#1b1c1c' },
  editSaveButton: { justifyContent: 'center', alignItems: 'center', backgroundColor: '#4CAF50' },
  buttonText: { color: '#fff', fontSize: 16 },
  headerText: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  input: { borderBottomWidth: 1, padding: 8, marginBottom: 16 },
  editable: { borderColor: '#4CAF50' },
  inputContainer: { marginBottom: 16, flexDirection: 'row', alignItems: 'center'},
  label: { fontSize: 16,  },
  picker: { height: 50, width: '100%' },
  difficultyText: { fontSize: 18 },
  dateTimeContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16, alignItems: 'center' },
  calendarButton: { padding: 8 },
  clockButton: { padding: 8 },
  dateText: { fontSize: 16 },
  subtaskContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  subtaskText: { fontSize: 16 },
  completed: { textDecorationLine: 'line-through' },
  button: { backgroundColor: '#4CAF50', padding: 10, marginBottom: 16, alignItems: 'center' },
});
