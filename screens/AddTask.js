import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TextInput, Pressable, Alert, TouchableOpacity, ScrollView, Animated, Easing} from 'react-native'; 
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSQLiteContext } from 'expo-sqlite';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Picker } from '@react-native-picker/picker';  // Import Picker component
import Feather from '@expo/vector-icons/Feather';
import { Ionicons } from '@expo/vector-icons';
import IntroductionModal from './component/IntroductionModal';
import AsyncStorage from '@react-native-async-storage/async-storage'; 

export default function AddTask() {

  // Intro Modal
  const [showModal, setShowModal] = useState(false);

  const checkFirstTime = async () => {
    const hasSeenIntro = await AsyncStorage.getItem('AddTaskIntro');
    if (!hasSeenIntro) {
      setShowModal(true);
    }
  };

  useEffect(() => {
    checkFirstTime();
  }, []);

  const handleCloseModal = async () => {
    await AsyncStorage.setItem('AddTaskIntro', 'true');
    setShowModal(false);
  };

  const db = useSQLiteContext();
  const [task, setTask] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(null);
  const [dueTime, setDueTime] = useState(null); 
  const [subtask, setSubtask] = useState('');
  const [subtasks, setSubtasks] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [difficulty, setDifficulty] = useState('Easy');  // Add state for difficulty
  
  // Reset fields when the screen is focused
  useFocusEffect(
    React.useCallback(() => {
      setTask('');
      setDescription('');
      setDueDate(null);
      setDueTime(null);
      setSubtask('');
      setSubtasks([]);
      setDifficulty('Easy');
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
      setDifficulty('Easy');
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

  const removeSubtask = (index) => {
    // Remove the subtask from the list based on its index
    const updatedSubtasks = subtasks.filter((sub, subIndex) => subIndex !== index);
    setSubtasks(updatedSubtasks);
  };

  const onDateChange = (event, selectedDate) => {
    if (event.type === 'set' && selectedDate) {
      setDueDate(selectedDate);
    }
    setShowDatePicker(false);
    
  };

  const onTimeChange = (event, selectedTime) => {
    if (event.type === 'set' && selectedTime) {
      // Set the selected time to the state
      setDueTime(selectedTime);
  
      // Merge the selected time into the existing dueDate
      if (dueDate) {
        const updatedDateTime = new Date(dueDate);
        updatedDateTime.setHours(selectedTime.getHours(), selectedTime.getMinutes());
        setDueDate(updatedDateTime);
        setShowTimePicker(false);
      }
    }
    // Always hide the time picker when a selection is made or canceled
    setShowTimePicker(false);
  };
  
  

  const clearDueDate = () => {
    setDueDate(null);
    setDueTime(null);
  };

  //Animations
  const addtaskAnimation = useRef(new Animated.Value(0)).current; // Animation value

  useFocusEffect(
    React.useCallback(() => {
      // Reset the animation value
      addtaskAnimation.setValue(0);

      // Start the fade-in animation
      Animated.timing(addtaskAnimation, {
        toValue: 1, // Fully visible
        duration: 500, // Animation duration
        easing: Easing.inOut(Easing.ease), // Smooth easing
        useNativeDriver: true,
      }).start();
    }, [])
  );

  // Conditional rendering if needed (optional)
  const animatedStyle = {
    opacity: addtaskAnimation,
  };

  return (
    <View 
      style={
        styles.container
      }
    >
      
      <IntroductionModal
        visible={showModal}
        onClose={handleCloseModal}
        dialogues={[
          'Here, you can add tasks—your challenges for the day. Each one brings you closer to your next victory!',
          'Ready to take on your first task? The adventure awaits!',
        ]}
        avatar={require('../assets/avatars/wizard.png')}
        name="Elder Mage"
      />

      <Text style={styles.title}>New Quest</Text>

    <Animated.ScrollView 
      style={[
        styles.scroll,
        animatedStyle,
        {
          transform: [
            {
              scale: addtaskAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [0.99, 1], // Optional scale effect for smooth entry
              }),
            },
          ],
        },
      ]}
    >
      <TextInput
        style={styles.input}
        placeholder="Quest Title"
        value={task}
        onChangeText={(text) => setTask(text)}
        placeholderTextColor="#aaa"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Notes"
        value={description}
        onChangeText={(text) => setDescription(text)}
        placeholderTextColor="#aaa"
      />

      {/* Difficulty Picker */}
      <View style={styles.difficultyContainer}>
        <Ionicons name="star" size={20} color="#7F8C8D" style={{marginRight: 10}} />
          <Text style={styles.label}>Difficulty </Text>
          <View style={styles.pickerContainer}>
          <Picker
            selectedValue={difficulty}
            onValueChange={(itemValue) => setDifficulty(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Easy" value="Easy" />
            <Picker.Item label="Medium" value="Medium" />
            <Picker.Item label="Hard" value="Hard" />
          </Picker>
          </View>
      </View>
      
      <View style={styles.dateContainer}>
        <Ionicons name="calendar" size={20} color="#7F8C8D" style={{marginRight: 10}}/>
          <Text style={styles.label}>
            Due Date 
          </Text>
          <Pressable onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
            <Text style={styles.dateText}>
              {dueDate ? dueDate.toLocaleDateString() : 'Not Set'}
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
      </View>

      <View style={styles.timeContainer}>
        <Ionicons name="time" size={20} color="#7F8C8D" style={{marginRight: 10}}/>
              <Text style={styles.label}>Time  </Text>
              <View style={styles.dateWrapper}>
                <Pressable onPress={() => setShowTimePicker(true)} style={styles.dateButton}>
                  <Text style={styles.dateText}>
                    {dueTime ? dueTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Not Set'}
                  </Text>
                </Pressable>
              </View>

            {showTimePicker && (
              <DateTimePicker
                value={dueTime || new Date()}
                mode="time"
                display="default"
                onChange={onTimeChange}
              />
            )}
      </View>


      {dueDate && (
        <Pressable onPress={clearDueDate} style={styles.clearDateButton}>
          <Text style={styles.buttonText}>Clear Date and Time</Text>
        </Pressable>
      )}


      <View style={styles.subtaskInputContainer}>
        <TextInput
          style={styles.subTaskInput}
          placeholder="Subtask"
          value={subtask}
          onChangeText={(text) => setSubtask(text)}
          placeholderTextColor="#aaa"
        />

        <Pressable style={styles.addSubButton} onPress={handleAddSubtask}>
          <Text style={styles.buttonText}>+</Text>
        </Pressable>
      </View>
      

      <View style={styles.subtasksContainer}>
      {subtasks.map((sub, index) => (
        <View key={index} style={styles.subtaskItem}>
          <Text style={styles.subtask}>{sub}</Text>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => removeSubtask(index)}
          >
             <Ionicons name="trash-outline" size={20} color="red" />
          </TouchableOpacity>
        </View>
      ))}

    </View>
      <View style={styles.addButtonContainer} >
         
      <TouchableOpacity style={styles.addButton} onPress={handleAddTask}>
        {/* Inner Shadow Layer */}
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.2)', 'rgba(0, 0, 0, 0)']}
          style={styles.innerShadow}
        />
        <Text style={styles.buttonText}>ADD QUEST</Text>
      </TouchableOpacity>
      </View>

      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: '#1e2026', 
    padding: 20,
    alignItems: 'center',
  },
  scroll:{
    width: '100%',
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold',
    color: '#f2f3f2',
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 20 
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
    flexDirection: 'row', // Arrange items in a row
    alignItems: 'center', // Vertically align label and picker
    justifyContent: 'space-between', // Push label and picker to opposite ends
    marginVertical: 5,
  },
  label: {
    flex: 1,
    fontSize: 16,
    color: '#7F8C8D',
  },
  pickerContainer:{
    backgroundColor: '#2c2f35',
    height: 30,
    borderRadius:10,
    alignItems: 'center',
    justifyContent: 'center',

  },
  picker: {
    width: 140, 
    color: '#7F8C8D', // Example text color for the picker
    
  },
  dateContainer:{
    flexDirection: 'row', // Arrange items in a row
    alignItems: 'center', // Vertically align label and picker
    justifyContent: 'space-between', // Push label and picker to opposite ends
    marginVertical: 5,
  },
  dateWrapper:{
    display: 'flex',
    justifyContent: 'flex-end',
  },
  dateButton: {
    display: 'flex',
    paddingHorizontal:10,
    height: 30,
    color: "#7F8C8D",
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2c2f35',
    borderRadius:10,
    overflow: 'hidden',

  },
  dateText: {
    color: '#7F8C8D',
  },
  timeContainer:{
    flexDirection: 'row', // Arrange items in a row
    alignItems: 'center', // Vertically align label and picker
    justifyContent: 'space-between', // Push label and picker to opposite ends
    marginVertical: 5,
    marginBottom: 10,
  },
 
  clearDateButton: { 
    padding: 12,
    backgroundColor: '#e74c3c',
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  addButtonContainer:{
    marginTop: 5
  },
  innerShadow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 25, // Same as button
    zIndex: 1, // Ensure it is on top of the button background
  },
  addButton: {
    position: 'relative', // Needed for the inner shadow
    backgroundColor: '#FF6347', // Tomato red
    borderRadius: 25,
    paddingVertical: 9,
    paddingHorizontal: 35,
    borderWidth: 3,
    borderColor: '#FFDAB9', // Light peach border
    overflow: 'hidden', // Ensures the inner shadow doesn't exceed borders
  },
  buttonText: { 
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
    zIndex: 2, // Ensure it stays above the inner shadow
  },

  subtaskInputContainer:{
    width: '100%',
    backgroundColor: 'black',
    height: 400
  },

  subtaskItem: {
    color: '#7F8C8D',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    
  },
  subtask: {
    flex: 1,
    fontSize: 16,
    marginRight: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    borderRadius:10,
    minHeight:40,
    color: '#7F8C8D',
    paddingHorizontal: 8,
    paddingVertical: 10,
    marginBottom: 10,
    borderWidth: .5,
    borderColor: '#7F8C8D'
    
  },
  removeButton: {
    justifyContent: 'flex-end',
    height: 40,
    padding: 10,
    borderRadius:10,
    backgroundColor: '#2c2f35',
    alignItems: 'center',
    marginBottom: 10,

  },
  removeText: {
    color: 'white',
    fontSize: 14,
    alignItems: 'center',
    paddingBottom: 5
  },

  subtaskInputContainer: {
    flexDirection: 'row', // Align items horizontally
    alignItems: 'center', // Center items vertically
    justifyContent: 'space-between', // Ensure even spacing between elements
    marginBottom: 10
  },
  subTaskInput: {
  flex: 1,
    height: 40,
    borderRadius:10,
    paddingHorizontal: 10,
    backgroundColor: '#FFFFFF',
    marginRight: 8, // Add a small gap between input and button
  },
  addSubButton: {
    width: 42, // Set width to 50% of the container
    height: 40, // Match the input height for alignment
    backgroundColor: '#2c2f35',
    borderRadius:10,
    justifyContent: 'center',
    alignItems: 'center',
  },

});
