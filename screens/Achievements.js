import React, { useEffect, useState, useRef} from "react";
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ScrollView, Animated, Easing} from "react-native";
import { useSQLiteContext } from "expo-sqlite"; // Assuming you're using a custom SQLite context
import { useFocusEffect } from '@react-navigation/native';
import IntroductionModal from './component/IntroductionModal';
import AsyncStorage from '@react-native-async-storage/async-storage';

const achievementsData = [
  {
    id: 1,
    title: "Conquer the Day",
    description: "Complete 1 task.",
    required: 1,
    icon: "dedicated.png",
  },
  {
    id: 2,
    title: "Task Expert",
    description: "Complete 50 tasks.",
    required: 50,
    icon: "dedicated2.png",
  },
  {
    id: 3,
    title: "Task Master",
    description: "Complete 100 tasks.",
    required: 100,
    icon: "taskmaniac.png",
  },
  {
    id: 4,
    title: "Momentum Builder",
    description: "Complete 10 tasks in a row.",
    required: 10,
    icon: "momentum.png",
  },
  
];

const achievementsLevel = [
  {
    id: 5,
    title: "Rising Star",
    description: "Reach Level 2.",
    required: 2,
    icon: "levelup.png",
  },
  {
    id: 6,
    title: "Seasoned Adventurer",
    description: "Reach Level 5.",
    required: 10,
    icon: "levelup.png",
  },

];

