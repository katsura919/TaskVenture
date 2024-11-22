import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, Modal, FlatList, TextInput, Button} from "react-native";
import { useSQLiteContext } from "expo-sqlite"; // Adjust based on your SQLite setup
import { useFocusEffect } from '@react-navigation/native';

const Profile = () => {
  const db = useSQLiteContext();
  const [profile, setProfile] = useState(null);
  const [newName, setNewName] = useState(""); // New name state
  const [profilePicture, setProfilePicture] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState("");
  const [completedAchievements, setCompletedAchievements] = useState([]);
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
        setNewName(user.username); // Initialize the name to the current name
        setProfilePicture(user.profile_picture || "../assets/profile-img.png"); // Default image
        setSelectedTitle(user.title || "No title");

        // Fetch completed achievements for the user
        const achievements = await db.getAllAsync("SELECT * FROM completed_achievements",);
        setCompletedAchievements(achievements);
        console.log(completedAchievements);
      }
      console.log(result); // Log the fetched result
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const achievementIcons = {
    "dedicated.png": require("../assets/achievements/dedicated.png"),
    "gladiator.png": require("../assets/avatars/gladiator.png"),
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


  const handleNameChange = async () => {
    try {
      if (newName.trim() === "") {
        // Avoid saving empty names
        return;
      }

      // Update the name in the database
      await db.runAsync(
        `UPDATE users SET username = ? WHERE user_id = ?`,
        [newName, profile.user_id]
      );

      // Close the modal after updating the name
      setModalVisible(false);

      // Trigger the re-fetch to refresh the profile data
      fetchProfile();
    } catch (error) {
      console.error("Error updating name:", error);
    }
  };

   // List of images with unlock levels
   const unlockableImages = [
    { source: require("../assets/avatars/gladiator.png"), level: 1 },
    { source: require("../assets/avatars/assasin.png"), level: 2 },
    { source: require("../assets/avatars/astronaut.png"), level: 10 },
  ];

  const updateProfilePicture = async (imagePath) => {
    try {
      await db.runAsync(
        `UPDATE users SET profile_picture = ? WHERE user_id = ?`,
        [imagePath, 1] // Assuming user_id = 1
      );
      setProfilePicture(imagePath);
      setModalVisible(false);
    } catch (error) {
      console.error("Error updating profile picture:", error);
    }
  };
  
  const isUnlocked = (requiredLevel) => {
    return profile?.level >= requiredLevel;
  };

  const [availableTitles, setAvailableTitles] = useState([
    { title: "Beginner", level: 1 },
    { title: "Intermediate", level: 1},
    { title: "Advanced", level: 10 },
    { title: "Master", level: 20 },
  ]);

  const updateProfileTitle = async (newTitle) => {
    try {
      await db.runAsync(
        `UPDATE users SET title = ? WHERE user_id = ?`,
        [newTitle, 1] // Assuming user_id = 1
      );
      setSelectedTitle(newTitle);
      setModalVisible(false);
    } catch (error) {
      console.error("Error updating profile title:", error);
    }
  };

  const handleTitleSelection = (title) => {
    // Check if the title is unlocked based on the user's level
    if (profile.level >= title.level) {
      updateProfileTitle(title.title);
      fetchProfile();
    }
  };

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
      <TouchableOpacity onPress={() => setModalVisible(true)}>
        <Image source={profilePicture} style={styles.profileImage} />
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.editIconContainer}>
          <Text style={styles.editIcon}>✏️</Text>
        </TouchableOpacity>
      </TouchableOpacity>

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
      
      {/* Completed Achievements Section */}
      <View style={styles.achievementsContainer}>
        <Text style={styles.achievementsHeader}>Achievements</Text>
        <FlatList
            data={completedAchievements}
            numColumns={3}
            keyExtractor={(item) => item.achievement_id ? item.achievement_id.toString() : ''}
            renderItem={({ item }) => {
                
              return (
                <View style={styles.achievementItem}>
                  <Image
                  source={achievementIcons[item.icon]}
                  style={styles.achievementIcon}
                  />
                  <Text style={styles.achievementTitle}>{item.title}</Text>
                </View>
              );
            }}
          />



      </View>

      {/* Modal for Image Selection */}
      <Modal
            visible={modalVisible}
            animationType="slide"
            onRequestClose={() => setModalVisible(false)}
            transparent={true}
          >
            <View style={styles.modalContainer}>
              <View>
                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeModal}>
                  <Text style={styles.editIcon}>Close</Text>
                </TouchableOpacity>
              </View>

               {/* Name Edit Section */}
          <Text style={styles.editIcon}>Edit Name</Text>
          <TextInput
            style={styles.nameInput}
            value={newName}
            onChangeText={setNewName}
            placeholder="Enter new name"
            placeholderTextColor="#ccc"
          />
          <Button title="Save Name" onPress={handleNameChange} />

              {/* Avatars Section */}
              <Text style={styles.editIcon}>Avatars</Text>
              <FlatList
                data={unlockableImages}
                keyExtractor={(item, index) => index.toString()}
                numColumns={3}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() =>
                      isUnlocked(item.level) && updateProfilePicture(item.source)
                    }
                    disabled={!isUnlocked(item.level)}
                    style={styles.imageOption}
                  >
                    {/* Image */}
                    <Image source={item.source} style={styles.modalImage} />
                    
                    {/* Lock Overlay */}
                    {!isUnlocked(item.level) && (
                      <View style={styles.lockOverlay}>
                        <Text style={styles.lockText}>🔒</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                )}
              />

              {/* Titles Section */}
              <Text style={styles.editIcon}>Titles</Text>
              <FlatList
                data={availableTitles}
                keyExtractor={(item, index) => index.toString()}
                numColumns={3}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => handleTitleSelection(item)}
                    style={styles.titleOption}
                  >
                    <Text
                      style={[
                        styles.titleText,
                        profile.level < item.level && styles.lockedTitle,
                      ]}
                    >
                      {item.title} {profile.level < item.level && ""}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flex: 1,
    backgroundColor: "#1b181c",
    padding: 16,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
    position: 'relative'
  },
  editIconContainer: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 15,
    padding: 5,
  },
  editIcon: {
    color: "#fff",
    fontSize: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#fff",
  },
  title: {
    fontSize: 18,
    fontStyle: "italic",
    marginBottom: 20,
    color: "#bbb",
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
    color: "#fff",
  },
  progressBarBackground: {
    width: 300,
    height: 15,
    backgroundColor: "#444",
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
    color: "#bbb",
  },
  loadingText: {
    fontSize: 16,
    color: "#fff",
  },

  modalContainer: {
    padding: 20,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "lightblue",
  },
  nameInput: {
    width: 250,
    height: 40,
    backgroundColor: "#333",
    borderRadius: 8,
    color: "#fff",
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  modalImage: {
    width: 70,
    height: 70,
    borderRadius: 35, // Makes the image circular
  },
  imageOption: {
    margin: 10,
    position: "relative",
  },
  lockOverlay: {
    position: "absolute",
    width: 70,
    height: 70,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 35, // Ensures the overlay matches the circular image
  },
  lockText: {
    fontSize: 24,
    color: "#fff",
  },
  titleOption: {
    padding: 10,
    backgroundColor: "#333",
    borderRadius: 5,
    margin: 10,
  },
  titleText: {
    color: "#fff",
    fontSize: 18,
  },
  lockedTitle: {
    color: "#888", // Use a different color to indicate locked titles
  },

  achievementsContainer: {
    marginTop: 30,
    width: "100%",
    paddingHorizontal: 20,
    alignItems: "center",
  },
  achievementsHeader: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  achievementItem: {
    flexDirection: "row",
    alignItems: "center",
    margin: 10,
    flexDirection: 'column',
    justifyContent: 'center',

  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
 
  },
  achievementTitle: {
    fontSize: 13,
    color: "#fff",
   
  },
});

export default Profile;