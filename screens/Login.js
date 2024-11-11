import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Pressable, Alert } from 'react-native';
import { SQLiteProvider, useSQLiteContext } from 'expo-sqlite';

function Login ({navigation}) {
    const db = useSQLiteContext();
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');

    // Function to handle login logic
    const handleLogin = async() => {
        if (userName.length === 0 || password.length === 0) {
            Alert.alert('Attention', 'Please enter both username and password');
            return;
        }
        try {
            // Fetch user details from the database
            const user = await db.getFirstAsync('SELECT * FROM users WHERE username = ?', [userName]);
            if (!user) {
                Alert.alert('Error', 'Username does not exist!');
                return;
            }

            // Check if the password is correct
            const validUser = await db.getFirstAsync('SELECT * FROM users WHERE username = ? AND password = ?', [userName, password]);
            if (validUser) {
                // Pass firstName and lastName as route parameters
                navigation.navigate('HomeTabs', {
                    firstName: validUser.firstName,
                    lastName: validUser.lastName,
                    email: validUser.email, // If you want to pass the email as well
                    userName: userName
                });
                setUserName('');
                setPassword('');
            } else {
                Alert.alert('Error', 'Incorrect password');
            }
        } catch (error) {
            console.log('Error during login: ', error);
        }
    }

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Login</Text>
                <TextInput 
                    style={styles.input}
                    placeholder='Username'
                    value={userName}
                    onChangeText={setUserName}
                />
                <TextInput 
                    style={styles.input}
                    placeholder='Password'
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                />
                <Pressable style={styles.button} onPress={handleLogin}>
                    <Text style={styles.buttonText}>Login</Text>
                </Pressable>
                <Pressable style={styles.link} onPress={() => navigation.navigate('Register')}>
                    <Text style={styles.linkText}>Don't have an account? Register</Text>
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
        fontSize : 40,
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
    userText: {
        fontSize: 18,
        marginBottom: 30,
    }
});

export default Login;
