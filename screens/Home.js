import React, {  useState, useEffect, useRef } from 'react';
import { Animated, StatusBar, View, Text, StyleSheet, TouchableOpacity, Easing, Image, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSQLiteContext } from 'expo-sqlite';
import { useFocusEffect } from '@react-navigation/native';
import IntroductionModal from './component/IntroductionModal';
import AsyncStorage from '@react-native-async-storage/async-storage'; 

const Dashboard = ({navigation}) => {
  const db = useSQLiteContext();
  const [newName, setNewName] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
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
        if (item.difficulty === 'Easy') counts.easy = item.task_count;
        if (item.difficulty === 'Medium') counts.medium = item.task_count;
        if (item.difficulty === 'Hard') counts.hard = item.task_count;
      });

      setTaskCounts(counts);
    } catch (error) {
      console.error('Error fetching task counts by difficulty:', error);
    }
  };

  const fetchProfile = async () => {
    try {
      // Fetch user data from the 'users' table
      const result = await db.getAllAsync("SELECT * FROM users");

      if (result.length > 0) {
        const user = result[0]; // Assuming there's only one user
        setNewName(user.username); // Initialize the name to the current name
        setProfilePicture(user.profile_picture || '../assets/avatars/gamer.png'); // Default avatar
      }

    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  // Fetch data when the component mounts
  useFocusEffect(
    React.useCallback(() => {
      countTasksByDifficulty();
      fetchTasksDueThisWeek();
      fetchProfile();
    }, [])
  );
  
  //Animations
  const cardAnimation = useRef(new Animated.Value(0)).current; // For card entry
  const headingAnimation = useRef(new Animated.Value(0)).current; // For card entry

   useFocusEffect(
    React.useCallback(() => {
      // Reset the animation value
      cardAnimation.setValue(0);
      headingAnimation.setValue(0);
      
      // Start the fade-in animation
      Animated.timing(headingAnimation, {
        toValue: 1,
        duration: 3000,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }).start();

      // Start the animation
      Animated.timing(cardAnimation, {
        toValue: 1,
        duration: 1000,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }).start();
    }, [])
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1e2026" />
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

      <Animated.View 
         style={[
          styles.headingSection,
          {
            opacity: headingAnimation, // Fade-in effect
          },
        ]}
        >
        <View style={styles.avatarSection}>
          
          <TouchableOpacity style={styles.avatarContainer} onPress={() => navigation.navigate('Profile')}>
            <Image
              source={profilePicture}
              style={styles.avatar}
              
            />
          </TouchableOpacity>
          
          {/* Greeting */}
          <Text style={styles.greeting}>Hi, <Text style={{color: '#fbb95f'}}>{newName}!</Text></Text>

        </View>
      
        <View style={styles.card}>
          <View style={styles.contentContainer}>
            {/* Text Section */}
            <View style={styles.textContainer}>
              <Text style={styles.welcomeText}>Welcome, <Text style={{color: '#fbb95f'}}>Adventurer!</Text></Text>
              <Text style={styles.subText}>
                Your quest awaits. Ready to conquer today's quest?
              </Text>
            </View>
            {/* Torch GIF */}
            <View style={styles.wandContainer}>
              <Image
                source={require('../assets/icons/rules.png')} // Replace with your GIF path
                style={styles.torchImage}
              />
            </View>
          </View>
        </View>
      </Animated.View >
    
    <Animated.View 
      style={[
        styles.scrollContainer,
        {
          transform: [{ translateY: cardAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [300, 0], // Slide in from bottom
          }) }],
          opacity: cardAnimation, // Fade in effect
        },
      ]}
      >
      <ScrollView style={styles.scroll}>
        <View style={styles.tasksection}>
         <View style={{justifyContent: 'center', alignItems: 'center'}}>
          <Text style={styles.headerTask}>WEEKLY QUESTS</Text>
          </View>

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
        

        <View style={{justifyContent: 'center', alignItems: 'center'}}>
          <Text style={styles.headerTask}>QUEST DIFFICULTIES</Text>
        </View>

        {/* Task Categories */}
        <View style={styles.taskCategoryContainer}>
          <TaskCategory title="Easy" newTasks={taskCounts.easy} />
          <TaskCategory title="Medium" newTasks={taskCounts.medium} />
          <TaskCategory title="Hard" newTasks={taskCounts.hard} />
        </View>
      </View>
      </ScrollView>
    </Animated.View>
    </View>
  );
};

// TaskCategory Component
const TaskCategory = ({ title, newTasks }) => {
  return (
    <View style={styles.taskCategory}>
      <Text style={styles.taskTitle}>{title}</Text>
      <Text style={styles.taskCount}>{newTasks}  Tasks</Text>
      
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e2026',
  },
  headingSection:{
    backgroundColor: '#1e2026',
  },
  scrollContainer:{
    backgroundColor: '#f2f3f2',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    overflow: 'hidden', // Ensures the content respects the border radius
  },
  scroll:{
    width: '100%',
  },
  avatarSection:{
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15
  },
  avatarContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    width: 35,
    height:35,
    backgroundColor: '#fffefe'
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  greeting: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f2f3f2',
    marginLeft: 10
  },
  card: {
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    top: -10
  },
  contentContainer: {
    flexDirection: 'row', // Align text and torch side by side
    alignItems: 'center',
  },
  innerShadow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 20, // Covers only the top half
    borderRadius: 50, // Matches the button's border radius
    zIndex: 1, // Ensure it overlays the button background
  },
  textContainer: {
    flex: 1, // Allow text to take up available space
  },
  welcomeText: {
    fontSize: 41,
    fontWeight: 'bold',
    color: '#f2f3f2', // Dark gold color for text
  },
  subText: {
    fontSize: 12,
    color: '#f2f3f2', // Muted gray for secondary text
    top: -7
  },
  wandContainer:{
    width:90,
    height:90,
    top: -20,
    left: -10
  },
  torchImage: {
    width: '100%',
    height: '100%',

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
    backgroundColor: '#2c2f35',
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 1,
  },
  taskTitles: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f2f3f2',
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
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 10,
    color: '#1e2026',
  },
  taskCategoryContainer: {
    flexDirection: 'column',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 300
  },
  taskCategory: {
    width: '100%',
    flexDirection:'row',
    alignItems: 'center',
    backgroundColor: '#2c2f35',
    padding: 16,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 1,
  },
  taskCount: {
    fontSize: 14,
    color: '#f2f3f2',
   marginLeft: 10
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#7F8C8D',
  },
});

export default Dashboard;
