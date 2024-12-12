import React, { useState, useEffect, useRef } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, Animated, Easing, ImageBackground } from "react-native";
import { useSQLiteContext } from "expo-sqlite"; 
import { useNavigation } from "@react-navigation/native";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import { captureRef } from "react-native-view-shot"; // Use captureRef instead of captureScreen

const ProfileShare = () => {
  const db = useSQLiteContext();
  const navigation = useNavigation();
  const [profile, setProfile] = useState(null);
  const [taskCount, setTaskCount] = useState(0);
  const profileCardRef = useRef(null); // Reference to capture the profile card as an image

  // Animation refs
  const cardAnimation = useRef(new Animated.Value(0)).current; // For card entry
  const profileBounce = useRef(new Animated.Value(1)).current; // For profile picture bounce
  const shareButtonPulse = useRef(new Animated.Value(1)).current; // For share button pulse

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileResult = await db.getAllAsync("SELECT * FROM users");
        if (profileResult.length > 0) {
          setProfile(profileResult[0]);
        }

        const taskResult = await db.getAllAsync("SELECT COUNT(*) as count FROM tasks");
        if (taskResult.length > 0) {
          setTaskCount(taskResult[0].count);
        }
      } catch (error) {
        console.error("Error fetching profile or task count:", error);
      }
    };

    fetchData();

    // Card entry animation
    Animated.timing(cardAnimation, {
      toValue: 1,
      duration: 1000,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();

    // Bounce animation for profile picture
    Animated.sequence([
      Animated.timing(profileBounce, {
        toValue: 1.2,
        duration: 300,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(profileBounce, {
        toValue: 1,
        duration: 300,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();

    // Share button pulse animation
    const pulse = () => {
      Animated.sequence([
        Animated.timing(shareButtonPulse, {
          toValue: 1.1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(shareButtonPulse, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start(() => pulse());
    };
    pulse();
  }, []);

  if (!profile) {
    return <Text>Loading...</Text>;
  }

  // Function to capture the profile card as an image
  const captureProfileCard = async () => {
    if (profileCardRef.current) {
      try {
        const uri = await captureRef(profileCardRef, {
          format: "png", // Set the format to PNG
          quality: 0.8,
          result: "tmpfile", // Save the image as a temporary file
        });

        console.log("Profile card captured at: ", uri);
        return uri;
      } catch (error) {
        console.error("Error capturing profile card: ", error);
      }
    }
  };

  // Function to share the captured image
  const shareProfileCard = async () => {
    const uri = await captureProfileCard();
    if (uri && Sharing.isAvailableAsync()) {
      try {
        await Sharing.shareAsync(uri); // Share the image
      } catch (error) {
        console.error("Error sharing the image: ", error);
      }
    }
  };

  // Function to download the captured image
  const downloadProfileCard = async () => {
    const uri = await captureProfileCard();
    if (uri) {
      const downloadUri = FileSystem.documentDirectory + "profile-card.jpg";
      try {
        await FileSystem.moveAsync({
          from: uri,
          to: downloadUri,
        });
        console.log("Profile card downloaded to: ", downloadUri);
      } catch (error) {
        console.error("Error downloading the image: ", error);
      }
    }
  };

  return (
    <View style={styles.profileContainer}>
      <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
        <Image
           source={require('../assets/icons/close.png')}
           style={styles.closeIcon}
        />
      </TouchableOpacity>

      <TouchableOpacity style={styles.downloadButton} onPress={downloadProfileCard}>
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>

      {/* Profile card with entry animation */}
      <Animated.View
        style={[
          styles.cardContainer,
          {
            transform: [{ translateY: cardAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [300, 0], // Slide in from bottom
            }) }],
            opacity: cardAnimation, // Fade in effect
          },
        ]}
        ref={profileCardRef}
      >

          {/* Profile picture with bounce animation */}
        <View style={styles.profileImageContainer}>
          <Animated.Image
            source={profile.profile_picture}
            style={[styles.profilePicture, { transform: [{ scale: profileBounce }] }]}
          />
          </View>

          <Text style={styles.username}>{profile.username}</Text>
          <Text style={styles.title}>{profile.title || "No title"}</Text>
          <Text style={styles.level}>LEVEL {profile.level || "No level"}</Text>
          <Text style={styles.taskCountTitle}>COMPLETED TASKS</Text>
          <Text style={styles.taskCount}>{taskCount}</Text>
      </Animated.View>

      {/* Share and Download buttons outside the card */}
      <View style={styles.buttonContainer}>
        <Animated.View style={{ transform: [{ scale: shareButtonPulse }] }}>
          <TouchableOpacity style={styles.shareButton} onPress={shareProfileCard}>
            <View style={styles.gradient}>
              <Text style={styles.buttonText}>Share</Text>
              <Image
                source={require("../assets/icons/share-transparent.png")} // Path to your share icon
                style={{width: 25, height: 25}}
              />
            </View>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  profileContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1e2026",
  },
  cardContainer: {
    width: "90%",
    height: "75%",
    backgroundColor: "#1e2026",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    top: 70,
    borderWidth: 5,
    borderColor: "rgba(255, 255, 255, 0.2)",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  profileImageContainer:{
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'white',
    overflow: 'hidden',  // Ensures the GIF is clipped to the border radius
    justifyContent: 'center',
    alignItems: 'center',
  },
  profilePicture: {
    width: 130,
    height: 130,
    borderRadius: 65,
  },

  username: {
    fontSize: 41,             
    fontWeight: 'bold',       
    color: '#f2f3f2',         
    textAlign: 'center',   
  },
  title: {
    fontSize: 18,
    color: "#FFD700",
    top: -10
  },
  level: {
    fontSize: 16,
    color: "#f2f3f2",
  },
  taskCountTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFD700",
    marginBottom: 5,
  },
  taskCount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    padding: 10,
    borderRadius: 20,
  },
  closeIcon: {
    width: 30,
    height: 30,
  },
  buttonContainer: {
    width: 200,
    justifyContent: 'center',
    flexDirection: "row",
    position: "absolute",
    bottom: 30,
  },
  shareButton: {
    width: '100%',
    borderRadius: 30,
    overflow: 'hidden',
  },
  downloadButton: {
    padding: 10,
    borderRadius: 5,
    position: "absolute",
    top: 10,
    right: 10,
    padding: 10,
    borderRadius: 20,
  },
  saveText:{
    fontSize: 17,
    color: "white",
    fontWeight: "bold",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  gradient: {
    width: 200,
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: "#25B7D3",
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderRadius: 30,
  },
});

export default ProfileShare;
