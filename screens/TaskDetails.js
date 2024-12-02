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
  const [difficulty, setDifficulty] = useState('Easy');
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
        setDifficulty(result.difficulty || 'Easy');
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
    if (!time) return 'Not Set';
    return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#7F8C8D" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.editSaveButton} onPress={isEditing ? updateTaskDetails : () => setIsEditing(true)}>
          <Text style={styles.buttonText}>{isEditing ? 'Save Changes' : 'Edit'}</Text>
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
            <Text style={styles.label}>Difficulty   </Text>
            <View style={styles.pickerContainer}>
              {isEditing ? (
                <Picker
                  selectedValue={difficulty}
                  onValueChange={(itemValue) => setDifficulty(itemValue)}
                  style={styles.picker}
                >
                  <Picker.Item label="Easy" value="Easy" />
                  <Picker.Item label="Medium" value="Medium" />
                  <Picker.Item label="Hard" value="Hard" />
                </Picker>
              ) : (
                <Text style={styles.difficultyText}>{difficulty}</Text>
              )}
            </View>
          </View>

          <View style={styles.dateTimeContainer}>
            <Text style={styles.dateText}>Due Date </Text>
            <Text style={styles.dateValue} onPress={() => setShowDatePicker(true)}>{formatDueDate(dueDate)}</Text>
          </View>

          {showDatePicker && isEditing && (
            <DateTimePicker value={dueDate || new Date()} mode="date" display="default" onChange={handleDateChange} />
          )}

          {dueDate && (
            <View style={styles.dateTimeContainer}>
              <Text style={styles.dateText}>Time </Text>
              <Text style={styles.timeValue} onPress={() => setShowTimePicker(true)}>{formatDueTime(dueTime)}</Text>
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
            keyExtractor={(item) => (typeof item.subtask_id === 'number' ? item.subtask_id.toString() : 'defaultKey')}
            renderItem={({ item }) => (
              <View style={styles.subtaskContainer}>
                {/* Left Section: Checkbox and Title */}
                <View style={styles.subtaskLeft}>
                  <TouchableOpacity onPress={() => toggleSubtaskStatus(item.subtask_id, item.status)}>
                    <Ionicons
                      name={item.status === 'completed' ? 'checkbox' : 'checkbox-outline'}
                      size={20}
                      color={item.status === 'completed' ? '#4caf50' : '#7F8C8D'}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => toggleSubtaskStatus(item.subtask_id, item.status)}>
                    <Text style={[styles.subtaskText, item.status === 'completed' && styles.completed]}>
                      {item.subtask_title}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Right Section: Delete Icon */}
                <TouchableOpacity style={styles.deleteSubtask} onPress={() => deleteSubtask(item.subtask_id)}>
                  <Ionicons name="trash-outline" size={20} color="#7F8C8D" />
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
  container: { 
    flex: 1, 
    padding: 16,
    backgroundColor: '#FFFFFF'
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 16,
  },
  backButton: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  backButtonText: { 
    marginLeft: 8, 
    color: '#7F8C8D' 
  },
  editSaveButton: { 
    justifyContent: 'center', 
    alignItems: 'center', 
    
  },
  buttonText: { 
    color: '#7F8C8D', 
    fontSize: 16 
  },
  headerText: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 16,
    color: '#B8860B'
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
  editable: { 
    borderColor: '#7F8C8D' 
  },
  inputContainer: { 
    flexDirection: 'row', // Arrange items in a row
    alignItems: 'center', // Vertically align label and picker
    justifyContent: 'space-between', // Push label and picker to opposite ends
    marginVertical: 5,
    
  },
  pickerContainer:{
    backgroundColor: '#FFFFFF',
    height: 30,
    borderRadius:10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    borderWidth: .5,
    borderColor: '#7F8C8D'
    
  },
  label: { 
    fontSize: 16,
    color: '#7F8C8D' 
  },
  picker: { 
    width: 140, 
    color: '#7F8C8D', // Example text color for the picker
  },
  difficultyText: { 
    fontSize: 16,
    color: '#7F8C8D',
    paddingHorizontal: 5
  },
  dateTimeContainer: { 
    flexDirection: 'row', // Arrange items in a row
    alignItems: 'center', // Vertically align label and picker
    justifyContent: 'space-between', // Push label and picker to opposite ends
    marginVertical: 5,
  },
  dateValue:{
    fontSize: 16,
    color: '#7F8C8D',
    paddingHorizontal: 5,
    backgroundColor: '#FFFFFF',
    height: 30,
    borderRadius:10,
    paddingTop: 4,
    borderWidth: .5,
    borderColor: '#7F8C8D'
  },
  timeValue:{
    fontSize: 16,
    color: '#7F8C8D',
    paddingHorizontal: 5,
    backgroundColor: '#FFFFFF',
    height: 30,
    borderRadius:10,
    paddingTop: 4,
    borderWidth: .5,
    borderColor: '#7F8C8D'
  },
  calendarButton: { 
    padding: 8 
  },
  clockButton: { 
    padding: 8 
  },
  dateText: { 
    fontSize: 16,
    color: '#7F8C8D'
  },
  subtaskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Places items at opposite ends
    marginBottom: 10
  },
  subtaskLeft: {
    flexDirection: 'row', // Ensures checkbox and title are in a row
    alignItems: 'center',
    flex: 1, // Allows the left section to take up remaining space
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    borderRadius:10,
    minHeight:40,
    paddingHorizontal: 8,
    paddingVertical: 10, 
    borderWidth: .5,
    borderColor: '#7F8C8D'
    
  },
  subtaskText: {
    marginLeft: 10, // Space between checkbox and title
    fontSize: 16,
    color: '#7F8C8D', // Default text color
  },
  completed: {
    textDecorationLine: 'line-through', // Strikes through completed tasks
    color: '#999', // Optional: lighter color for completed tasks
  },
  button: {
     backgroundColor: '#2C3E50', 
     padding: 10, 
     marginBottom: 16, 
     alignItems: 'center',
     borderRadius: 15
    },
  deleteSubtask:{
    justifyContent: 'flex-end',
    height: 40,
    padding: 10,
    borderRadius:10,
    color: '#FFFFFF',
    alignItems: 'center',
    marginLeft: 10,
    borderWidth: .5,
    borderColor: '#7F8C8D'
  }
});
