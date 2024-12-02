
import {Image } from 'react-native';
import { SQLiteProvider } from 'expo-sqlite';
import { NavigationContainer, useIsFocused } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { registerBackgroundTask } from './screens/utils/notifications';
import { useEffect } from 'react';
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
  const names = ['Wanderer', 'Lone Wolf', 'Boss'];
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
          profile_picture TEXT DEFAULT '',
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
          difficulty TEXT CHECK (difficulty IN ('Easy', 'Medium', 'Hard'))  
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
          let iconSource;

          if (route.name === 'Home') {
            iconSource = focused
              ? require('./assets/icons/castle-focused.png') // Focused icon
              : require('./assets/icons/castle.png'); // Default icon
          } else if (route.name === 'Challenges') {
            iconSource = focused
              ? require('./assets/icons/challenges-focused.png')
              : require('./assets/icons/challenges.png');
          }else if (route.name === 'Create Task') {
            iconSource = focused
              ? require('./assets/icons/anvil-focused.png')
              : require('./assets/icons/anvil.png');
          } else if (route.name === 'Quests') {
            iconSource = focused
              ? require('./assets/icons/map-focused.png')
              : require('./assets/icons/map.png');
          } else if (route.name === 'Profile') {
            iconSource = focused
              ? require('./assets/icons/profile.png')
              : require('./assets/icons/profile.png');
          }

          return (
            <Image
              source={iconSource}
              style={{ width: 35, height: 35, tintColor: color }} // Adjust size and color
            />
          );
        },
        tabBarShowLabel: true,
        tabBarStyle: { backgroundColor: '#2C3E50', height: 60, borderTopColor:'#2C3E50', paddingBottom: 2},
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: '#95A5A6',
        headerShown: false,
        borderTopWidth: 0, // Remove border
        elevation: 0, // Remove shadow for Android
        shadowOpacity: 0, // Remove shadow for iOS
      })}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Challenges" component={Achievements} />
      <Tab.Screen name="Create Task" component={AddTask} />
      {/* Custom Center Button 
      <Tab.Screen
        name="AddTask"
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
                      ? require('./assets/icons/anvil-focused.png') // Image for focused state
                      : require('./assets/icons/anvil.png') // Default image
                  }
                  style={{ width: 30, height: 30, alignItems: 'center' }}
                />
              </TouchableOpacity>
            );
          },
        }}
      />
      */}
      <Tab.Screen name="Quests" component={MyTasks} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
}


export default function App() {
  useEffect(() => {
    console.log('background task is running')
    registerBackgroundTask();
  }, []);

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
