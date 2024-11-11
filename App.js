import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SQLiteProvider } from 'expo-sqlite';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

import Home from './screens/Home';
import AddTask from './screens/AddTask';
import MyTasks from './screens/MyTasks';
import CompletedQuests from './screens/CompletedQuests';
import Profile from './screens/Profile';
import Settings from './screens/Settings';
import ChangePassword from './screens/ChangePassword';

// Initialize the database
const initializeDatabase = async (db) => {
  try {
    await db.execAsync(`
      PRAGMA journal_mode = WAL;

      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        firstName TEXT,
        lastName TEXT,
        email TEXT UNIQUE,
        username TEXT UNIQUE,
        password TEXT
      );

      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        task TEXT,
        status TEXT
      );
    `);

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
          } else if (route.name === 'Quests') {
            iconName = focused ? 'list-sharp' : 'list-outline';
          } else if (route.name === 'CompletedQuests') {
            iconName = focused ? 'checkmark-done-sharp' : 'checkmark-done-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarShowLabel: false,
        tabBarStyle: { backgroundColor: '#2a2a2a' },
        tabBarActiveTintColor: '#e8e9e8',
        tabBarInactiveTintColor: '#e8e9e8',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Quests" component={MyTasks} />

      {/* Custom Center Button */}
      <Tab.Screen
        name="CenterButton"
        component={AddTask} // You can replace this with any screen or a placeholder
        options={{
          tabBarButton: (props) => (
            <TouchableOpacity
              {...props}
              style={{
                top: -20,
                justifyContent: 'center',
                alignItems: 'center',
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: '#3e3e3e',
              }}
            >
              <Ionicons name="add" size={28} color="white" />
            </TouchableOpacity>
          ),
        }}
      />

      <Tab.Screen name="CompletedQuests" component={CompletedQuests} />
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
        </Stack.Navigator>
      </NavigationContainer>
    </SQLiteProvider>
  );
}
