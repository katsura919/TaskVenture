import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, Modal, FlatList, TextInput, ScrollView, Animated, Easing} from "react-native";
import { useSQLiteContext } from "expo-sqlite"; // Adjust based on your SQLite setup
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import IntroductionModal from './component/IntroductionModal';
import AsyncStorage from '@react-native-async-storage/async-storage'; 

const Profile = ({ navigation }) => {
  //Intro Modal
  const [showModal, setShowModal] = useState(false);

  const checkFirstTime = async () => {
    const hasSeenIntro = await AsyncStorage.getItem('ProfileIntro');
    if (!hasSeenIntro) {
      setShowModal(true);
    }
  };

  useEffect(() => {
    checkFirstTime();
  }, []);

  const handleCloseModal = async () => {
    await AsyncStorage.setItem('ProfileIntro', 'true');
    setShowModal(false);
  };

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
        setProfilePicture(user.profile_picture); // Default image
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
    "dedicated2.png": require("../assets/achievements/dedicated2.png"),
    "taskmaniac.png": require("../assets/achievements/taskmaniac.png"),
    "levelup.png": require("../assets/achievements/levelup.png"),
    "tasks.png": require("../assets/achievements/tasks.png"),
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
    { source: require("../assets/avatars/knight.png"), level: 1 },
    { source: require("../assets/avatars/gamer.png"), level: 1 },
    { source: require("../assets/avatars/woman.png"), level: 2 },
    { source: require("../assets/avatars/meerkat.png"), level: 3},
    { source: require("../assets/avatars/bear.png"), level: 3},
    { source: require("../assets/avatars/boy.png"), level: 5 },
    { source: require("../assets/avatars/chicken.png"), level: 6 },
    { source: require("../assets/avatars/cyclops.png"), level: 10 },
    { source: require("../assets/avatars/doctor.png"), level: 15 },
    { source: require("../assets/avatars/dog.png"), level: 15 },
    { source: require("../assets/avatars/gamer.png"), level: 15 },
    { source: require("../assets/avatars/knight4.png"), level: 20 },
    { source: require("../assets/avatars/knight2.gif"), level: 2 },
    { source: require("../assets/avatars/ninja.gif"), level: 2},
    { source: require("../assets/avatars/ninja1.gif"), level: 2},
    { source: require("../assets/avatars/knightmove.gif"), level: 2 },

    

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
    { title: "Brave Explorer", level: 1 },
    { title: "Mystic Wanderer", level: 2},
    { title: "Fearless Challenger", level: 2 },
    { title: "Pathfinder", level: 2},
    { title: "Arcane Seeker", level: 5 },
    { title: "Task Maniac", level: 5},
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

   
  //Animations
  const addtaskAnimation = useRef(new Animated.Value(0)).current; // Animation value

  useFocusEffect(
    React.useCallback(() => {
      // Reset the animation value
      addtaskAnimation.setValue(0);

      // Start the fade-in animation
      Animated.timing(addtaskAnimation, {
        toValue: 1, // Fully visible
        duration: 200, // Animation duration
        easing: Easing.inOut(Easing.ease), // Smooth easing
        useNativeDriver: true,
      }).start();
    }, [])
  );

  // Conditional rendering if needed (optional)
  const animatedStyle = {
    opacity: addtaskAnimation,
  };

  
  if (!profile) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <Animated.View 
    style={[
      styles.container,
      animatedStyle,
      {
        transform: [
          {
            scale: addtaskAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 1], // Optional scale effect for smooth entry
            }),
          },
        ],
      },
    ]}
    >
      <IntroductionModal
        visible={showModal}
        onClose={handleCloseModal}
        dialogues={[
          'Welcome to your profile, Adventurer! This is where you can see the fruits of your hard work.',
          'Here, you can choose your avatar, set your title, and track your progress on your epic journey.',
          'Keep an eye on your level, achievements, and the path you’ve walked so far. Your adventure is just beginning!',
        ]}
        avatar={require('../assets/avatars/viking.png')}
        name="Bjorn"
      />
      
      <View >
       <Image
          source={require('../assets/background/bg2.png')} // Replace with your image URL or require local image
          style={styles.background}
        />
         {/* Share Icon */}
      <TouchableOpacity
        style={styles.shareIconContainer}
        onPress={() => navigation.navigate("ProfileShare")} // Navigate to ProfileShare screen
      >
        <Image
          source={require("../assets/icons/share.png")} // Path to your share icon
          style={styles.shareIcon}
        />
      </TouchableOpacity>
      </View>

      <Animated.View 
        style={styles.profileContent}
      >
          {/* Profile Picture */}
          <View style={styles.profileContainer}>
            <Image source={profilePicture || require('../assets/avatars/knight.png')} style={styles.profileImage} />
            
          </View>

          <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.editIconContainer}>
              <Image style={styles.pen} source={require('../assets/icons/pen.png')}/>
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
            <ScrollView style={{height: 90, top: -90}}>
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
                scrollEnabled={false}
              />
          </ScrollView>
          </View>

      </Animated.View>  

      {/* Modal for Image Selection */}
      <Modal
            visible={modalVisible}
            animationType="slide"
            onRequestClose={() => setModalVisible(false)}
            transparent={true}
          >
            <View style={styles.modalContainer}>
              <View style={styles.backbuttonContainer}>
                <TouchableOpacity style={styles.backButton} onPress={() => setModalVisible(false)}>
                  <Ionicons name="arrow-back" size={24} color="#7F8C8D" />
                  <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>
              </View>

               {/* Name Edit Section */}
          <Text style={styles.labels}>Edit Name</Text>
          <TextInput
            style={styles.nameInput}
            value={newName}
            onChangeText={setNewName}
            placeholder="Enter new name"
            placeholderTextColor="#ccc"
          />
          <TouchableOpacity style={styles.saveName} onPress={handleNameChange}>
            <Text style={styles.saveText}>Save Name</Text>
          </TouchableOpacity>

              {/* Avatars Section */}
              <Text style={styles.labels}>Avatars</Text>
              <FlatList
                data={unlockableImages}
                keyExtractor={(item, index) => index.toString()}
                numColumns={4}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() =>
                      isUnlocked(item.level) && updateProfilePicture(item.source)
                    }
                    disabled={!isUnlocked(item.level)}
                    style={styles.imageOption}
                  >
                    {/* Image */}
                    <View style={styles.avatarContainer}>
                    <Image source={item.source} style={styles.modalImage} />
                    </View>
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
              <Text style={styles.labels}>Titles</Text>
              <FlatList
                data={availableTitles}
                keyExtractor={(item, index) => index.toString()}
                numColumns={2}
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
                 
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '1e2026'
  },
  background: {
    width: '100%', // Full-width image
    height: 200, // Adjust height as needed
    resizeMode: 'cover', // Scales the image properly
  },
  shareIconContainer: {
    position: "absolute",
    top: 5, // Position the share icon near the top
    right: 5, // Position the share icon near the right
    padding: 8,
    borderRadius: 20, // Rounded container for the icon
  },
  shareIcon: {
    width: 35,
    height: 35,
   
  },
  profileContent:{
    
    alignItems: 'center',
    backgroundColor: '#1e2026',
    marginBottom: 100
  },
  profileContainer:{
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 10,
    borderColor: '#1e2026',
    backgroundColor: 'white',
    overflow: 'hidden',  // Ensures the GIF is clipped to the border radius
    justifyContent: 'center',
    alignItems: 'center',
    top: -90
  },
  profileImage: {
    width: 170,
    height: 170,
    borderRadius: 85,
    borderColor: '#5fa1fb',
  },
  editIconContainer: {
    bottom: 130,
    right: -35,
    borderRadius: 15,
    padding: 5,
  },
  pen: {
    width: 30,
    height: 30,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    top: -130
  },
  title: {
    fontSize: 18,
    fontStyle: "italic",
    color: "#7F8C8D",
    top: -130
  },
  levelContainer: {
    alignItems: "center",
    marginTop: 20,
    width: "100%",
    top: -130
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
    backgroundColor: "#fff",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 5,
    borderWidth: .5,
    borderColor: '#7F8C8D'
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
    padding: 10,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1e2026",
  },
  backbuttonContainer: {
    flexDirection: 'row',         // Align items in a row
    width: '100%',
    justifyContent: 'flex-start', // Align items to the left
    alignItems: 'center',         // Vertically center items
    padding: 5,                  // Add padding for spacing
  
  },
  backButton: {
    flexDirection: 'row',         // Keep icon and text in a row
    alignItems: 'center',         // Center icon and text vertically
  },
  backButtonText: {
    color: '#7F8C8D',
    marginLeft: 8,                // Add space between the icon and text
    fontSize: 16,
  },
  labels:{
    color: '#7F8C8D',
    fontSize: 15, 
    marginBottom: 10
  },
  nameInput: {
    width: 300,
    height: 40,
    borderRadius: 8,
    color: "#7F8C8D",
    paddingHorizontal: 10,
    marginBottom: 10,
    borderWidth: .5,
    borderColor: '#7F8C8D'
  },
  saveName:{
    backgroundColor: '#2C3E50',
    borderRadius: 10,
    padding: 5,
    marginBottom: 20
  },
  saveText:{
    color: '#FFFFFF'
  },
  avatarContainer:{
    width: 60,
    height: 60,
    borderRadius: 35, // Makes the image circular
    overflow: 'hidden', 
  },
  modalImage: {
    width: 60,
    height: 60,
    borderRadius: 35, // Makes the image circular
    overflow: 'hidden'
  },
  imageOption: {
    margin: 10,
    position: "relative",
  },
  lockOverlay: {
    position: "absolute",
    width: 60,
    height: 60,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 30, // Ensures the overlay matches the circular image
  },
  lockText: {
    fontSize: 24,
    color: "#fff",
  },
  titleOption: {
    padding: 2,
    backgroundColor: "#2C3E50",
    borderRadius: 5,
    width: 150,
    height: 30,
    margin: 2,
    alignItems: 'center',
    justifyContent:'center'
  },
  titleText: {
    color: "#fff",
    fontSize: 13,
  },
  lockedTitle: {
    color: "#888", // Use a different color to indicate locked titles
  },

  achievementsContainer: {
    height: 300,
    marginTop: 30,
    width: "100%",
    paddingHorizontal: 20,
    alignItems: "center",
    top: -60
  
  },
  achievementsHeader: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
    top: -80
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
    color: "#7F8C8D",
   
  },
});

export default Profile;