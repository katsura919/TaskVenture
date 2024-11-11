import React from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';

const ProfileScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Profile</Text>

      <Image
        source={require('../assets/profile-img.png')} // Replace with your own image source
        style={styles.profileImage}
      />
      <Text style={styles.name}>User Name</Text> 
      <Text style={styles.email}>user@example.com</Text> 
      <View style={styles.buttonsContainer}>
          <Pressable style={styles.button}>
            <Text style={styles.buttonText}>Edit Profile</Text>
          </Pressable>
          <Pressable style={styles.button} onPress={() => navigation.navigate('ChangePassword')}>
            <Text style={styles.buttonText}>Change Password</Text>
          </Pressable>
          <Pressable style={styles.button} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.buttonText}>Logout</Text>
          </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    padding: 20,
  },

  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 30,
    marginBottom: 80,
  },
  
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    marginBottom: 20,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  email: {
    fontSize: 18,
    color: '#666',
    marginBottom: 30,
  },
  
  buttonsContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: '90%',
    height: 300,
  },
  button: {
    backgroundColor: '#6c64fe',
    padding: 15,
    borderRadius: 8,
    elevation: 3,
    width: '100%',
    marginVertical: 2,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '40%',
    marginTop: 20,
  },
  iconButton: {
    backgroundColor: '#007BFF',
    borderRadius: 50,
    padding: 10,
    elevation: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ProfileScreen;
