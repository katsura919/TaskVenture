import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

const SettingsScreen = ({navigation}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Settings Page</Text>
      <Pressable style={styles.button} onPress={() => navigation.navigate('Login')}>
              <Text style={styles.buttonText} >Logout</Text>
          </Pressable>
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
    marginBottom: 30,
  },
  input: {
    width: '80%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    marginVertical: 5,
  },
  button: {
    backgroundColor: 'blue',
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
  link : {
    marginTop: 10,
  },
  linkText: {
    color: 'blue',
  },
  userText: {
    fontSize: 18,
    marginBottom: 30,
  }
});

export default SettingsScreen;
