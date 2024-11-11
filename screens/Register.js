import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Pressable, Alert } from 'react-native';
import { SQLiteProvider, useSQLiteContext } from 'expo-sqlite';

function Register({ navigation }) {
  const db = useSQLiteContext();

  // State for user input fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Helper function to validate email format
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Helper function to validate password strength
  const isValidPassword = (password) => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,})/;
    return passwordRegex.test(password);
  };

  // Function to handle registration logic
  const handleRegister = async () => {
    // Check if all fields are filled
    if (!firstName || !lastName || !email || !userName || !password || !confirmPassword) {
      Alert.alert('Attention!', 'Please enter all the fields.');
      return;
    }

    // Validate email format
    if (!isValidEmail(email)) {
      Alert.alert('Error', 'Invalid email format.');
      return;
    }

    // Validate password strength
    if (!isValidPassword(password)) {
      Alert.alert(
        'Weak Password',
        'Password must have at least 8 characters, 1 uppercase letter, and 1 special character.'
      );
      return;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    try {
      // Check if username or email already exists
      const existingUser = await db.getFirstAsync(
        'SELECT * FROM users WHERE username = ? OR email = ?',
        [userName, email]
      );
      if (existingUser) {
        Alert.alert('Error', 'Username or email already exists.');
        return;
      }

      // Insert new user into the database
      await db.runAsync(
        'INSERT INTO users (firstName, lastName, email, username, password) VALUES (?, ?, ?, ?, ?)',
        [firstName, lastName, email, userName, password]
      );

      Alert.alert('Success', 'Registration successful!');
      navigation.navigate('Login');
    } catch (error) {
      console.log('Error during registration:', error);
    }
  };

  return (
    <View style={styles.container}>

      <View style={styles.content}>
        <Text style={styles.title}>Register</Text>

        <TextInput
          style={styles.input}
          placeholder="First Name"
          value={firstName}
          onChangeText={setFirstName}
        />
        <TextInput
          style={styles.input}
          placeholder="Last Name"
          value={lastName}
          onChangeText={setLastName}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Username"
          value={userName}
          onChangeText={setUserName}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <Pressable style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Register</Text>
        </Pressable>

        <Pressable style={styles.link} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.linkText}>Already have an account? Login</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({

  content:{
    backgroundColor: '#fff',
    top: 50,
    left: 25,
    backgroundColor: '#000',
    width: 360,
    height: 800,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor : "#6c64fe",
    borderRadius: 20,
    elevation: 5,
  },
  title: {
    fontSize : 30,
    fontWeight : "bold",
    textTransform : "uppercase",
    textAlign: "center",
    paddingVertical : 40,
    color : "#6c64fe"
  },
  input: {
    width: '80%',
    padding: 10,
    borderWidth: 1,
    marginVertical: 5,
    height : 50,
    paddingHorizontal : 20,
    borderColor : "#e3eaf2",
    borderWidth : 1,
    borderRadius: 7
  },
  button: {
    backgroundColor: '#6c64fe',
    padding: 10,
    marginVertical: 10,
    width: '80%',
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 18,
  },
  link: {
    marginTop: 10,
  },
  linkText: {
    color: '#6c64fe',
  },
});

export default Register;
