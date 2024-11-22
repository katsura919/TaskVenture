import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from "react-native";
import { useSQLiteContext } from "expo-sqlite"; // Assuming you're using a custom SQLite context
import { useFocusEffect } from '@react-navigation/native';
const achievementsData = [
  {
    id: 1,
    title: "Task Novice",
    description: "Complete 10 tasks.",
    required: 8,
    icon: "dedicated.png",
  },
  {
    id: 2,
    title: "Task Expert",
    description: "Complete 50 tasks.",
    required: 3,
    icon: "dedicated.png",
  },
  {
    id: 3,
    title: "Task Master",
    description: "Complete 100 tasks.",
    required: 4,
    icon: "gladiator.png",
  },
];

const AchievementScreen = () => {
  const db = useSQLiteContext();
  const [completedAchievements, setCompletedAchievements] = useState([]);
  const [taskCount, setTaskCount] = useState(0);
  const [activeTab, setActiveTab] = useState("ongoing"); // State for active tab (ongoing or completed)

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

  const checkForCompletedAchievements = async (updatedTaskCount) => {
    const newCompleted = [];
    for (const achievement of achievementsData) {
      if (
        updatedTaskCount >= achievement.required &&
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
    "gladiator.png": require("../assets/avatars/gladiator.png"),
  };

  useFocusEffect(
    React.useCallback(() => {
      const loadData = async () => {
        const count = await fetchTaskCompletionCount();
        setTaskCount(count);

        const achievements = await fetchCompletedAchievements();
        setCompletedAchievements(achievements);

        // Check for any new achievements based on the latest task count
        await checkForCompletedAchievements(count);
      };

      loadData();
    }, [])
  );

  return (
    <View style={styles.container}>
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
        />
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
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 24,
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
    backgroundColor: "#e0e0e0",
    borderRadius: 5,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  activeTabButton: {
    backgroundColor: "#4caf50",
  },
  achievementContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: "#f8f8f8",
    borderRadius: 10,
    padding: 10,
    elevation: 3,
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
  },
  description: {
    fontSize: 14,
    color: "#666",
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
    color: "#333",
  },
});

export default AchievementScreen;
