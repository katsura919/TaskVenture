import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Pressable, Alert } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';

const ChangePassword = ({ navigation, route }) => {
  const db = useSQLiteContext();
  const { userName } = route.params; // Extract username from route params
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }
    
    try {
      // Update the password in the database
      await db.runAsync('UPDATE users SET password = ? WHERE username = ?', [newPassword, userName]);
      Alert.alert('Success', 'Password changed successfully');
      navigation.goBack(); // Go back to the previous screen
    } catch (error) {
      console.error('Error changing password: ', error);
      Alert.alert('Error', 'Could not change password. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Change Password</Text>
      <TextInput
        style={styles.input}
        placeholder="New Password"
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm New Password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      <View style={styles.buttoncontainer}>
        <Pressable style={styles.button} onPress={handleChangePassword}>
          <Text style={styles.buttonText}>Change Password</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={() => navigation.navigate('Profile')}>
          <Text style={styles.buttonText}>Cancel</Text>
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
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#6c64fe'
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

  buttoncontainer: {
    marginTop: 10,
    width: '80%',
  },
 
  button: {
    backgroundColor: '#6c64fe',
    padding: 10,
    marginVertical: 5,
    width: '100%',
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 18,
  },
});

export default ChangePassword;
