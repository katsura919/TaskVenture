import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Audio } from 'expo-av'; // Import expo-av for sound effects

const IntroductionModal = ({ visible, onClose, dialogues, avatar, name }) => {
  const [textIndex, setTextIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingSound, setTypingSound] = useState(null); // Store the typing sound
  const [isSoundPlaying, setIsSoundPlaying] = useState(false); // To track if sound is playing

  useEffect(() => {
    if (visible) {
      setTextIndex(0);
      startTyping(dialogues[0]);
    }
  }, [visible]);

  // Load sound when the component is mounted
  useEffect(() => {
    const loadSound = async () => {
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/sounds/type.mp3') // Replace with your typing sound file
      );
      setTypingSound(sound);
    };

    loadSound();

    return () => {
      if (typingSound) {
        typingSound.unloadAsync(); // Unload the sound when the component is unmounted
      }
    };
  }, []);

  const startTyping = (text) => {
    setDisplayedText('');
    setIsTyping(true);
    let charIndex = 0;

    // Play typing sound only once when typing starts
    if (!isSoundPlaying && typingSound) {
      typingSound.playAsync(); // Play the sound once
      setIsSoundPlaying(true); // Set the flag that the sound is playing
    }

    const typeInterval = setInterval(() => {
      if (charIndex < text.length) {
        setDisplayedText((prev) => prev + text[charIndex]);
        charIndex++;
      } else {
        clearInterval(typeInterval);
        setIsTyping(false);

        // Stop the typing sound once the text is fully typed
        if (typingSound) {
          typingSound.stopAsync(); // Stop the typing sound when typing is finished
          setIsSoundPlaying(false); // Reset the flag
        }
      }
    }, 10); // Adjust typing speed here
  };

  const handleNext = () => {
    if (isTyping) return; // Prevent skipping while typing
    const nextIndex = textIndex + 1;
    if (nextIndex < dialogues.length) {
      setTextIndex(nextIndex);
      startTyping(dialogues[nextIndex]);
    } else {
      onClose(); // Close the modal when all dialogues are done
    }
  };

  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.dialogueContainer}>
          <View style={styles.avatarContainer}>
            <Image source={avatar} style={styles.avatar} />
            <Text style={styles.name}>{name}</Text>
          </View>
          <View style={styles.textBox}>
            <Text style={styles.text}>{displayedText}</Text>
          </View>
          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNext}
            disabled={isTyping}
          >
            <Text style={styles.nextText}>
              {textIndex < dialogues.length - 1 ? 'Next' : 'Yes'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  dialogueContainer: {
    width: '90%',
    padding: 20,
    backgroundColor: '#2C3E50',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 60,
    height: 60,
    marginRight: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  textBox: {
    padding: 10,
    backgroundColor: '#ffffff',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#8b5e34',
    minHeight: 80,
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    color: '#333333',
  },
  nextButton: {
    marginTop: 15,
    alignSelf: 'flex-end',
    paddingVertical: 5,
    paddingHorizontal: 5,
    borderRadius: 5,
  },
  nextText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default IntroductionModal;