const AchievementScreen = () => {
  const db = useSQLiteContext();
  const [completedAchievements, setCompletedAchievements] = useState([]);
  const [level, setLevel] = useState()
  const [taskCount, setTaskCount] = useState(0);
  const [activeTab, setActiveTab] = useState("ongoing"); // State for active tab (ongoing or completed)
  console.log(level);

  const fetchLevel = async () => {
    try {
      const result = await db.getFirstAsync("SELECT level FROM users");
      setLevel(result.level);
  
    } catch (error) {
      console.error("Error fetching level", error);
      return 0;
    }
  };
  
  const fetchTaskCompletionCount = async () => {
    try {
      const result = await db.getFirstAsync("SELECT COUNT(*) AS count FROM tasks WHERE status = ?", [
        "completed",
      ]);
      return result?.count || 0;
    } catch (error) {
      console.error("Error fetching task completion count:", error);
      return 0;
    }
  };

  const fetchCompletedAchievements = async () => {
    try {
      const achievements = await db.getAllAsync(`SELECT * FROM completed_achievements`);
      return achievements;
    } catch (error) {
      console.error("Error fetching completed achievements:", error);
      return [];
    }
  };

  const saveCompletedAchievement = async (title, icon) => {
    try {
      const existing = await db.getFirstAsync(
        `SELECT * FROM completed_achievements WHERE title = ?`,
        [title]
      );

      if (!existing) {
        await db.runAsync(
          `INSERT INTO completed_achievements (title, icon) VALUES (?, ?)`,

          [title, icon]
        );
      }
    } catch (error) {
      console.error("Error saving completed achievement:", error);
    }
  };

  const checkForCompletedAchievements = async (updatedValue, type = 'task') => {
    const newCompleted = [];
  
    // Determine which data to check based on the type
    const achievements = type === 'level' ? achievementsLevel : achievementsData;
    
    for (const achievement of achievements) {
      const valueToCompare = type === 'level' ? updatedValue : updatedValue;  // You can use the updated value directly in both cases (level or task count)
      
      if (
        valueToCompare >= achievement.required &&
        !completedAchievements.some((a) => a.title === achievement.title)
      ) {
        await saveCompletedAchievement(achievement.title, achievement.icon);
        newCompleted.push({ title: achievement.title, icon: achievement.icon });
      }
    }
  
    // Update state for new achievements
    if (newCompleted.length > 0) {
      setCompletedAchievements((prev) => [...prev, ...newCompleted]);
    }
  };
  

  const achievementIcons = {
    "dedicated.png": require("../assets/achievements/dedicated.png"),
    "dedicated2.png": require("../assets/achievements/dedicated2.png"),
    "taskmaniac.png": require("../assets/achievements/taskmaniac.png"),
    "gladiator.png": require("../assets/avatars/gladiator.png"),
    "levelup.png": require("../assets/achievements/levelup.png")
  };

  useFocusEffect(
    React.useCallback(() => {
      const loadData = async () => {
        fetchLevel();
        const count = await fetchTaskCompletionCount();
        setTaskCount(count);

        const achievements = await fetchCompletedAchievements();
        setCompletedAchievements(achievements);
        
        // Check for any new achievements based on the latest task count
        await checkForCompletedAchievements(count);
        await checkForCompletedAchievements(level);
      };

      loadData();
    }, [])
  );

  
  const [showModal, setShowModal] = useState(false);

  const checkFirstTime = async () => {
    const hasSeenIntro = await AsyncStorage.getItem('AchievementIntro');
    if (!hasSeenIntro) {
      setShowModal(true);
    }
  };

  useEffect(() => {
    checkFirstTime();
  }, []);

  const handleCloseModal = async () => {
    await AsyncStorage.setItem('AchievementIntro', 'true');
    setShowModal(false);
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
    <View style={styles.container}>
      
      <IntroductionModal
        visible={showModal}
        onClose={handleCloseModal}
        dialogues={[
          'Here, you’ll find the marks of your triumphs—your earned achievements that reflect your bravery, strategy, and determination!',
          'Unlock new feats, witness your growth, and continue your quest by pushing forward to even greater challenges.',
          'Are you ready to view your legendary achievements and discover what awaits on the path ahead?',
        ]}
        avatar={require('../assets/avatars/wizard.png')}
        name="Elder Mage"
      />
      <Text style={styles.header}>Challenges</Text>

      {/* Navigation Buttons */}
      <View style={styles.navButtonsContainer}>
        <TouchableOpacity
          style={[styles.navButton, activeTab === "ongoing" && styles.activeTabButton]}
          onPress={() => setActiveTab("ongoing")}
        >
          <Text style={styles.navButtonText}>Ongoing</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navButton, activeTab === "completed" && styles.activeTabButton]}
          onPress={() => setActiveTab("completed")}
        >
          <Text style={styles.navButtonText}>Completed</Text>
        </TouchableOpacity>
      </View>

      {/* Conditional Rendering Based on Active Tab */}
      {activeTab === "ongoing" ? (
        <Animated.ScrollView
        style={[
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
          <FlatList
            data={achievementsData.filter((item) => taskCount < item.required)}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => {
              const progress = Math.min(taskCount / item.required, 1);

              return (
                <View style={styles.achievementContainer}>
                  <Image
                    source={achievementIcons[item.icon]}
                    style={styles.icon}
                  />
                  <View style={styles.details}>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.description}>{item.description}</Text>
                    <View style={styles.progressBarContainer}>
                      <View
                        style={[styles.progressBar, { width: `${progress * 100}%` }]}
                      />
                    </View>
                    <Text style={styles.progressText}>
                      {Math.min(taskCount, item.required)} / {item.required}
                    </Text>
                  </View>
                </View>
              );
            }}
            scrollEnabled={false}
          />

          <FlatList
            data={achievementsLevel.filter((item) => level < item.required)}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => {
              const progress = Math.min(level / item.required, 1);

              return (
                <View style={styles.achievementContainer}>
                  <Image
                    source={achievementIcons[item.icon]}
                    style={styles.icon}
                  />
                  <View style={styles.details}>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.description}>{item.description}</Text>
                    <View style={styles.progressBarContainer}>
                      <View
                        style={[styles.progressBar, { width: `${progress * 100}%` }]}
                      />
                    </View>
                    <Text style={styles.progressText}>
                      {Math.min(level, item.required)} / {item.required}
                    </Text>
                  </View>
                </View>
              );
            }}
            scrollEnabled={false}
          />
        </Animated.ScrollView>
      ) : (
        <FlatList
          data={completedAchievements}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.achievementContainer}>
              <Image
                source={achievementIcons[item.icon]}
                style={styles.icon}
              />
              <Text style={styles.title}>{item.title}</Text>
            </View>
          )}
          scrollEnabled={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#1e2026",
  },
  header: {
    fontSize: 24,
    color: '#f2f3f2',
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: 'center',
 
  },
  navButtonsContainer: {
    flexDirection: "row",
    marginBottom: 20,
    justifyContent: "space-around",
  },
  navButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#2c2f35",
    borderRadius: 5,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  activeTabButton: {
    backgroundColor: "#2c2f35",
  },
  achievementContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: "#2c2f35",
    borderRadius: 15,
    padding: 10,

  },
  icon: {
    width: 50,
    height: 50,
    marginRight: 15,
  },
  details: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: 'white'
  },
  description: {
    fontSize: 14,
    color: "#FFFFFF",
    marginBottom: 10,
  },
  progressBarContainer: {
    height: 10,
    width: 200,
    backgroundColor: "#e0e0e0",
    borderRadius: 5,
    overflow: "hidden",
    marginBottom: 5,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#4caf50",
  },
  progressText: {
    fontSize: 12,
    color: "white",
  },
});

export default AchievementScreen;
