import React, {  useState, useEffect } from 'react';
import { StatusBar, View, Text, StyleSheet, TouchableOpacity, Dimensions, Image, ScrollView } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { useFocusEffect } from '@react-navigation/native';
import IntroductionModal from './component/IntroductionModal';
import AsyncStorage from '@react-native-async-storage/async-storage'; 

const Dashboard = () => {
  const db = useSQLiteContext();
  const screenWidth = Dimensions.get('window').width;
  const [tasksDueThisWeek, setTasksDueThisWeek] = useState([]);
  const [taskCounts, setTaskCounts] = useState({
    easy: 0,
    medium: 0,
    hard: 0,
  });

  //Intro Modal
  const [showModal, setShowModal] = useState(false);

  const checkFirstTime = async () => {
    const hasSeenIntro = await AsyncStorage.getItem('HomeScreenIntro');
    if (!hasSeenIntro) {
      setShowModal(true);
    }
  };

  useEffect(() => {
    checkFirstTime();
  }, []);

  const handleCloseModal = async () => {
    await AsyncStorage.setItem('HomeScreenIntro', 'true');
    setShowModal(false);
  };

   // Get the start and end of the current week (Sunday to Saturday)
   const getCurrentWeekRange = () => {
    const currentDate = new Date();
    const startOfWeek = new Date(currentDate);
    const endOfWeek = new Date(currentDate);

    // Set start of the week (Sunday)
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay()); // Get previous Sunday
    startOfWeek.setHours(0, 0, 0, 0); // Set to start of day

    // Set end of the week (Saturday)
    endOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + 6); // Get next Saturday
    endOfWeek.setHours(23, 59, 59, 999); // Set to end of day

    return { startOfWeek, endOfWeek };
  };

  // Function to fetch tasks due this week
  const fetchTasksDueThisWeek = async () => {
    const { startOfWeek, endOfWeek } = getCurrentWeekRange();
    const startOfWeekString = startOfWeek.toISOString();
    const endOfWeekString = endOfWeek.toISOString();

    try {
      const result = await db.getAllAsync(`
        SELECT * FROM tasks
        WHERE due_date BETWEEN '${startOfWeekString}' AND '${endOfWeekString}'
        AND status = 'pending'
      `);
      

      if (result.length === 0) {
        // No tasks for the current week
        setTasksDueThisWeek(null);
      } else {
        setTasksDueThisWeek(result);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  // Function to format the due date
  const formatDueDate = (dueDate) => {
  const date = new Date(dueDate);
  const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
};


  // Function to fetch task counts by difficulty
  const countTasksByDifficulty = async () => {
    try {
      const result = await db.getAllAsync(`
        SELECT difficulty, COUNT(*) AS task_count
        FROM tasks
        WHERE status = 'pending'
        GROUP BY difficulty
      `);
      

      // Set the result to state
      const counts = {
        easy: 0,
        medium: 0,
        hard: 0,
      };

      result.forEach((item) => {
        if (item.difficulty === 'easy') counts.easy = item.task_count;
        if (item.difficulty === 'medium') counts.medium = item.task_count;
        if (item.difficulty === 'hard') counts.hard = item.task_count;
      });

      setTaskCounts(counts);
    } catch (error) {
      console.error('Error fetching task counts by difficulty:', error);
    }
  };

  // Fetch data when the component mounts
  useFocusEffect(
    React.useCallback(() => {
      countTasksByDifficulty();
      fetchTasksDueThisWeek();
    }, [])
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2a2a2a" />
      <IntroductionModal
        visible={showModal}
        onClose={handleCloseModal}
        dialogues={[
          'Welcome, Adventurer! My name is Arcanor, your guide on this epic journey!',
          'TaskVenture is not just a to-do list app, it’s a quest for productivity!',
          'Complete tasks to earn experience, unlock achievements, and level up!',
          'Are you ready to begin your adventure?',
        ]}
        avatar={require('../assets/avatars/wizard.png')}
        name="Elder Mage"
      />


      <View style={styles.card}>
        <View style={styles.contentContainer}>
          {/* Text Section */}
          <View style={styles.textContainer}>
            <Text style={styles.welcomeText}>Welcome, Adventurer!</Text>
            <Text style={styles.subText}>
              Your quest awaits. Ready to conquer today's quest?
            </Text>
          </View>
          {/* Torch GIF */}
          <Image
            source={require('../assets/icons/torch.gif')} // Replace with your GIF path
            style={styles.torchImage}
          />
        </View>
      </View>
    <ScrollView style={styles.scroll}>
      <View style={styles.tasksection}>
        <Text style={styles.headerTask}>Weekly Quests</Text>
      

      {/* Display tasks or message */}
      <View style={styles.taskContainer}>
        {tasksDueThisWeek === null ? (
          <View  style={styles.task}>
            <Text style={styles.taskDescription}>No more Quest for this week. Well done, Adventurer!</Text>
          </View>
        ) : (
          tasksDueThisWeek.map((task) => (
            <View key={task.task_id} style={styles.task}>
              <Text style={styles.taskTitles}>{task.title}</Text>
              <Text style={styles.taskDescription}>{task.description}</Text>
              <Text style={styles.taskDueDate}>Due: {formatDueDate(task.due_date)}</Text>
            </View>
          ))
        )}
      </View>
      

      <View >
        <Text style={styles.headerTask}>Quest Difficulties</Text>
      </View>

      {/* Task Categories */}
      <View style={styles.taskCategoryContainer}>
        <TaskCategory title="Easy" newTasks={taskCounts.easy} />
        <TaskCategory title="Medium" newTasks={taskCounts.medium} />
        <TaskCategory title="Hard" newTasks={taskCounts.hard} />
      </View>
    </View>
    </ScrollView>
    </View>
  );
};

// TaskCategory Component
const TaskCategory = ({ title, newTasks }) => {
  return (
    <View style={styles.taskCategory}>
      <Text style={styles.taskTitle}>{title}</Text>
      <Text style={styles.taskCount}>{newTasks} Tasks</Text>
      
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    
  },
  scroll:{
    width: '100%',
  },
  card: {
    backgroundColor: '#FFFFFF', // White card background
    borderRadius: 15,
    padding: 10,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 5,
  },
  contentContainer: {
    flexDirection: 'row', // Align text and torch side by side
    alignItems: 'center',
    
  },
  textContainer: {
    flex: 1, // Allow text to take up available space
  },
  welcomeText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#B8860B', // Dark gold color for text
    marginBottom: 8,
  },
  subText: {
    fontSize: 14,
    color: '#7F8C8D', // Muted gray for secondary text
  },
  torchImage: {
    width: 70,
    height: 90,
    marginLeft: 15,
  },

  tasksection:{
   
  },
  taskContainer: {
  },
  message: {
    fontSize: 18,
    color: '#28a745', // Green color for success
    textAlign: 'center',
    marginTop: 20,
  },
  task: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  taskTitles: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7F8C8D',
  },
  taskDescription: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  taskDueDate: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#7F8C8D',
  },
  headerTask:{
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    marginLeft: 16,
    color: '#7F8C8D',
  },
  taskCategoryContainer: {
    flexDirection: 'column',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: 16,
  },
  taskCategory: {
    width: '100%',
    flexDirection:'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  taskCount: {
    fontSize: 14,
    color: '#7F8C8D',
   marginLeft: 10
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#7F8C8D',
  },
});

export default Dashboard;
