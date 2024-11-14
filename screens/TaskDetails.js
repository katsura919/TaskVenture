import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSQLiteContext } from 'expo-sqlite';

export default function TaskDetails({ route, navigation }) {
  const { taskId } = route.params;
  const db = useSQLiteContext();
  const [task, setTask] = useState(null);
  const [subtasks, setSubtasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(null); // Set initial to null
  const [dueTime, setDueTime] = useState(null); // Set initial to null
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [newSubtask, setNewSubtask] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  
  useEffect(() => {
    const fetchTaskDetails = async () => {
      try {
        const result = await db.getFirstAsync('SELECT * FROM tasks WHERE task_id = ?', [taskId]);
        setTask(result);
        setTitle(result.title);
        setDescription(result.description || '');
        if (result.due_date) {
          const dueDateTime = new Date(result.due_date);
          setDueDate(dueDateTime);
          setDueTime(dueDateTime); // set both due date and time from the same field
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
    if (!title || !dueDate || !dueTime) {
      Alert.alert('Please fill out the title, due date, and time.');
      return;
    }
    try {
      const updatedDueDateTime = new Date(dueDate);
      updatedDueDateTime.setHours(dueTime.getHours(), dueTime.getMinutes(), 0, 0);
      await db.runAsync('UPDATE tasks SET title = ?, description = ?, due_date = ? WHERE task_id = ?', [
        title,
        description,
        updatedDueDateTime.toISOString(),
        taskId,
      ]);
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
    setDueTime(currentTime);  // Update the due time state here
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
    if (!time) return ''; // If due time is not set, return empty string
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

          {/* Title Input */}
          <TextInput
            style={[styles.input, isEditing && styles.editable]}
            value={title}
            onChangeText={setTitle}
            placeholder="Task Title"
            editable={isEditing}
          />

          {/* Description Input */}
          <TextInput
            style={[styles.input, isEditing && styles.editable]}
            value={description}
            onChangeText={setDescription}
            placeholder="Description"
            editable={isEditing}
          />

          {/* Date Display */}
          <View style={styles.dateTimeContainer}>
            <Text style={styles.dateText}>Due Date: {formatDueDate(dueDate)}</Text>
            {isEditing && (
              <TouchableOpacity style={styles.calendarButton} onPress={() => setShowDatePicker(true)}>
                <Ionicons name="calendar-outline" size={24} color="#4CAF50" />
              </TouchableOpacity>
            )}
          </View>

          {/* Date Picker */}
          {showDatePicker && isEditing && (
            <DateTimePicker
              value={dueDate || new Date()}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}

          {/* Time Display */}
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

          {/* Time Picker */}
          {showTimePicker && isEditing && (
            <DateTimePicker
              value={dueTime || new Date()}
              mode="time"
              display="default"
              onChange={handleTimeChange}
            />
          )}

          {/* Subtask Input */}
          <TextInput
            style={styles.input}
            value={newSubtask}
            onChangeText={setNewSubtask}
            placeholder="Add a new subtask"
          />
          <TouchableOpacity style={styles.button} onPress={addSubtask}>
            <Text style={styles.buttonText}>Add Subtask</Text>
          </TouchableOpacity>

          {/* Subtask List */}
          <FlatList
            data={subtasks}
            keyExtractor={(item) => item.subtask_id.toString()}
            renderItem={({ item }) => (
              <View style={styles.subtaskContainer}>
                <Text
                  style={[styles.subtaskText, item.status === 'completed' && styles.completedSubtaskText]}
                >
                  {item.subtask_title}
                </Text>
                <TouchableOpacity
                  style={styles.checkButton}
                  onPress={() => toggleSubtaskStatus(item.subtask_id, item.status)}
                >
                  <Ionicons name="checkmark-circle-outline" size={24} color={item.status === 'completed' ? 'green' : '#4CAF50'} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deleteSubtask(item.subtask_id)}
                >
                  <Ionicons name="trash-outline" size={20} color="#FF6347" />
                </TouchableOpacity>
              </View>
            )}
          />
        </>
      ) : (
        <Text>Loading task...</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    color: '#4CAF50',
    marginLeft: 10,
  },
  editSaveButton: {
    padding: 10,
    backgroundColor: '#4CAF50',
    borderRadius: 5,
  },
  buttonText: {
    fontSize: 16,
    color: '#fff',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 20,
    textAlign: 'center',
  },
  input: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    marginBottom: 15,
  },
  editable: {
    borderColor: '#4CAF50',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  dateText: {
    fontSize: 16,
    marginRight: 10,
  },
  calendarButton: {
    padding: 5,
  },
  clockButton: {
    padding: 5,
  },
  subtaskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  subtaskText: {
    fontSize: 16,
    flex: 1,
  },
  completedSubtaskText: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  checkButton: {
    padding: 5,
  },
  deleteButton: {
    padding: 5,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    alignItems: 'center',
  },
});
