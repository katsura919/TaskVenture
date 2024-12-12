import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ScrollView, Animated, Easing} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Import Expo Ionicons
import { useSQLiteContext } from 'expo-sqlite';
import { useFocusEffect } from '@react-navigation/native';

import IntroductionModal from './component/IntroductionModal';
import AsyncStorage from '@react-native-async-storage/async-storage'; 

export default function MyTasks({ navigation }) {

  //Intro Modal
  const [showModal, setShowModal] = useState(false);

  const checkFirstTime = async () => {
    const hasSeenIntro = await AsyncStorage.getItem('QuestListIntro');
    if (!hasSeenIntro) {
      setShowModal(true);
    }
  };

  useEffect(() => {
    checkFirstTime();
  }, []);

  const handleCloseModal = async () => {
    await AsyncStorage.setItem('QuestListIntro', 'true');
    setShowModal(false);
  };

  const db = useSQLiteContext();
  const [easyTasks, setEasyTasks] = useState([]);
  const [mediumTasks, setMediumTasks] = useState([]);
  const [hardTasks, setHardTasks] = useState([]);
  
  const fetchTasks = async () => {
    try {
      const result = await db.getAllAsync('SELECT * FROM tasks WHERE status = ?', ['pending']);
      
      // Separate tasks into categories based on difficulty
      const easy = result.filter(task => task.difficulty === 'Easy');
      const medium = result.filter(task => task.difficulty === 'Medium');
      const hard = result.filter(task => task.difficulty === 'Hard');

      setEasyTasks(easy);
      setMediumTasks(medium);
      setHardTasks(hard);
    } catch (error) {
      console.log('Error fetching tasks:', error);
    }
  };

  const calculateRemainingDays = (dueDate) => {
    if (!dueDate) return "No Deadline";

    const currentDate = new Date();
    const dueDateObj = new Date(dueDate);
    const diffTime = dueDateObj - currentDate;
    const remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Convert time difference to days

    return remainingDays >= 0
      ? `${remainingDays} days remaining`
      : "Overdue";
  };

  const markTaskAsCompleted = async (taskId) => {
    try {
      // Step 1: Retrieve the task's difficulty
      const task = await db.getFirstAsync(
        `SELECT difficulty FROM tasks WHERE task_id = ?`,
        [taskId]
      );
  
      if (!task) {
        console.log('Task not found');
        return;
      }
  
      // Step 2: Determine XP based on difficulty
      const difficulty = task.difficulty;
      let xp = 0;
      if (difficulty === 'Easy') xp = 10;
      else if (difficulty === 'Medium') xp = 20;
      else if (difficulty === 'Hard') xp = 30;

      // Step 3: Update the task status to 'completed'
      await db.getFirstAsync(
        `UPDATE tasks SET status = ? WHERE task_id = ?`,
        ['completed', taskId]
      );
      console.log(`Task Completed`);

      // Step 4: Get current experience
      const currentExperienceResult = await db.getFirstAsync("SELECT experience FROM users WHERE user_id = ?", [1]);
      const currentExperience = currentExperienceResult ? currentExperienceResult.experience : 0; // Handle null if no user found
      console.log("Current XP: ", currentExperience);

      // Step 5: Update the user's experience
      await db.runAsync(
        `UPDATE users SET experience = experience + ? WHERE user_id = ?`,
        [xp, 1]
      );
      console.log(`Gained ${xp} XP!`);


  
      fetchTasks(); // Re-fetch tasks to update the list
    } catch (error) {
      console.log('Error marking task as completed:', error);
    }
  };
  
  
  

  useFocusEffect(
    React.useCallback(() => {
      fetchTasks();
    }, [])
  );


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
    <View style={styles.container}>
      <IntroductionModal
        visible={showModal}
        onClose={handleCloseModal}
        dialogues={[
          'Behold, your list of quests—tasks that will challenge your strength and wits.',
          'Each quest is a stepping stone on your journey. Complete them to unlock greater rewards!',
          'Ready to choose your next adventure? The path is yours to decide.',
        ]}
        avatar={require('../assets/avatars/wizard.png')}
        name="Quest Keeper"
      />


      <View style={styles.header}>
        <Text style={styles.headerText}>My Quests</Text>
      </View>

      <Animated.ScrollView 
        style={[
          styles.scrollContainer,
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
      <TouchableOpacity
              style={styles.completedTask}
              onPress={() => navigation.navigate('CompletedTasks')}
            >
      <Text style={styles.completedTaskLabel}>View Completed Quest</Text>      
      </TouchableOpacity>
      {/* Easy Tasks */}
      <View style={styles.taskListContainer}>
        <Text style={styles.categoryHeader}>Easy Quests</Text>
        <FlatList
          data={easyTasks}
          keyExtractor={(item) => item.task_id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => navigation.navigate('TaskDetails', { taskId: item.task_id })}
            >
              <View style={[styles.taskContainerEasy, item.status === 'completed' && styles.taskCompleted]}>
                <TouchableOpacity
                  onPress={() => markTaskAsCompleted(item.task_id)} // Mark task as completed when tapped
                >
                  <Ionicons
                    name={item.status === 'completed' ? 'checkbox' : 'checkbox-outline'} // Change icon based on completion status
                    size={24}
                    color={item.status === 'completed' ? '#28a745' : '#FFFFFF'}
                    style={styles.taskIcon}
                  />
                </TouchableOpacity>
                <Text style={[styles.taskText, item.status === 'completed' && styles.completedTaskText]}>
                  {item.title}
                </Text>
                <Text style={styles.dueDateText}>{calculateRemainingDays(item.due_date)}</Text>
              </View>
            </TouchableOpacity>
          )}
          scrollEnabled={false}
        />
      </View>

      {/* Medium Tasks */}
      <View style={styles.taskListContainer}>
        <Text style={styles.categoryHeader}>Medium Quests</Text>
        <FlatList
          data={mediumTasks}
          keyExtractor={(item) => item.task_id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => navigation.navigate('TaskDetails', { taskId: item.task_id })}
            >
              <View style={[styles.taskContainerMedium, item.status === 'completed' && styles.taskCompleted]}>
                <TouchableOpacity
                  onPress={() => markTaskAsCompleted(item.task_id)} // Mark task as completed when tapped
                >
                  <Ionicons
                    name={item.status === 'completed' ? 'checkbox' : 'checkbox-outline'} // Change icon based on completion status
                    size={24}
                    color={item.status === 'completed' ? '#28a745' : '#FFFFFF'}
                    style={styles.taskIcon}
                  />
                </TouchableOpacity>
                <Text style={[styles.taskText, item.status === 'completed' && styles.completedTaskText]}>
                  {item.title}
                </Text>
                <Text style={styles.dueDateText}>{calculateRemainingDays(item.due_date)}</Text>
              </View>
            </TouchableOpacity>
          )}
          scrollEnabled={false}
        />
      </View>

      {/* Hard Tasks */}
      <View style={styles.taskListContainer}>
        <Text style={styles.categoryHeader}>Hard Quests</Text>
        <FlatList
          data={hardTasks}
          keyExtractor={(item) => item.task_id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => navigation.navigate('TaskDetails', { taskId: item.task_id })}
            >
              <View style={[styles.taskContainerHard, item.status === 'completed' && styles.taskCompleted]}>
                <TouchableOpacity
                  onPress={() => markTaskAsCompleted(item.task_id)} // Mark task as completed when tapped
                >
                  <Ionicons
                    name={item.status === 'completed' ? 'checkbox' : 'checkbox-outline'} // Change icon based on completion status
                    size={24}
                    color={item.status === 'completed' ? '#28a745' : '#FFFFFF'}
                    style={styles.taskIcon}
                  />
                </TouchableOpacity>
                <Text style={[styles.taskText, item.status === 'completed' && styles.completedTaskText]}>
                  {item.title}
                </Text>
                <Text style={styles.dueDateText}>{calculateRemainingDays(item.due_date)}</Text>
              </View>
            </TouchableOpacity>
          )}
          scrollEnabled={false}
        />
      </View>
      </Animated.ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#1e2026', 
    padding: 16,
    paddingBottom: 60
  },
  completedTask:{
    flexDirection: 'row', // Ensures the text can be aligned in a row
    justifyContent: 'flex-end', // Aligns text to the right
    
  },
  completedTaskLabel:{
    fontSize: 13,
    fontWeight: "bold",
    color: "#7F8C8D",
    justifyContent: 'flex-end'
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 20 
  },
  headerText: { 
    fontSize: 24, 
    fontWeight: 'bold',
    color: '#f2f3f2'
  },
  taskListContainer: { 
    marginBottom: 20,
  },
  categoryHeader: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    marginVertical: 10,
    color: '#7F8C8D'
  },
  taskContainerEasy: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#6dc34b', 
    padding: 15, 
    borderRadius: 10,
    marginVertical: 5,
    elevation: 5
  },
  taskContainerMedium: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#e1e13d', 
    padding: 15, 
    borderRadius: 10,
    marginVertical: 5, 
    elevation: 5
  },
  taskContainerHard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#f6b531', 
    padding: 15, 
    borderRadius: 10,   
    marginVertical: 5,
    elevation: 5
  },
  taskIcon: { 
    marginRight: 10,
  },
  taskText: { 
    fontSize: 16, 
    flex: 1,
    color: 'white'
  },
  completedTaskText: { 
    textDecorationLine: 'line-through', 
    color: 'gray' },
  taskCompleted: { 
    backgroundColor: '#d3f8e2' 
  },
  dueDateText: { 
    fontSize: 14, 
    color: 'white' },
});