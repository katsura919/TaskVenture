import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import { SQLiteProvider } from 'expo-sqlite';
import { NavigationContainer, useIsFocused } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

import Home from './screens/Home';
import AddTask from './screens/AddTask';
import MyTasks from './screens/MyTasks';
import TaskDetails from './screens/TaskDetails';
import CompletedQuests from './screens/CompletedQuests';
import Profile from './screens/Profile';
import ChangePassword from './screens/ChangePassword';
import Achievements from './screens/Achievements';
import Test from './screens/Test';




// Initialize the database
const getRandomName = () => {
  const names = ['John', 'Alice', 'Bob', 'Charlie', 'Eve', 'Zara', 'Liam', 'Sophia', 'Lucas', 'Olivia'];
  const randomIndex = Math.floor(Math.random() * names.length);
  return names[randomIndex];
};

const initializeDatabase = async (db) => {
  try {
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      
        CREATE TABLE IF NOT EXISTS users (
          user_id INTEGER PRIMARY KEY,  
          username TEXT DEFAULT 'Adventurer',
          experience INTEGER DEFAULT 0,
          profile_picture TEXT,
          level INTEGER DEFAULT 1,
          title TEXT
        );

        CREATE TABLE IF NOT EXISTS completed_achievements (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          icon TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS tasks (
          task_id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT,
          description TEXT,
          status TEXT,
          date_created DATETIME DEFAULT CURRENT_TIMESTAMP,
          due_date DATETIME,
          difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard'))  
        );
      
        CREATE TABLE IF NOT EXISTS subtasks (
          subtask_id INTEGER PRIMARY KEY AUTOINCREMENT,
          task_id INTEGER,  
          subtask_title TEXT,
          status TEXT,
          date_created DATETIME DEFAULT CURRENT_TIMESTAMP,
          due_date DATETIME,
          FOREIGN KEY (task_id) REFERENCES tasks(task_id) ON DELETE CASCADE
        );
    `);
    
    // Check if there are any users in the table
    const userExists = await db.getFirstAsync("SELECT 1 FROM users LIMIT 1");

    // If no users exist, insert a random username for the first user with user_id = 1
    if (!userExists) {
      const randomUsername = getRandomName();

      // Insert the new user with user_id = 1 (since it's the first user)
      await db.getFirstAsync(`
        INSERT INTO users (user_id, username)
        VALUES (1, ?);
      `, [randomUsername]);

      console.log(`User with username '${randomUsername}' has been created with user_id: 1`);
    } else {
      console.log("User already exists, skipping creation");
    }

    console.log('Database initialized!');
  } catch (error) {
    console.log('Error while initializing the database:', error);
  }
};

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Bottom Tab Navigator Component
function MyTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Quest Log') {
            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          } else if (route.name === 'Quest Board') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={24} color={color} />;
        },
        tabBarShowLabel: true,
        tabBarStyle: { backgroundColor: '#1b181c', height: 50, borderTopColor:'#1b181c' },
        tabBarActiveTintColor: 'white',
        tabBarInactiveTintColor: '#8e8e93',
        headerShown: false,
        borderTopWidth: 0, // Remove border
        elevation: 0, // Remove shadow for Android
        shadowOpacity: 0, // Remove shadow for iOS
        
        
      })}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Quest Log" component={Achievements} />

      {/* Custom Center Button */}
      <Tab.Screen
        name="CenterButton"
        component={AddTask}
        options={{
          tabBarButton: (props) => {
            const isFocused = useIsFocused(); // Check if this tab is focused

            return (
              <TouchableOpacity
                {...props}
                style={{
                  top: 5,
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: 40,
                  height: 40,
                  marginHorizontal: 20,
                }}
              >
                <Image
                  source={
                    isFocused
                      ? require('./assets/plus-shield-focus.png') // Image for the focused state
                      : require('./assets/plus-shield.png') // Default image 
                  }
                  style={{ width: 40, height: 40, alignItems: 'center'}}
                />
              </TouchableOpacity>
            );
          },
        }}
      />

      <Tab.Screen name="Quest Board" component={MyTasks} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
}


export default function App() {
  return (
    <SQLiteProvider databaseName='auth.db' onInit={initializeDatabase}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName='HomeTabs' screenOptions={{ headerShown: false }}>
          <Stack.Screen name='HomeTabs' component={MyTabs} />
          <Stack.Screen name='ChangePassword' component={ChangePassword} />
          <Stack.Screen name='TaskDetails' component={TaskDetails} />
          <Stack.Screen name='CompletedTasks' component={CompletedQuests} />
        </Stack.Navigator>
      </NavigationContainer>
    </SQLiteProvider>
  );
}
