import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { useSQLiteContext } from "expo-sqlite"; // Adjust based on your SQLite setup
import { useFocusEffect } from '@react-navigation/native';

const Profile = () => {
  const db = useSQLiteContext();
  const [profile, setProfile] = useState(null);

  // Function to check and update the level based on experience
const updateLevelIfNeeded = async () => {
  const xpThreshold = 100;

  try {
    // Fetch the current user data (assuming there's one user in the `users` table)
    const result = await db.getAllAsync("SELECT * FROM users");

    if (result.length > 0) {
      const user = result[0]; // Assuming there's only one user in the db
      
      let newLevel = user.level;
      let newExperience = user.experience;

      // If the experience exceeds the threshold, calculate the new level and reset experience
      if (user.experience >= xpThreshold) {
        newLevel = user.level + 1;  // Calculate new level
        newExperience = user.experience % xpThreshold; // Reset experience after leveling up
      }

      // Only update if level or experience has changed
      if (newLevel !== user.level || newExperience !== user.experience) {
        await db.runAsync(
          `UPDATE users SET level = ?, experience = ? WHERE user_id = ?`,
          [newLevel, newExperience, 1] // Assuming user_id = 1
        );
        console.log(`Level up! New level: ${newLevel}, XP: ${newExperience}`);
      }
    }
  } catch (error) {
    console.error("Error updating level:", error);
  }
};


  // Fetch user data from the `users` table
  const fetchProfile = async () => {
    try {
      const result = await db.getAllAsync("SELECT * FROM users");

      if (result.length > 0) {
        const user = result[0];
        setProfile(user);

      }
      console.log(result); // Log the fetched result
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };



  useEffect(() => {
   

    // Set up an interval to check and update the level every 10 seconds
    const intervalId = setInterval(() => {
      updateLevelIfNeeded(); // Check and update level periodically
    }, 1000); // Every 1 second

    // Cleanup interval when the component is unmounted
    return () => clearInterval(intervalId);
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchProfile();
    }, [])
  );

  if (!profile) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Profile Picture */}
      <Image
        source={require("../assets/Profile.png")} // Replace with the actual profile picture
        style={styles.profileImage}
      />

      {/* Name */}
      <Text style={styles.name}>{profile.username}</Text>

      {/* Title */}
      <Text style={styles.title}>{profile.title || "No title"}</Text>

      {/* Level and Experience */}
      <View style={styles.levelContainer}>
        <Text style={styles.levelText}>Level {profile.level}</Text>

        {/* Progress Bar */}
        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${profile.experience}%` }, // Use experience as progress
            ]}
          />
        </View>

        <Text style={styles.expText}>
          {Math.floor(profile.experience % 100)}/100 XP
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f3f3f3",
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  title: {
    fontSize: 18,
    fontStyle: "italic",
    marginBottom: 20,
    color: "#777",
  },
  levelContainer: {
    alignItems: "center",
    marginTop: 20,
    width: "100%",
  },
  levelText: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
    color: "#555",
  },
  progressBarBackground: {
    width: 300,
    height: 15,
    backgroundColor: "#ddd",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 5,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#4caf50",
  },
  expText: {
    fontSize: 14,
    color: "#777",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
});

export default Profile;
