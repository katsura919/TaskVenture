import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Modal,
  FlatList,
} from "react-native";
import { useSQLiteContext } from "expo-sqlite"; // Adjust based on your SQLite setup
import { useFocusEffect } from "@react-navigation/native";

const Profile = () => {
  const db = useSQLiteContext();
  const [profile, setProfile] = useState(null);
  const [profilePicture, setProfilePicture] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  // Function to check and update the level based on experience
  const updateLevelIfNeeded = async () => {
  };
  
  const fetchProfile = async () => {
    try {
      const result = await db.getAllAsync("SELECT * FROM users");
      if (result.length > 0) {
        const user = result[0];
        setProfile(user);
        setProfilePicture(user.profile_picture || "../assets/profile-img.png"); // Default image
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
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
      <TouchableOpacity onPress={() => setModalVisible(true)}>
        <Image source={profilePicture} style={styles.profileImage} />
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

      {/* Modal for Image Selection */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <FlatList
            data={unlockableImages}
            keyExtractor={(item, index) => index.toString()}
            numColumns={2}
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
    flex: 1,
  
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "blue",
  },
  modalImage: {
    width: 500,
    height: 500,
    margin: 10,
    borderRadius: 120, // Makes the image circular
  },
  imageOption: {
    margin: 10,
    position: "relative",
  },
  lockOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 100,
    height: 100,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 50, // Ensures the overlay matches the circular image
  },
  lockText: {
    fontSize: 24,
    color: "#fff",
  },
});

export default Profile;
